import json
import uuid
from fastapi import Request
from app.api.deps import invalidate_tenant_cache_for_tenant
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.get_current_user import CurrentUser, get_current_user
from app.core.redis import page_cache_key, redis_client
from app.core.config import settings
from app.db.session import get_db
from app.models.page import Page
from app.schemas.page import PageOut, PageUpdate
from app.models.tenant import Tenant

router = APIRouter(prefix="/tenants/{tenant_id}/pages", tags=["pages"])

@router.put("/{page_id}", response_model=PageOut)
async def update_page(
    request: Request,
    tenant_id: uuid.UUID,
    page_id: uuid.UUID,
    payload: PageUpdate,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(Page).where(
                Page.id == page_id,
                Page.tenant_id == tenant_id,
            )
        )

        page = result.scalar_one_or_none()

        if not page:
            raise HTTPException(
                status_code=404,
                detail="Page not found",
            )
        
        tenant_result = await db.execute(
            select(Tenant).where(
                Tenant.id == tenant_id
            )
        )

        tenant = tenant_result.scalar_one_or_none()

        if not tenant:
            raise HTTPException(
                status_code=404,
                detail="Tenant not found",
            )
        
        if payload.layout_variant is not None:
            page.layout_variant = payload.layout_variant

        if payload.sections is not None:
            page.sections = [
                section.model_dump()
                for section in payload.sections
            ]

        if payload.theme is not None:
            page.theme = payload.theme

        await db.commit()
        await db.refresh(page)
        host = request.headers.get("x-forwarded-host") or request.headers.get("host")
        if host:
            await invalidate_tenant_cache_for_tenant(tenant)
        return page

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        print("UPDATE PAGE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update page: {str(e)}",
        )

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

