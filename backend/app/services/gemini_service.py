"""Google Gemini AI service with structured JSON responses."""

import asyncio
import json
import logging
from typing import Any

import google.generativeai as genai

from app.config import get_settings
from app.utils.helpers import extract_json, ensure_list

logger = logging.getLogger(__name__)
settings = get_settings()

MAX_RETRIES = 3
TIMEOUT_SECONDS = 60


class GeminiService:
    """Reusable Gemini AI service with retries and JSON parsing."""

    def __init__(self) -> None:
        self._configured = False
        if settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here":
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self._configured = True

    def _check_configured(self) -> None:
        if not self._configured:
            raise RuntimeError(
                "Gemini API key is not configured. Set GEMINI_API_KEY in .env"
            )

    async def _generate(self, prompt: str) -> str:
        self._check_configured()
        loop = asyncio.get_event_loop()

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None,
                        lambda: self.model.generate_content(
                            prompt,
                            generation_config=genai.types.GenerationConfig(
                                temperature=0.3,
                                response_mime_type="application/json",
                            ),
                        ),
                    ),
                    timeout=TIMEOUT_SECONDS,
                )
                text = response.text.strip()
                if not text:
                    raise ValueError("Empty response from Gemini")
                return text
            except asyncio.TimeoutError:
                logger.warning("Gemini timeout on attempt %d", attempt)
                if attempt == MAX_RETRIES:
                    raise RuntimeError("Gemini API request timed out") from None
            except Exception as exc:
                logger.warning("Gemini error on attempt %d: %s", attempt, exc)
                if attempt == MAX_RETRIES:
                    raise RuntimeError(f"Gemini API failed: {exc}") from exc
                await asyncio.sleep(1 * attempt)

        raise RuntimeError("Gemini API failed after retries")

    def _fallback_job_match(self, profile: dict, job: dict) -> dict[str, Any]:
        profile_skills = set(s.strip().lower() for s in profile.get("skills", "").split(",") if s.strip())
        job_skills = set(s.strip().lower() for s in job.get("required_skills", "").split(",") if s.strip())
        matching = profile_skills & job_skills
        missing = job_skills - profile_skills
        score = round((len(matching) / max(len(job_skills), 1)) * 100, 1) if job_skills else 65.0
        return {
            "match_score": score,
            "summary": f"Profile aligns with {job.get('title', 'this role')} based on skill overlap.",
            "matching_skills": list(matching) or ["General professional skills"],
            "missing_skills": list(missing) or ["Role-specific advanced skills"],
            "recommendations": [
                "Complete relevant certifications",
                "Build portfolio projects in required domain",
                "Shadow team members in target department",
            ],
            "weekly_learning_plan": [
                "Week 1: Review job requirements and gap analysis",
                "Week 2: Complete online course for top missing skill",
                "Week 3: Apply skills in internal project",
                "Week 4: Schedule informational interview with hiring manager",
            ],
        }

    async def job_match(self, profile: dict, job: dict) -> dict[str, Any]:
        prompt = f"""You are an expert HR AI assistant for internal job mobility.
Analyze the employee profile against the job description and return ONLY valid JSON with this exact structure:
{{
  "match_score": <number 0-100>,
  "summary": "<brief match summary>",
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "weekly_learning_plan": ["week1 plan", "week2 plan", "week3 plan", "week4 plan"]
}}

Employee Profile:
- Designation: {profile.get('designation', 'N/A')}
- Department: {profile.get('department', 'N/A')}
- Experience: {profile.get('experience', 'N/A')}
- Education: {profile.get('education', 'N/A')}
- Skills: {profile.get('skills', 'N/A')}
- Certifications: {profile.get('certifications', 'N/A')}
- Summary: {profile.get('summary', 'N/A')}

Job:
- Title: {job.get('title', 'N/A')}
- Department: {job.get('department', 'N/A')}
- Description: {job.get('description', 'N/A')}
- Required Skills: {job.get('required_skills', 'N/A')}
- Experience Required: {job.get('experience', 'N/A')}
- Location: {job.get('location', 'N/A')}
"""
        try:
            raw = await self._generate(prompt)
            data = extract_json(raw)
            return {
                "match_score": float(data.get("match_score", 0)),
                "summary": str(data.get("summary", "")),
                "matching_skills": ensure_list(data.get("matching_skills")),
                "missing_skills": ensure_list(data.get("missing_skills")),
                "recommendations": ensure_list(data.get("recommendations")),
                "weekly_learning_plan": ensure_list(data.get("weekly_learning_plan")),
            }
        except Exception as exc:
            logger.error("Job match AI failed, using fallback: %s", exc)
            return self._fallback_job_match(profile, job)

    async def career_plan(self, profile: dict) -> dict[str, Any]:
        path_template = """{{
  "role": "<target role>",
  "reason": "<why this path fits>",
  "required_skills": ["skill1", "skill2"],
  "learning_roadmap": ["step1", "step2", "step3"],
  "weekly_plan": ["week1", "week2", "week3", "week4"],
  "certifications": ["cert1", "cert2"],
  "expected_timeline": "<timeline e.g. 12-18 months>"
}}"""

        prompt = f"""You are a career development AI coach for internal mobility.
Based on the employee profile, generate three career paths and return ONLY valid JSON:
{{
  "upward_path": {path_template},
  "lateral_path": {path_template},
  "upskill_path": {path_template}
}}

Employee Profile:
- Designation: {profile.get('designation', 'N/A')}
- Department: {profile.get('department', 'N/A')}
- Experience: {profile.get('experience', 'N/A')}
- Education: {profile.get('education', 'N/A')}
- Skills: {profile.get('skills', 'N/A')}
- Certifications: {profile.get('certifications', 'N/A')}
- Interests: {profile.get('interests', 'N/A')}
- Summary: {profile.get('summary', 'N/A')}
"""
        try:
            raw = await self._generate(prompt)
            data = extract_json(raw)
            result = {}
            for key in ("upward_path", "lateral_path", "upskill_path"):
                path = data.get(key, {})
                result[key] = {
                    "role": str(path.get("role", "Senior Professional")),
                    "reason": str(path.get("reason", "Based on your current trajectory")),
                    "required_skills": ensure_list(path.get("required_skills")),
                    "learning_roadmap": ensure_list(path.get("learning_roadmap")),
                    "weekly_plan": ensure_list(path.get("weekly_plan")),
                    "certifications": ensure_list(path.get("certifications")),
                    "expected_timeline": str(path.get("expected_timeline", "12-18 months")),
                }
            return result
        except Exception as exc:
            logger.error("Career plan AI failed, using fallback: %s", exc)
            return self._fallback_career_plan(profile)

    def _fallback_career_plan(self, profile: dict) -> dict[str, Any]:
        designation = profile.get("designation", "Professional")
        dept = profile.get("department", "your department")

        def make_path(role: str, reason: str) -> dict:
            return {
                "role": role,
                "reason": reason,
                "required_skills": ["Leadership", "Strategic Planning", "Communication"],
                "learning_roadmap": [
                    "Assess current skill gaps",
                    "Enroll in leadership program",
                    "Lead cross-functional initiative",
                ],
                "weekly_plan": [
                    "Week 1: Self-assessment and goal setting",
                    "Week 2: Skill development course",
                    "Week 3: Mentorship sessions",
                    "Week 4: Progress review",
                ],
                "certifications": ["PMP", "Industry-specific certification"],
                "expected_timeline": "12-18 months",
            }

        return {
            "upward_path": make_path(
                f"Senior {designation}",
                f"Natural progression from {designation} with demonstrated expertise",
            ),
            "lateral_path": make_path(
                f"{designation} - {dept} Specialist",
                "Leverage existing skills in a complementary role",
            ),
            "upskill_path": make_path(
                "Technical Lead / Architect",
                "Deepen technical expertise for future leadership",
            ),
        }

    async def resume_analysis(self, resume_text: str) -> dict[str, Any]:
        prompt = f"""You are an expert resume analyzer for internal career mobility.
Analyze the resume text and return ONLY valid JSON with this exact structure:
{{
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"],
  "experience": ["exp1", "exp2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "certifications": ["cert1"],
  "projects": ["project1"],
  "recommendations": ["rec1", "rec2"]
}}

Resume Text:
{resume_text[:8000]}
"""
        try:
            raw = await self._generate(prompt)
            data = extract_json(raw)
            return {
                "technical_skills": ensure_list(data.get("technical_skills")),
                "soft_skills": ensure_list(data.get("soft_skills")),
                "experience": ensure_list(data.get("experience")),
                "strengths": ensure_list(data.get("strengths")),
                "weaknesses": ensure_list(data.get("weaknesses")),
                "certifications": ensure_list(data.get("certifications")),
                "projects": ensure_list(data.get("projects")),
                "recommendations": ensure_list(data.get("recommendations")),
            }
        except Exception as exc:
            logger.error("Resume analysis AI failed, using fallback: %s", exc)
            return {
                "technical_skills": ["Communication", "Problem Solving"],
                "soft_skills": ["Teamwork", "Adaptability"],
                "experience": ["Professional experience identified in resume"],
                "strengths": ["Diverse background", "Continuous learner"],
                "weaknesses": ["Consider adding quantifiable achievements"],
                "certifications": [],
                "projects": ["Review resume for project details"],
                "recommendations": [
                    "Add metrics to accomplishments",
                    "Highlight leadership experiences",
                    "Include relevant certifications",
                ],
            }


gemini_service = GeminiService()
