from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/municipalities", tags=["Municipalities"])

@router.get("", response_model=List[schemas.MunicipalityResponse])
def get_municipalities(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Super Admin can view all municipalities; others see only their assigned municipality
    if current_user.role == "SUPER_ADMIN":
        munis = db.query(models.Municipality).all()
    else:
        munis = db.query(models.Municipality).filter(models.Municipality.id == current_user.municipality_id).all()

    result = []
    for m in munis:
        bin_count = db.query(models.SmartBin).filter(models.SmartBin.municipality_id == m.id).count()
        collector_count = db.query(models.User).filter(
            models.User.municipality_id == m.id,
            models.User.role == "GARBAGE_COLLECTOR"
        ).count()

        resp = schemas.MunicipalityResponse(
            id=m.id,
            name=m.name,
            code=m.code,
            state=m.state,
            country=m.country,
            total_area_sqkm=m.total_area_sqkm,
            population=m.population,
            contact_email=m.contact_email,
            created_at=m.created_at,
            total_bins=bin_count,
            active_collectors=collector_count
        )
        result.append(resp)
    return result

@router.post("", response_model=schemas.MunicipalityResponse)
def create_municipality(
    muni_data: schemas.MunicipalityCreate,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN"])),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Municipality).filter(
        (models.Municipality.code == muni_data.code.upper()) |
        (models.Municipality.name == muni_data.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Municipality with this name or code already exists.")

    new_m = models.Municipality(
        name=muni_data.name,
        code=muni_data.code.upper(),
        state=muni_data.state,
        country=muni_data.country,
        total_area_sqkm=muni_data.total_area_sqkm,
        population=muni_data.population,
        contact_email=muni_data.contact_email
    )
    db.add(new_m)
    db.commit()
    db.refresh(new_m)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        action="MUNICIPALITY_CREATED",
        entity_type="MUNICIPALITY",
        entity_id=str(new_m.id),
        details=f"Created new municipality: {new_m.name} ({new_m.code})"
    )
    db.add(audit)
    db.commit()

    return schemas.MunicipalityResponse(
        id=new_m.id,
        name=new_m.name,
        code=new_m.code,
        state=new_m.state,
        country=new_m.country,
        total_area_sqkm=new_m.total_area_sqkm,
        population=new_m.population,
        contact_email=new_m.contact_email,
        created_at=new_m.created_at,
        total_bins=0,
        active_collectors=0
    )

