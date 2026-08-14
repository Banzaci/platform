import redis.asyncio as redis

from app.core.config import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)


def page_cache_key(tenant_id: str, slug: str) -> str:
    return f"page:{tenant_id}:{slug}"


def tenant_features_cache_key(tenant_id: str) -> str:
    return f"tenant_features:{tenant_id}"
