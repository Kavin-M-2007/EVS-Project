import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth
from services.ai_classifier import classifier

router = APIRouter(prefix="/api/classify", tags=["AI Waste Classification"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=schemas.ClassificationResponse)
async def classify_waste_image(
    file: UploadFile = File(...),
    municipality_id: Optional[int] = Form(None),
    current_user: Optional[models.User] = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Invalid image file format. Supported: JPG, PNG, WEBP.")

    # Save file
    file_bytes = await file.read()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_bytes)

    # Perform AI classification
    inference_result = classifier.classify_image(file.filename, file_bytes)

    # Determine municipality
    user_muni_id = current_user.municipality_id if current_user else municipality_id
    if not user_muni_id:
        user_muni_id = 1

    # Persist to DB
    record = models.WasteClassification(
        user_id=current_user.id if current_user else None,
        municipality_id=user_muni_id,
        image_url=f"/uploads/{unique_filename}",
        binary_category=inference_result["binary_category"],
        broad_category=inference_result["broad_category"],
        fine_class=inference_result["fine_class"],
        confidence_score=inference_result["confidence_score"],
        disposal_guide=inference_result["disposal_guide"],
        recycling_guide=inference_result["recycling_guide"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.ClassificationResponse(
        id=record.id,
        binary_category=record.binary_category,
        broad_category=record.broad_category,
        fine_class=record.fine_class,
        confidence_score=record.confidence_score,
        disposal_guide=record.disposal_guide,
        recycling_guide=record.recycling_guide,
        model_mode=inference_result["model_mode"],
        image_url=record.image_url,
        created_at=record.created_at
    )

@router.get("/history", response_model=List[schemas.ClassificationResponse])
def get_classification_history(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.WasteClassification)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(models.WasteClassification.municipality_id == current_user.municipality_id)

    records = query.order_by(models.WasteClassification.created_at.desc()).limit(20).all()
    return [
        schemas.ClassificationResponse(
            id=r.id,
            binary_category=r.binary_category,
            broad_category=r.broad_category,
            fine_class=r.fine_class,
            confidence_score=r.confidence_score,
            disposal_guide=r.disposal_guide,
            recycling_guide=r.recycling_guide,
            model_mode="AI_VISION_PIPELINE",
            image_url=r.image_url,
            created_at=r.created_at
        ) for r in records
    ]

