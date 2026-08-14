import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_tenant_access
from app.core.redis import page_cache_key, redis_client
from app.core.config import settings
from app.db.session import get_db
from app.models.page import Page
from app.schemas.page import PageOut, PageUpdate

router = APIRouter(prefix="/tenants/{tenant_id}/pages", tags=["pages"])


@router.get("/{slug}", response_model=PageOut)
async def get_page(tenant_id: uuid.UUID, slug: str, db: AsyncSession = Depends(get_db)):
    """Public endpoint — this is what the tenant's live website calls to
    render a page. Cached in Redis since page config changes rarely but is
    read on every request."""

    cache_key = page_cache_key(str(tenant_id), slug)
    cached = await redis_client.get(cache_key)
    if cached:
        return PageOut.model_validate(json.loads(cached))

    result = await db.execute(select(Page).where(Page.tenant_id == tenant_id, Page.slug == slug))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    page_out = PageOut.model_validate(page)
    await redis_client.set(cache_key, page_out.model_dump_json(), ex=settings.cache_ttl_seconds)
    return page_out


@router.put("/{slug}", response_model=PageOut)
async def update_page(
    tenant_id: uuid.UUID,
    slug: str,
    payload: PageUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_tenant_access),
):
    """Admin endpoint — tenant_admin (own tenant only) or superadmin. Any
    edit invalidates the cached version so the live site picks up changes
    on the next request instead of serving stale content for the full TTL."""

    result = await db.execute(select(Page).where(Page.tenant_id == tenant_id, Page.slug == slug))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    if payload.fields is not None:
        page.fields = [f.model_dump() for f in payload.fields]
    if payload.theme is not None:
        page.theme = payload.theme
    if payload.layout_variant is not None:
        page.layout_variant = payload.layout_variant

    await db.commit()
    await db.refresh(page)

    await redis_client.delete(page_cache_key(str(tenant_id), slug))
    return PageOut.model_validate(page)
