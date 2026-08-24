import uuid
from datetime import date
from app.models.tenant_membership import TenantRole
from app.schemas.page import PageOut
from pydantic import BaseModel, ConfigDict


class CancellationPolicy(BaseModel):
    free_cancellation_days: int = 14
    partial_refund_hours: int = 48
    partial_refund_percent: int = 50

class NavigationTheme(BaseModel):
    backgroundColor: str = "#ffffff"
    textColor: str = "#222222"
    hoverColor: str = "#666666"
    activeColor: str = "#111111"
    fontFamily: str = "Inter"
    fontSize: str = "16px"
    height: str = "72px"
    logoHeight: str = "42px"

class FontTheme(BaseModel):
    body: str = "Inter"
    heading: str = "Inter"

class ThemeSchema(BaseModel):
    backgroundColor: str = "#ffffff"
    textColor: str = "#222222"
    primaryColor: str = "#111111"
    secondaryColor: str = "#666666"

    navigation: NavigationTheme = NavigationTheme()
    fonts: FontTheme = FontTheme()

class TenantOut(BaseModel):
    id: uuid.UUID
    name: str
    subdomain: str
    custom_domain: str | None
    category: str | None
    location: str | None
    logo_url: str | None
    short_description: str | None
    latitude: float | None
    longitude: float | None
    theme: ThemeSchema
    deleted: bool
    cancellation_policy: CancellationPolicy = CancellationPolicy()

    class Config:
        from_attributes = True

class TenantSessionOut(BaseModel):
    tenant: TenantOut
    membership_id: uuid.UUID
    username: str
    role: TenantRole
    permissions: dict

class TenantFullOut(BaseModel):
    tenant: TenantOut
    pages: list[PageOut]

class TenantCreate(BaseModel):
    name: str
    subdomain: str
    custom_domain: str | None = None
    category: str | None = None
    location: str | None = None
    logo_url: str | None = None
    short_description: str | None = None


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    phone_number: str
    is_superadmin: bool

    class Config:
        from_attributes = True


class FeatureOut(BaseModel):
    id: uuid.UUID
    key: str
    name: str
    description: str | None
    monthly_price: float | None
    yearly_price: float | None

    class Config:
        from_attributes = True


class TenantFeatureToggle(BaseModel):
    feature_key: str
    enabled: bool = True


class MembershipOut(BaseModel):
    user_id: uuid.UUID
    email: str
    role: str


class MembershipCreate(BaseModel):
    email: str
    role: str = "admin"


class TransactionOut(BaseModel):
    id: uuid.UUID
    type: str
    category: str | None
    amount: float
    currency: str
    description: str | None
    occurred_at: date

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    type: str
    category: str | None = None
    amount: float
    currency: str = "SEK"
    description: str | None = None
    occurred_at: date



