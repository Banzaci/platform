from pydantic import BaseModel


class GenerateProjectRequest(BaseModel):
    name: str
    username: str
    password: str
    short_description: str
    pages: list[str]


class GenerateProjectResponse(BaseModel):
    tenant_id: str
    message: str

class GenerateProjectAIRequest(BaseModel):
    prompt: str