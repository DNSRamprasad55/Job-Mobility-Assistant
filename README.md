# Internal Job Mobility Assistant

Enterprise AI-powered internal job mobility, career planning, and resume analysis platform.

## Tech Stack

**Backend:** Python 3.10+, FastAPI, SQLAlchemy, SQLite, JWT, Google Gemini AI  
**Frontend:** React, Vite, Tailwind CSS, React Router, Axios

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@company.com | emp123456 |
| HR Manager | hr@company.com | hr123456 |

## Environment Variables

Set `GEMINI_API_KEY` in `backend/.env` for full AI features. Without it, intelligent fallbacks are used.
