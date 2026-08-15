import uuid
from pydantic import BaseModel
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException

from app.api.get_current_user import get_current_user
from app.api.deps import require_tenant_access
from app.services.cloudinary import upload_image

router = APIRouter()


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




class DeleteImageRequest(BaseModel):
    public_id: str


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