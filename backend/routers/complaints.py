import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/complaints", tags=["Citizen Complaints"])

@router.post("", response_model=schemas.ComplaintResponse)
def submit_complaint(
    comp_in: schemas.ComplaintCreate,
    db: Session = Depends(get_db)
):
    ticket = f"ECO-{uuid.uuid4().hex[:8].upper()}"

    complaint = models.Complaint(
        ticket_number=ticket,
        citizen_name=comp_in.citizen_name.strip(),
        citizen_phone=comp_in.citizen_phone,
        citizen_email=comp_in.citizen_email,
        municipality_id=comp_in.municipality_id,
        complaint_type=comp_in.complaint_type,
        description=comp_in.description.strip(),
        location_name=comp_in.location_name.strip(),
        latitude=comp_in.latitude,
        longitude=comp_in.longitude,
        photo_url=comp_in.photo_url,
        status="PENDING"
    )
    db.add(complaint)

    # Notify admin
    notif = models.Notification(
        role_target="ADMIN",
        municipality_id=comp_in.municipality_id,
        title=f"New Citizen Complaint: {comp_in.complaint_type}",
        message=f"Ticket {ticket} submitted at {comp_in.location_name}: {comp_in.description[:80]}...",
        notification_type="DAMAGE_REPORT"
    )
    db.add(notif)
    db.commit()
    db.refresh(complaint)

    return schemas.ComplaintResponse(
        id=complaint.id,
        ticket_number=complaint.ticket_number,
        citizen_name=complaint.citizen_name,
        citizen_phone=complaint.citizen_phone,
        citizen_email=complaint.citizen_email,
        municipality_id=complaint.municipality_id,
        complaint_type=complaint.complaint_type,
        description=complaint.description,
        location_name=complaint.location_name,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        photo_url=complaint.photo_url,
        status=complaint.status,
        created_at=complaint.created_at,
        resolved_at=complaint.resolved_at,
        municipality_name=complaint.municipality.name if complaint.municipality else ""
    )

@router.get("/track/{ticket_number}")
def track_complaint(ticket_number: str, db: Session = Depends(get_db)):
    comp = db.query(models.Complaint).filter(models.Complaint.ticket_number == ticket_number.upper().strip()).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint ticket not found. Please verify the ticket code.")

    return {
        "ticket_number": comp.ticket_number,
        "complaint_type": comp.complaint_type,
        "location_name": comp.location_name,
        "status": comp.status,
        "created_at": comp.created_at.strftime("%Y-%m-%d %H:%M"),
        "resolved_at": comp.resolved_at.strftime("%Y-%m-%d %H:%M") if comp.resolved_at else None,
        "municipality_name": comp.municipality.name if comp.municipality else ""
    }

@router.get("", response_model=List[schemas.ComplaintResponse])
def list_complaints(
    status_filter: Optional[str] = None,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN", "MUNICIPALITY_MONITOR"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.Complaint)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(models.Complaint.municipality_id == current_user.municipality_id)

    if status_filter:
        query = query.filter(models.Complaint.status == status_filter)

    complaints = query.order_by(models.Complaint.created_at.desc()).all()
    res = []
    for c in complaints:
        res.append(schemas.ComplaintResponse(
            id=c.id,
            ticket_number=c.ticket_number,
            citizen_name=c.citizen_name,
            citizen_phone=c.citizen_phone,
            citizen_email=c.citizen_email,
            municipality_id=c.municipality_id,
            complaint_type=c.complaint_type,
            description=c.description,
            location_name=c.location_name,
            latitude=c.latitude,
            longitude=c.longitude,
            photo_url=c.photo_url,
            status=c.status,
            created_at=c.created_at,
            resolved_at=c.resolved_at,
            municipality_name=c.municipality.name if c.municipality else ""
        ))
    return res

@router.patch("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status: str,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN"])),
    db: Session = Depends(get_db)
):
    comp = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role == "ADMIN" and comp.municipality_id != current_user.municipality_id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    comp.status = status
    if status == "RESOLVED":
        comp.resolved_at = datetime.utcnow()
    db.commit()

    return {"message": f"Complaint {comp.ticket_number} marked as {status}."}

