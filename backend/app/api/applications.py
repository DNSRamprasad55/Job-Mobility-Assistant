"""Application management API routes."""

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user, get_current_hr
from app.database.database import get_db
from app.models.models import User, Application
from app.schemas.schemas import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    MessageResponse,
)
from app.services.business_service import apply_with_analysis

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/apply", response_model=ApplicationResponse)
async def apply_for_job(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        application = await apply_with_analysis(db, current_user, data.job_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    db.refresh(application)
    application = (
        db.query(Application)
        .options(joinedload(Application.job))
        .filter(Application.id == application.id)
        .first()
    )
    return application


@router.get("/my", response_model=List[ApplicationResponse])
def my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Application)
        .options(joinedload(Application.job))
        .filter(Application.employee_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )


@router.get("/all", response_model=List[ApplicationResponse])
def all_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_hr),
):
    return (
        db.query(Application)
        .options(joinedload(Application.job))
        .order_by(Application.created_at.desc())
        .all()
    )


@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_hr),
):
    application = (
        db.query(Application)
        .options(joinedload(Application.job))
        .filter(Application.id == application_id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    application.status = data.status
    db.commit()
    db.refresh(application)
    return application
