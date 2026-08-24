from typing import Literal
from pydantic import BaseModel
from typing import Literal
from pydantic import BaseModel, Field


class LocalizedText(BaseModel):
    en: str

class HeroContent(BaseModel):
    heading: LocalizedText
    text: LocalizedText | None = None
    image: str | None = None


class ImageTextContent(BaseModel):
    heading: LocalizedText
    text: LocalizedText
    image: str | None = None


class CardItem(BaseModel):
    title: LocalizedText
    text: LocalizedText
    image: str | None = None


class CardGridContent(BaseModel):
    heading: LocalizedText | None = None
    text: LocalizedText | None = None
    cards: list[CardItem]


class PropertyGridContent(BaseModel):
    heading: LocalizedText
    text: LocalizedText | None = None


class ContactFormContent(BaseModel):
    heading: LocalizedText
    text: LocalizedText | None = None

    
class AIButtonTheme(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    borderRadius: str | None = None


class AIDateSelectorTheme(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    secondaryColor: str | None = None
    borderColor: str | None = None
    borderRadius: str | None = None
    shadow: str | None = None
    width: str | None = None
    selectedBackgroundColor: str | None = None
    selectedColor: str | None = None

class AICardTheme(BaseModel):
    backgroundColor: str | None = None
    textColor: str | None = None
    secondaryColor: str | None = None
    borderColor: str | None = None
    borderRadius: str | None = None
    padding: str | None = None
    shadow: str | None = None
    
class AISectionTheme(BaseModel):
    card: AICardTheme | None = None
    button: AIButtonTheme | None = None
    dateSelector: AIDateSelectorTheme | None = None

class AISectionBase(BaseModel):
    theme: AISectionTheme = Field(
        default_factory=AISectionTheme
    )

class HeroSection(AISectionBase):
    type: Literal["hero"]
    content: HeroContent


class ImageTextSection(AISectionBase):
    type: Literal["image-text"]
    content: ImageTextContent


class CardGridSection(AISectionBase):
    type: Literal["card-grid"]
    content: CardGridContent


class ContactFormSection(AISectionBase):
    type: Literal["contact-form"]
    content: ContactFormContent


class PropertyGridSection(AISectionBase):
    type: Literal["property-grid"]
    content: PropertyGridContent

class SectionContent(BaseModel):
    heading: LocalizedText | None = None
    text: LocalizedText | None = None
    image: str | None = None

AISection = (
    HeroSection
    | ImageTextSection
    | CardGridSection
    | PropertyGridSection
    | ContactFormSection
)


class AIPage(BaseModel):
    name: str = Field(min_length=1)
    slug: str = Field(min_length=1)
    sections: list[AISection] = Field(
        min_length=1
    )


class AITheme(BaseModel):
    backgroundColor: str
    textColor: str
    primaryColor: str
    secondaryColor: str
    fontFamily: str
    headingFontFamily: str


class AITenant(BaseModel):
    name: str = Field(min_length=1)
    category: str | None = None
    location: str | None = None
    short_description: str = Field(min_length=1)

class AIKnowledgeItem(BaseModel):
    category: str
    intent: str | None = None
    question: LocalizedText
    answer: LocalizedText


class GenerateKnowledgeRequest(BaseModel):
    prompt: str

class AIUpdatePlan(BaseModel):
    theme: AITheme | None = None
    pages: list[AIPage] = []
    knowledge: list[AIKnowledgeItem] = []


class AIProjectPlan(BaseModel):
    tenant: AITenant
    theme: AITheme
    pages: list[AIPage] = Field(min_length=1)
    property_count: int = Field(ge=0)
    knowledge: list[AIKnowledgeItem] = Field(
        default_factory=list
    )