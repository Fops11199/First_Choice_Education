from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Review(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    rating: int = Field(ge=1, le=5)  # 1-5 stars
    content: str
    is_approved: bool = Field(default=False)  # Admin must approve before showing
    created_at: datetime = Field(default_factory=datetime.utcnow)
