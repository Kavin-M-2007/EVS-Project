from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    limit: int = Query(50, le=200),
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.AuditLog)

    if action:
        query = query.filter(models.AuditLog.action == action)

    logs = query.order_by(models.AuditLog.created_at.desc()).limit(limit).all()

    return [
        schemas.AuditLogResponse(
            id=log.id,
            user_email=log.user_email,
            user_role=log.user_role,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            details=log.details,
            ip_address=log.ip_address,
            created_at=log.created_at
        ) for log in logs
    ]

