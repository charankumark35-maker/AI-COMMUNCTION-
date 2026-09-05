from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS — comma-separated list of allowed origins
    # Example: "https://your-app.vercel.app,https://www.yourdomain.com"
    ALLOWED_ORIGINS: Optional[str] = None

    # Gemini API Key
    GEMINI_API_KEY: Optional[str] = None

    # Environment
    ENVIRONMENT: str = "development"  # "development" | "production"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
