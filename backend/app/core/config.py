import os

class Settings:
    PROJECT_NAME: str = "TeamForge AI"
    VERSION: str = "1.0.0-rad"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "teamforge-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./teamforge.db")
    
    LLM_API_BASE_URL: str = os.getenv("LLM_API_BASE_URL", "https://integrate.api.nvidia.com/v1")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "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")
    LLM_DEFAULT_MODEL: str = os.getenv("LLM_DEFAULT_MODEL", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning")
    
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
