import uuid

from cloudinary import config
import cloudinary.uploader

from app.core.config import settings


config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


async def upload_image(
    file,
    user_id: str,
    tenant_id: str,
):
    filename = file.filename or "image"
    name = filename.rsplit(".", 1)[0]

    folder = f"{user_id}/{tenant_id}"
    public_id = f"{uuid.uuid4()}-{name}"

    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        public_id=public_id,
        resource_type="image",
        overwrite=False,
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "width": result.get("width"),
        "height": result.get("height"),
        "format": result.get("format"),
    }