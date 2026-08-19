import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Page(Base):
    __tablename__ = "pages"

    __table_args__ = (
        UniqueConstraint(
            "tenant_id",
            "slug",
            name="uq_tenant_slug",
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

    name: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    slug: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    layout_variant: Mapped[str] = mapped_column(
        String,
        default="default",
    )

    sort_order: Mapped[int] = mapped_column(
        default=0,
    )

    sections: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    theme: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    schema_version: Mapped[int] = mapped_column(
        default=1,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    tenant: Mapped["Tenant"] = relationship(
        back_populates="pages"
    )

    key: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    is_visible: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    is_system: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )