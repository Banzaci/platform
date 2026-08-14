import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Tenant(Base):
    """One company / customer. Every other tenant-scoped table has a
    tenant_id FK back to this table."""

    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    subdomain: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    custom_domain: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)

    # Shown on the central hub site (google.com/booking.com-style listing)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String, nullable=True)

    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    rooms: Mapped[list["Room"]] = relationship(
        back_populates="tenant",
        cascade="all, delete-orphan",
    )

    pages: Mapped[list["Page"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    tenant_features: Mapped[list["TenantFeature"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    memberships: Mapped[list["TenantMembership"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
