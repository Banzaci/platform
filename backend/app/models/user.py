import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    """A person, not tied to a single company. `is_superadmin` grants
    platform-wide access (you). Everyone else's access to a given tenant
    comes from a row in TenantMembership — one user can belong to several
    tenants (e.g. someone who owns/manages more than one company)."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    phone_number: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_superadmin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    memberships: Mapped[list["TenantMembership"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class TenantMembership(Base):
    """Join table: which tenants a user can administer. Composite primary
    key means a user can have at most one membership row per tenant, but
    any number of tenants overall."""

    __tablename__ = "tenant_memberships"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[str] = mapped_column(String, default="admin")  # room to add e.g. 'viewer' later
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tenant: Mapped["Tenant"] = relationship(back_populates="memberships")
    user: Mapped["User"] = relationship(back_populates="memberships")
