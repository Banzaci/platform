import os

from openai import AsyncOpenAI

from app.schemas.ai_sections import AIProjectPlan
from app.core.config import settings
from app.mocked.mocked_open_ai import get_mock_hotel_plan


client = AsyncOpenAI(
    api_key=settings.openai_api_key
)


async def generate_hotel_plan(
    prompt: str,
) -> AIProjectPlan:
    if os.getenv("ENVIRONMENT") == "development":
        return get_mock_hotel_plan()

    response = await client.responses.parse(
        model="gpt-5.6-luna",
        input=[
            {
                "role": "system",
                "content": """
You are a hotel website planner.
Convert the user's request into a complete hotel project.
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