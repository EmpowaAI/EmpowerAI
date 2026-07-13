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
    # Must be recent enough for the deployed model. GPT-5-era deployments
    # need a 2025 preview version - copy the exact api-version from your
    # Azure AI Foundry deployment's sample code.
    AZURE_OPENAI_API_VERSION: str = "2025-01-01-preview"

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