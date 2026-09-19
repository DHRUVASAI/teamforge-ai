from openai import OpenAI
import openai
import json
import logging
import re
from .config import settings

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_API_BASE_URL,
    timeout=60.0
)

def generate_text(system_prompt: str, user_prompt: str, model: str = None) -> str:
    response = client.chat.completions.create(
        model=model or settings.LLM_DEFAULT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        extra_body={
            "max_tokens": 65536,
            "reasoning_budget": 16384
        },
        timeout=120.0
    )
    return response.choices[0].message.content

def extract_json_from_text(text: str) -> dict:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    clean_text = re.sub(r'`json\s*', '', text, flags=re.IGNORECASE)
    clean_text = re.sub(r'`\s*', '', clean_text)
    clean_text = clean_text.strip()
    try:
        return json.loads(clean_text)
    except json.JSONDecodeError:
        pass
        
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        sliced_text = text[start_idx:end_idx+1]
        try:
            return json.loads(sliced_text)
        except json.JSONDecodeError:
            pass
            
    raise json.JSONDecodeError("Could not extract JSON from LLM response", text, 0)

def generate_json(system_prompt: str, user_prompt: str, model: str = None, retries: int = 1) -> dict:
    attempt = 0
    current_system = system_prompt
    use_json_mode = False  # Not all models support json_mode natively. We'll rely on prompt engineering.
    
    current_system += "\n\nCRITICAL: You must respond ONLY with valid JSON. No conversational text. Do not wrap in markdown backticks."
    
    while attempt <= retries:
        try:
            kwargs = {
                "model": model or settings.LLM_DEFAULT_MODEL,
                "messages": [
                    {"role": "system", "content": current_system},
                    {"role": "user", "content": user_prompt}
                ],
                "extra_body": {
                    "max_tokens": 4096,
                    "reasoning_budget": 2048
                },
                "timeout": 120.0
            }
            if use_json_mode:
                kwargs["response_format"] = { "type": "json_object" }
                
            response = client.chat.completions.create(**kwargs)
            raw_content = response.choices[0].message.content
            return extract_json_from_text(raw_content)
            
        except openai.BadRequestError as e:
            logger.warning(f"BadRequestError on attempt {attempt}: {e.message if hasattr(e, 'message') else str(e)}")
            attempt += 1
        except json.JSONDecodeError as e:
            logger.warning(f"JSON Parse failed on attempt {attempt}: {str(e)}. Retrying...")
            attempt += 1
        except Exception as e:
            logger.warning(f"General exception: {str(e)}")
            raise e
            
    raise ValueError("Max retries exceeded for JSON parsing")
