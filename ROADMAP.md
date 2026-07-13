# Roadmap

This document tracks what is done, what is in progress, and what comes next. It is updated as priorities shift.

Last updated: 2026-06-13.

---

## Legend

- `[x]` Done
- `[-]` In progress / partially complete
- `[ ]` Planned
- `[~]` Deferred / reconsidering

---

## Phase 1 - Foundation (complete)

### Infrastructure
- [x] Monorepo: React frontend, Node/Express backend, Python FastAPI AI service
- [x] Vercel (frontend), Render (backend + AI service)
- [x] MongoDB removed - fully migrated to Supabase (PostgreSQL)
- [x] Supabase Auth replaces custom JWT + bcrypt stack
- [x] AES-256-GCM field-level encryption for PII (CV data, user profiles)
- [x] Helmet, CORS, rate limiting, compression
- [x] Winston structured logging
- [x] Zod input validation on all routes
- [x] Paystack billing integration (Starter / Professional / Enterprise)
- [x] Per-feature usage metering with monthly reset
- [x] BullMQ queue for async AI jobs

### Features
- [x] User registration + email verification
- [x] Digital Economic Twin creation
- [x] CV file upload and AI analysis (ATS scoring, skill gap, readiness level)
- [x] CV revamp (AI rewrites the CV)
- [x] DOCX export of revamped CV
- [x] Opportunity browsing with province + type filters
- [x] Smart opportunity matching via CV skills
- [x] Application tracking
- [x] Mock interview coach (tech, behavioural, non-tech)
- [x] AI twin chat
- [x] Admin dashboard (users, opportunities, usage)
- [x] RSS feed aggregation for job postings
- [x] Adzuna API integration
- [x] Waitlist system

---

## Phase 2 - Stability (current, ~2026-Q3)

These are the active priorities:

### Critical fixes
- [ ] **Frontend auth migration**: replace `localStorage` custom-token flow with Supabase client auth (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`, session management via `onAuthStateChange`). The backend bridge routes (`/api/auth/*`) currently proxy these calls - the frontend should eventually call Supabase directly for auth and the backend only for application data.
- [ ] **Frontend `.env.local`**: ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are populated and the Supabase client is used for auth
- [ ] **Delete stale scripts**: `empowerai-backend/scripts/` contains MongoDB-era utilities (`createIndexes.js`, `backfillOpportunitySkills.js`, etc.) that will crash if run - replace with Supabase equivalents or delete
- [ ] **`mongodb-memory-server` in devDependencies**: remove from `package.json`, replace tests with Supabase-compatible stubs
- [ ] **`src-v2/` directory in frontend**: either promote to main or delete - it is a dead code branch currently

### Security hardening
- [ ] **HttpOnly cookies for auth tokens**: move the Supabase access token from `localStorage` to a `Set-Cookie: HttpOnly; Secure; SameSite=Strict` header to eliminate XSS exposure. Requires backend `/api/auth/session` endpoint and frontend cookie read pattern.
- [ ] **ENCRYPTION_KEY rotation strategy**: document a process for rotating the AES key without losing existing encrypted data (re-encrypt on next user login)
- [ ] **Audit log table**: add `audit_logs` table to `schema.sql`, implement `createAuditLog` in `admin.Repository.js` for admin actions (user deletion, role changes, opportunity edits)
- [ ] **AI usage log table**: add `ai_usage_logs` table so anomalous AI spend can be detected

### Observability
- [ ] Render health check endpoint wired to uptime monitoring (UptimeRobot or similar)
- [ ] Structured error alerting (email or Slack on 5xx spike)
- [ ] Request ID propagation across backend ↔ AI service for distributed tracing

### Test coverage
- [ ] Integration tests for auth module (register, login, validate)
- [ ] Integration tests for subscription webhook handler
- [ ] Unit tests for `encryption.util.js` (encrypt/decrypt round-trip)
- [ ] Unit tests for opportunity matching score algorithm

---

## Phase 3 - Growth features (~2026-Q4)

### User experience
- [ ] **Onboarding wizard**: guided first-time setup (province, education, skills) - the raw twin creation form is the current flow
- [ ] **Mobile-first redesign**: current UI is desktop-biased; most users will be on mobile with limited data
- [ ] **Offline capability**: cache CV analysis and twin data for users with intermittent connectivity
- [ ] **Notification system**: email + in-app alerts for new matching opportunities, subscription renewals, interview reminders
- [ ] **Progress dashboard**: streak tracking, skill development milestones, income projection updates

### AI features
- [ ] **Interview voice mode**: use Azure Cognitive Services (already installed) for spoken interview practice
- [ ] **Multilingual AI responses**: structured support for Zulu, Xhosa, Sotho, Afrikaans in the AI mentor
- [ ] **Personalised learning paths**: suggest courses, certifications, and side projects based on skill gaps
- [ ] **Economic simulation v2**: multi-path simulation with probability distributions and time-to-employment modelling

### Opportunities
- [ ] **Recruiter portal**: recruiter role with posting, applicant review, shortlisting
- [ ] **Direct application**: apply within the platform for partner opportunities
- [ ] **Learnership calendar**: tracking application deadlines for government and SETA learnerships
- [ ] **Bursary database**: curated list of bursaries with eligibility matching

### Data
- [ ] **Taxonomy persistence**: move career taxonomy from in-memory to a `config` table in Supabase - admin updates survive restarts
- [ ] **Analytics dashboard**: aggregate skill demand trends, provincial opportunity density, cohort outcome tracking
- [ ] **Opportunity quality scoring**: ML model to score relevance and quality of aggregated job postings

---

## Phase 4 - Open source readiness (~2027)

- [ ] Evaluate open-source licensing model (MIT vs AGPL for commercial forks)
- [ ] Contributor documentation: architecture decision records (ADRs), local dev Docker setup
- [ ] GitHub Actions CI: lint, test, build on every PR
- [ ] Automated dependency updates (Dependabot or Renovate)
- [ ] Issue and PR templates
- [ ] Public roadmap (this file in the repo)
- [ ] Contributor recognition: CONTRIBUTORS.md, GitHub Sponsors or Open Collective
- [ ] Community forum or Discord for contributors and users

---

## What we will not build

To keep the scope manageable for a small team:

- **Native mobile app** - the web app will be mobile-optimised instead
- **Custom LLM training** - we use existing providers (Claude, Gemini, etc.) via API
- **CV printing service** - DOCX export covers this need
- **Payroll or HR features** - EmpowerAI is a job-seeker tool, not an employer tool (recruiter portal is limited to opportunity posting)

---

## Architecture decisions

| Decision | Status | Rationale |
|---|---|---|
| Supabase over self-hosted Postgres | Accepted | Reduced ops burden for a solo developer; free tier is viable; Auth + Storage included |
| Express 5 over Fastify/Hapi | Accepted | Familiar, widely documented, contributors unlikely to need retraining |
| React + Vite over Next.js | Accepted | Simpler deployment (static SPA on Vercel); SSR not needed for this app |
| AES-256-GCM field encryption over full-disk | Accepted | Protects against DB breach; field-level allows partial queries on non-sensitive columns |
| Paystack over Stripe | Accepted | Paystack supports ZAR and South African cards without friction; Stripe's SA support is limited |
| Python FastAPI for AI service | Accepted | Python ecosystem has better AI/ML library support; FastAPI is fast and well-documented |
| BullMQ for async jobs | Conditional | Only active when `REDIS_URL` is set; no Redis = synchronous fallback |
