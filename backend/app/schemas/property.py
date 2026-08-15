import uuid
from pydantic import BaseModel, Field
from app.schemas.base_price import BasePriceOut

class PropertyBase(BaseModel):
    name: str
    description: str | None = None
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    bathrooms: int = 1
    units: int = 1
    amenities: list[str] = Field(default_factory=list)
    is_open: bool = True


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    max_guests: int | None = None
    bedrooms: int | None = None
    beds: int | None = None
    bathrooms: int | None = None
    units: int | None = None
    amenities: list[str] | None = None
    is_open: bool | None = None
    images: list[dict] | None = None


class PropertyOut(PropertyBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    images: list[dict]
    base_price: BasePriceOut | None = None

    class Config:
        from_attributes = True


from datetime import date
import uuid

from pydantic import BaseModel


class PricePeriodCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    daily_price: float | None = None
    weekly_price: float | None = None
    monthly_price: float | None = None


class PricePeriodOut(PricePeriodCreate):
    id: uuid.UUID
    property_id: uuid.UUID

    class Config:
        from_attributes = True