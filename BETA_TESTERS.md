# EmpowaAI — Beta Tester Guide

Thanks for helping test EmpowaAI! This page explains what to expect so you can
tell a real bug apart from intended behaviour.

## Getting started

1. **Register** at the sign-up page with a real email you can receive mail at.
2. There is **no email verification step** — your account is active
   immediately. Just sign in with the email and password you chose.
   - 📧 You won't get a "verify your email" message. **That's expected, not a bug.**
3. Recommended first run:
   **Analyse your CV → Build your Digital Twin → browse Opportunities.**

## What's normal (please don't report these as bugs)

- **No sign-up verification email** — accounts are auto-activated during beta.
- **Password reset does work** — "Forgot password" emails you a reset link.
- **First Opportunities load takes a few seconds** — it fetches jobs matched to
  your CV/role live, then it's fast.
- **AI steps take ~30–40 seconds** (CV analysis, CV revamp, Digital Twin,
  Interview Coach). The AI is working — it hasn't frozen.
- A real CV isn't required to test — any CV text or PDF works.

## What we'd love you to try

- Register, log in, log out, log back in — your data should persist.
- Upload a CV and read the AI analysis + ATS score.
- Revamp your CV and download it (PDF / TXT).
- Run the Interview Coach: start a session, answer, get feedback; leave and
  resume it.
- Generate your Digital Twin and chat with it.
- Browse Opportunities and bookmark a few — they should stay saved after a
  refresh.

## Reporting issues

Please open an issue at
**https://github.com/EmpowaAI/EmpowerAI/issues** with:

- What you did (steps)
- What you expected
- What actually happened (a screenshot helps)
- Your browser / device

For **security issues**, do **not** open a public issue — email
`nicolette.mashaba@marisapeer.com` (see [SECURITY.md](SECURITY.md)).

## Known limitations during beta

- Sign-up email verification is disabled (auto-confirm).
- Email-change confirmation is not fully wired yet.
- AI responses can be slow under heavy concurrent load.
- Shared mobile networks (carrier NAT) may occasionally hit rate limits sooner.

Thank you for testing 🇿🇦 — your feedback shapes the platform.
