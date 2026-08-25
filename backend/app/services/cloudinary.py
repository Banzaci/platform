import uuid
import logging
import asyncio
from cloudinary import config
from app.core.config import settings

from fastapi import HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from cloudinary import api
from cloudinary.uploader import upload, destroy

logger = logging.getLogger(__name__)

config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)

async def delete_file(
    public_id: str,
    resource_type: str = "image",
) -> None:
    try:
        result = await run_in_threadpool(
            destroy,
            public_id,
            resource_type=resource_type,
        )

        if result.get("result") not in ("ok", "not found"):
            raise RuntimeError(
                f"Cloudinary delete failed: {result}"
            )

    except Exception as e:
        logger.exception(
            "Cloudinary file delete failed",
            extra={
                "public_id": public_id,
                "resource_type": resource_type,
            },
        )

        raise HTTPException(
            status_code=502,
            detail="File delete failed",
        ) from e
    
async def upload_font_file(
    tenant_id: uuid.UUID,
    file: UploadFile,
) -> tuple[str, str]:
    filename = file.filename or "font"

    name = filename.rsplit(".", 1)[0]
    folder = f"{tenant_id}/fonts"

    result = upload(
        file.file,
        resource_type="raw",
        folder=folder,
        public_id=name,
        overwrite=True,
    )

    return result["secure_url"], result["public_id"]

async def delete_tenant_cloudinary_assets(
    tenant_id: str,
) -> None:
    try:
        prefix = f"{tenant_id}/"

        await asyncio.to_thread(
            api.delete_resources_by_prefix,
            prefix,
            resource_type="image",
        )

        await asyncio.to_thread(
            api.delete_resources_by_prefix,
            prefix,
            resource_type="raw",
        )

        await asyncio.to_thread(
            api.delete_folder,
            tenant_id,
        )

    except Exception:
        logger.exception(
            "Failed to delete tenant Cloudinary assets",
            extra={
                "tenant_id": tenant_id,
            },
        )
        raise

async def upload_image(
    file: UploadFile,
    tenant_id: str,
    path: str = "",
):
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="File must be an image",
            )

        filename = file.filename or "image"
        name = filename.rsplit(".", 1)[0]

        folder = (
            f"{tenant_id}/{path.strip('/')}"
            if path
            else tenant_id
        )

        public_id = f"{uuid.uuid4()}-{name}"

        result = await run_in_threadpool(
            upload,
            file.file,
            folder=folder,
            public_id=public_id,
            resource_type="image",
            overwrite=False,
        )

        secure_url = result.get("secure_url")
        result_public_id = result.get("public_id")

        if not secure_url or not result_public_id:
            raise RuntimeError(
                "Cloudinary returned an invalid upload response"
            )

        return {
            "url": secure_url,
            "public_id": result_public_id,
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format"),
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.exception(
            "Cloudinary image upload failed",
            extra={
                "tenant_id": tenant_id,
                "filename": file.filename,
            },
        )

        raise HTTPException(
            status_code=502,
            detail="Image upload failed",
        ) from e
