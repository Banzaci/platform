from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- Database ---
    database_url: str = "postgresql+asyncpg://platform:12125tgh678xx!!6545@postgres:5432/platform"

    # --- Redis ---
    redis_url: str = "redis://redis:6379/0"
    cache_ttl_seconds: int = 300

    # --- Auth ---
    jwt_secret: str = "hdajsk67678ghjsa567567hjshajkhdsa979799"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # --- Cloudinary ---
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_url: str | None = None

    # --- Stripe ---
    stripe_secret_key: str = ""

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
