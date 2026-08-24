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
    # if settings.environment == "development":
    #     return get_mock_hotel_plan()

    response = await client.responses.parse(
        model="gpt-5.6-luna",
        input=[
            {
"role": "system",
"content": """
You are a hotel website planner.

Rules:

- Home must use slug "index".
- Accommodation must use slug "accommodation".
- The accommodation page MUST contain exactly one section.
- That section MUST be of type "property-grid".
- No other section types are allowed on the accommodation page.
- Do NOT represent rooms using "card-grid".
- Rooms/properties are rendered dynamically by the platform through "property-grid".
- Do not invent room types unless the user explicitly provides them.
- Other pages may use hero, image-text, card-grid and contact-form.
"""
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