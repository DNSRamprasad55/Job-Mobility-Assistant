"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.models import UserRole, ApplicationStatus


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    fullname: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.employee


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


# ── User ──────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fullname: str
    email: str
    role: UserRole
    created_at: datetime


# ── Employee Profile ──────────────────────────────────────────────────────────

class EmployeeProfileBase(BaseModel):
    designation: str = ""
    department: str = ""
    experience: str = ""
    education: str = ""
    skills: str = ""
    certifications: str = ""
    interests: str = ""
    summary: str = ""


class EmployeeProfileUpdate(EmployeeProfileBase):
    pass


class EmployeeProfileResponse(EmployeeProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fullname: str
    email: str
    role: UserRole
    created_at: datetime
    profile: Optional[EmployeeProfileResponse] = None


# ── Jobs ──────────────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    department: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    required_skills: str = ""
    experience: str = ""
    location: str = ""


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    experience: Optional[str] = None
    location: Optional[str] = None


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    department: str
    description: str
    required_skills: str
    experience: str
    location: str
    posted_by: int
    created_at: datetime


# ── Applications ──────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    job_id: int


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    job_id: int
    status: ApplicationStatus
    match_score: float
    analysis: str
    created_at: datetime
    job: Optional[JobResponse] = None


# ── AI ────────────────────────────────────────────────────────────────────────

class JobMatchRequest(BaseModel):
    job_id: int


class CareerPlanRequest(BaseModel):
    pass


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)


class JobMatchResponse(BaseModel):
    match_score: float
    summary: str
    matching_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]
    weekly_learning_plan: list[str]


class CareerPathDetail(BaseModel):
    role: str
    reason: str
    required_skills: list[str]
    learning_roadmap: list[str]
    weekly_plan: list[str]
    certifications: list[str]
    expected_timeline: str


class CareerPlanResponse(BaseModel):
    upward_path: CareerPathDetail
    lateral_path: CareerPathDetail
    upskill_path: CareerPathDetail


class ResumeAnalysisResponse(BaseModel):
    technical_skills: list[str]
    soft_skills: list[str]
    experience: list[str]
    strengths: list[str]
    weaknesses: list[str]
    certifications: list[str]
    projects: list[str]
    recommendations: list[str]


class ResumeAnalysisStored(ResumeAnalysisResponse):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    created_at: datetime


# ── Analytics ─────────────────────────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    total_jobs: int = 0
    total_applications: int = 0
    shortlisted: int = 0
    offered: int = 0
    rejected: int = 0
    applications_by_department: dict[str, int] = {}
    hiring_funnel: dict[str, int] = {}
    top_candidates: list[dict[str, Any]] = []


class EmployeeDashboardStats(BaseModel):
    available_jobs: int = 0
    applied_jobs: int = 0
    career_score: float = 0.0
    recommended_jobs: list[JobResponse] = []


class MessageResponse(BaseModel):
    message: str
