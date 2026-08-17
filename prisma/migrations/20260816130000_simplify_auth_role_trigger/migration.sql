-- Corrects 20260816120000_harden_auth_role_trigger: that migration added a
-- second, "privileged" role path reading raw_app_meta_data (Supabase
-- "app_metadata"), intended for a later admin-created Judge/Admin account
-- flow. Live-tested against the actual Supabase Admin API
-- (POST /auth/v1/admin/users) and confirmed that path never fires: GoTrue
-- writes raw_user_meta_data atomically on the auth.users INSERT, but applies
-- a request's custom app_metadata via a separate UPDATE afterward — so this
-- AFTER INSERT trigger never sees it. The branch was dead code that quietly
-- fell through (fail-safe, not a security issue — it never let anything
-- unintended in), but its comment claimed a capability it didn't have.
--
-- Rather than fight GoTrue's insert/update timing to make that branch work,
-- this drops it. The trigger now does exactly what's needed for what's
-- actually built today: allowlist STUDENT/PARENT/COACH from
-- raw_user_meta_data (self-serve signup, restricted the same way
-- src/app/signup/actions.ts restricts the form), reject everything else.
-- Admin/Judge account provisioning is still Phase 2 (CLAUDE.md "Deferred")
-- — when that's built, it needs its own mechanism (e.g. server code that
-- creates the auth user, then sets public."User".role directly via Prisma
-- in a second step, gated on the caller already being an authenticated
-- admin), not a speculative branch in this trigger.
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
  user_role text := new.raw_user_meta_data->>'role';
begin
  if user_role in ('STUDENT', 'PARENT', 'COACH') then
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
