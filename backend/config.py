import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Application runtime
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DOCS_ENABLED: bool = True

    # Security
    JWT_SECRET: str = "ecosort-ai-super-secret-key-2025-production-grade"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS & Networking
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Supabase credentials
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./ecosort.db"

    # AI Vision Classifier
    GEMINI_API_KEY: Optional[str] = None
    GET_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if self.ENVIRONMENT == "production":
            origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
            if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
                origins.append(self.FRONTEND_URL)
            return origins
        dev_origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"}
        configured = {o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()}
        if self.FRONTEND_URL:
            configured.add(self.FRONTEND_URL)
        return list(dev_origins.union(configured))

settings = Settings()

