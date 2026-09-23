import { createClient } from "@supabase/supabase-js";

// Server-only: the service-role key bypasses RLS and can manage
// auth.users directly (create/delete/generate links). Never import this
// from a "use client" file or expose SUPABASE_SERVICE_ROLE_KEY to the
// browser. Reserved since Sprint 1 (see CLAUDE.md status log, Aug 15 2026)
// for exactly this kind of admin-initiated account management; first real
// use is deleteUserAccount (src/lib/delete-account.ts).
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
