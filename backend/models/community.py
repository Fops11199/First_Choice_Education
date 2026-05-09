from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
import uuid

class Community(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    category: str = Field(index=True)  # Biology, Maths, etc.
    is_private: bool = Field(default=False, index=True)
    image_url: Optional[str] = None
    creator_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    threads: List["Thread"] = Relationship(back_populates="community")
    memberships: List["CommunityMember"] = Relationship(back_populates="community")

class CommunityMember(SQLModel, table=True):
    community_id: uuid.UUID = Field(foreign_key="community.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    role: str = Field(default="member", index=True) # owner, moderator, member
    status: str = Field(default="active", index=True) # active, pending, banned — filtered often
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    
    community: "Community" = Relationship(back_populates="memberships")

class Thread(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    community_id: Optional[uuid.UUID] = Field(default=None, foreign_key="community.id", index=True)
    title: str
    category: Optional[str] = Field(default=None, index=True) # For legacy paper discussions
    author_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    community: Optional[Community] = Relationship(back_populates="threads")
    replies: List["Reply"] = Relationship(back_populates="thread")

class Reply(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    thread_id: uuid.UUID = Field(foreign_key="thread.id", index=True)
    author_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    content: str
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="reply.id", index=True)
    is_pinned: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    thread: Thread = Relationship(back_populates="replies")
