from openai import OpenAI, RateLimitError
import json
import logging
import re
from .config import settings

logger = logging.getLogger(__name__)


def get_layer_client(layer_name: str) -> tuple[OpenAI, str]:
    """
    Returns a dedicated OpenAI client and model name for a specific pipeline layer.
    Each layer has its own API key — zero shared quota between layers.
    """
    config = settings.LAYER_KEYS.get(layer_name)
    if not config:
        # Safe fallback: use playbook_engine key if layer not found
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
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=8192,
        )
        return response.choices[0].message.content
    except RateLimitError:
        logger.error(f"[LAYER: {layer}] Rate limit hit on dedicated key! This should not happen.")
        raise
    except Exception as e:
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
            return extract_json_from_text(raw)
        except RateLimitError:
            logger.error(f"[LAYER: {layer}] Rate limit hit on dedicated key! This should never happen.")
            raise
        except json.JSONDecodeError as e:
            logger.warning(f"[LAYER: {layer}] JSON parse failed on attempt {attempt + 1}: {e}. Retrying...")
            if attempt == 1:
                raise ValueError(f"Layer '{layer}' failed to produce valid JSON after 2 attempts.")
        except Exception as e:
            logger.error(f"[LAYER: {layer}] Fatal error: {str(e)}")
            raise
