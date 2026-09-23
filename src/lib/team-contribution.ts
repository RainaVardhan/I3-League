import type { StageName, TeamContribution } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STAGE_ORDER } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";

// Server-enforced cap on TeamContribution.description — same "the real
// limit lives on the server, the form just matches it" convention as
// JOURNAL_TEXT_LIMIT (src/lib/journal.ts) and TEXT_LIMITS
// (src/lib/stage-field-limits.ts). Kept separate since it's a single field
// on an unrelated model, not a per-stage-field map.
export const CONTRIBUTION_TEXT_LIMIT = 2000;

// Same cap, for the optional evidence/result field — kept as its own
// constant (rather than reusing CONTRIBUTION_TEXT_LIMIT directly) so the two
// can diverge later without one silently changing under the other.
export const CONTRIBUTION_RESULT_LIMIT = 2000;

// Which of the six stages a contribution is about — same STAGE_ORDER +
// stage-copy display names as JOURNAL_STAGE_OPTIONS (src/lib/journal.ts),
// built here rather than imported from there since it's a fact about the
// six stages in general, not something specific to the Journal.
export const TEAM_STAGE_OPTIONS = STAGE_ORDER.map((stage) => ({
  value: stage,
  label: getStageCopy(stage).name,
}));

const STAGE_SET = new Set<string>(STAGE_ORDER);

export function isTeamStage(value: unknown): value is StageName {
  return typeof value === "string" && STAGE_SET.has(value);
}

const STAGE_LABEL: Record<string, string> = Object.fromEntries(TEAM_STAGE_OPTIONS.map((s) => [s.value, s.label]));

export function teamStageLabel(stage: string | null): string | null {
  return stage ? (STAGE_LABEL[stage] ?? stage) : null;
}

export type TeamContext = {
  team: { id: string; name: string };
  project: { id: string; title: string };
  teammates: { studentId: string; name: string; roleLabel: string | null }[];
};

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

export type ContributionRow = TeamContribution & { studentName: string };

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
