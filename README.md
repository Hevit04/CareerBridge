# CareerBridge — Backend API

FastAPI + SQLAlchemy backend for the CareerBridge platform.

## Project Structure

```
careerbridge-backend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── core/
│   │   ├── config.py            # Pydantic settings (.env)
│   │   ├── database.py          # SQLAlchemy engine + session + get_db
│   │   └── security.py          # JWT, password hashing, auth dependencies
│   ├── models/
│   │   ├── user.py              # User (student / admin)
│   │   ├── assessment.py        # Test, Question, TestAttempt
│   │   ├── interview.py         # InterviewSession, InterviewResponse
│   │   └── internship.py        # Internship, Application
│   ├── schemas/
│   │   ├── auth.py              # Login / Register / Token
│   │   ├── user.py              # UserOut, UserUpdate, AdminUserAction
│   │   ├── assessment.py        # TestOut, QuestionOut, SubmitAttempt, AttemptResult
│   │   ├── interview.py         # SessionOut, SubmitResponse, SessionSummary
│   │   ├── internship.py        # InternshipOut, ApplicationOut
│   │   └── analytics.py        # DashboardStats, AdminAnalyticsSummary
│   └── routers/
│       ├── auth.py              # POST /register  POST /login  GET /me
│       ├── users.py             # GET/PATCH /users/me  POST /users/me/resume
│       ├── assessments.py       # GET tests, POST submit, GET my-attempts
│       ├── interviews.py        # POST start/response/complete, GET sessions
│       ├── internships.py       # GET list, POST apply, GET my-applications
│       ├── analytics.py         # GET /analytics/dashboard
│       └── admin.py             # Full admin CRUD for users/tests/internships
├── alembic/                     # DB migrations
├── seed.py                      # One-time data seeder
├── requirements.txt
├── .env.example
└── README.md
```

## Quick Start

### 1. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if needed (SECRET_KEY, DATABASE_URL)
```

### 4. Seed the database

```bash
python seed.py
```

This creates:
- **Admin account** — `admin@career.ai` / `admin123`
- **Demo student** — `demo@career.ai` / `demo123`  (mirrors frontend demo)
- 4 demo student accounts (Aarav, Diya, Riya)
- 4 tests with full question banks (DSA, Aptitude, System Design, Verbal)
- 8 internship listings (Google, Microsoft, Flipkart, Amazon, …)

### 5. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Explore the API docs

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET  | `/api/auth/me` | Get logged-in user info |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/users/me` | Full profile |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/users/me/resume` | Upload PDF resume |
| GET  | `/api/users/me/readiness` | Readiness score |

### Assessments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/assessments/tests` | List active tests |
| GET  | `/api/assessments/tests/{id}/questions` | Get questions (no answers) |
| POST | `/api/assessments/submit` | Submit answers → score + breakdown |
| GET  | `/api/assessments/attempts/me` | My past attempts |
| GET  | `/api/assessments/stats/me` | KPI stats |

### Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/start` | Start a session |
| POST | `/api/interviews/response` | Submit one answer |
| POST | `/api/interviews/complete` | End session + compute score |
| GET  | `/api/interviews/sessions/me` | Past sessions |
| GET  | `/api/interviews/stats/me` | KPI stats |

### Internships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/internships/` | List (with match scores) |
| GET  | `/api/internships/{id}` | Single listing |
| POST | `/api/internships/apply` | Apply |
| GET  | `/api/internships/applications/me` | My applications |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/analytics/dashboard` | Full dashboard payload |

### Admin (requires admin JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/users` | All users |
| POST | `/api/admin/users/{id}/action` | Block/unblock/reset |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET/POST | `/api/admin/tests` | List / create tests |
| PATCH/DELETE | `/api/admin/tests/{id}` | Update / delete test |
| POST | `/api/admin/tests/{id}/questions` | Add question |
| GET/DELETE | `/api/admin/tests/{id}/questions/{qid}` | Manage questions |
| GET/POST | `/api/admin/internships` | List / create internships |
| PATCH/DELETE | `/api/admin/internships/{id}` | Update / delete internship |
| GET  | `/api/admin/analytics` | System-wide analytics |

---

## Connecting to the Frontend

Update the frontend API base URL to point to `http://localhost:8000`.

All protected routes require the `Authorization: Bearer <token>` header.

Example login + fetch pattern:

```js
// login
const res = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, role })
})
const { access_token, role } = await res.json()
localStorage.setItem('token', access_token)

// authenticated request
const data = await fetch('http://localhost:8000/api/analytics/dashboard', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json())
```

---

## Production Checklist

- [ ] Change `SECRET_KEY` in `.env` to a strong random value
- [ ] Switch `DATABASE_URL` to PostgreSQL
- [ ] Run `alembic upgrade head` instead of `Base.metadata.create_all`
- [ ] Add HTTPS / reverse proxy (nginx)
- [ ] Replace mock interview scoring in `interviews.py` with an NLP model
- [ ] Replace match scoring in `internships.py` with ML recommendations
- [ ] Add email service for password reset
- [ ] Add rate limiting (slowapi)
