import os

from openai import AsyncOpenAI

from app.schemas.ai_sections import AIProjectPlan, AIUpdatePlan
from app.core.config import settings
from app.mocked.mocked_open_ai import get_mock_hotel_plan


client = AsyncOpenAI(
    api_key=settings.openai_api_key
)

async def generate_tenant_update(
    prompt: str,
) -> AIUpdatePlan:
    response = await client.responses.parse(
        model="gpt-5.6-luna",
        input=[
            {
                "role": "system",
                "content": """
You update an existing hotel website.

Never create a new tenant.

Only return changes requested by the user.

You may:
- update the theme
- add or update pages
- add or update sections
- add FAQ / hotel knowledge

Do not modify unrelated data.
""",
            },
            {
                "role": "user",
                "content": prompt,
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