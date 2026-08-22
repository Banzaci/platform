import redis.asyncio as redis

from app.models.tenant import Tenant
from app.core.config import settings


redis_client = redis.Redis.from_url(
    settings.redis_url,
    decode_responses=True,
)

async def delete_tenant_cache_for_tenant(
    tenant: Tenant,
) -> None:
    await delete_tenant_cache(
        f"{tenant.subdomain}.{settings.tenant_base_domain}"
    )

    if tenant.custom_domain:
        await delete_tenant_cache(
            tenant.custom_domain
        )

def page_cache_key(
    tenant_id: str,
    slug: str,
) -> str:
    return f"page:{tenant_id}:{slug}"


async def get_page_cache(
    tenant_id: str,
    slug: str,
):
    return await redis_client.get(
        page_cache_key(tenant_id, slug)
    )


async def add_page_cache(
    tenant_id: str,
    slug: str,
    data: str,
    ttl: int,
) -> None:
    await redis_client.set(
        page_cache_key(tenant_id, slug),
        data,
        ex=ttl,
    )


async def delete_page_cache(
    tenant_id: str,
    slug: str,
) -> None:
    await redis_client.delete(
        page_cache_key(tenant_id, slug)
    )


def tenant_features_cache_key(tenant_id: str) -> str:
    return f"tenant_features:{tenant_id}"


async def get_tenant_features_cache(tenant_id: str):
    return await redis_client.get(
        tenant_features_cache_key(tenant_id)
    )


async def add_tenant_features_cache(
    tenant_id: str,
    data: str,
    ttl: int,
) -> None:
    await redis_client.set(
        tenant_features_cache_key(tenant_id),
        data,
        ex=ttl,
    )


async def delete_tenant_features_cache(
    tenant_id: str,
) -> None:
    await redis_client.delete(
        tenant_features_cache_key(tenant_id)
    )

def tenant_cache_key(host: str) -> str:
    return f"tenant-resolve:{host}"


async def get_tenant_cache(host: str):
    return await redis_client.get(
        tenant_cache_key(host)
    )


async def add_tenant_cache(
    host: str,
    data: str,
    ttl: int,
) -> None:
    await redis_client.set(
        tenant_cache_key(host),
        data,
        ex=ttl,
    )


async def delete_tenant_cache(host: str) -> None:
    await redis_client.delete(
        tenant_cache_key(host)
    )