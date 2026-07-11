-- ============================================================
-- EmpowerAI migration — 2026-07-11
-- Align subscriptions.status default with application constants.
--
-- schema.sql created the column with default 'TRIAL' (uppercase), but the
-- backend compares status against lowercase values ('trial', 'active',
-- 'past_due', 'cancelled', 'expired' — plans.config.js SUBSCRIPTION_STATUS).
-- The backend always sets status explicitly today, so this is only a
-- safeguard against any row created via the DB default (manual SQL / future
-- code) that would otherwise read as an unrecognised status and wrongly lock
-- an active trial user out.
--
-- Run in the Supabase SQL editor. Safe to re-run.
-- ============================================================

alter table public.subscriptions
  alter column status set default 'trial';

-- Normalise any existing rows that still carry the old uppercase default.
update public.subscriptions
  set status = 'trial'
  where status = 'TRIAL';
