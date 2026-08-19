import uuid

from pydantic import BaseModel


class SectionSchema(BaseModel):
    id: str
    type: str
    content: dict = {}
    layout: str | None = None
    theme: dict = {}
    
class PageSchema(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    slug: str
    layout_variant: str = "default"
    sections: list[SectionSchema] = []
    theme: dict = {}
    
class PageOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    slug: str
    layout_variant: str
    sections: list[SectionSchema]
    theme: dict
    name: dict | None = None

    class Config:
        from_attributes = True


class PageUpdate(BaseModel):
    layout_variant: str | None = None
    sections: list[SectionSchema] | None = None
    theme: dict | None = None
