from pydantic import BaseModel


class GenerateProjectRequest(BaseModel):
    name: str
    short_description: str
    pages:list[str]


class GenerateProjectResponse(BaseModel):
    tenant_id: str
    message: str