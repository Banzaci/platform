from typing import Literal

from pydantic import BaseModel, Field


class GlobalThemeSchema(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    primaryColor: str | None = None
    secondaryColor: str | None = None
    fontFamily: str | None = None
    fontSize: str | None = None
    paddingTop: str | None = None
    paddingBottom: str | None = None
    headingFontFamily: str | None = None


class CardThemeSchema(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    secondaryColor: str | None = None
    borderColor: str | None = None
    borderRadius: str | None = None
    padding: str | None = None
    shadow: Literal["none", "sm", "md", "lg"] | None = None


class ButtonThemeSchema(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    borderRadius: str | None = None


class DateSelectorThemeSchema(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    secondaryColor: str | None = None
    borderColor: str | None = None
    borderRadius: str | None = None
    selectedBackgroundColor: str | None = None
    selectedColor: str | None = None
    shadow: Literal["none", "sm", "md", "lg"] | None = None
    width: Literal["50%", "100%"] | None = None


class ImageThemeSchema(BaseModel):
    aspectRatio: str | None = None


class LayoutThemeSchema(BaseModel):
    columns: int | None = None
    gap: str | None = None


class NavigationTheme(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    hoverColor: str | None = None
    activeColor: str | None = None
    fontFamily: str | None = None
    fontSize: str | None = None
    height: str | None = None
    logoHeight: str | None = None


class FontTheme(BaseModel):
    body: str | None = None
    heading: str | None = None


class TenantThemeSchema(BaseModel):
    global_: GlobalThemeSchema | None = Field(
        default=None,
        alias="global",
    )

    card: CardThemeSchema | None = None
    button: ButtonThemeSchema | None = None
    dateSelector: DateSelectorThemeSchema | None = None
    image: ImageThemeSchema | None = None
    navigation: NavigationTheme | None = None
    fonts: FontTheme | None = None
    layout: LayoutThemeSchema | None = None

    model_config = {
        "populate_by_name": True,
    }