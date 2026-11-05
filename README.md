# Personal Expense Tracker

React + Vite + Tailwind + Chart.js frontend, FastAPI + SQLAlchemy + PostgreSQL backend, JWT auth, Alembic migrations.

## Run locally

```bash
# 1. Database
docker compose up database -d

# 2. Backend (http://localhost:8000, docs at /docs)
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload

# 3. Frontend (http://localhost:5173) - new terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Tests

```bash
cd backend && pytest
```

## Deploy

- **Backend (Render):** create a Web Service from `backend/` using the Dockerfile (or use `render.yaml`).
  Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (your Vercel URL). Migrations run on container start.
- **Frontend (Vercel):** import `frontend/`, set `VITE_API_URL=https://<your-render-app>.onrender.com/api`.
  `vercel.json` handles SPA routing.

## Before real production use

Move tokens to HttpOnly cookies, add rate limiting, password reset / email verification,
budgets CRUD (table described in the spec but not yet implemented), and per-user currency.
