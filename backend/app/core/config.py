from pydantic_settings import BaseSettings

DATABASE_URL="postgresql+asyncpg://platform:12125tgh678xx!!6545@localhost:5435/platform"

class Settings(BaseSettings):
    # --- Database ---
    database_url: str = DATABASE_URL

    # --- Redis ---
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl_seconds: int = 300  # how long page/theme config stays cached

    # --- Auth ---
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24h

    class Config:
        env_file = ".env"


settings = Settings()
