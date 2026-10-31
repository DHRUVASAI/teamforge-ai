from pydantic import BaseModel, ConfigDict
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token: Optional[str] = None
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str

