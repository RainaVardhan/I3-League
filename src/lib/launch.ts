import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/season";

// Launch switch. While the platform is closed, only APPROVED accounts can use
// it. Anyone else can still sign up and log in, but registration, payment,
// consent and the dashboard are unreachable; the dashboard shows a "coming
// soon" card instead. Approved means:
//   student: payment VERIFIED for the active season
//   parent:  at least one admin-verified, not-rejected student link
//   admin:   always
// Coaches have no approval step yet, so they are treated as not approved.
//
// Nothing was deleted to make this work: set PLATFORM_OPEN=true in .env
// (and restart the server) to open everything to everyone. Default is
// CLOSED, so forgetting the variable fails safe.
export function isPlatformOpen(): boolean {
  return process.env.PLATFORM_OPEN === "true";
}

// True when this account must be kept out right now. Used at the top of the
// registration and payment pages and actions, and by the dashboard. Stage,
// journal and team pages need no check of their own: they already require a
// VERIFIED payment.
export async function isAccountLocked(appUser: { id: string; role: string }): Promise<boolean> {
  if (isPlatformOpen() || appUser.role === "ADMIN") return false;

  if (appUser.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
    if (!student) return true;
    const season = await getActiveSeason();
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
      include: { payment: true },
    });
    return enrollment?.payment?.status !== "VERIFIED";
  }

  if (appUser.role === "PARENT") {
    const link = await prisma.studentParent.findFirst({
      where: { parent: { userId: appUser.id }, verifiedAt: { not: null }, rejectedAt: null },
      select: { studentId: true },
    });
    return link === null;
  }

  return true;
}
