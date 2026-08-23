import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://platform:12125tgh678xx!!6545@localhost:5435/platform")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    jwt_secret: str = os.getenv("JWT_SECRET", "local")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    environment: str = "development"
    cache_ttl_seconds: int = 300
    tenant_base_domain: str = "miche.se"
    
    cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
    cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")
    cloudinary_url: str | None = os.getenv("CLOUDINARY_URL")

    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")

    class Config:
        env_file = ".env"


settings = Settings()

# DATABASE_URL="postgresql+asyncpg://platform:12125tgh678xx!!6545@localhost:5435/platform"

# class Settings(BaseSettings):
#     # --- Database ---
#     database_url: str = DATABASE_URL

#     # --- Redis ---
#     redis_url: str = "redis://localhost:6379/0"
#     cache_ttl_seconds: int = 300  # how long page/theme config stays cached

#     # --- Auth ---
#     jwt_secret: str = "password"
#     jwt_algorithm: str = "HS256"
#     access_token_expire_minutes: int = 60 * 24  # 24h

#     cloudinary_cloud_name: str = ""
#     cloudinary_api_key: str = ""
#     cloudinary_api_secret: str = ""
#     cloudinary_url: str | None = None

#     stripe_secret_key: str = ""

#     class Config:
#         env_file = ".env"


# settings = Settings()
