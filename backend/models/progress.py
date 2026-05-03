from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid


# ─────────────────────────────────────────────
# Enrollment — User ↔ Subject subscription
# ─────────────────────────────────────────────
class Enrollment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    subject_id: uuid.UUID = Field(foreign_key="subject.id", index=True)
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


# ─────────────────────────────────────────────
# PaperProgress — tracks per-paper completion
# ─────────────────────────────────────────────
class PaperProgress(SQLModel, table=True):
    __tablename__ = "paper_progress"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    paper_id: uuid.UUID = Field(foreign_key="paper.id", index=True)
    # not_started | in_progress | completed
    status: str = Field(default="not_started")
    last_accessed: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


# ─────────────────────────────────────────────
# VideoWatch — tracks video watch progress
# ─────────────────────────────────────────────
class VideoWatch(SQLModel, table=True):
    __tablename__ = "video_watch"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    video_id: uuid.UUID = Field(foreign_key="video.id", index=True)
    watched_seconds: int = Field(default=0)
    is_completed: bool = Field(default=False)
    last_watched_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# PDFDownload — logs when a PDF is accessed
# ─────────────────────────────────────────────
class PDFDownload(SQLModel, table=True):
    __tablename__ = "pdf_download"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    pdf_id: uuid.UUID = Field(foreign_key="pdf.id", index=True)
    downloaded_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# Streak — daily study streak
# ─────────────────────────────────────────────
class Streak(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True, index=True)
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    last_activity_date: Optional[datetime] = None


# ─────────────────────────────────────────────
# Badge — achievement definitions
# ─────────────────────────────────────────────
class Badge(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True)
    description: str
    icon: Optional[str] = None  # emoji or icon name

    user_badges: List["UserBadge"] = Relationship(back_populates="badge")


# ─────────────────────────────────────────────
# UserBadge — many-to-many: User ↔ Badge
# ─────────────────────────────────────────────
class UserBadge(SQLModel, table=True):
    __tablename__ = "user_badge"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    badge_id: uuid.UUID = Field(foreign_key="badge.id", index=True)
    earned_at: datetime = Field(default_factory=datetime.utcnow)

    badge: Badge = Relationship(back_populates="user_badges")


# ─────────────────────────────────────────────
# RefreshToken — secure session management
# ─────────────────────────────────────────────
class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_token"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    token: str = Field(unique=True, index=True)
    expires_at: datetime
    revoked: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# PasswordResetToken — forgot password
# ─────────────────────────────────────────────
class PasswordResetToken(SQLModel, table=True):
    __tablename__ = "password_reset_token"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    token: str = Field(unique=True, index=True)
    expires_at: datetime
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
