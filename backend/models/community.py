from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
import uuid

class Thread(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    category: str # Biology, Maths, etc.
    author_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    replies: List["Reply"] = Relationship(back_populates="thread")

class Reply(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    thread_id: uuid.UUID = Field(foreign_key="thread.id")
    author_id: uuid.UUID = Field(foreign_key="user.id")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    thread: Thread = Relationship(back_populates="replies")
