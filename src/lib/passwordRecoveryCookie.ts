// Marks "this browser just came through the password-recovery email link."
// A valid Supabase session alone doesn't distinguish that from any other
// logged-in session — without this, anyone with an active session (e.g. a
// shared school Chromebook someone forgot to log out of) could open
// /reset-password directly and change another student's password without
// ever touching their email. Set by /auth/callback only when next is
// /reset-password, required by that page, cleared once the password is
// actually changed.
export const PASSWORD_RECOVERY_COOKIE = "pw-recovery";

export const passwordRecoveryCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 10, // 10 minutes — plenty of time to fill in a new password
  path: "/",
};
