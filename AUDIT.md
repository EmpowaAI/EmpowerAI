# EmpowerAI Project Audit (Static Review)

Date: 2026-04-03

## Scope

- `frontend/`: Vite + React + TypeScript SPA
- `empowerai-backend/`: Express + MongoDB API (JWT auth)
- `ai-service/`: FastAPI AI microservice (OpenAI/Azure OpenAI)

This audit is primarily a static review (code + config). I did not run dependency CVE scans because they typically require network access to vulnerability databases.

## Key Findings

### Critical

1) **Azure/OpenAI API key exposure risk in the browser**
- Issue: Avoid any design where the browser calls Azure/OpenAI with long-lived keys (e.g. `VITE_*` env vars) because those values are bundled into shipped JS.
- Status: Fixed in-repo by removing the only browser-side Azure OpenAI client (`frontend/src/services/azureOpenAIService.ts`).
- Recommendation: Keep all LLM calls behind `empowerai-backend/` → `ai-service/` so secrets stay server-side.

### High

2) **Real credentials present in local `.env` files**
- Files: `empowerai-backend/.env`, `ai-service/.env`
- Issue: These `.env` files contain real-looking secrets (DB credentials, API keys).
- Notes: They appear untracked by git (good), but are still a leak risk if the folder is ever zipped/shared, or if `.env` was previously committed in history.
- Recommendations:
  - Rotate any credentials that may have been exposed.
  - Ensure `.env` remains ignored (it is currently ignored in root and backend `.gitignore`).
  - If these values were ever committed historically, rewrite history (e.g., `git filter-repo`) and rotate keys.

3) **Auth token stored in `localStorage` (XSS -> account takeover)**
- Files (examples): `frontend/src/api/Client.ts`, `frontend/src/lib/api.ts`, `frontend/src/lib/api/core.ts`
- Issue: JWT is stored in `localStorage` (`empowerai-token`).
- Impact: Any XSS on your origin becomes a full token theft and account takeover.
- Recommendations:
  - Prefer `HttpOnly; Secure; SameSite=Lax/Strict` cookies (with CSRF protections if needed).
  - Tighten CSP (and avoid “dangerous” HTML rendering patterns).
  - Reduce token lifetime and consider refresh-token rotation if you must keep JWTs.

### Medium

4) **Backend CORS allow rule is broader than it looks**
- File: `empowerai-backend/src/server.js`
- Issue: `origin?.includes('vercel.app')` allows *any* Vercel-hosted origin in production.
- Impact: If you ever move to cookie-based auth (or have endpoints that act on ambient credentials), this becomes a serious cross-origin risk. Even without cookies, it expands the attack surface and makes reasoning about allowed origins harder.
- Recommendation: Replace substring matching with an explicit allowlist (and/or exact suffix matching to known deployment hostnames only).

5) **Admin access uses a static API key and the UI stores it in `localStorage`**
- Backend: `empowerai-backend/src/middleware/adminAuth.js` (header `x-admin-key`, env `ADMIN_API_KEY`)
- Frontend: `frontend/src/pages/AdminPanel.tsx`, `frontend/src/components/layouts/DashboardLayout.tsx`
- Risks: Key theft via XSS, accidental sharing, no user-level attribution/auditing.
- Recommendations:
  - Prefer real admin accounts/roles (JWT claims + server-side authorization).
  - If keeping an admin key: do not store it client-side; restrict by IP/VPN; add auditing; rotate regularly.

6) **AI service prints configuration at startup**
- File: `ai-service/main.py`
- Issue: Prints `AZURE_OPENAI_ENDPOINT` / model to stdout.
- Recommendation: Remove or gate behind a debug flag; keep logs free of sensitive config.

### Low

7) **Minor hygiene**
- `empowerai-backend/src/server.js` calls `require('dotenv').config()` twice.
- `empowerai-backend/src/utils/fileParser.js` imports `child_process.exec` but does not use it.

## Test/Build Signal

- Backend unit tests: `empowerai-backend/__tests__/dto.validation.test.js` passes when run with `jest --runInBand`.
- Frontend TypeScript: `tsc --noEmit` passes.
- Frontend e2e: `npm run test:e2e` currently fails because `frontend/playwright.config.ts` imports `@playwright/test`, but `@playwright/test` is not installed (only `playwright` is present in `devDependencies`).
- Frontend Vite build could not be executed in this environment due to process-spawn restrictions (`esbuild` service spawn `EPERM`); this is an execution-environment limitation, not necessarily a project bug.

## Suggested Remediation Plan (Prioritized)

1) Remove all browser-side LLM API-key usage; proxy via server-side services.
2) Rotate secrets; ensure `.env` never leaves local/dev/secret manager; add `.env.example` templates (added in this audit).
3) Migrate away from `localStorage` tokens (or harden against XSS with strict CSP + short TTL).
4) Tighten backend CORS to explicit origins only.
5) Fix e2e setup (`@playwright/test`) and run CI for backend + frontend.
