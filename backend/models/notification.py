from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    message: str
    type: str = Field(default="system") # system, reply, mention, announcement
    link: Optional[str] = None # URL to navigate to when clicked
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
