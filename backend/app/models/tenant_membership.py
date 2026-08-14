import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class TenantRole(str, enum.Enum):
    owner = "owner"    # created the tenant — full access, only one per tenant normally
    admin = "admin"    # sub-user with full management access
    staff = "staff"    # sub-user with restricted access (defined per-endpoint below)


class TenantMembership(Base):
    __tablename__ = "tenant_memberships"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[TenantRole] = mapped_column(Enum(TenantRole), default=TenantRole.admin)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tenant: Mapped["Tenant"] = relationship(back_populates="memberships")
    user: Mapped["User"] = relationship(back_populates="memberships")