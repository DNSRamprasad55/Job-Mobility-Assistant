"""User profile API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.models import User, EmployeeProfile
from app.schemas.schemas import (
    UserProfileResponse,
    EmployeeProfileUpdate,
    MessageResponse,
)
from app.services.business_service import get_or_create_profile

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_or_create_profile(db, current_user)
    db.refresh(current_user)
    return current_user


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_data: EmployeeProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_or_create_profile(db, current_user)
    for field, value in profile_data.model_dump().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
