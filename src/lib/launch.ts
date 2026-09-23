// Which environment is this? One codebase runs both:
//   PUBLIC site  (branch `main`):    PLATFORM_OPEN unset. Only admins and the
//                                    emails in ALLOWED_EMAILS get past login.
//                                    Everyone else can sign up, then sees
//                                    "Account created. Coming soon."
//   TESTING site (branch `testing`): PLATFORM_OPEN=true. Everything works for
//                                    everyone (register, pay, consent, stages).
//                                    Keep it private (Cloudflare Access) and
//                                    on its own Supabase project.
//
// The behavior differs only by environment variables, never by code, so
// merging `testing` into `main` cannot change what the public site does.
// Default is CLOSED, so a missing variable fails safe.
export function isPlatformOpen(): boolean {
  return process.env.PLATFORM_OPEN === "true";
}

// Comma-separated list, compared case-insensitively.
function allowedEmails(): Set<string> {
  return new Set(
    (process.env.ALLOWED_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

// True when this account must be kept out right now. Admins are always in.
// While closed, only allowlisted emails are in: no other rule (a verified
// payment, a verified parent link) grants access on the public site.
// Used at the top of the registration and payment pages and actions and by
// the dashboard. Stage, journal and team pages need no check of their own:
// they already require a VERIFIED payment, and nobody can reach one without
// getting past registration first.
export function isAccountLocked(appUser: { email: string; role: string }): boolean {
  if (isPlatformOpen() || appUser.role === "ADMIN") return false;
  return !allowedEmails().has(appUser.email.toLowerCase());
}
