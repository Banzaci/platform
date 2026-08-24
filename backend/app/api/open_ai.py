from openai import AsyncOpenAI
from collections.abc import Sequence
from app.schemas.ai_sections import AIProjectPlan, AIUpdatePlan
from app.core.config import settings
from app.models.page import Page

client = AsyncOpenAI(
    api_key=settings.openai_api_key
)

async def generate_tenant_update(
    prompt: str,
    pages: Sequence[Page],
) -> AIUpdatePlan:
    page_context = [
        {
            "slug": page.slug,
            "sections": [
                {
                    "id": section.get("id"),
                    "type": section.get("type"),
                }
                for section in (page.sections or [])
            ],
        }
        for page in pages
    ]
    response = await client.responses.parse(
    model="gpt-5.6-luna",
    input=[
        {
            "role": "system",
            "content": """
ou update the visual theme of an existing hotel website.

Return ONLY theme-related changes.

You may:
- update the global theme
- update navigation design
- update section themes
- design property-grid cards, buttons and date selector

Rules:
- Do not create or remove pages.
- Do not create or remove sections.
- Do not modify page or section content.
- Do not modify tenant data or knowledge.
- Do not modify unrelated theme data.

Accommodation rules:
- The accommodation page always uses slug "accommodation".
- Accommodation contains exactly one section of type "property-grid".
- Do not generate room cards.
- Rooms are rendered dynamically from Property data.
- You may only update the property-grid section theme, including card, button and date selector styling.

Use only existing page slugs and section IDs provided in the website context.
"""
        },
        {
            "role": "user",
            "content": f"""
Existing website:

{page_context}

Requested change:
{prompt}
""",
        },
    ],
    text_format=AIUpdatePlan,
)

    plan = response.output_parsed

    if plan is None:
        raise ValueError(
            "Could not generate tenant update"
        )

    return plan

async def generate_hotel_plan(
    prompt: str,
) -> AIProjectPlan:
    response = await client.responses.parse(
        model="gpt-5.6-luna",
        input=[
            {
                "role": "system",
                "content": """
You are a hotel website planner.

Create a complete hotel project from the user's description.

Tenant rules:
- Always create a tenant name.
- If the user provides a hotel name, use exactly that name.
- Create a short_description based on the user's description.
- Set category when it can be inferred.
- Set location when the user provides one.
- Never return an empty tenant name.
- Never return an empty short_description.

Page rules:
- Always create at least a Home page.
- Home must use slug "index".
- If the user asks for rooms or accommodation, create an Accommodation page with slug "accommodation".
- Create every page explicitly requested by the user.
- Page names and slugs must never be empty.

Accommodation rules:
- The accommodation page MUST contain exactly one section.
- That section MUST be of type "property-grid".
- No other section types are allowed on the accommodation page.
- Do NOT represent rooms using "card-grid".
- Rooms/properties are rendered dynamically by the platform through "property-grid".
- Do not invent room types unless the user explicitly provides them.

Other page rules:
- Other pages may use hero, image-text, card-grid and contact-form.
- Create useful headings and text based on the user's description.

Theme rules:
- Create a coherent visual theme based on the style requested by the user.
- Always provide backgroundColor, textColor, primaryColor and secondaryColor.

Property rules:
- Set property_count from the number of rooms if the user provides one.
- If no room count is provided, use 0.

Knowledge rules:
- Create knowledge/FAQ items only from facts explicitly provided by the user.
- Do not invent facts.
""",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        text_format=AIProjectPlan,
    )

    plan = response.output_parsed

    if plan is None:
        raise ValueError(
            "Could not generate hotel project"
        )

    return plan