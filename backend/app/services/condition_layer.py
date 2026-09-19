from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models.project import Project

PLATFORM_BLUEPRINTS: Dict[str, Dict[str, Any]] = {
    "stripe": {
        "component_name": "Stripe Payment & Checkout Service",
        "responsibility": "Payment session creation, webhook reconciliation, and refund handling (Mandatory Sponsor Track).",
        "tool_name": "Stripe API & Webhooks",
        "category": "Payment Gateway",
        "setup_steps": [
            "1. Sign up for a free Stripe test account at dashboard.stripe.com.",
            "2. Get your `pk_test_...` and `sk_test_...` API keys from the Developers tab.",
            "3. Install the SDK: `pip install stripe`.",
            "4. Create a checkout session in 4 lines of Python and return the session URL to the frontend."
        ],
        "schema_tables": ["payments", "stripe_events"]
    },
    "vercel": {
        "component_name": "Vercel Edge & Frontend Hosting",
        "responsibility": "Automated zero-config continuous deployment and edge routing for the web application.",
        "tool_name": "Vercel CLI & Hosting",
        "category": "Deployment & Edge",
        "setup_steps": [
            "1. Install Vercel CLI: `npm i -g vercel`.",
            "2. Run `vercel` in your frontend directory to link your GitHub repository.",
            "3. Add your backend API URL in Vercel project Environment Variables as `NEXT_PUBLIC_API_URL`."
        ],
        "schema_tables": []
    },
    "twilio": {
        "component_name": "Twilio SMS & Alert Gateway",
        "responsibility": "Real-time SMS ticket confirmations and organizer outage notifications.",
        "tool_name": "Twilio REST API",
        "category": "Messaging & SMS",
        "setup_steps": [
            "1. Create a free Twilio trial account and get a test phone number.",
            "2. Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in your `.env`.",
            "3. Install `pip install twilio` and send a test SMS with `client.messages.create()`."
        ],
        "schema_tables": ["sms_logs"]
    },
    "gemini": {
        "component_name": "Google Gemini Intelligence Gateway",
        "responsibility": "Automated alert summarization, attendee question answering, and QR metadata validation.",
        "tool_name": "Google Gemini 2.5 Flash API",
        "category": "LLM & AI Services",
        "setup_steps": [
            "1. Get a free Gemini API key from Google AI Studio (aistudio.google.com).",
            "2. Install the SDK: `pip install google-generativeai`.",
            "3. Set `GEMINI_API_KEY` in your environment and initialize `genai.GenerativeModel('gemini-2.5-flash')`."
        ],
        "schema_tables": ["ai_interactions"]
    }
}

def extract_mandatory_platform_rules(project: Project) -> List[Dict[str, Any]]:
    rules = []
    platforms = project.mandatory_platforms or []
    for p in platforms:
        p_lower = p.lower()
        matched = False
        for key, blueprint in PLATFORM_BLUEPRINTS.items():
            if key in p_lower:
                rules.append({
                    "platform_name": p,
                    "is_mandatory": True,
                    "blueprint": blueprint
                })
                matched = True
                break
        if not matched:
            rules.append({
                "platform_name": p,
                "is_mandatory": True,
                "blueprint": {
                    "component_name": f"{p} Integration Module",
                    "responsibility": f"Mandatory hackathon sponsor integration for {p}.",
                    "tool_name": p,
                    "category": "Sponsor Platform",
                    "setup_steps": [
                        f"1. Obtain API credentials from the official {p} sponsor documentation.",
                        f"2. Add {p} SDK to requirements.txt / package.json.",
                        f"3. Initialize the client in your application startup lifecycle."
                    ],
                    "schema_tables": []
                }
            })
    return rules
