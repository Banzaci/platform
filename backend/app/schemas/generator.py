from pydantic import BaseModel


class GenerateProjectRequest(BaseModel):
    prompt: str


class GenerateProjectResponse(BaseModel):
    tenant_id: str
    message: str