# Contributing to EmpowerAI

Thank you for your interest in contributing to EmpowerAI. This platform exists to give South African youth real tools for economic mobility — every improvement matters.

EmpowerAI is currently maintained by one primary developer. Contributions are welcome from developers, AI researchers, UX designers, and people with lived experience of SA's job market.

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [How to contribute](#how-to-contribute)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Coding standards](#coding-standards)
- [Pull request process](#pull-request-process)
- [Security](#security)
- [Good first issues](#good-first-issues)

---

## Code of conduct

Be respectful. We serve a vulnerable population (young, unemployed people). Keep that in mind in every discussion, code review, and feature decision.

Specifically:
- No harassment or discrimination of any kind
- Constructive criticism only — attack the problem, not the person
- Assume good faith until proven otherwise
- When in doubt about a design decision, consider: "does this make it easier for a young person in Limpopo with a 2G connection to get a job?"

---

## How to contribute

### Reporting a bug

1. Check [existing issues](https://github.com/EmpowaAI/EmpowerAI/issues) first
2. Open a new issue using the **Bug Report** template
3. Include: what you expected, what happened, steps to reproduce, environment (OS, Node/Python version, browser)

### Suggesting a feature

1. Open a **Feature Request** issue
2. Describe the problem it solves — not just the solution
3. Note if it affects a specific user group (e.g. users in rural areas, users without data, recruiters)

### Writing code

1. Comment on an issue to claim it before starting work
2. Fork the repo, create a branch: `git checkout -b feat/your-feature` or `fix/your-fix`
3. Write code, tests, and update docs where needed
4. Submit a pull request against `main`

---

## Development setup

### Full setup

See [README.md](README.md) for the full local dev setup.

### Minimum setup (backend only)

```bash
cd empowerai-backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATA_ENCRYPTION_KEY
npm install
npm run dev
```

You need a Supabase project with `schema.sql` applied. The free tier is sufficient.

### Running tests

```bash
cd empowerai-backend
npm test
```

---

## Project structure

```
EmpowerAI/
├── frontend/
│   └── src/
│       ├── components/    Shared and feature UI components
│       ├── pages/         Route-level page components
│       ├── lib/           API client, auth, utilities
│       ├── hooks/         Custom React hooks
│       └── contexts/      React context providers
│
├── empowerai-backend/
│   └── src/
│       ├── modules/       Feature modules — each has Controller, Service, Repository, Route
│       │   ├── auth/      Register, login, validate (NEW — Supabase bridge)
│       │   ├── account/   Password reset, email change, deletion
│       │   ├── user/      Profile read/update
│       │   ├── cvAnalyser/ CV upload, analysis, revamp
│       │   ├── twinBuilder/ Economic twin creation and simulation
│       │   ├── twinChat/  AI mentor chat
│       │   ├── interview/ Interview coach sessions
│       │   ├── opportunities/ Job/learnership matching
│       │   ├── applications/ Application tracking
│       │   ├── subscription/ Paystack billing
│       │   ├── usage/     Per-feature usage metering
│       │   ├── admin/     Admin dashboard
│       │   └── waitlist/  Pre-launch waitlist
│       ├── middleware/    protect, adminAuth, subscription, rateLimiter
│       ├── services/      jobAPI, rss, scheduler, taxonomy (cross-cutting)
│       ├── config/        plans, features, careerTaxonomy
│       ├── db/            supabase.js singleton
│       └── utils/         encryption, logger, validators, errors
│
└── ai-service/
    └── app/
        ├── modules/
        │   ├── cvAnalyser/   CV analysis + skill extraction
        │   └── cvRevamp/     CV rewriting
        └── core/             Auth, models, config
```

---

## Coding standards

### Backend (Node.js)

- **No Mongoose**. The codebase has been fully migrated to Supabase. Do not introduce Mongoose or MongoDB.
- **Module pattern**: every feature has `Controller` → `Service` → `Repository` → `Route`. Controllers handle HTTP; Services contain business logic; Repositories handle Supabase queries.
- **snake_case in DB, camelCase in app**: use `fromRow()` (DB → app) and `toRow()` (app → DB) helpers — see existing modules for the pattern.
- **Error handling**: throw from Services/Repositories. Controllers call `next(error)`. The global errorHandler in `middleware/errorHandler.js` handles formatting.
- **No comments explaining what the code does**. Names should be self-explanatory. Only comment the *why* when it is non-obvious.
- **No `console.log` in production paths** — use the `logger` from `src/utils/logger.js`.

### Frontend (React/TypeScript)

- **Supabase client is in `src/integrations/supabase/client.ts`** — import from there.
- **Auth tokens**: the current token stored in `localStorage` as `empowerai-token` is a Supabase access token. Do not introduce a separate token system.
- **API calls**: use the functions in `src/lib/api.ts`. Add new endpoints there.
- **No `any` types** unless genuinely necessary. Add proper TypeScript types.

### Both

- **No secrets in code**. All keys via environment variables.
- **Validate all user input** at the HTTP boundary (Zod schemas in `src/utils/validators.js`).
- **No force-push to `main`**. All changes via PR.

---

## Pull request process

1. **One concern per PR.** A bug fix doesn't need surrounding refactors.
2. **Title format:** `fix: description` / `feat: description` / `chore: description`
3. **Description must include:**
   - What changed and why
   - How to test it
   - Any env vars added (update `.env.example` too)
   - Any schema changes (update `schema.sql` too)
4. **Checklist before requesting review:**
   - [ ] `node --check src/**/*.js` passes (no syntax errors)
   - [ ] `npm test` passes (or explain why tests don't exist for this change)
   - [ ] No new `console.log` left in production paths
   - [ ] No secrets committed
   - [ ] `.env.example` updated if new env vars added
   - [ ] `schema.sql` updated if DB schema changed
5. PRs are reviewed by the primary maintainer (Nicolette). Response time may vary — we're a small team. Ping on the issue if no response after 5 business days.

---

## Security

**Do not open a GitHub issue for security vulnerabilities.** See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## Good first issues

Look for issues tagged [`good first issue`](https://github.com/EmpowaAI/EmpowerAI/labels/good%20first%20issue). These are:

- Well-defined scope
- Unlikely to conflict with other active work
- Don't require deep knowledge of the full system

Current areas where we especially welcome contributions:

- **Tests**: unit and integration tests are sparse — add coverage for any module
- **Accessibility**: screen reader support, keyboard navigation, high-contrast mode
- **Mobile responsiveness**: the platform is used on mobile in low-data environments
- **SA language support**: translations and localisation for Zulu, Xhosa, Sotho, Afrikaans, etc.
- **Opportunity data quality**: improve skill extraction and deduplication in `src/services/rssFeedService.js`

---

## Questions

Open a [Discussion](https://github.com/EmpowaAI/EmpowerAI/discussions) on GitHub for anything that isn't a bug report or feature request.
