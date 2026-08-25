import uuid
import logging

from cloudinary import config
from app.core.config import settings

from fastapi import HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool
import cloudinary.uploader

logger = logging.getLogger(__name__)

config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)

async def upload_font_file(
    tenant_id: uuid.UUID,
    file: UploadFile,
) -> tuple[str, str]:
    filename = file.filename or "font"

    name = filename.rsplit(".", 1)[0]
    folder = f"{tenant_id}/fonts"

    result = cloudinary.uploader.upload(
        file.file,
        resource_type="raw",
        folder=folder,
        public_id=name,
        overwrite=True,
    )
    return result["secure_url"], result["public_id"]




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
            cloudinary.uploader.upload,
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
