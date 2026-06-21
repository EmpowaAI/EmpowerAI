# Changelog

All notable changes to EmpowerAI are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- GitHub Actions CI workflow for frontend, backend, and AI service
- Issue templates (bug report, feature request) and PR template
- Code of Conduct
- `ai-service/.env.example`
- `empowerai-backend/schema.sql` — full Supabase schema with tables, indexes, RLS policies, and `increment_usage` RPC function
- `CONTRIBUTORS.md` — contributor credits and acknowledgements
- `.github/dependabot.yml` — automated weekly dependency updates for npm (frontend + backend), pip (AI service), and GitHub Actions
- `.github/workflows/ci.yml` — gitleaks secret-scan job runs on every push and PR, blocking merges that contain real credentials
- `.gitleaks.toml` — allowlists `.env.example` and doc files so placeholder values don't trigger false positives
- `SECURITY.md` — new "Credential protection for contributors" section: rules, rotate-if-exposed steps, adding-new-env-var guide
- `docker-compose.yml` — single-command local dev (`docker compose up --build`) for all three services; Redis available via `--profile redis`
- `Dockerfile` for backend, AI service, and frontend — hot reload in all three via source volume mounts
- `.dockerignore` files for all three services

### Fixed
- `ai-service/.gitignore` — was nearly empty; now covers venv, pycache, .env variants, pytest/coverage artefacts

### Removed
- `frontend/src-v2/` dead code directory (App.tsx, components, hooks, pages — unused branch never promoted to main)

---

## [0.9.0] — 2026-06-13

### Added
- Token refresh mechanism: backend `POST /auth/refresh` endpoint; frontend silently refreshes expired Supabase access tokens and retries on 401
- `CVUploadError` auth error category — shows "Session Expired" with a direct login link instead of generic "Try Again"
- `scripts/seedOpportunities.js` — 30 South African job listings auto-seed on first server start
- Skill Gap Analysis action links now use React Router `<Link>` for internal navigation instead of opening new tabs

### Fixed
- CV Analyzer returning 401 "Please log in" after Supabase token expiry (1h TTL)
- Opportunities page showing empty when database had no seed data
- "Revamp CV" action in Skill Gap Analysis navigating to upload form in a new tab instead of the revamp flow

---

## [0.8.0] — 2026-06-10

### Added
- Open source readiness files: `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, `ROADMAP.md`
- `CODEOWNERS` — all PRs require human review
- Comprehensive `README.md` rewrite with architecture diagram and full setup guide
- Frontend and backend `.env.example` files with inline documentation

### Removed
- Stale audit documentation replaced by structured open source docs

---

## [0.7.0] — 2026-05-31

### Fixed
- Dashboard reads live backend data for progress and opportunity count
- Twin API route mismatches
- CV Analyzer missing imports
- Duplicate middleware registration

### Added
- Security audit logging
- Admin rate limiting controls

---

## [0.1.0] — 2026-01-15

### Added
- Initial platform: Digital Economic Twin, CV Analyser, CV Revamp, Opportunity Matching, Interview Coach, AI Mentor
- Supabase Auth + PostgreSQL
- Paystack subscription payments
- Multi-language support (11 SA languages via AI Mentor)
