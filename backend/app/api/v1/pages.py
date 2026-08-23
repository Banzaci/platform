import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.get_current_user import CurrentUser, get_current_user
from app.api.deps import require_permission, slugify
from app.core.redis import (
    delete_tenant_cache,
    page_cache_key,
    delete_page_cache,
    get_page_cache,
    add_page_cache,
    delete_tenant_cache_for_tenant
)
from app.models.tenant import Tenant
from app.core.config import settings
from app.db.session import get_db
from app.models.page import Page
from app.models.tenant_membership import TenantMembership
from app.schemas.page import PageOut, PageUpdate, PageCreate
from pydantic import BaseModel

class PageOrderItem(BaseModel):
    id: uuid.UUID
    sort_order: int


class PageReorderRequest(BaseModel):
    pages: list[PageOrderItem]

router = APIRouter(
    prefix="/tenants/{tenant_id}/pages",
    tags=["pages"],
)

@router.put("/reorder", status_code=204)
async def reorder_pages(
    tenant_id: uuid.UUID,
    payload: PageReorderRequest,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
    page_ids = [item.id for item in payload.pages]

    result = await db.execute(
        select(Page).where(
            Page.tenant_id == tenant_id,
            Page.id.in_(page_ids),
        )
    )

    pages = result.scalars().all()

    pages_by_id = {
        page.id: page
        for page in pages
    }

    for item in payload.pages:
        page = pages_by_id.get(item.id)

        if page:
            page.sort_order = item.sort_order

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

    await db.commit()

    await delete_tenant_cache_for_tenant(
        tenant
    )


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(
    tenant_id: uuid.UUID,
    page_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
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

    await db.delete(page)
    await db.commit()

    await delete_page_cache(
        str(tenant_id),
        page.slug,
    )

@router.post("",response_model=PageOut,status_code=201) 
async def create_page(
    tenant_id: uuid.UUID,
    payload: PageCreate,
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    slug = slugify(payload.name)

    page = Page(
        tenant_id=tenant_id,
        slug=slug,
        key=slug,
        name={"en": payload.name},
        layout_variant="default",
        sort_order=100,
        sections=[
            {
                "id": "hero",
                "type": "hero",
                "content": {
                    "heading": {
                        "en": payload.name,
                    },
                    "text": {
                        "en": "",
                    },
                    "image": "",
                },
                "layout": None,
                "theme": {},
            }
        ],
        theme={},
        is_system=False,
    )

    db.add(page)

    await db.commit()
    await db.refresh(page)

    return page

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