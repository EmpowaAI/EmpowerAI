-- ============================================================
-- EmpowerAI migration — 2026-07-10
-- Adds: interview_sessions (persist interview coach sessions)
--       saved_opportunities (persist user bookmarks)
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout.
-- ============================================================

-- ─── interview_sessions ───────────────────────────────────────
-- One row per interview coach session. `questions` holds the
-- AI-generated question list; `answers` accumulates the user's
-- responses + AI feedback so sessions survive restarts and can
-- be resumed.

create table if not exists public.interview_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  type         text not null check (type in ('tech', 'behavioral', 'non-tech')),
  difficulty   text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  company      text,
  questions    jsonb not null default '[]',
  answers      jsonb not null default '[]',
  cv_data      jsonb,
  status       text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists interview_sessions_user_idx
  on public.interview_sessions(user_id, started_at desc);

drop trigger if exists interview_sessions_updated_at on public.interview_sessions;
create trigger interview_sessions_updated_at before update on public.interview_sessions
  for each row execute function update_updated_at();

alter table public.interview_sessions enable row level security;

drop policy if exists "Users can view own interview sessions" on public.interview_sessions;
create policy "Users can view own interview sessions"
  on public.interview_sessions for select using (auth.uid() = user_id);


-- ─── saved_opportunities ──────────────────────────────────────
-- Bookmarks. Separate from applications (which record an actual
-- apply action).

create table if not exists public.saved_opportunities (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  opportunity_id  uuid not null references public.opportunities(id) on delete cascade,
  created_at      timestamptz default now(),
  unique(user_id, opportunity_id)
);

create index if not exists saved_opportunities_user_idx
  on public.saved_opportunities(user_id, created_at desc);

alter table public.saved_opportunities enable row level security;

drop policy if exists "Users can view own saved opportunities" on public.saved_opportunities;
create policy "Users can view own saved opportunities"
  on public.saved_opportunities for select using (auth.uid() = user_id);

drop policy if exists "Users can save opportunities" on public.saved_opportunities;
create policy "Users can save opportunities"
  on public.saved_opportunities for insert with check (auth.uid() = user_id);

drop policy if exists "Users can unsave opportunities" on public.saved_opportunities;
create policy "Users can unsave opportunities"
  on public.saved_opportunities for delete using (auth.uid() = user_id);
