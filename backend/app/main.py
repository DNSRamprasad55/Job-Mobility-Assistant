"""Internal Job Mobility Assistant - FastAPI Application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.config import get_settings
from app.database.database import engine, Base, SessionLocal
from app.models.models import User, UserRole
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.jobs import router as jobs_router
from app.api.applications import router as applications_router
from app.api.ai import router as ai_router
from app.utils.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


def seed_sample_data():
    """Seed sample jobs and demo users if database is empty."""
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            hr = User(
                fullname="Sarah Johnson",
                email="hr@company.com",
                password=hash_password("hr123456"),
                role=UserRole.hr_manager,
            )
            employee = User(
                fullname="John Doe",
                email="employee@company.com",
                password=hash_password("emp123456"),
                role=UserRole.employee,
            )
            db.add_all([hr, employee])
            db.commit()
            db.refresh(hr)
            db.refresh(employee)

            from app.models.models import EmployeeProfile, Job

            db.add(EmployeeProfile(
                user_id=employee.id,
                designation="Software Engineer",
                department="Engineering",
                experience="3 years",
                education="B.Tech Computer Science",
                skills="Python, JavaScript, React, FastAPI, SQL",
                certifications="AWS Cloud Practitioner",
                interests="AI, Cloud Computing, Leadership",
                summary="Full-stack developer with passion for AI-driven solutions",
            ))

            sample_jobs = [
                Job(
                    title="Senior Software Engineer",
                    department="Engineering",
                    description="Lead development of enterprise web applications using modern tech stack. Mentor junior developers and drive architectural decisions.",
                    required_skills="Python, FastAPI, React, System Design, Leadership",
                    experience="5+ years",
                    location="Remote",
                    posted_by=hr.id,
                ),
                Job(
                    title="Data Scientist",
                    department="Analytics",
                    description="Build ML models for internal HR analytics and talent management. Work with Gemini AI and large datasets.",
                    required_skills="Python, Machine Learning, Statistics, SQL, TensorFlow",
                    experience="3+ years",
                    location="Hybrid - New York",
                    posted_by=hr.id,
                ),
                Job(
                    title="Product Manager",
                    department="Product",
                    description="Drive product strategy for internal mobility platform. Collaborate with engineering and HR teams.",
                    required_skills="Product Strategy, Agile, Communication, Data Analysis",
                    experience="4+ years",
                    location="San Francisco",
                    posted_by=hr.id,
                ),
                Job(
                    title="DevOps Engineer",
                    department="Infrastructure",
                    description="Manage CI/CD pipelines, cloud infrastructure, and deployment automation for enterprise applications.",
                    required_skills="Docker, Kubernetes, AWS, CI/CD, Terraform",
                    experience="3+ years",
                    location="Remote",
                    posted_by=hr.id,
                ),
            ]
            db.add_all(sample_jobs)
            db.commit()
            logger.info("Sample data seeded successfully")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_sample_data()
    yield


app = FastAPI(
    title="Internal Job Mobility Assistant",
    description="Enterprise AI-powered internal job mobility, career planning, and resume analysis platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error("Database error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred"},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred"},
    )


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(ai_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Internal Job Mobility Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
