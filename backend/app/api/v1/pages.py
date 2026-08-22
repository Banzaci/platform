import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_permission
from app.core.redis import (
    delete_tenant_cache,
    page_cache_key,
    delete_page_cache,
    get_page_cache,
    add_page_cache
)
from app.core.config import settings
from app.db.session import get_db
from app.models.page import Page
from app.models.tenant_membership import TenantMembership
from app.schemas.page import PageOut, PageUpdate

router = APIRouter(
    prefix="/tenants/{tenant_id}/pages",
    tags=["pages"],
)

@router.put("/{page_id}", response_model=PageOut)
async def update_page(
    request: Request,
    tenant_id: uuid.UUID,
    page_id: uuid.UUID,
    payload: PageUpdate,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
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
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Page not found",
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

        await delete_page_cache(
            str(tenant_id),
            page.slug,
        )

        host = (
            request.headers.get("x-forwarded-host")
            or request.headers.get("host")
        )

        if host:
            await delete_tenant_cache(host)

        return page

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        print(
            "UPDATE PAGE ERROR:",
            repr(e),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update page",
        )


@router.get("/{slug}", response_model=PageOut)
async def get_page(
    tenant_id: uuid.UUID,
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    cache_key = page_cache_key(
        str(tenant_id),
        slug,
    )

    cached = await get_page_cache(
        str(tenant_id),
        slug,
    )

    if cached:
        return PageOut.model_validate_json(cached)

    result = await db.execute(
        select(Page).where(
            Page.tenant_id == tenant_id,
            Page.slug == slug,
        )
    )

    page = result.scalar_one_or_none()

    if not page:
        raise HTTPException(
            status_code=404,
            detail="Page not found",
        )

    page_out = PageOut.model_validate(page)

    await add_page_cache(
        str(tenant_id),
        slug,
        page_out.model_dump_json(),
        settings.cache_ttl_seconds,
    )

    return page_out