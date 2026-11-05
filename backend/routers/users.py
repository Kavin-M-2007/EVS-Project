from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/users", tags=["User Management"])

@router.get("", response_model=List[schemas.UserResponse])
def list_users(
    role: Optional[str] = None,
    municipality_id: Optional[int] = None,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN", "MUNICIPALITY_MONITOR"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.User)

    if current_user.role == "SUPER_ADMIN":
        if municipality_id:
            query = query.filter(models.User.municipality_id == municipality_id)
    else:
        # Admin and Monitor are locked to their municipality
        query = query.filter(models.User.municipality_id == current_user.municipality_id)

    if role:
        query = query.filter(models.User.role == role)

    users = query.order_by(models.User.created_at.desc()).all()
    
    result = []
    for u in users:
        result.append(schemas.UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            employee_id=u.employee_id,
            role=u.role,
            municipality_id=u.municipality_id,
            assigned_area=u.assigned_area,
            phone_number=u.phone_number,
            status=u.status,
            created_at=u.created_at,
            last_login=u.last_login,
            municipality_name=u.municipality.name if u.municipality else "Global Platform"
        ))
    return result

@router.post("", response_model=schemas.UserResponse)
def create_user(
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN"])),
    db: Session = Depends(get_db)
):
    # RBAC check on role creation
    if current_user.role == "ADMIN":
        # Admin can ONLY create GARBAGE_COLLECTOR or MUNICIPALITY_MONITOR in their assigned municipality
        if user_in.role not in ("GARBAGE_COLLECTOR", "MUNICIPALITY_MONITOR"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admins are only authorized to create Garbage Collectors and Municipality Monitors."
            )
        # Lock to admin's municipality
        target_muni_id = current_user.municipality_id
    else:
        # Super Admin can create any role
        target_muni_id = user_in.municipality_id

    # Check email / employee ID uniqueness
    if db.query(models.User).filter(models.User.email == user_in.email.lower().strip()).first():
        raise HTTPException(status_code=400, detail="A user with this email address already exists.")
    if db.query(models.User).filter(models.User.employee_id == user_in.employee_id.strip()).first():
        raise HTTPException(status_code=400, detail="A user with this Employee ID already exists.")

    new_user = models.User(
        email=user_in.email.lower().strip(),
        password_hash=auth.hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        employee_id=user_in.employee_id.strip(),
        role=user_in.role,
        municipality_id=target_muni_id,
        assigned_area=user_in.assigned_area,
        phone_number=user_in.phone_number,
        status="ACTIVE"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        action="USER_CREATED",
        entity_type="USER",
        entity_id=str(new_user.id),
        details=f"Created user {new_user.full_name} ({new_user.email}) as {new_user.role}."
    )
    db.add(audit)
    db.commit()

    return schemas.UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        employee_id=new_user.employee_id,
        role=new_user.role,
        municipality_id=new_user.municipality_id,
        assigned_area=new_user.assigned_area,
        phone_number=new_user.phone_number,
        status=new_user.status,
        created_at=new_user.created_at,
        last_login=new_user.last_login,
        municipality_name=new_user.municipality.name if new_user.municipality else "Global Platform"
    )

@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN"])),
    db: Session = Depends(get_db)
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if current_user.role == "ADMIN":
        if target_user.municipality_id != current_user.municipality_id:
            raise HTTPException(status_code=403, detail="Unauthorized to modify users from another municipality.")
        if target_user.role in ("SUPER_ADMIN", "ADMIN"):
            raise HTTPException(status_code=403, detail="Admins cannot modify administrator accounts.")

    if user_update.full_name is not None:
        target_user.full_name = user_update.full_name
    if user_update.phone_number is not None:
        target_user.phone_number = user_update.phone_number
    if user_update.assigned_area is not None:
        target_user.assigned_area = user_update.assigned_area
    if user_update.status is not None:
        target_user.status = user_update.status
    if user_update.password:
        target_user.password_hash = auth.hash_password(user_update.password)

    # Super admin only updates
    if current_user.role == "SUPER_ADMIN":
        if user_update.role is not None:
            target_user.role = user_update.role
        if user_update.municipality_id is not None:
            target_user.municipality_id = user_update.municipality_id

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        action="USER_UPDATED",
        entity_type="USER",
        entity_id=str(target_user.id),
        details=f"Updated user profile for {target_user.email}."
    )
    db.add(audit)
    db.commit()

    return schemas.UserResponse(
        id=target_user.id,
        email=target_user.email,
        full_name=target_user.full_name,
        employee_id=target_user.employee_id,
        role=target_user.role,
        municipality_id=target_user.municipality_id,
        assigned_area=target_user.assigned_area,
        phone_number=target_user.phone_number,
        status=target_user.status,
        created_at=target_user.created_at,
        last_login=target_user.last_login,
        municipality_name=target_user.municipality.name if target_user.municipality else "Global Platform"
    )

