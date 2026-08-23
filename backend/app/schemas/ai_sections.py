from typing import Literal
from pydantic import BaseModel
from typing import Literal
from pydantic import BaseModel


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


class HeroSection(BaseModel):
    type: Literal["hero"]
    content: HeroContent


class ImageTextSection(BaseModel):
    type: Literal["image-text"]
    content: ImageTextContent


class CardGridSection(BaseModel):
    type: Literal["card-grid"]
    content: CardGridContent


class PropertyGridSection(BaseModel):
    type: Literal["property-grid"]
    content: PropertyGridContent


class ContactFormSection(BaseModel):
    type: Literal["contact-form"]
    content: ContactFormContent
    


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
    name: str
    slug: str
    sections: list[AISection]


class AITheme(BaseModel):
    backgroundColor: str
    textColor: str
    primaryColor: str
    secondaryColor: str
    fontFamily: str
    headingFontFamily: str


class AITenant(BaseModel):
    name: str
    category: str | None = None
    location: str | None = None
    short_description: str

class AIKnowledgeItem(BaseModel):
    category: str
    question: LocalizedText
    answer: LocalizedText
    intent: str | None = None
    
class AIProjectPlan(BaseModel):
    tenant: AITenant
    theme: AITheme
    pages: list[AIPage]
    property_count: int
    knowledge: list[AIKnowledgeItem]