import sys
import logging
logging.basicConfig(level=logging.INFO)
import os
sys.path.append(os.getcwd())
from backend.app.core.llm_client import generate_json
from backend.app.core.config import settings

print(f"Testing playbook_engine using key: {settings.LAYER_KEYS['playbook_engine']['api_key'][:8]}...")
try:
    res = generate_json(system_prompt="You are a helpful AI.", user_prompt="Reply with {'status': 'ok'} strictly in JSON.", layer="playbook_engine")
    print(res)
except Exception as e:
    print("FAILED:", e)
