from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[schemas.NotificationResponse])
def get_user_notifications(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id) |
        (models.Notification.role_target == current_user.role) |
        (models.Notification.role_target == "ALL")
    )

    if current_user.role != "SUPER_ADMIN" and current_user.municipality_id:
        query = query.filter(
            (models.Notification.municipality_id == current_user.municipality_id) |
            (models.Notification.municipality_id == None)
        )

    notifs = query.order_by(models.Notification.created_at.desc()).limit(30).all()
    return [
        schemas.NotificationResponse(
            id=n.id,
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            is_read=n.is_read,
            created_at=n.created_at,
            role_target=n.role_target
        ) for n in notifs
    ]

@router.patch("/{notif_id}/read")
def mark_notification_as_read(
    notif_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    n = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Notification marked as read."}

@router.post("/read-all")
def mark_all_read(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id) |
        (models.Notification.role_target == current_user.role)
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}

