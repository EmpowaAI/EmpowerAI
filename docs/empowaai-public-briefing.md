# EmpowerAI - Public Launch Briefing

Use this document as full context when helping present EmpowerAI to the public as an open source project.

---

## What EmpowerAI Is

**EmpowerAI** (branded as **EmpowaAI**) is a South African AI-powered career empowerment platform. It is built to close the gap between young South African job seekers and the opportunities available to them - using AI to level a playing field that has historically been stacked against them.

**Tagline:** "Amandla e-Ubuntu" - power through community.
**Built in Mzansi** (South Africa), for the African job market.

The product is not a generic global career tool. Every feature is shaped around the realities of the South African job market: high youth unemployment, skills mismatch, lack of access to career coaching, and the challenge of presenting oneself professionally to employers who increasingly filter by keyword and algorithm.

---

## Core Features

### 1. CV Analyser
Uploads a CV (PDF or plain text), extracts the content, and runs it through Azure OpenAI to produce:
- A readiness score (0 to 100)
- Missing skills and keywords
- Strengths and weaknesses
- Industry-specific suggestions
- A full written summary

### 2. CV Revamp
Takes the analysed CV and rewrites it using AI - optimised for keywords, ATS (applicant tracking systems), and the target industry. Returns a restructured, professionally worded CV.

### 3. Digital Twin Builder
Builds a personalised "economic twin" - a data model of the user's skills, aspirations, salary expectations, and career trajectory. Used to simulate career scenarios and match opportunities.

### 4. Interview Coach
AI-powered mock interview sessions. Generates questions based on the user's CV and target role, scores answers, and provides coaching feedback.

### 5. AI Mentor (24/7)
A conversational AI mentor that can answer career questions, explain job requirements, help with cover letters, and provide guidance - available around the clock.

### 6. Opportunity Matching
Matches users to job opportunities based on their CV score, skills profile, and Digital Twin data. Uses AI scoring to rank relevance.

---

## Who It's For

**Primary users:** Young South African job seekers, recent graduates, and career changers who lack access to professional career coaching.

**Secondary users:** Developers who want to contribute to South African tech infrastructure and open source projects with social impact.

---

## Technical Architecture

EmpowerAI is a **three-tier monorepo** hosted across three separate services:

### Frontend
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui component library
- **State:** React Context + useReducer
- **Auth:** Supabase client SDK (`supabase.auth.onAuthStateChange`)
- **Hosting:** Vercel (auto-deploys from main branch)
- **Key directory:** `/frontend`

### Backend (API Server)
- **Runtime:** Node.js + Express
- **Language:** JavaScript (CommonJS)
- **Database:** Supabase PostgreSQL (accessed via service role key, bypasses RLS)
- **Auth:** Supabase JWT validation on every request
- **Encryption:** AES-256-GCM field-level encryption of all PII (phone, location, skills, etc.)
- **Queue:** BullMQ (Redis-backed) for async AI jobs
- **Hosting:** Render
- **Key directory:** `/empowerai-backend`

### AI Service
- **Framework:** Python + FastAPI
- **AI provider:** Azure OpenAI (GPT-4 class models)
- **Purpose:** All AI inference - CV analysis, CV revamp, interview question generation, opportunity scoring
- **Auth:** Service-to-service token (`X-Service-Token` header)
- **Hosting:** Render
- **Key directory:** `/ai-service`

### Data Layer
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth (JWT, email/password, magic link)
- **Storage:** Supabase Storage (profile images) + Cloudinary
- **Schema file:** `empowerai-backend/schema.sql`

### Data flow example (CV analysis)
```
User uploads CV (frontend)
  → POST /api/cv/analyse (backend)
    → Extracts text from PDF
    → Encrypts and stores CV metadata
    → Calls ai-service POST /api/cv/text
      → Azure OpenAI processes CV
      → Returns structured JSON analysis
    → Backend encrypts PII fields
    → Returns analysis to frontend
      → Frontend renders results
```

---

## Open Source Status

| Metric | Status |
|--------|--------|
| Open Source Readiness Score | **100 / 100** |
| Licence | **MIT** |
| Published release | **v1.0.0** (June 2026) |
| Automated tests | **59 tests** (unit, no mocking required) |
| Security policy | **SECURITY.md** - responsible disclosure process in place |
| Contribution guide | **CONTRIBUTING.md** - step-by-step for new contributors |
| Code of Conduct | In place |
| Code reviewer | CODEOWNERS - all PRs require @NickiMash17 review |
| Good First Issues | Labelled and discoverable on GitHub |

