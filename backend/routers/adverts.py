from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlmodel import Session, select
from db.database import get_session
from models.advert import Advert
from core.security import require_admin
from schemas.advert import AdvertCreate, AdvertRead, AdvertUpdate
from services.storage import storage_service
from core.config import settings
from typing import List
import uuid
import os

router = APIRouter(prefix="/adverts", tags=["adverts"])

@router.get("/", response_model=List[AdvertRead])
def get_active_adverts(db: Session = Depends(get_session)):
    """Get all active adverts for students."""
    statement = select(Advert).where(Advert.is_active == True).order_by(Advert.display_order)
    return db.exec(statement).all()

@router.get("/{advert_id}", response_model=AdvertRead)
def get_advert(advert_id: uuid.UUID, db: Session = Depends(get_session)):
    """Get a specific advert by ID."""
    advert = db.get(Advert, advert_id)
    if not advert:
        raise HTTPException(status_code=404, detail="Advert not found")
    return advert

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

@router.post("/admin/{advert_id}/image", response_model=AdvertRead)
async def upload_advert_image(
    advert_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
    current_user = Depends(require_admin)
):
    """Admin: Upload an image for an advert."""
    advert = db.get(Advert, advert_id)
    if not advert:
        raise HTTPException(status_code=404, detail="Advert not found")

    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, GIF, WEBP)")

    # Ensure the directory exists locally (temporary)
    os.makedirs("uploads/adverts", exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    safe_filename = f"{uuid.uuid4()}{file_extension}"
    file_location = f"uploads/adverts/{safe_filename}"
    
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    # Upload to Cloudflare R2
    s3_key = f"adverts/{safe_filename}"
    try:
        storage_service.s3_client.upload_file(
            file_location,
            settings.R2_BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        # Cloudflare R2 public URL
        file_url = f"{settings.R2_PUBLIC_URL}/{s3_key}"
        
        # Update advert
        advert.image_url = file_url
        db.add(advert)
        db.commit()
        db.refresh(advert)
        
        # Clean up local file
        os.remove(file_location)
        
        return advert
    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
