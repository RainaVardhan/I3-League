-- Hand-written fail-safe / integration point: Prisma has no concept of
-- Postgres triggers, and auth.users is a table Supabase Auth owns, not one
-- Prisma manages. This trigger is what makes "email/password signup"
-- actually produce a row in public."User" with the right role, atomically
-- with the auth.users insert itself — no application code has to remember
-- to do this as a second step. See CLAUDE.md status log (Sprint 1 entry) —
-- this must be manually re-added if migrations are ever reset, since
-- `prisma migrate reset` / a regenerated migration history will NOT
-- recreate it from schema.prisma.
--
-- Reads role from the signup call's `options.data.role` (Supabase surfaces
-- this as `raw_user_meta_data->>'role'` on the new auth.users row). Only
-- STUDENT / PARENT / COACH are reachable from the public signup form (see
-- src/app/signup/actions.ts's server-side allowlist), but the trigger
-- itself is generic — it will accept any value that casts cleanly to the
-- "Role" enum, which is intentional: an admin-created Judge/Admin account
-- (later sprint, via the Supabase Admin API with metadata set server-side)
-- should sync through this same trigger.
--
-- If `role` metadata is ever missing/invalid, the enum cast below produces
-- NULL, which violates public."User".role being NOT NULL — the whole
-- auth.users insert then fails and rolls back. That's correct fail-safe
-- behavior (no orphaned auth.users row with no matching public.User and no
-- role), not a bug.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = '' -- empty on purpose: forces fully-qualified names below,
                      -- which prevents a search_path-hijacking attack against
                      -- a SECURITY DEFINER function (current Supabase-recommended
                      -- pattern, replaces the older `set search_path = public`).
as $$
begin
  insert into public."User" ("id", "supabaseUid", "email", "role", "createdAt", "updatedAt")
  values (
    gen_random_uuid(),
    new.id,
    new.email,
    (new.raw_user_meta_data->>'role')::public."Role",
    now(),
    now()
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();
