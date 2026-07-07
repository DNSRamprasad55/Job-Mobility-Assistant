"""AI-powered feature API routes."""

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_current_hr
from app.database.database import get_db
from app.models.models import User, CareerPlan, ResumeAnalysis
from app.schemas.schemas import (
    JobMatchRequest,
    CareerPlanRequest,
    ResumeAnalysisRequest,
    JobMatchResponse,
    CareerPlanResponse,
    CareerPathDetail,
    ResumeAnalysisResponse,
    ResumeAnalysisStored,
    AnalyticsResponse,
    EmployeeDashboardStats,
    JobResponse,
)
from app.services.business_service import (
    perform_job_match,
    generate_career_plan,
    analyze_resume,
    get_analytics,
    get_employee_dashboard,
)

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/job-match", response_model=JobMatchResponse)
async def job_match(
    data: JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await perform_job_match(db, current_user, data.job_id)
        return JobMatchResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/career-plan", response_model=CareerPlanResponse)
async def career_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await generate_career_plan(db, current_user)
        return CareerPlanResponse(
            upward_path=CareerPathDetail(**result["upward_path"]),
            lateral_path=CareerPathDetail(**result["lateral_path"]),
            upskill_path=CareerPathDetail(**result["upskill_path"]),
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/career-plan/latest", response_model=CareerPlanResponse)
def get_latest_career_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = (
        db.query(CareerPlan)
        .filter(CareerPlan.employee_id == current_user.id)
        .order_by(CareerPlan.created_at.desc())
        .first()
    )
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No career plan found")

    return CareerPlanResponse(
        upward_path=CareerPathDetail(**json.loads(plan.upward_path)),
        lateral_path=CareerPathDetail(**json.loads(plan.lateral_path)),
        upskill_path=CareerPathDetail(**json.loads(plan.upskill_path)),
    )


@router.post("/resume-analysis", response_model=ResumeAnalysisResponse)
async def resume_analysis(
    data: ResumeAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await analyze_resume(db, current_user, data.resume_text)
        return ResumeAnalysisResponse(**result)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/resume-analysis/latest", response_model=List[ResumeAnalysisStored])
def get_resume_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analyses = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.employee_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .all()
    )
    result = []
    for a in analyses:
        result.append(
            ResumeAnalysisStored(
                id=a.id,
                employee_id=a.employee_id,
                created_at=a.created_at,
                technical_skills=a.technical_skills.split(", ") if a.technical_skills else [],
                soft_skills=a.soft_skills.split(", ") if a.soft_skills else [],
                experience=a.experience.split(", ") if a.experience else [],
                strengths=a.strengths.split(", ") if a.strengths else [],
                weaknesses=a.weaknesses.split(", ") if a.weaknesses else [],
                certifications=a.certifications.split(", ") if a.certifications else [],
                projects=a.projects.split(", ") if a.projects else [],
                recommendations=a.recommendations.split(", ") if a.recommendations else [],
            )
        )
    return result


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_hr),
):
    return AnalyticsResponse(**get_analytics(db))


@router.get("/dashboard/employee", response_model=EmployeeDashboardStats)
def employee_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stats = get_employee_dashboard(db, current_user)
    return EmployeeDashboardStats(
        available_jobs=stats["available_jobs"],
        applied_jobs=stats["applied_jobs"],
        career_score=stats["career_score"],
        recommended_jobs=[JobResponse.model_validate(j) for j in stats["recommended_jobs"]],
    )
