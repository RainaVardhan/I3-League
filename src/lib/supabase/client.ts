import { createBrowserClient } from "@supabase/ssr";

// For Client Components that need to talk to Supabase directly. Nothing in
// Sprint 1 uses this yet (login/signup submit through Server Actions
// instead), but it's part of the standard @supabase/ssr trio alongside
// server.ts and supabase/middleware.ts.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
