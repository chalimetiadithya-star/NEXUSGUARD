import os
from typing import List

class Settings:
    PROJECT_NAME: str = "AccessLens - Secure Enterprise Research Agent"
    COMPANY_NAME: str = "NovaTech Solutions"
    VERSION: str = "1.0.0"
    API_V1_STR: ""

    # On Vercel, serverless filesystem is read-only except /tmp
    _is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    _default_db = "sqlite:////tmp/accesslens.db" if _is_serverless else "sqlite:///./accesslens.db"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-enterprise-jwt-key-2026-accesslens")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12 # 12 hours for demo
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "deterministic") # "gemini", "openai", "deterministic"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
