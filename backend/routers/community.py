from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.community import Thread, Reply
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
def create_thread(thread: Thread, db: Session = Depends(get_session)):
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

@router.get("/threads/{thread_id}/replies", response_model=List[Reply])
def get_replies(thread_id: uuid.UUID, db: Session = Depends(get_session)):
    statement = select(Reply).where(Reply.thread_id == thread_id)
    replies = db.exec(statement).all()
    return replies

@router.post("/threads/{thread_id}/replies", response_model=Reply, status_code=status.HTTP_201_CREATED)
def create_reply(thread_id: uuid.UUID, reply: Reply, db: Session = Depends(get_session)):
    reply.thread_id = thread_id
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply
