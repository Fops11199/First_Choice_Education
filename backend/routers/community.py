from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.community import Thread, Reply
from models.user import User
from core.security import require_user, require_admin
from typing import List
import uuid

router = APIRouter(prefix="/community", tags=["community"])

@router.get("/threads", response_model=List[Thread])
def get_threads(category: str = None, db: Session = Depends(get_session)):
    if category:
        statement = select(Thread).where(Thread.category == category)
    else:
        statement = select(Thread)
    threads = db.exec(statement).all()
    return threads

@router.post("/threads", response_model=Thread, status_code=status.HTTP_201_CREATED)
def create_thread(
    thread: Thread, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    # Force the author_id to be the current user
    thread.author_id = current_user.id
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
    thread_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    db.delete(thread)
    db.commit()
    return None

@router.get("/threads/{thread_id}/replies", response_model=List[Reply])
def get_replies(thread_id: uuid.UUID, db: Session = Depends(get_session)):
    statement = select(Reply).where(Reply.thread_id == thread_id)
    replies = db.exec(statement).all()
    return replies

@router.post("/threads/{thread_id}/replies", response_model=Reply, status_code=status.HTTP_201_CREATED)
def create_reply(
    thread_id: uuid.UUID, 
    reply: Reply, 
    db: Session = Depends(get_session),
    current_user: User = Depends(require_user)
):
    reply.thread_id = thread_id
    reply.author_id = current_user.id
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply
