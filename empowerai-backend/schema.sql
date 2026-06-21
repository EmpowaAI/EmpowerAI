-- EmpowerAI — Supabase PostgreSQL schema
--
-- Run this in your Supabase project → SQL Editor before starting the backend.
-- Tables are created idempotently (CREATE TABLE IF NOT EXISTS) so re-running
-- is safe on a pre-existing database.
--
-- Order: extensions → helpers → tables → indexes → RLS → functions

-- ── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Helpers ───────────────────────────────────────────────────────────────────

-- Automatically stamp updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── Users (public profile — extends auth.users) ───────────────────────────────
-- Supabase Auth owns auth.users. This table stores the application-level profile.
-- Deleting an auth.users row cascades here via the FK.

CREATE TABLE IF NOT EXISTS public.users (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  email                   TEXT NOT NULL,
  age                     INTEGER,
  province                TEXT,
  phone                   TEXT,
  education               TEXT,
  about                   TEXT,
  summary                 TEXT,
  skills                  JSONB NOT NULL DEFAULT '[]',
  interests               JSONB NOT NULL DEFAULT '[]',
  avatar                  TEXT,
  role                    TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  consent_data_processing BOOLEAN NOT NULL DEFAULT FALSE,
  consent_profile_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  consent_ai_processing   BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at          TIMESTAMPTZ,
  flagged_for_deletion    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON public.users (LOWER(email));

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create a minimal public.users row when a new auth user is created.
-- The application upserts the full profile on registration, so this is a
-- safety net for users created directly via the Supabase dashboard.
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ── CV profiles ───────────────────────────────────────────────────────────────
-- One row per user. Upserted on conflict with user_id.
-- raw_text and most analysis sub-fields are AES-256-GCM encrypted by the backend.

CREATE TABLE IF NOT EXISTS public.cv_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename         TEXT,
  mimetype         TEXT,
  file_size        INTEGER,
  raw_text         TEXT,          -- encrypted when CV_STORE_RAW_TEXT=true
  analysis         JSONB,         -- encrypted sub-fields, see cvAnalyser.Repository.js
  revamp           JSONB,         -- encrypted sub-fields
  is_complete      BOOLEAN NOT NULL DEFAULT FALSE,
  is_fallback      BOOLEAN NOT NULL DEFAULT FALSE,
  analyzed_at      TIMESTAMPTZ,
  last_analyzed_at TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  analysis_count   INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE OR REPLACE TRIGGER cv_profiles_updated_at
  BEFORE UPDATE ON public.cv_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Economic twins ────────────────────────────────────────────────────────────
-- One row per user. identity/skills/market/intelligence sub-fields are encrypted.

CREATE TABLE IF NOT EXISTS public.economic_twins (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cv_profile_id       UUID REFERENCES public.cv_profiles(id) ON DELETE SET NULL,
  analysis            JSONB,
  identity            JSONB,
  economy             JSONB,
  skills              JSONB,
  market              JSONB,
  intelligence        JSONB,
  chat_history        JSONB NOT NULL DEFAULT '[]',
  simulation_history  JSONB NOT NULL DEFAULT '[]',
  evolution           JSONB,
  status              TEXT,
  last_calculated_at  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE OR REPLACE TRIGGER economic_twins_updated_at
  BEFORE UPDATE ON public.economic_twins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Opportunities ─────────────────────────────────────────────────────────────
-- Job listings sourced from Adzuna API, RSS feeds, and manual seed data.

CREATE TABLE IF NOT EXISTS public.opportunities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  type            TEXT,           -- 'job' | 'learnership' | 'internship' | 'bursary'
  company         TEXT,
  location        TEXT,
  province        TEXT[],         -- multi-province (filter: .contains('province', [x]))
  description     TEXT,
  requirements    TEXT,
  skills          JSONB,
  salary_range    TEXT,
  deadline        TIMESTAMPTZ,
  application_url TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  source          TEXT,           -- 'adzuna' | 'rss' | 'manual'
  external_id     TEXT,           -- source-specific dedup key
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- External IDs must be unique per source to prevent duplicate imports
CREATE UNIQUE INDEX IF NOT EXISTS opportunities_external_id_source_idx
  ON public.opportunities (source, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS opportunities_is_active_idx ON public.opportunities (is_active);
CREATE INDEX IF NOT EXISTS opportunities_type_idx      ON public.opportunities (type);

CREATE OR REPLACE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Applications ──────────────────────────────────────────────────────────────
-- Tracks which opportunities a user has applied to.

CREATE TABLE IF NOT EXISTS public.applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  opportunity_id  UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  source          TEXT,
  application_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS applications_user_id_idx ON public.applications (user_id);

CREATE OR REPLACE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Subscriptions ─────────────────────────────────────────────────────────────
-- One row per user. Managed by Paystack webhooks via the subscription service.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id                   TEXT NOT NULL DEFAULT 'free',
  billing_cycle             TEXT,         -- 'monthly' | 'annual'
  status                    TEXT NOT NULL DEFAULT 'free',
  trial_started_at          TIMESTAMPTZ,
  trial_ends_at             TIMESTAMPTZ,
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  paystack_customer_code    TEXT,
  paystack_subscription_code TEXT,
  paystack_email_token      TEXT,
  last_payment_id           TEXT,
  last_payment_amount       INTEGER,      -- in kobo (ZAR cents × 100)
  last_payment_at           TIMESTAMPTZ,
  next_payment_date         TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at              TIMESTAMPTZ,
  cancellation_reason       TEXT,
  pending_plan_id           TEXT,
  pending_billing_cycle     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE OR REPLACE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Usages ────────────────────────────────────────────────────────────────────
-- Monthly feature-usage counters. Reset via period_start bucket (first of month).

CREATE TABLE IF NOT EXISTS public.usages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product      TEXT NOT NULL,
  count        INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  UNIQUE (user_id, product, period_start)
);

CREATE INDEX IF NOT EXISTS usages_user_id_period_idx
  ON public.usages (user_id, period_start);

-- Atomic upsert for increment_usage RPC — avoids race conditions
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id     UUID,
  p_product     TEXT,
  p_period_start TIMESTAMPTZ
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.usages (user_id, product, count, period_start, last_used_at)
  VALUES (p_user_id, p_product, 1, p_period_start, NOW())
  ON CONFLICT (user_id, product, period_start)
  DO UPDATE SET
    count        = public.usages.count + 1,
    last_used_at = NOW();
END;
$$;

-- ── Waitlist ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.waitlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS on every table. The backend uses the service-role key which
-- bypasses RLS — these policies protect direct client-side access.

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist       ENABLE ROW LEVEL SECURITY;

-- Users: read/update own row only
CREATE POLICY IF NOT EXISTS users_own_row ON public.users
  USING (auth.uid() = id);

-- CV profiles: own row only
CREATE POLICY IF NOT EXISTS cv_profiles_own_row ON public.cv_profiles
  USING (auth.uid() = user_id);

-- Economic twins: own row only
CREATE POLICY IF NOT EXISTS economic_twins_own_row ON public.economic_twins
  USING (auth.uid() = user_id);

-- Opportunities: anyone can read active listings; no direct write
CREATE POLICY IF NOT EXISTS opportunities_public_read ON public.opportunities
  FOR SELECT USING (is_active = TRUE);

-- Applications: own rows only
CREATE POLICY IF NOT EXISTS applications_own_rows ON public.applications
  USING (auth.uid() = user_id);

-- Subscriptions: own row only
CREATE POLICY IF NOT EXISTS subscriptions_own_row ON public.subscriptions
  USING (auth.uid() = user_id);

-- Usages: own rows only
CREATE POLICY IF NOT EXISTS usages_own_rows ON public.usages
  USING (auth.uid() = user_id);

-- Waitlist: insert only, no reads
CREATE POLICY IF NOT EXISTS waitlist_insert_only ON public.waitlist
  FOR INSERT WITH CHECK (TRUE);
