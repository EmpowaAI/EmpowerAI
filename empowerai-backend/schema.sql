-- ============================================================
-- EmpowerAI — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── Updated_at trigger (applied to every table) ─────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ─── 1. users ─────────────────────────────────────────────────
-- Extends auth.users with app-specific profile fields.
-- id matches auth.users.id (Supabase Auth manages passwords,
-- email verification, password reset, and JWT issuance).

create table if not exists public.users (
  id                      uuid primary key references auth.users(id) on delete cascade,
  name                    text not null,
  email                   text not null unique,
  age                     integer,
  province                text,
  phone                   text,
  education               text,
  skills                  text[]    default '{}',
  interests               text[]    default '{}',
  avatar                  text,
  role                    text      not null default 'user' check (role in ('user', 'admin')),
  about                   text,
  summary                 text,
  consent_data_processing boolean   not null default false,
  consent_profile_sharing boolean   not null default false,
  consent_ai_processing   boolean   default false,
  consent_timestamp       timestamptz,
  consent_ip              text,
  last_active_at          timestamptz default now(),
  flagged_for_deletion    boolean   default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create trigger users_updated_at before update on public.users
  for each row execute function update_updated_at();

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);


-- ─── 2. subscriptions ─────────────────────────────────────────

create table if not exists public.subscriptions (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null unique references public.users(id) on delete cascade,
  plan_id                     text not null check (plan_id in ('starter', 'professional', 'enterprise')),
  billing_cycle               text not null,
  status                      text default 'TRIAL',
  trial_started_at            timestamptz,
  trial_ends_at               timestamptz,
  current_period_start        timestamptz,
  current_period_end          timestamptz,
  paystack_customer_code      text,
  paystack_subscription_code  text,
  paystack_email_token        text,
  last_payment_id             text,
  last_payment_amount         integer,
  last_payment_at             timestamptz,
  next_payment_date           timestamptz,
  cancel_at_period_end        boolean default false,
  cancelled_at                timestamptz,
  cancellation_reason         text,
  pending_plan_id             text,
  pending_billing_cycle       text,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

create index if not exists subscriptions_status_idx       on public.subscriptions(status);
create index if not exists subscriptions_trial_ends_idx   on public.subscriptions(trial_ends_at);
create index if not exists subscriptions_period_end_idx   on public.subscriptions(current_period_end);
create index if not exists subscriptions_paystack_cus_idx on public.subscriptions(paystack_customer_code);
create index if not exists subscriptions_paystack_sub_idx on public.subscriptions(paystack_subscription_code);

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function update_updated_at();

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);


-- ─── 3. usages ────────────────────────────────────────────────

create table if not exists public.usages (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  product       text not null,
  period_start  timestamptz not null,
  count         integer default 0 check (count >= 0),
  last_used_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id, product, period_start)
);

create index if not exists usages_user_idx    on public.usages(user_id);
create index if not exists usages_product_idx on public.usages(product);

create trigger usages_updated_at before update on public.usages
  for each row execute function update_updated_at();

alter table public.usages enable row level security;

create policy "Users can view own usage"
  on public.usages for select using (auth.uid() = user_id);


-- ─── 4. cv_profiles ───────────────────────────────────────────

create table if not exists public.cv_profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references public.users(id) on delete cascade,
  filename         text,
  mimetype         text,
  file_size        integer,
  raw_text         text,
  analysis         jsonb default '{}',
  revamp           jsonb default '{}',
  is_complete      boolean default false,
  is_fallback      boolean default false,
  analyzed_at      timestamptz default now(),
  analysis_count   integer default 0,
  last_analyzed_at timestamptz,
  expires_at       timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create trigger cv_profiles_updated_at before update on public.cv_profiles
  for each row execute function update_updated_at();

alter table public.cv_profiles enable row level security;

create policy "Users can view own CV profile"
  on public.cv_profiles for select using (auth.uid() = user_id);

create policy "Users can update own CV profile"
  on public.cv_profiles for update using (auth.uid() = user_id);


-- ─── 5. economic_twins ────────────────────────────────────────

