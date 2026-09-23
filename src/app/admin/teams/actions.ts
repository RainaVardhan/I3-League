"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

// Coach assignment is the only team write an admin needs: a coach gets
// read-only access to a roster, and the roster is whichever teams point at
// them. An empty coachId unassigns. The coach id is checked against real
// Coach rows so a crafted POST cannot point a team at a non-coach id.
export async function assignTeamCoachAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const teamId = String(formData.get("teamId") ?? "");
  const coachId = String(formData.get("coachId") ?? "");
  if (!teamId) return;

  if (coachId) {
    const coach = await prisma.coach.findUnique({ where: { id: coachId }, select: { id: true } });
    if (!coach) return;
  }

  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { coachId: true } });
  if (!team || team.coachId === (coachId || null)) return;

  await prisma.team.update({ where: { id: teamId }, data: { coachId: coachId || null } });
  await logAdminAction(admin.userId, coachId ? "TEAM_COACH_ASSIGNED" : "TEAM_COACH_REMOVED", "Team", teamId, {
    previousCoachId: team.coachId,
    coachId: coachId || null,
  });

  revalidatePath("/admin/teams");
}
