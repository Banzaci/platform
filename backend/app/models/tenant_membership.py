import enum
import uuid
from datetime import datetime
from sqlalchemy import Enum, DateTime, func, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class TenantRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    staff = "staff"


class TenantMembership(Base):
    __tablename__ = "tenant_memberships"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id",
            "username",
            name="uq_tenant_membership_username",
        ),
    )
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    username: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    role: Mapped[TenantRole] = mapped_column(
        Enum(TenantRole),
        default=TenantRole.staff,
        nullable=False,
    )

    permissions: Mapped[dict] = mapped_column(
        JSONB,
        default=dict,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    tenant: Mapped["Tenant"] = relationship(
        back_populates="memberships"
    )