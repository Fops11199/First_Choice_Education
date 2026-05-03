from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.progress import (
    Enrollment, PaperProgress, VideoWatch, PDFDownload, Streak, UserBadge, Badge
)
from models.content import Subject, Paper, Video, PDF
from models.user import User
from core.security import get_current_user, require_user
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/progress", tags=["progress"])

def check_user_access(requested_user_id: uuid.UUID, current_user: User):
    """
    Check if the current user has access to data for requested_user_id.
    Admins can access everything. Students can only access their own data.
    """
    if current_user.role != "admin" and str(current_user.id) != str(requested_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this user's data"
        )


# ── Enrollment ──────────────────────────────────────────────
@router.get("/enrollments/{user_id}")
def get_user_enrollments(
    user_id: uuid.UUID, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get all subjects a user is enrolled in."""
    check_user_access(user_id, current_user)
    statement = select(Enrollment, Subject).join(
        Subject, Enrollment.subject_id == Subject.id
    ).where(Enrollment.user_id == user_id, Enrollment.is_active == True)
    rows = db.exec(statement).all()
    return [
        {
            "enrollment_id": str(e.id),
            "subject_id": str(s.id),
            "subject_name": s.name,
            "enrolled_at": e.enrolled_at.isoformat(),
        }
        for e, s in rows
    ]


@router.post("/enrollments")
def enroll_in_subject(
    user_id: uuid.UUID,
    subject_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Enroll a user in a subject."""
    check_user_access(user_id, current_user)
    # Check if already enrolled
    existing = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.subject_id == subject_id
        )
    ).first()
    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            return {"message": "Re-enrolled successfully"}
        return {"message": "Already enrolled"}

    enrollment = Enrollment(user_id=user_id, subject_id=subject_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"message": "Enrolled successfully", "enrollment_id": str(enrollment.id)}


@router.delete("/enrollments")
def unenroll_from_subject(
    user_id: uuid.UUID,
    subject_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Unenroll a user from a subject."""
    check_user_access(user_id, current_user)
    enrollment = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.subject_id == subject_id
        )
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.is_active = False
    db.commit()
    return {"message": "Unenrolled successfully"}


# ── Paper Progress ───────────────────────────────────────────
@router.get("/paper-progress/{user_id}")
def get_user_paper_progress(
    user_id: uuid.UUID, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get all paper progress for a user."""
    check_user_access(user_id, current_user)
    rows = db.exec(
        select(PaperProgress).where(PaperProgress.user_id == user_id)
    ).all()
    return rows


@router.post("/paper-progress")
def update_paper_progress(
    user_id: uuid.UUID,
    paper_id: uuid.UUID,
    status: str,  # not_started | in_progress | completed
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Update or create progress entry for a paper."""
    check_user_access(user_id, current_user)
    if status not in ("not_started", "in_progress", "completed"):
        raise HTTPException(status_code=400, detail="Invalid status value")

    existing = db.exec(
        select(PaperProgress).where(
            PaperProgress.user_id == user_id,
            PaperProgress.paper_id == paper_id
        )
    ).first()

    if existing:
        existing.status = status
        existing.last_accessed = datetime.utcnow()
        if status == "completed":
            existing.completed_at = datetime.utcnow()
        db.commit()
        return {"message": "Progress updated"}

    progress = PaperProgress(
        user_id=user_id,
        paper_id=paper_id,
        status=status,
        completed_at=datetime.utcnow() if status == "completed" else None
    )
    db.add(progress)
    db.commit()
    return {"message": "Progress created"}


# ── Video Watch ──────────────────────────────────────────────
@router.post("/video-watch")
def track_video_watch(
    user_id: uuid.UUID,
    video_id: uuid.UUID,
    watched_seconds: int,
    is_completed: bool = False,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Track or update how much of a video a user has watched."""
    check_user_access(user_id, current_user)
    existing = db.exec(
        select(VideoWatch).where(
            VideoWatch.user_id == user_id,
            VideoWatch.video_id == video_id
        )
    ).first()

    if existing:
        existing.watched_seconds = max(existing.watched_seconds, watched_seconds)
        existing.is_completed = is_completed or existing.is_completed
        existing.last_watched_at = datetime.utcnow()
        db.commit()
        return {"message": "Watch progress updated"}

    watch = VideoWatch(
        user_id=user_id,
        video_id=video_id,
        watched_seconds=watched_seconds,
        is_completed=is_completed
    )
    db.add(watch)
    db.commit()
    return {"message": "Watch progress created"}


# ── Streak ───────────────────────────────────────────────────
@router.get("/streak/{user_id}")
def get_streak(
    user_id: uuid.UUID, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get a user's current study streak."""
    check_user_access(user_id, current_user)
    streak = db.exec(
        select(Streak).where(Streak.user_id == user_id)
    ).first()
    if not streak:
        return {"current_streak": 0, "longest_streak": 0, "last_activity_date": None}
    return streak


@router.post("/streak/{user_id}/ping")
def ping_streak(
    user_id: uuid.UUID, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """
    Called when a user performs any study activity.
    Increments streak if the last activity was yesterday.
    Resets if more than 1 day has passed.
    """
    streak = db.exec(select(Streak).where(Streak.user_id == user_id)).first()
    now = datetime.utcnow()

    if not streak:
        streak = Streak(user_id=user_id, current_streak=1, longest_streak=1, last_activity_date=now)
        db.add(streak)
        db.commit()
        return {"message": "Streak started", "current_streak": 1}

    if streak.last_activity_date:
        delta_days = (now.date() - streak.last_activity_date.date()).days
        if delta_days == 0:
            return {"message": "Already active today", "current_streak": streak.current_streak}
        elif delta_days == 1:
            streak.current_streak += 1
            streak.longest_streak = max(streak.current_streak, streak.longest_streak)
        else:
            streak.current_streak = 1  # reset

    streak.last_activity_date = now
    db.commit()
    return {"message": "Streak updated", "current_streak": streak.current_streak}


# ── Dashboard Summary ────────────────────────────────────────
@router.get("/dashboard/{user_id}")
def get_user_dashboard(
    user_id: uuid.UUID, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Aggregated progress summary for the student dashboard."""
    check_user_access(user_id, current_user)
    enrollments = db.exec(
        select(Enrollment).where(Enrollment.user_id == user_id, Enrollment.is_active == True)
    ).all()
    all_progress = db.exec(
        select(PaperProgress).where(PaperProgress.user_id == user_id)
    ).all()
    streak = db.exec(select(Streak).where(Streak.user_id == user_id)).first()
    badges = db.exec(
        select(UserBadge, Badge).join(Badge).where(UserBadge.user_id == user_id)
    ).all()

    completed = [p for p in all_progress if p.status == "completed"]
    in_progress = [p for p in all_progress if p.status == "in_progress"]

    return {
        "enrolled_subjects": len(enrollments),
        "papers_completed": len(completed),
        "papers_in_progress": len(in_progress),
        "current_streak": streak.current_streak if streak else 0,
        "longest_streak": streak.longest_streak if streak else 0,
        "badges_earned": len(badges),
        "badges": [{"name": b.name, "icon": b.icon} for _, b in badges],
    }
