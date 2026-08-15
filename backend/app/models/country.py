import uuid
import enum
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Continent(str, enum.Enum):
    africa = "Africa"
    asia = "Asia"
    europe = "Europe"
    north_america = "North America"
    south_america = "South America"
    oceania = "Oceania"
    antarctica = "Antarctica"


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    code: Mapped[str | None] = mapped_column(String(2), nullable=True)  # ISO 3166-1 alpha-2, e.g. "GH"
    continent: Mapped[Continent] = mapped_column(Enum(Continent, name="continent_enum"), nullable=False)