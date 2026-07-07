"""SQLAlchemy ORM models."""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    Enum,
)
from sqlalchemy.orm import relationship

from app.database.database import Base


class UserRole(str, enum.Enum):
    employee = "employee"
    hr_manager = "hr_manager"
    admin = "admin"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    offered = "offered"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.employee, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("EmployeeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    posted_jobs = relationship("Job", back_populates="poster", foreign_keys="Job.posted_by")
    applications = relationship("Application", back_populates="employee", foreign_keys="Application.employee_id")
    resume_analyses = relationship("ResumeAnalysis", back_populates="employee", cascade="all, delete-orphan")
    career_plans = relationship("CareerPlan", back_populates="employee", cascade="all, delete-orphan")


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    designation = Column(String(255), default="")
    department = Column(String(255), default="")
    experience = Column(String(255), default="")
    education = Column(Text, default="")
    skills = Column(Text, default="")
    certifications = Column(Text, default="")
    interests = Column(Text, default="")
    summary = Column(Text, default="")

    user = relationship("User", back_populates="profile")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, default="")
    experience = Column(String(255), default="")
    location = Column(String(255), default="")
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    poster = relationship("User", back_populates="posted_jobs", foreign_keys=[posted_by])
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.applied, nullable=False)
    match_score = Column(Float, default=0.0)
    analysis = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("User", back_populates="applications", foreign_keys=[employee_id])
    job = relationship("Job", back_populates="applications")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    extracted_skills = Column(Text, default="")
    strengths = Column(Text, default="")
    weaknesses = Column(Text, default="")
    certifications = Column(Text, default="")
    recommendations = Column(Text, default="")
    technical_skills = Column(Text, default="")
    soft_skills = Column(Text, default="")
    experience = Column(Text, default="")
    projects = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("User", back_populates="resume_analyses")


class CareerPlan(Base):
    __tablename__ = "career_plans"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    upward_path = Column(Text, default="")
    lateral_path = Column(Text, default="")
    upskill_path = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("User", back_populates="career_plans")
