import uuid
import logging
from app.services.cloudinary import delete_file
from pydantic import BaseModel
from typing import Literal
from sqlalchemy import select
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Form
from app.models.tenant_font import TenantFont
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_tenant_access, require_permission
from app.services.cloudinary import upload_image, upload_font_file
from app.models.tenant_membership import TenantMembership
from app.db.session import get_db
from app.core.redis import delete_tenant_cache_for_tenant
from app.models.tenant import Tenant
from app.schemas.entities import TenantOut

logger = logging.getLogger(__name__)
router = APIRouter()

class DeleteImageRequest(BaseModel):
    public_id: str

@router.post("/tenants/{tenant_id}/logo", response_model=TenantOut)
async def upload_tenant_logo(
    tenant_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    upload = await upload_image(
        file=file,
        tenant_id=str(tenant.id),
        path="logo"
    )

    tenant.logo_url = upload["url"]

    await db.commit()
    await db.refresh(tenant)

    await delete_tenant_cache_for_tenant(
        tenant
    )

    return tenant

@router.post("/tenants/{tenant_id}/uploads/image")
async def upload_tenant_image(
    tenant_id: uuid.UUID,
    file: UploadFile = File(...),
    path: Literal["section", "property"] = Form("section"),
    db: AsyncSession = Depends(get_db),
    _access=Depends(require_tenant_access),
):
    try:
        result = await db.execute(
            select(Tenant).where(
                Tenant.id == tenant_id
            )
        )

        tenant = result.scalar_one_or_none()

        if not tenant:
            raise HTTPException(
                status_code=404,
                detail="Tenant not found",
            )

        image = await upload_image(
            file=file,
            tenant_id=str(tenant_id),
            path=path,
        )

        await delete_tenant_cache_for_tenant(tenant)

        return image

    except HTTPException:
        raise

    except Exception as e:
        logger.exception("Failed to upload tenant image")

        raise HTTPException(
            status_code=500,
            detail="Failed to upload image",
        ) from e

@router.delete("/tenants/{tenant_id}/uploads/image")
async def delete_tenant_image(
    tenant_id: uuid.UUID,
    payload: DeleteImageRequest,
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
    expected_prefix = f"{tenant_id}/"

    if not payload.public_id.startswith(expected_prefix):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot delete this image",
        )

    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )

    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    await delete_file(
        payload.public_id,
        resource_type="image",
    )

    await delete_tenant_cache_for_tenant(
        tenant
    )

    return {
        "result": "success"
    }


@router.post("/tenants/{tenant_id}/fonts", status_code=status.HTTP_201_CREATED)
async def upload_tenant_font(
    tenant_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _access: TenantMembership = Depends(
        require_permission("content.edit")
    ),
):
    allowed_types = {
        "font/woff",
        "font/woff2",
        "application/font-woff",
        "application/octet-stream",
    }

    filename = file.filename or ""

    valid_extension = (
        filename.lower().endswith(".woff")
        or filename.lower().endswith(".woff2")
    )

    valid_content_type = file.content_type in allowed_types

    if not valid_extension or not valid_content_type:
        raise HTTPException(
            status_code=400,
            detail="Only WOFF and WOFF2 fonts are allowed",
        )

    result = await db.execute(
        select(Tenant).where(
            Tenant.id == tenant_id
        )
    )
    
    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )
    # Här använder du din befintliga upload-lösning,
    # t.ex. Cloudinary/S3/etc.
    url, public_id = await upload_font_file(
        tenant_id,
        file,
    )

    font_format = (
        "woff2"
        if filename.lower().endswith(".woff2")
        else "woff"
    )

    font_name = filename.rsplit(".", 1)[0]

    font = TenantFont(
        tenant_id=tenant_id,
        name=font_name,
        url=url,
        format=font_format,
        public_id=public_id,
    )

    db.add(font)

    await db.commit()
    await db.refresh(font)

    await delete_tenant_cache_for_tenant(
        tenant
    )

    return font