import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Used only by src/proxy.ts. Bound to the request/response cookie pair
// (rather than next/headers' cookies()) so a refreshed session is visible
// both to the rest of the middleware chain and to Server Components
// downstream in the same request.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // getUser() (not getSession()) forces a round-trip to Supabase to verify
  // the token rather than trusting the cookie payload as-is — getSession()
  // is spoofable in server-side code since it never revalidates.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
