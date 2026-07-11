<div align="center">

# EmpowerAI

**AI-powered career platform for South African youth**

[![Status](https://img.shields.io/badge/status-public%20beta-brightgreen?style=flat-square)](https://github.com/EmpowaAI/EmpowerAI)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Python%20%7C%20Supabase-blueviolet?style=flat-square)]()

[Report Bug](https://github.com/EmpowaAI/EmpowerAI/issues) · [Request Feature](https://github.com/EmpowaAI/EmpowerAI/issues) · [Security](SECURITY.md) · [Beta Testers](BETA_TESTERS.md)

</div>

---

EmpowerAI uses a Digital Economic Twin, CV analysis, interview coaching, and real-time opportunity matching to help young South Africans find work and build careers — in their own languages, from wherever they are.

> **🧪 Public Beta:** EmpowaAI is in open beta. If you're testing, please read the
> **[Beta Tester Guide](BETA_TESTERS.md)** — it explains what to expect (e.g. sign-up
> has no email-verification step during beta) and how to report issues.

## Features

| Feature | Description |
|---|---|
| **Digital Economic Twin** | AI model of your career potential — income projections, skill gaps, growth paths |
| **CV Analyser** | ATS score, keyword gaps, readiness level, and actionable improvements |
| **CV Revamp** | AI rewrites your CV to pass ATS filters |
| **Opportunity Matching** | Learnerships, internships, bursaries, and jobs matched to your skills and province |
| **Interview Coach** | Practice sessions with real-time AI feedback (tech, behavioural, non-tech) |
| **AI Mentor** | 24/7 career guidance in 11 South African languages |

## Architecture

```
EmpowerAI/
├── frontend/              React 18 + TypeScript + Vite    → Vercel
├── empowerai-backend/     Node.js 20 + Express 5          → Render
└── ai-service/            Python 3.11 + FastAPI           → Render
```

**Infrastructure:**

| Layer | Technology |
|---|---|
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| Storage | Supabase Storage |
| Payments | Paystack |
| Email | Brevo |
| Job data | Adzuna API + RSS feeds |

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.11+
- A [Supabase](https://supabase.com) project (free tier works for local dev)

### 1. Clone and set up the database

```bash
git clone https://github.com/EmpowaAI/EmpowerAI.git
cd EmpowerAI
```

Open your Supabase project → SQL Editor and run `empowerai-backend/schema.sql`,
then run each file in `empowerai-backend/migrations/` (in filename order) to
create the `interview_sessions` and `saved_opportunities` tables and apply the
security/consent updates.  
Note your **Project URL** and **service role key** from Settings → API.

### 2. Option A — Docker (recommended)

The fastest way to run all three services together:

```bash
# Copy and fill in all three env files (Supabase keys, AI provider key, encryption key)
cp empowerai-backend/.env.example empowerai-backend/.env
cp ai-service/.env.example ai-service/.env
cp frontend/.env.example frontend/.env.local

# Start everything
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| AI Service | http://localhost:8000 |

To also start Redis (needed for the BullMQ async queue):
```bash
docker compose --profile redis up --build
```

### Option B — Manual setup

#### Backend

```bash
cd empowerai-backend
cp .env.example .env
# Edit .env: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATA_ENCRYPTION_KEY
npm install
npm run dev
```

Generate `DATA_ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### AI Service

```bash
cd ai-service
python -m venv venv && source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_BASE_URL
npm install
npm run dev
```

App starts at `http://localhost:5173`.

## Environment variables

### Backend (`empowerai-backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service-role key — **never expose client-side** |
| `DATA_ENCRYPTION_KEY` | Yes | 64-char hex for AES-256-GCM encryption of PII |
| `AI_SERVICE_URL` | Yes | FastAPI service URL |
| `FRONTEND_URL` | Yes | Frontend URL (used in email auth redirects) |
| `BREVO_API_KEY` | Email | Transactional email delivery |
| `PAYSTACK_SECRET_KEY` | Payments | Paystack server key |

See `.env.example` for the complete list.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Same as backend `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase **anon** key (safe for browser) |
| `VITE_API_BASE_URL` | Yes | Backend URL, e.g. `http://localhost:5000/api` |

## API reference

All protected endpoints require `Authorization: Bearer <supabase-jwt>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Sign in, returns JWT |
| GET  | `/api/auth/validate` | Token | Validate token + profile |
| POST | `/api/account/forgot-password` | Public | Send reset email |
| POST | `/api/account/reset-password` | Token | Set new password |
| GET  | `/api/twin/` | Token | Get economic twin |
| POST | `/api/twin/` | Token | Create/update twin |
| POST | `/api/twin/build-from-cv` | Token | Build twin from CV |
| POST | `/api/twin/simulate` | Token | Run career simulation |
| POST | `/api/twin/chat/message` | Token | AI twin chat |
| POST | `/api/cv/analyze-file` | Token | Analyse uploaded CV |
| GET  | `/api/opportunities` | Optional | Browse opportunities |
| POST | `/api/applications` | Token | Track application |
| POST | `/api/interview/start` | Token | Start mock interview |
| GET  | `/api/health` | Public | Health check |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We welcome contributors — especially developers, AI researchers, and people with lived experience of South Africa's job market.

## Security

See [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## Licence

MIT. See [LICENSE](LICENSE).
