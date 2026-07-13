-- ============================================================
-- EmpowerAI migration - 2026-07-11
-- SECURITY FIX: prevent privilege escalation via direct Supabase access
--
-- The "Users can update own profile" RLS policy allows a user to update
-- their own row (auth.uid() = id). With the public anon key, a logged-in
-- user could call the Supabase REST API directly:
--     PATCH /rest/v1/users?id=eq.<self>   { "role": "admin" }
-- RLS passes (they own the row) and there is no column restriction, so the
-- role column - on that same row - gets set to 'admin'. The backend then
-- reads role fresh from the DB and grants full admin access.
--
-- Fix: a BEFORE UPDATE trigger that, for any caller that is NOT the backend
-- service role, silently forces privileged columns back to their previous
-- values. Legitimate profile edits all go through the backend (service role,
-- field-whitelisted DTO), so this breaks nothing.
--
-- Run in the Supabase SQL editor. Safe to re-run.
-- ============================================================

create or replace function public.protect_privileged_user_columns()
returns trigger as $$
begin
  -- auth.role() returns 'service_role' when the request uses the service
  -- key (our backend), 'authenticated'/'anon' for browser callers.
  if coalesce(auth.role(), '') <> 'service_role' then
    new.role                 := old.role;
    new.flagged_for_deletion := old.flagged_for_deletion;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_privileged_user_columns on public.users;
create trigger protect_privileged_user_columns
  before update on public.users
  for each row execute function public.protect_privileged_user_columns();
