import uuid

from pydantic import BaseModel


class BasePriceUpsert(BaseModel):
    daily_price: float
    weekly_price: float | None = None
    monthly_price: float | None = None


class BasePriceOut(BaseModel):
    id: uuid.UUID
    property_id: uuid.UUID
    daily_price: float
    weekly_price: float | None
    monthly_price: float | None

    class Config:
        from_attributes = True