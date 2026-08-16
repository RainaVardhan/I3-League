import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PASSWORD_RECOVERY_COOKIE, passwordRecoveryCookieOptions } from "@/lib/passwordRecoveryCookie";

// Hit after a user clicks the email confirmation link. Note: the
// public.User row was already created by the auth.users trigger at signup
// time, not here — this route only turns a valid confirmation code into a
// real session so the user can actually log in.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");

  // `next` is attacker-controlled (it's a query param) and gets concatenated
  // directly into a redirect below. Only allow a same-origin relative path —
  // reject anything that could re-point the host, e.g. "@evil.com" (parsed
  // as URL userinfo, navigates to evil.com) or "//evil.com" (protocol-
  // relative). A single leading slash not followed by a second slash is the
  // only shape that stays on this origin.
  const next =
    requestedNext && /^\/(?!\/)/.test(requestedNext) ? requestedNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next === "/reset-password") {
        (await cookies()).set(
          PASSWORD_RECOVERY_COOKIE,
          "1",
          passwordRecoveryCookieOptions
        );
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
