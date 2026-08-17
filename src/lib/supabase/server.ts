import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// For Server Components, Server Actions, and Route Handlers. `cookies()` is
// async (Next.js 15+), so this factory is async too — every call site must
// `await createClient()`.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components can't write cookies — Next.js throws if you
            // try. That's fine here: this only gets hit on read-only paths
            // (e.g. the dashboard reading the session). src/proxy.ts is
            // what actually persists the refreshed session cookie on every
            // request. Server Actions and Route Handlers ARE allowed to
            // write cookies, so setAll works for real there (e.g. login).
          }
        },
      },
    }
  );
}
