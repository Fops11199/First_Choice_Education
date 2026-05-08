from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from db.database import get_session
from models.advert import Advert
from core.security import require_admin
from schemas.advert import AdvertCreate, AdvertRead, AdvertUpdate
from typing import List
import uuid

router = APIRouter(prefix="/adverts", tags=["adverts"])

@router.get("/", response_model=List[AdvertRead])
def get_active_adverts(db: Session = Depends(get_session)):
    """Get all active adverts for students."""
    statement = select(Advert).where(Advert.is_active == True).order_by(Advert.display_order)
    return db.exec(statement).all()

@router.get("/admin/all", response_model=List[AdvertRead])
def get_all_adverts_admin(
    db: Session = Depends(get_session),
    current_user = Depends(require_admin)
):
    """Admin: Get all adverts."""
    statement = select(Advert).order_by(Advert.display_order)
    return db.exec(statement).all()

@router.post("/admin", response_model=AdvertRead, status_code=status.HTTP_201_CREATED)
def create_advert(
    advert_data: AdvertCreate,
    db: Session = Depends(get_session),
    current_user = Depends(require_admin)
):
    """Admin: Create a new advert."""
    new_advert = Advert(**advert_data.model_dump())
    db.add(new_advert)
    db.commit()
    db.refresh(new_advert)
    return new_advert

@router.put("/admin/{advert_id}", response_model=AdvertRead)
def update_advert(
    advert_id: uuid.UUID,
    advert_data: AdvertUpdate,
    db: Session = Depends(get_session),
    current_user = Depends(require_admin)
):
    """Admin: Update an advert."""
    advert = db.get(Advert, advert_id)
    if not advert:
        raise HTTPException(status_code=404, detail="Advert not found")
    
    data = advert_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(advert, key, value)
    
    db.add(advert)
    db.commit()
    db.refresh(advert)
    return advert

@router.delete("/admin/{advert_id}")
def delete_advert(
    advert_id: uuid.UUID,
    db: Session = Depends(get_session),
    current_user = Depends(require_admin)
):
    """Admin: Delete an advert."""
    advert = db.get(Advert, advert_id)
    if not advert:
        raise HTTPException(status_code=404, detail="Advert not found")
    db.delete(advert)
    db.commit()
    return {"message": "Advert deleted"}
