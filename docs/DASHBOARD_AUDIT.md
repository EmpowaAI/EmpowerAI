# Dashboard Audit (Accuracy + UX)

Date: 2026-04-03

## What “real data” means in this app

- **Server-backed (authoritative):** fetched from `empowerai-backend` which in turn reads MongoDB and/or calls `ai-service`.
- **Client cached (best-effort):** values in `localStorage` (can be stale, per-device, and easy to desync).
- **Placeholder:** random numbers or hard-coded values.

## Current Data Accuracy Findings

### Dashboard route in production

The app route `/dashboard` uses `frontend/src/pages/Dashboard/Dashboard.tsx`.

### Metrics on the dashboard

- **Empowerment Score**
  - Source: `twinAPI.get()` (server-backed) when available; otherwise `localStorage.twinData` (cached).
  - Accuracy: usually real if the twin exists; can be stale if cached.

- **CV Strength**
  - Source: `localStorage.comprehensiveCVAnalysis.score` (cached).
  - Accuracy: depends on latest CV run; not persisted server-side, so cross-device/cross-browser differs.

- **Opportunities count**
  - Previous behavior: random placeholder values (not real).
  - Now: uses the Opportunities API count via `statsAPI.getDashboardStats()` (server-backed count, filtered where possible).

- **Applications count**
  - Source: `GET /api/applications/stats` (server-backed).

- **Interview score / interviews practiced**
  - Current behavior: 0 / placeholder.
  - Recommendation: persist interview sessions + results, then compute stats from DB.

### “Live” insights feed

- `frontend/src/components/LiveInsightsFeed.tsx` calls `opportunitiesAPI.getAll({ limit: 5 })`.
- Accuracy: real opportunities (server-backed), with some copy that is informational.

### Skill Gap Analysis widget

- `frontend/src/components/SkillGapAnalysis.tsx` only displays `cvData.aiInsights` if present; otherwise shows an empty “strong profile” state.
- Accuracy: currently not reliably AI-driven (depends on whether `aiInsights` exists, which is not consistently produced).

## Top Accuracy Risks

1) **localStorage as a system of record**
   - CV score + skills are stored client-side only, leading to stale values and cross-device mismatch.

2) **Placeholders masquerading as “live”**
   - Any remaining random/estimated metrics reduce trust.

3) **No explicit “data freshness” indicator**
   - Users can’t tell whether a number is live vs cached.

## UX / Layout Improvements (High impact)

1) **Make “Next best action” the primary CTA**
   - Show a single prominent card: “Do CV analysis” → “Build twin” → “Practice interview” → “Apply”.

2) **Data provenance + refresh**
   - Add a small status pill: “Live” vs “Cached”, plus “Last updated” timestamp and a refresh button.

3) **Replace empty states with guided actions**
   - If no CV: show “Upload CV” + benefits.
   - If no twin: show “Create twin” + what it unlocks.

4) **Reduce animation delay / perceived latency**
   - Avoid fixed `setTimeout` delays; load data immediately and use skeletons while fetching.

5) **Consistency**
   - There are multiple dashboard implementations in the repo; keep one and remove/redirect older variants to reduce drift.

## Recommended Next Engineering Steps

- Persist CV analysis summary server-side (user profile or separate collection): `cvScore`, `skills`, `updatedAt`.
- Add interview session tracking + stats endpoints.
- Extend AI service to generate `aiInsights` deterministically from `weaknesses/missingKeywords` when LLM is unavailable.

