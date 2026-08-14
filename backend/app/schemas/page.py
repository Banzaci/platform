import uuid
from typing import Literal, Union

from pydantic import BaseModel


class TextFieldSchema(BaseModel):
    id: str
    type: Literal["text", "textarea"]
    label: str
    value: dict[str, str]  # {"sv": "...", "en": "..."}


class ImageFieldSchema(BaseModel):
    id: str
    type: Literal["image"]
    label: str
    src: str
    alt: str | None = None


class ImageGalleryFieldSchema(BaseModel):
    id: str
    type: Literal["image_gallery"]
    label: str
    images: list[dict]  # [{"src": "...", "alt": "..."}]


FieldSchema = Union[TextFieldSchema, ImageFieldSchema, ImageGalleryFieldSchema]


class PageOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    slug: str
    layout_variant: str
    fields: list[FieldSchema]
    theme: dict

    class Config:
        from_attributes = True


class PageUpdate(BaseModel):
    layout_variant: str | None = None
    fields: list[FieldSchema] | None = None
    theme: dict | None = None
