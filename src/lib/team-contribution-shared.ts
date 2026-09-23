// Browser-safe half of src/lib/team-contribution.ts (constants, types, pure
// helpers, no database code). Client components import from here.
import type { StageName, TeamContribution } from "@prisma/client";
import { STAGE_ORDER } from "@/lib/stage-constants";
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

export type ContributionRow = TeamContribution & { studentName: string };