create table if not exists public.economic_twins (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references public.users(id) on delete cascade,
  cv_profile_id        uuid references public.cv_profiles(id),
  analysis             jsonb    default '{"latest": ""}',
  identity             jsonb    default '{}',
  economy              jsonb    default '{}',
  skills               jsonb    default '{}',
  market               jsonb    default '{}',
  intelligence         jsonb    default '{}',
  chat_history         jsonb[]  default '{}',
  simulation_history   jsonb[]  default '{}',
  evolution            jsonb    default '{}',
  status               text     default 'INCOMPLETE' check (status in ('ACTIVE', 'INCOMPLETE', 'NEEDS_UPDATE')),
  last_calculated_at   timestamptz default now(),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists economic_twins_status_idx on public.economic_twins(status);

create trigger economic_twins_updated_at before update on public.economic_twins
  for each row execute function update_updated_at();

alter table public.economic_twins enable row level security;

create policy "Users can view own twin"
  on public.economic_twins for select using (auth.uid() = user_id);

create policy "Users can update own twin"
  on public.economic_twins for update using (auth.uid() = user_id);


-- ─── 6. opportunities ─────────────────────────────────────────

create table if not exists public.opportunities (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  type             text check (type in ('learnership', 'bursary', 'internship', 'job', 'freelance')),
  company          text,
  location         text,
  province         text[],
  description      text,
  requirements     text[],
  skills           text[],
  salary_range     jsonb,
  deadline         timestamptz,
  application_url  text,
  is_active        boolean default true,
  source           text default 'manual' check (source in ('rss', 'adzuna', 'indeed', 'manual')),
  external_id      text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(external_id, source)
);

create index if not exists opportunities_type_active_idx      on public.opportunities(type, is_active);
create index if not exists opportunities_province_active_idx  on public.opportunities using gin(province) where is_active = true;
create index if not exists opportunities_deadline_active_idx  on public.opportunities(deadline, is_active);
create index if not exists opportunities_created_at_idx       on public.opportunities(created_at desc);
create index if not exists opportunities_search_idx           on public.opportunities(title, company, location);

create trigger opportunities_updated_at before update on public.opportunities
  for each row execute function update_updated_at();

-- Opportunities are publicly readable (no auth required for job discovery)
alter table public.opportunities enable row level security;

create policy "Anyone can view active opportunities"
  on public.opportunities for select using (is_active = true);


-- ─── 7. applications ──────────────────────────────────────────

create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  opportunity_id  uuid not null references public.opportunities(id) on delete cascade,
  status          text default 'applied' check (status in ('applied')),
  source          text default 'manual' check (source in ('manual', 'adzuna', 'indeed', 'rss')),
  application_url text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id, opportunity_id)
);

create index if not exists applications_user_idx        on public.applications(user_id);
create index if not exists applications_opportunity_idx on public.applications(opportunity_id);

create trigger applications_updated_at before update on public.applications
  for each row execute function update_updated_at();

alter table public.applications enable row level security;

create policy "Users can view own applications"
  on public.applications for select using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.applications for insert with check (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.applications for delete using (auth.uid() = user_id);


-- ─── 8. waitlist ──────────────────────────────────────────────

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger waitlist_updated_at before update on public.waitlist
  for each row execute function update_updated_at();

-- Waitlist inserts are public (pre-auth signup)
alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist for insert with check (true);


-- ─── Supabase Auth hook: auto-create public.users on signup ───
-- This function fires when a new user is confirmed in auth.users.
-- It creates the matching row in public.users automatically.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── Usage: atomic increment function ────────────────────────
-- Called via supabase.rpc('increment_usage', {...}) from the backend.
-- Upserts the usage record and increments count atomically.

create or replace function public.increment_usage(
  p_user_id    uuid,
  p_product    text,
  p_period_start timestamptz
)
returns integer as $$
declare
  new_count integer;
begin
  insert into public.usages (user_id, product, period_start, count, last_used_at)
  values (p_user_id, p_product, p_period_start, 1, now())
  on conflict (user_id, product, period_start)
  do update set
    count        = usages.count + 1,
    last_used_at = now(),
    updated_at   = now()
  returning count into new_count;

  return new_count;
end;
$$ language plpgsql security definer;



