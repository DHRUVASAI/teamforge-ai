import os
import json
from openai import OpenAI
from app.prompts.architect_prompt import LAZY_ARCHITECT_SYSTEM_PROMPT, PLAYBOOK_JSON_PROMPT

client = OpenAI(
    api_key="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",
    base_url="https://integrate.api.nvidia.com/v1",
)

user_prompt = f"""
Create a playbook for this project.
Problem Statement: Cricket Analysis
Idea: Get all historical data about cricket for analysis...
Time Budget: 10 days
Constraints: []
Selected Tools: ["Frontend: Next.js", "Backend: FastAPI"]

{PLAYBOOK_JSON_PROMPT}
"""

response = client.chat.completions.create(
    model="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    messages=[
        {"role": "system", "content": LAZY_ARCHITECT_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ],
    extra_body={
        "max_tokens": 8192,
        "reasoning_budget": 4096
    }
)
print("--- RAW OUTPUT ---")
print(response.choices[0].message.content)
