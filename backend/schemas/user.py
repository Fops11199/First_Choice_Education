from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid

# Input Schemas
class UserCreateSchema(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    whatsapp_number: Optional[str] = Field(None, max_length=20)
    level: Optional[str] = Field(None, pattern="^(O-Level|A-Level)$")

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

# Output Schemas
class UserResponseSchema(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    whatsapp_number: Optional[str]
    role: str
    level: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseSchema

class TokenDataSchema(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
