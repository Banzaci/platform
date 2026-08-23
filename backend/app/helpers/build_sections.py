from app.schemas.ai_sections import AISection, AIPage
from app.api.deps import slugify

def build_sections(
    sections: list[AISection],
) -> list[dict]:
    result: list[dict] = []

    for index, section in enumerate(sections):
        result.append(
            {
                "id": f"{section.type}-{index}",
                "type": section.type,
                "content": section.content.model_dump(
                    exclude_none=True
                ),
                "layout": None,
                "theme": {},
            }
        )

    return result

def normalize_page_slug(
    page: AIPage,
) -> str:
    name = page.name.strip().lower()

    if name in {"home", "homepage", "index"}:
        return "index"

    if name in {
        "rooms",
        "room",
        "accommodation",
        "accommodations",
    }:
        return "accommodation"

    return slugify(page.name)