import os
import json
from openai import OpenAI

client = OpenAI(
    api_key="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",
    base_url="https://integrate.api.nvidia.com/v1",
)

response = client.chat.completions.create(
    model="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    messages=[{"role": "user", "content": "Respond with a JSON object containing { 'hello': 'world' }. ONLY output JSON. No markdown."}],
    extra_body={
        "max_tokens": 1024,
        "reasoning_budget": 512
    }
)
print(response.choices[0].message.content)
