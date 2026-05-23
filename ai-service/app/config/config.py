from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    # ── AI CONFIG ──
    AI_PRIMARY_PROVIDER: str = "azure"

    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_MODEL: str

    # ⚠️ This should NOT be optional if you're protecting API access
    AI_SERVICE_API_KEY: str

    # ── APP CONFIG ──
    FRONTEND_URL: Optional[str] = None
    BACKEND_URL: Optional[str] = None
    NODE_ENV: str = "development"
    STRICT_REAL_DATA: bool = False

    # ── SECURITY ──
    SERVICE_SECRET: str  # needed for your FastAPI middleware auth

    # ── CORS ──
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173"
    ]
    

settings = Settings()