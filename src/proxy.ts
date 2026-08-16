import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Proves "logged in vs not" end to end. Deliberately does NOT do per-role
// gating (e.g. blocking a Student from /admin) — that's later-sprint work
// once role-specific dashboards exist.
//
// Next.js 16 renamed this file convention from middleware.ts to proxy.ts
// (and the export from `middleware` to `proxy`) — same request-interception
// mechanism, new name. See https://nextjs.org/docs/messages/middleware-to-proxy.
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
