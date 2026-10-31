from openai import OpenAI, RateLimitError
import json
import logging
import re
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from .config import settings

logger = logging.getLogger(__name__)

# Telemetry store for observability & reliability monitoring
MAX_TELEMETRY_ITEMS = 100
EXECUTION_TELEMETRY: List[Dict[str, Any]] = []

def record_telemetry(layer: str, model: str, latency_ms: int, status: str, error: Optional[str] = None):
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "layer": layer,
        "model": model,
        "latency_ms": latency_ms,
        "status": status, # "SUCCESS", "FAILED", "FAILOVER"
        "error": error
    }
    EXECUTION_TELEMETRY.append(entry)
    if len(EXECUTION_TELEMETRY) > MAX_TELEMETRY_ITEMS:
        EXECUTION_TELEMETRY.pop(0)

def get_telemetry_stats() -> Dict[str, Any]:
    total = len(EXECUTION_TELEMETRY)
    if total == 0:
        return {
            "total_calls": 0,
            "success_rate": 100.0,
            "avg_latency_ms": 0,
            "recent_traces": []
        }
    successes = sum(1 for e in EXECUTION_TELEMETRY if e["status"] == "SUCCESS")
    avg_latency = int(sum(e["latency_ms"] for e in EXECUTION_TELEMETRY) / total)
    return {
        "total_calls": total,
        "success_rate": round((successes / total) * 100, 1),
        "avg_latency_ms": avg_latency,
        "recent_traces": EXECUTION_TELEMETRY[-15:]
    }


def get_layer_client(layer_name: str) -> tuple[OpenAI, str]:
    """
    Returns a dedicated OpenAI client and model name for a specific pipeline layer.
    Each layer has its own API key — zero shared quota between layers.
    """
    config = settings.LAYER_KEYS.get(layer_name)
    if not config:
        logger.warning(f"Unknown layer '{layer_name}'. Falling back to playbook_engine key.")
        config = settings.LAYER_KEYS["playbook_engine"]
    
    client = OpenAI(
        api_key=config["api_key"],
        base_url=config["base_url"],
        timeout=120.0
    )
    return client, config["model"]


def extract_json_from_text(text: str) -> dict:
    text = text.strip()
    
    # Try 1: Direct JSON parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try 2: Strip markdown code fences
    clean_text = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
    clean_text = re.sub(r'```\s*', '', clean_text).strip()
    try:
        return json.loads(clean_text)
    except json.JSONDecodeError:
        pass
    
    # Try 3: Extract first { ... } block
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        try:
            return json.loads(text[start_idx:end_idx + 1])
        except json.JSONDecodeError:
            pass
    
    raise json.JSONDecodeError("Could not extract valid JSON from LLM response", text, 0)


def generate_text(system_prompt: str, user_prompt: str, layer: str = "playbook_engine") -> str:
    """
    Generate text using the dedicated API key for the specified layer.
    Falls back gracefully if the layer's provider is unavailable.
    """
    client, model = get_layer_client(layer)
    start_time = time.time()
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=8192,
        )
        elapsed_ms = int((time.time() - start_time) * 1000)
        record_telemetry(layer, model, elapsed_ms, "SUCCESS")
        return response.choices[0].message.content
    except RateLimitError as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        record_telemetry(layer, model, elapsed_ms, "FAILED", f"RateLimitError: {str(e)}")
        logger.error(f"[LAYER: {layer}] Rate limit hit on dedicated key! This should not happen.")
        raise
    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        record_telemetry(layer, model, elapsed_ms, "FAILED", str(e))
        logger.error(f"[LAYER: {layer}] API call failed: {str(e)}")
        raise


def generate_json(system_prompt: str, user_prompt: str, layer: str = "playbook_engine") -> dict:
    """
    Generate structured JSON using the dedicated API key for the specified layer.
    Retries once on JSON parse failure before raising.
    """
    strict_system = (
        system_prompt
        + "\n\nCRITICAL INSTRUCTION: Your entire response MUST be a single, valid JSON object. "
        "Do NOT include any explanation, markdown, or text outside the JSON. "
        "Start your response with '{' and end with '}'."
    )
    
    client, model = get_layer_client(layer)
    start_time = time.time()
    
    for attempt in range(2):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": strict_system},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=8192,
            )
            raw = response.choices[0].message.content
            logger.info(f"[LAYER: {layer}] Raw response received ({len(raw)} chars). Parsing JSON...")
            result = extract_json_from_text(raw)
            elapsed_ms = int((time.time() - start_time) * 1000)
            record_telemetry(layer, model, elapsed_ms, "SUCCESS")
            return result
        except RateLimitError as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            record_telemetry(layer, model, elapsed_ms, "FAILED", f"RateLimit: {str(e)}")
            logger.error(f"[LAYER: {layer}] Rate limit hit on dedicated key!")
            raise
        except json.JSONDecodeError as e:
            logger.warning(f"[LAYER: {layer}] JSON parse failed on attempt {attempt + 1}: {e}. Retrying...")
            if attempt == 1:
                elapsed_ms = int((time.time() - start_time) * 1000)
                record_telemetry(layer, model, elapsed_ms, "FAILED", f"JSONDecodeError: {str(e)}")
                raise ValueError(f"Layer '{layer}' failed to produce valid JSON after 2 attempts.")
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            record_telemetry(layer, model, elapsed_ms, "FAILED", str(e))
            logger.error(f"[LAYER: {layer}] Fatal error: {str(e)}")
            raise
