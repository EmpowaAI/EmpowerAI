# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| `main` branch | Yes — active development |
| Previous releases | No |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email security reports to: **nicolette.mashaba@marisapeer.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- (Optional) Suggested fix

We aim to acknowledge receipt within 2 business days and to issue a patch within 14 days for critical issues. We will credit researchers who report responsibly.

---

## Security model

### Authentication

- **Supabase Auth** manages all identity: JWT issuance, email verification, password reset, MFA (future).
- The backend validates every protected request by calling `supabase.auth.getUser(token)` — tokens are never self-validated against a local secret.
- Sessions are stateless JWTs stored client-side. The backend does not maintain session state.
- Tokens expire according to Supabase's default TTL. Refresh tokens are managed by the Supabase client.

### Authorisation

- **Row Level Security (RLS)** is enforced at the database level on all tables. The backend uses the service-role key which bypasses RLS — this is intentional and required for server-to-server operations. The service-role key must never be exposed to the client.
- Backend route-level auth:
  - `protect` middleware: validates JWT, fetches user profile from `public.users`
  - `restrictTo('admin')`: checks `users.role === 'admin'`
  - `requireActiveSubscription`: checks the `subscriptions` table

### Data encryption

Sensitive PII stored in Supabase is encrypted at rest using AES-256-GCM before being written to the database:

| Encrypted fields | Location |
|---|---|
| `phone`, `province`, `education`, `skills[]`, `interests[]`, `age` | `users` table |
| Full CV analysis narrative (summary, achievements, experience, etc.) | `cv_profiles.analysis` (JSONB) |
| Economic twin data | `economic_twins` (JSONB fields) |

Encryption uses a per-field IV (12 bytes) and auth tag (16 bytes). The key is a 32-byte random value stored only in environment variables. There is no key rotation mechanism currently (see roadmap).

### Payment data

- No payment card data is stored anywhere in the system. All card handling is delegated to Paystack.
- Paystack webhook events are authenticated via HMAC-SHA512 signature verification before processing.

### Stored secrets

| Secret | Where stored |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Render env vars — never in code or client |
| `ENCRYPTION_KEY` | Render env vars — never in code or client |
| `PAYSTACK_SECRET_KEY` | Render env vars |
| `PAYSTACK_WEBHOOK_SECRET` | Render env vars |
| `BREVO_API_KEY` | Render env vars |
| `AI_SERVICE_API_KEY` | Render env vars |

### What the frontend can safely hold

- `VITE_SUPABASE_URL` — public, identifies your project
- `VITE_SUPABASE_ANON_KEY` — public, RLS restricts what it can access
- `VITE_API_BASE_URL` — public

### Known limitations

1. **Frontend auth migration incomplete**: The frontend currently stores Supabase JWTs in `localStorage` under a custom key and routes them through the Express backend. This is functional but not the most direct Supabase flow. The full migration to `supabase.auth.signInWithPassword()` client-side is on the roadmap. `localStorage` tokens are accessible to JavaScript (XSS risk) — see roadmap for HttpOnly cookie migration.

2. **Taxonomy updates are in-memory only**: Admin taxonomy changes reset on Render restart. No security risk, but operational gap.

3. **AI usage logs are not persisted**: The `ai_usage_logs` table does not exist in Supabase. Usage is logged to Winston (file/stdout) only. This limits anomaly detection capability.

4. **Audit log table is stubbed**: `admin/createAuditLog` is a no-op. Admin actions are not persistently audited.

5. **Scripts directory contains stale MongoDB code**: Files in `empowerai-backend/scripts/` still reference Mongoose and will fail. These are development utilities only and are not deployed — they do not affect production security, but they should not be run.

---

## Security checklist for contributors

Before submitting a PR, verify:

- [ ] No secrets or credentials in source code
- [ ] No `console.log(password)` or similar logging of sensitive values
- [ ] User input is validated with Zod schemas before processing
- [ ] New Supabase queries use parameterised values (Supabase JS does this by default — do not use `.rpc()` with string concatenation)
- [ ] New routes that serve user data are protected with `protect` middleware
- [ ] Admin-only routes are protected with `protect` + `restrictTo('admin')`
- [ ] Any new env vars are documented in `.env.example` with placeholder values only
- [ ] `schema.sql` changes include appropriate RLS policies
- [ ] File uploads are validated for MIME type and size before processing

---

## Dependency security

We use `npm audit` to monitor backend dependencies. Run `npm audit` before submitting PRs that add or update packages. Critical and high-severity vulnerabilities must be resolved before merge.

---

## POPIA / Privacy

EmpowerAI collects personal information from South African users and is subject to the Protection of Personal Information Act (POPIA).

Key principles applied:
- **Purpose limitation**: We collect only what is needed for career services
- **Data minimisation**: PII is encrypted at the field level
- **Deletion right**: Users can request account deletion which calls `supabase.auth.admin.deleteUser()` cascading to all profile data
- **Transparency**: We do not sell user data

If you find code that collects, stores, or transmits personal data beyond what is necessary for the stated purpose, please report it as a security/privacy issue.
