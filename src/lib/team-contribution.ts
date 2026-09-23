import { prisma } from "@/lib/prisma";
import type { ContributionRow, TeamContext } from "@/lib/team-contribution-shared";

export * from "@/lib/team-contribution-shared";

// TeamContribution (schema comment: "Only meaningful when Project.teamId is
// set") only makes sense for a team project — an individual student has no
// teammates' contributions to distinguish from their own. Returns null for
// an individual student, or a team student whose shared Project doesn't
// exist yet (nobody has reached INSIGHT and lazily created it — see
// getOrCreateStudentProject), so the page can redirect rather than show a
// team with no project to log against.
export async function getTeamContext(studentId: string): Promise<TeamContext | null> {
  const membership = await prisma.teamMembership.findFirst({
    where: { studentId },
    include: {
      team: {
        include: {
          project: true,
          memberships: { include: { student: true }, orderBy: { joinedAt: "asc" } },
        },
      },
    },
  });
  if (!membership || !membership.team.project) return null;

  return {
    team: { id: membership.team.id, name: membership.team.name },
    project: { id: membership.team.project.id, title: membership.team.project.title },
    teammates: membership.team.memberships.map((m) => ({
      studentId: m.studentId,
      name: m.student.displayName ?? m.student.firstName,
      roleLabel: m.roleLabel,
    })),
  };
}

// Every contribution logged against the team's shared project, across every
// teammate (not just the signed-in student) — the whole point of this
// feature is a shared, honest record of who did what, so it isn't scoped to
// "my own contributions" the way the Journal is scoped to one student.
export async function getTeamContributions(projectId: string): Promise<ContributionRow[]> {
  const contributions = await prisma.teamContribution.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  if (contributions.length === 0) return [];

  const studentIds = [...new Set(contributions.map((c) => c.studentId))];
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, displayName: true, firstName: true },
  });
  const nameById = new Map(students.map((s) => [s.id, s.displayName ?? s.firstName]));

  return contributions.map((c) => ({ ...c, studentName: nameById.get(c.studentId) ?? "Former teammate" }));
}
