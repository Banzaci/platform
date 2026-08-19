import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PropertyBlock(Base):
    __tablename__ = "property_blocks"

    __table_args__ = (
        UniqueConstraint(
            "property_id",
            "source_id",
            "external_id",
            name="uq_property_block_external",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "properties.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "property_calendar_sources.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    external_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )