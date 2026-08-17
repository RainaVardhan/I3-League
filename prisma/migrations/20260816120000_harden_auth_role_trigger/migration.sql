-- Hardens the auth-user-sync trigger against role escalation. The previous
-- version (see 20260815071853_add_auth_user_sync_trigger) cast
-- raw_user_meta_data->>'role' straight to the "Role" enum with no
-- allowlist. raw_user_meta_data (Supabase's "user_metadata") is
-- client-settable at signup via the public GoTrue REST endpoint
-- (POST {SUPABASE_URL}/auth/v1/signup), reachable with only the public
-- NEXT_PUBLIC_SUPABASE_ANON_KEY. A request straight to that endpoint —
-- bypassing the Next.js signup form and its server-side allowlist in
-- src/app/signup/actions.ts entirely — could set role: "ADMIN" and the old
-- trigger would honor it, inserting a real public."User" row with ADMIN
-- privileges. CLAUDE.md requires Judge/Admin to be "enforced server-side,
-- not just by the UI omitting them as options" — the trigger is the actual
-- server-side boundary here (it runs regardless of which client hit
-- auth.users), and it wasn't enforcing anything.
--
-- Fix: only trust a privileged role (ADMIN/JUDGE) when it comes from
-- raw_app_meta_data ("app_metadata"), which the public signup endpoint
-- cannot set — it's writable only via the Supabase Admin API using the
-- service-role key (SUPABASE_SERVICE_ROLE_KEY), which never reaches the
-- client and is reserved for a later admin-created-account flow (see
-- CLAUDE.md Aug 15 status log). Self-serve signups (student/parent/coach)
-- keep working exactly as before, sourced from raw_user_meta_data, but are
-- now explicitly allowlisted instead of trusting any value that happens to
-- cast cleanly to the enum.
--
-- If neither source yields an allowed role, "resolved_role" stays NULL,
-- which violates public."User".role being NOT NULL and rolls back the
-- whole auth.users insert — same fail-safe behavior the original trigger
-- documented, now backed by a real allowlist instead of an open enum cast.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = '' -- empty on purpose: forces fully-qualified names below,
                      -- which prevents a search_path-hijacking attack against
                      -- a SECURITY DEFINER function.
as $$
declare
  resolved_role public."Role";
  app_role text := new.raw_app_meta_data->>'role';
  user_role text := new.raw_user_meta_data->>'role';
begin
  if app_role in ('ADMIN', 'JUDGE') then
    resolved_role := app_role::public."Role";
  elsif user_role in ('STUDENT', 'PARENT', 'COACH') then
    resolved_role := user_role::public."Role";
  end if;

  insert into public."User" ("id", "supabaseUid", "email", "role", "createdAt", "updatedAt")
  values (
    gen_random_uuid(),
    new.id,
    new.email,
    resolved_role,
    now(),
    now()
  );
  return new;
end;
$$;
