import uuid

from pydantic import BaseModel
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from app.models.tenant_font import TenantFont
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.get_current_user import get_current_user
from app.api.deps import require_tenant_access, require_permission
from app.services.cloudinary import upload_image, upload_font_file
from app.models.tenant_membership import TenantMembership
from app.db.session import get_db

router = APIRouter()

class DeleteImageRequest(BaseModel):
    public_id: str

@router.post("/tenants/{tenant_id}/uploads/image")
async def upload_tenant_image(
    tenant_id: uuid.UUID,
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    return await upload_image(
        file=file,
        user_id=str(user.id),
        tenant_id=str(tenant_id),
    )

@router.delete("/tenants/{tenant_id}/uploads/image")
async def delete_tenant_image(
    tenant_id: uuid.UUID,
    payload: DeleteImageRequest,
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    expected_prefix = f"{user.id}/{tenant_id}/"

    if not payload.public_id.startswith(expected_prefix):
        raise HTTPException(
            status_code=403,
            detail="You cannot delete this image",
        )

    result = cloudinary.uploader.destroy(
        payload.public_id,
        resource_type="image",
    )

    return {
        "result": result.get("result"),
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

    return font