### What 100/100 means in practice
Every standard the global developer community uses to judge whether a project is safe to contribute to has been met:
- Legal (MIT licence - clear permission to use and build on)
- Security (responsible disclosure policy)
- Community (code of conduct, contribution guide)
- Quality (59 automated tests, CI pipeline)
- Governance (CODEOWNERS - no change merges without human review)
- Discoverability (Good First Issue labels - GitHub surfaces the project to newcomers worldwide)

---

## Current Development State

- **Site status:** Closed to public users during active development phase
- **Team:** Nicolette Mashaba (sole developer - full-stack + AI integration)
- **Repository:** `github.com/EmpowaAI/EmpowerAI` (public)
- **Branch strategy:** `main` auto-deploys to Vercel (frontend) and Render (backend + AI service)

### Recent work completed (June 2026)
- Frontend auth fully migrated from custom token flow to Supabase client sessions
- Footer added across all authenticated dashboard pages
- 20 new issues filed from a full codebase audit (security, bugs, enhancements)
- Docker local dev setup added for all three services
- Secret scanning added to CI pipeline

---

## Issues Backlog (20 open issues as of June 2026)

### Security (Highest Priority)
- AI service endpoints unauthenticated - X-Service-Token middleware not applied (#154)
- Missing rate limiting on /auth/register, /forgot-password, /reset-password (#155)
- CV text and contact form not sanitized - prompt injection / XSS risk (#156)

### Critical Bugs
- Navbar profile link routes to /profile - 404 on click (#157)
- Admin controller uses MongoDB ObjectID instead of Supabase UUID (#158)
- Azure OpenAI client has no explicit timeout (#163)

### Medium Bugs
- Opportunities bookmark/save feature - state defined but UI never rendered (#159)
- localStorage not fully cleared on logout (#160)
- Twin Builder and Interview sessions lost on navigation (#161)
- Interview sessions have no cleanup or TTL (#162)
- Email verification page hangs indefinitely - no timeout or retry (#164)

### Code Quality
- Remove console.log statements from production frontend code (#165)
- Consolidate duplicate Profile pages (#166)

### Enhancements / Good First Issues
- Add loading skeletons for Dashboard stat cards (#167)
- Add empty state for Opportunities page (#168)
- Sync Opportunities pagination to URL query params (#169)
- Add Edit Profile link to ProfileMenu dropdown (#170) ← good first issue
- Add copy-to-clipboard button to CV revamp results (#171) ← good first issue
- Create .env.example for backend (#172) ← good first issue
- Add retry button for CV revamp failure (#173)

---

## How to Contribute

1. Read `CONTRIBUTING.md` in the repo root
2. Find a "Good First Issue" on the issues page (labelled `good first issue`)
3. Fork the repo, create a branch, make the change, open a PR
4. All PRs require review and approval from @NickiMash17 before merge

### Local development
Docker Compose is available for local setup of all three services. See `docker-compose.yml` in the repo root.

### Key environment variables needed
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (backend)
- `DATA_ENCRYPTION_KEY` (64-char hex string - backend)
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (frontend)
- `AI_SERVICE_URL` and `AI_SERVICE_API_KEY` (backend → AI service)
- Azure OpenAI credentials (AI service)

A `.env.example` file is planned (issue #172) but not yet created.

---

## What Makes EmpowerAI Different

1. **South African context built in** - not a generic career tool adapted for SA, but designed from the ground up for the SA job market, including local industry terminology, South African education credentials, and Ubuntu values.

2. **End-to-end AI pipeline** - most career tools use a single AI feature. EmpowerAI chains: CV analysis → CV revamp → career twin → interview prep → opportunity matching. The user's data improves every step.

3. **Privacy-first** - all PII is encrypted at field level (AES-256-GCM) before being stored. The AI service never stores data.

4. **Open source with social impact** - the codebase is freely available for other developers building employment tools for underserved communities.

---

## Suggested framing for public presentation

EmpowerAI is a free, open source career platform built specifically for South African job seekers. It uses AI to do what a professional career coach would do - analyse your CV, rewrite it for the job market, prepare you for interviews, and match you to opportunities - and makes that accessible to anyone with an internet connection.

The project reached its first official release (v1.0.0) in June 2026 and is now open to contributors from the global developer community. It is MIT-licensed, fully documented, and scored 100/100 on open source readiness standards used by projects like React and VS Code.

---

*Prepared by Nicolette Mashaba - June 2026*
*Repository: github.com/EmpowaAI/EmpowerAI*
