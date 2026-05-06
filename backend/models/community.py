from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
import uuid

class Community(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    category: str  # Biology, Maths, etc.
    is_private: bool = Field(default=False)
    image_url: Optional[str] = None
    creator_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    threads: List["Thread"] = Relationship(back_populates="community")
    memberships: List["CommunityMember"] = Relationship(back_populates="community")

class CommunityMember(SQLModel, table=True):
    community_id: uuid.UUID = Field(foreign_key="community.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    role: str = Field(default="member") # owner, moderator, member
    status: str = Field(default="active") # active, pending, banned
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    
    community: "Community" = Relationship(back_populates="memberships")

class Thread(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    community_id: Optional[uuid.UUID] = Field(default=None, foreign_key="community.id")
    title: str
    category: Optional[str] = None # For legacy paper discussions
    author_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    community: Optional[Community] = Relationship(back_populates="threads")
    replies: List["Reply"] = Relationship(back_populates="thread")

class Reply(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    thread_id: uuid.UUID = Field(foreign_key="thread.id")
    author_id: uuid.UUID = Field(foreign_key="user.id")
    content: str
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="reply.id")
    is_pinned: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    thread: Thread = Relationship(back_populates="replies")
