"""Business logic services."""

import json
from typing import Optional

from sqlalchemy.orm import Session

from app.models.models import (
    User,
    EmployeeProfile,
    Job,
    Application,
    ResumeAnalysis,
    CareerPlan,
    ApplicationStatus,
)
from app.services.gemini_service import gemini_service


def get_or_create_profile(db: Session, user: User) -> EmployeeProfile:
    if not user.profile:
        profile = EmployeeProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    return user.profile


def profile_to_dict(profile: EmployeeProfile) -> dict:
    return {
        "designation": profile.designation or "",
        "department": profile.department or "",
        "experience": profile.experience or "",
        "education": profile.education or "",
        "skills": profile.skills or "",
        "certifications": profile.certifications or "",
        "interests": profile.interests or "",
        "summary": profile.summary or "",
    }


def job_to_dict(job: Job) -> dict:
    return {
        "title": job.title,
        "department": job.department,
        "description": job.description,
        "required_skills": job.required_skills or "",
        "experience": job.experience or "",
        "location": job.location or "",
    }


async def perform_job_match(db: Session, user: User, job_id: int) -> dict:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise ValueError("Job not found")

    profile = get_or_create_profile(db, user)
    result = await gemini_service.job_match(profile_to_dict(profile), job_to_dict(job))
    return result


async def generate_career_plan(db: Session, user: User) -> dict:
    profile = get_or_create_profile(db, user)
    result = await gemini_service.career_plan(profile_to_dict(profile))

    plan = db.query(CareerPlan).filter(CareerPlan.employee_id == user.id).first()
    if plan:
        plan.upward_path = json.dumps(result["upward_path"])
        plan.lateral_path = json.dumps(result["lateral_path"])
        plan.upskill_path = json.dumps(result["upskill_path"])
    else:
        plan = CareerPlan(
            employee_id=user.id,
            upward_path=json.dumps(result["upward_path"]),
            lateral_path=json.dumps(result["lateral_path"]),
            upskill_path=json.dumps(result["upskill_path"]),
        )
        db.add(plan)
    db.commit()
    return result


async def analyze_resume(db: Session, user: User, resume_text: str) -> dict:
    result = await gemini_service.resume_analysis(resume_text)

    analysis = ResumeAnalysis(
        employee_id=user.id,
        extracted_skills=", ".join(result.get("technical_skills", [])),
        strengths=", ".join(result.get("strengths", [])),
        weaknesses=", ".join(result.get("weaknesses", [])),
        certifications=", ".join(result.get("certifications", [])),
        recommendations=", ".join(result.get("recommendations", [])),
        technical_skills=", ".join(result.get("technical_skills", [])),
        soft_skills=", ".join(result.get("soft_skills", [])),
        experience=", ".join(result.get("experience", [])),
        projects=", ".join(result.get("projects", [])),
    )
    db.add(analysis)

    profile = get_or_create_profile(db, user)
    if result.get("technical_skills"):
        profile.skills = ", ".join(result["technical_skills"])
    if result.get("certifications"):
        profile.certifications = ", ".join(result["certifications"])
    db.commit()
    db.refresh(analysis)
    return result


async def apply_with_analysis(db: Session, user: User, job_id: int) -> Application:
    existing = (
        db.query(Application)
        .filter(Application.employee_id == user.id, Application.job_id == job_id)
        .first()
    )
    if existing:
        return existing

    match_result = await perform_job_match(db, user, job_id)

    application = Application(
        employee_id=user.id,
        job_id=job_id,
        status=ApplicationStatus.applied,
        match_score=match_result.get("match_score", 0),
        analysis=json.dumps(match_result),
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_analytics(db: Session) -> dict:
    jobs = db.query(Job).all()
    applications = db.query(Application).all()

    dept_counts: dict[str, int] = {}
    for app in applications:
        if app.job:
            dept = app.job.department
            dept_counts[dept] = dept_counts.get(dept, 0) + 1

    funnel = {
        "applied": sum(1 for a in applications if a.status == ApplicationStatus.applied),
        "shortlisted": sum(1 for a in applications if a.status == ApplicationStatus.shortlisted),
        "offered": sum(1 for a in applications if a.status == ApplicationStatus.offered),
        "rejected": sum(1 for a in applications if a.status == ApplicationStatus.rejected),
    }

    top_candidates = sorted(
        [
            {
                "employee_id": a.employee_id,
                "employee_name": a.employee.fullname if a.employee else "Unknown",
                "job_title": a.job.title if a.job else "Unknown",
                "match_score": a.match_score,
                "status": a.status.value,
            }
            for a in applications
        ],
        key=lambda x: x["match_score"],
        reverse=True,
    )[:10]

    return {
        "total_jobs": len(jobs),
        "total_applications": len(applications),
        "shortlisted": funnel["shortlisted"],
        "offered": funnel["offered"],
        "rejected": funnel["rejected"],
        "applications_by_department": dept_counts,
        "hiring_funnel": funnel,
        "top_candidates": top_candidates,
    }


def get_employee_dashboard(db: Session, user: User) -> dict:
    jobs = db.query(Job).all()
    applications = db.query(Application).filter(Application.employee_id == user.id).all()
    applied_job_ids = {a.job_id for a in applications}

    avg_score = (
        sum(a.match_score for a in applications) / len(applications)
        if applications
        else 0.0
    )

    recommended = [j for j in jobs if j.id not in applied_job_ids][:5]

    return {
        "available_jobs": len(jobs),
        "applied_jobs": len(applications),
        "career_score": round(avg_score, 1),
        "recommended_jobs": recommended,
    }
