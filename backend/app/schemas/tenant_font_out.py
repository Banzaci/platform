import uuid

from pydantic import BaseModel, ConfigDict


class TenantFontOut(BaseModel):
    id: uuid.UUID
    name: str
    url: str
    format: str

    model_config = ConfigDict(
        from_attributes=True
    )