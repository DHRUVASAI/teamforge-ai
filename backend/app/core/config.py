import os

class Settings:
    PROJECT_NAME: str = "TeamForge AI"
    VERSION: str = "1.0.0-rad"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "teamforge-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./teamforge.db")
    
    # ─────────────────────────────────────────────────────
    # 7-LAYER API KEY ASSIGNMENT
    # 1 dedicated API key per pipeline layer.
    # Each layer runs completely independently — zero shared quota.
    # ─────────────────────────────────────────────────────
    
    LAYER_KEYS: dict = {
        # Layer 1 — Problem Statement Analyzer
        # GEMINI KEY 1: Massive context window, perfect for parsing long problem descriptions
        "ps_analyzer": {
            "api_key": os.getenv("GEMINI_API_KEY_1", ""),
            "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
            "model": "gemini-3.8-flash",
        },
        # Layer 2 — Architecture Engine
        # NVIDIA KEY 1: Nemotron reasoning for deep architectural trade-offs (SQL vs NoSQL, monolith vs microservices)
        "arch_engine": {
            "api_key": os.getenv("NVIDIA_API_KEY_1", ""),
            "base_url": "https://integrate.api.nvidia.com/v1",
            "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        },
        # Layer 3 — SDLC Engine
        # GROQ KEY 1: Blazing fast for methodical SDLC phase generation (Agile sprints, Kanban boards)
        "sdlc_engine": {
            "api_key": os.getenv("GROQ_API_KEY_1", ""),
            "base_url": "https://api.groq.com/openai/v1",
            "model": "openai/gpt-oss-120b",
        },
        # Layer 4 — Tool Evaluator
        # GEMINI KEY 2: Best for comparing and evaluating large catalogs of tools and tech stacks
        "tool_evaluator": {
            "api_key": os.getenv("GEMINI_API_KEY_2", ""),
            "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
            "model": "gemini-3.8-flash",
        },
        # Layer 5 — Task Engine
        # NVIDIA KEY 2: Nemotron reasoning for intelligent task decomposition and dependency graphs
        "task_engine": {
            "api_key": os.getenv("NVIDIA_API_KEY_2", ""),
            "base_url": "https://integrate.api.nvidia.com/v1",
            "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        },
        # Layer 6 — Risk Engine
        # GROQ KEY 2: Fast risk pattern recognition from established software risk catalogs
        "risk_engine": {
            "api_key": os.getenv("GROQ_API_KEY_2", ""),
            "base_url": "https://api.groq.com/openai/v1",
            "model": "openai/gpt-oss-120b",
        },
        # Layer 7 — Playbook Engine (Final Assembly)
        # GEMINI KEY 3: Massive context window to read ALL previous layer outputs and assemble the final playbook
        "playbook_engine": {
            "api_key": os.getenv("GROQ_API_KEY_1", ""),
            "base_url": "https://api.groq.com/openai/v1",
            "model": "openai/gpt-oss-120b",
        },
        # Mentor Chat — Bonus dedicated key for the AI Mentor chat (never competes with the pipeline)
        "mentor": {
            "api_key": os.getenv("GROQ_API_KEY_1", ""),
            "base_url": "https://api.groq.com/openai/v1",
            "model": "openai/gpt-oss-120b",
        },
    }
    
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

settings = Settings()

