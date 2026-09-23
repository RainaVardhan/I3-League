import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Sprint 6: the first real admin surface. Every admin page and server
// action calls this — src/proxy.ts also gates /admin by role (reading the
// session's own user_metadata, no DB hit), but that's an edge-level
// shortcut, not the real check. This is the real check: a live Prisma read
// of the signed-in user's role and Admin profile, same defense-in-depth
// convention as requireCurrentStudent in dashboard/[stage]/actions.ts.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const appUser = await prisma.user.findUnique({
    where: { supabaseUid: user.id },
    include: { admin: true },
  });

  if (!appUser || appUser.role !== "ADMIN" || !appUser.admin) {
    redirect("/dashboard");
  }

  return { user: appUser, admin: appUser.admin };
}

// Counts that drive the Overview page's KPI strip and each queue's own
// heading. One query per queue — these are small, unpaginated admin lists
// (a season's worth of students, not the whole platform), so this is
// deliberately not aggregated into one raw query.
export async function getAdminOverviewCounts() {
  const [
    pendingPayments,
    pendingSafetyReviews,
    pendingParentLinks,
    totalStudents,
    totalParents,
    totalCoaches,
    // Judge/Admin are never self-serve (Phase 2 provisioning, see CLAUDE.md
    // status log) so these are usually 0 — still counted, not just assumed,
    // so the directory reflects reality rather than an invented default.
    totalJudges,
    totalAdmins,
    totalSchools,
    activeSeason,
  ] = await Promise.all([
    prisma.payment.count({ where: { status: "SUBMITTED" } }),
    prisma.safetyReview.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.studentParent.count({ where: { verifiedAt: null, rejectedAt: null } }),
    prisma.student.count(),
    prisma.parent.count(),
    prisma.coach.count(),
    prisma.judge.count(),
    prisma.admin.count(),
    prisma.school.count(),
    prisma.season.findFirst({ where: { isActive: true }, orderBy: { openDate: "desc" } }),
  ]);

  return {
    pendingPayments,
    pendingSafetyReviews,
    pendingParentLinks,
    totalStudents,
    totalParents,
    totalCoaches,
    totalJudges,
    totalAdmins,
    totalSchools,
    activeSeason,
  };
}
