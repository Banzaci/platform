from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from app.models.tenant_membership import TenantRole


class TenantMembershipCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8)
    role: TenantRole = TenantRole.staff
    permissions: dict = {}


class TenantMembershipOut(BaseModel):
    id: UUID
    username: str
    role: TenantRole
    permissions: dict
    created_at: datetime
    can_delete: bool
    model_config = {
        "from_attributes": True
    }

