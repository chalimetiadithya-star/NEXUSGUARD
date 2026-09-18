from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserProfile"

class TokenData(BaseModel):
    employee_id: Optional[str] = None

class UserProfile(BaseModel):
    employee_id: str
    name: str
    email: str
    department: str
    role: str
    clearance: str
    is_active: bool

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    clearance: Optional[str] = None
    is_active: Optional[bool] = None

Token.model_rebuild()
