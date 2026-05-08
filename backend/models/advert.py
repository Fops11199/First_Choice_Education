from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Advert(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    image_url: str
    target_url: str
    is_active: bool = Field(default=True)
    display_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
