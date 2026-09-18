from typing import List
import os
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "SmileProgress Backend"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Storage Buckets
    BUCKET_PATIENT_ORIGINALS: str = "patient-originals"
    BUCKET_PATIENT_SITTINGS: str = "patient-sittings"
    BUCKET_AI_SIMULATIONS: str = "ai-simulations"
    BUCKET_REPORTS: str = "reports"

    # AI Provider Settings
    AI_PROVIDER: str = "mock"  # 'mock', 'gemini', 'flux'
    GEMINI_API_KEY: str = ""

    # Security
    JWT_SECRET: str = "smileprogress-dev-secret-key-32charsmin!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Upload validation
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_TYPES: List[str] = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ]

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
