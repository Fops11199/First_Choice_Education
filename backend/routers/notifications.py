from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.notification import Notification
from models.user import User
from core.security import require_user
import uuid

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
def get_my_notifications(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Get all notifications for the current user, sorted by newest first."""
    statement = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    return db.exec(statement).all()

@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Mark a specific notification as read."""
    notification = db.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return {"message": "Notification marked as read"}

@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    """Mark all notifications for the current user as read."""
    statement = select(Notification).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    unread = db.exec(statement).all()
    for n in unread:
        n.is_read = True
        db.add(n)
    db.commit()
    return {"message": f"{len(unread)} notifications marked as read"}
