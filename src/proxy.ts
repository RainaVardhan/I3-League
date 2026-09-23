import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Proves "logged in vs not" end to end, plus (as of Sprint 4) one role
// check for the stage routes below — everything else is still deliberately
// NOT role-gated here (e.g. a Parent hitting /admin) — that's later-sprint
// work once those role-specific dashboards exist.
//
// Next.js 16 renamed this file convention from middleware.ts to proxy.ts
// (and the export from `middleware` to `proxy`) — same request-interception
// mechanism, new name. See https://nextjs.org/docs/messages/middleware-to-proxy.
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const requiresAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/consent") ||
    pathname.startsWith("/admin");
  if (requiresAuth && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const dest = user.user_metadata?.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Pre-launch lockdown (src/lib/launch.ts) is NOT enforced here: it depends
  // on whether the account has finished registration, which needs a database
  // read this edge proxy does not do. It is enforced in the registration
  // page/actions and the dashboard instead.

  // /dashboard/<stage> (the six-stage journey pages) is STUDENT-only — a
  // Parent or Coach session should bounce back to the shared hub, not see a
  // student's stage form. Read straight off the session's own
  // user_metadata (set at signup by the auth trigger, see CLAUDE.md) rather
  // than a Prisma call — getUser() above already round-tripped to Supabase
  // to verify this token, so it's trustworthy without an extra DB hit here
  // at the edge. The stage page itself re-checks with a real Prisma lookup
  // regardless (defense in depth, same as every other server action in
  // this codebase).
  if (user && pathname.startsWith("/dashboard/") && user.user_metadata?.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // /admin is ADMIN-only. Same edge-level shortcut as the stage-route check
  // above (trusts the session's own user_metadata, no DB hit) — the real
  // check is requireAdmin() (src/lib/admin.ts), a live Prisma read re-run on
  // every admin page and server action.
  if (user && pathname.startsWith("/admin") && user.user_metadata?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
