"""
Students Router — /api/v1/students/me/*

All endpoints infer the current user from the JWT token.
No user_id needed in the URL — eliminates spoofing risk.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel
from sqlmodel import Session, select
from db.database import get_session
from models.progress import (
    Enrollment, PaperProgress, VideoWatch, Streak, UserBadge, Badge
)
from models.content import Subject, Paper, Video
from models.user import User
from core.security import require_user
from datetime import datetime
import uuid

class EnrollmentCreate(BaseModel):
    subject_id: uuid.UUID

router = APIRouter(prefix="/students/me", tags=["Students"])


# ── Dashboard ────────────────────────────────────────────────
@router.get("/dashboard")
def get_my_dashboard(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Aggregated progress summary for the student dashboard."""
    enrollments = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.is_active == True
        )
    ).all()
    all_progress = db.exec(
        select(PaperProgress).where(PaperProgress.user_id == current_user.id)
    ).all()
    streak = db.exec(
        select(Streak).where(Streak.user_id == current_user.id)
    ).first()
    badges = db.exec(
        select(UserBadge, Badge).join(Badge).where(UserBadge.user_id == current_user.id)
    ).all()

    completed = [p for p in all_progress if p.status == "completed"]
    in_progress = [p for p in all_progress if p.status == "in_progress"]

    return {
        "user": {
            "full_name": current_user.full_name,
            "level": current_user.level,
        },
        "enrolled_subjects": len(enrollments),
        "papers_completed": len(completed),
        "papers_in_progress": len(in_progress),
        "current_streak": streak.current_streak if streak else 0,
        "longest_streak": streak.longest_streak if streak else 0,
        "badges_earned": len(badges),
        "badges": [{"name": b.name, "icon": b.icon} for _, b in badges],
    }


# ── Enrollments ──────────────────────────────────────────────
@router.get("/enrollments")
def get_my_enrollments(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get all subjects the current user is enrolled in."""
    statement = select(Enrollment, Subject).join(
        Subject, Enrollment.subject_id == Subject.id
    ).where(Enrollment.user_id == current_user.id, Enrollment.is_active == True)
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




@router.post("/enrollments", status_code=status.HTTP_201_CREATED)
def enroll_in_subject(
    data: EnrollmentCreate = Body(...),
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Enroll the current user in a subject."""
    # Verify subject exists
    subject = db.get(Subject, data.subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check if already enrolled
    existing = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.subject_id == data.subject_id
        )
    ).first()

    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            return {"message": "Re-enrolled successfully", "enrollment_id": str(existing.id)}
        return {"message": "Already enrolled", "enrollment_id": str(existing.id)}

    enrollment = Enrollment(user_id=current_user.id, subject_id=data.subject_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"message": "Enrolled successfully", "enrollment_id": str(enrollment.id)}


@router.delete("/enrollments/{subject_id}")
def unenroll_from_subject(
    subject_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Unenroll the current user from a subject."""
    enrollment = db.exec(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id,
            Enrollment.subject_id == subject_id
        )
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.is_active = False
    db.commit()
    return {"message": "Unenrolled successfully"}


# ── Paper Progress ───────────────────────────────────────────
@router.get("/progress")
def get_my_progress(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get all paper progress records for the current user."""
    rows = db.exec(
        select(PaperProgress).where(PaperProgress.user_id == current_user.id)
    ).all()
    return rows


@router.post("/progress")
def update_my_progress(
    paper_id: uuid.UUID,
    progress_status: str,  # not_started | in_progress | completed
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Update or create a progress entry for a paper."""
    if progress_status not in ("not_started", "in_progress", "completed"):
        raise HTTPException(status_code=400, detail="Invalid status. Use: not_started | in_progress | completed")

    existing = db.exec(
        select(PaperProgress).where(
            PaperProgress.user_id == current_user.id,
            PaperProgress.paper_id == paper_id
        )
    ).first()

    if existing:
        existing.status = progress_status
        existing.last_accessed = datetime.utcnow()
        if progress_status == "completed":
            existing.completed_at = datetime.utcnow()
        db.commit()
        return {"message": "Progress updated", "status": progress_status}

    progress = PaperProgress(
        user_id=current_user.id,
        paper_id=paper_id,
        status=progress_status,
        completed_at=datetime.utcnow() if progress_status == "completed" else None
    )
    db.add(progress)
    db.commit()
    return {"message": "Progress created", "status": progress_status}


# ── Streak ───────────────────────────────────────────────────
@router.get("/streak")
def get_my_streak(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get the current user's study streak."""
    streak = db.exec(
        select(Streak).where(Streak.user_id == current_user.id)
    ).first()
    if not streak:
        return {"current_streak": 0, "longest_streak": 0, "last_activity_date": None}
    return streak


@router.post("/streak/ping")
def ping_my_streak(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """
    Called when the user performs any study activity.
    Increments streak if last activity was yesterday. Resets if more than 1 day has passed.
    """
    streak = db.exec(
        select(Streak).where(Streak.user_id == current_user.id)
    ).first()
    now = datetime.utcnow()

    if not streak:
        streak = Streak(
            user_id=current_user.id,
            current_streak=1,
            longest_streak=1,
            last_activity_date=now
        )
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


# ── Video Watch ──────────────────────────────────────────────
@router.post("/video-watch")
def track_video_watch(
    video_id: uuid.UUID,
    watched_seconds: int,
    is_completed: bool = False,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Track how much of a video the current user has watched."""
    existing = db.exec(
        select(VideoWatch).where(
            VideoWatch.user_id == current_user.id,
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
        user_id=current_user.id,
        video_id=video_id,
        watched_seconds=watched_seconds,
        is_completed=is_completed
    )
    db.add(watch)
    db.commit()
    return {"message": "Watch progress created"}
