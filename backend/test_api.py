import os
import json
import requests

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
    "Authorization": "Bearer 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",
    "Accept": "application/json",
}

payload = {
  "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "max_tokens": 100
}

response = requests.post(invoke_url, headers=headers, json=payload)
print(response.status_code)
print(response.json())
