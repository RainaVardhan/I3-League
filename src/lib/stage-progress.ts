import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/season";
import type { StageName, StageStatus } from "@prisma/client";

// Single source of truth for stage sequence — CLAUDE.md "Sequential stage
// unlocking". prisma/seed.ts imports this instead of keeping its own copy.
export const STAGE_ORDER: StageName[] = [
  "INSIGHT",
  "INVESTIGATE",
  "IMAGINE",
  "ITERATE",
  "IMPACT",
  "INFLUENCE",
];

// StageName <-> URL slug, e.g. /dashboard/insight.
export const STAGE_SLUGS: Record<StageName, string> = {
  INSIGHT: "insight",
  INVESTIGATE: "investigate",
  IMAGINE: "imagine",
  ITERATE: "iterate",
  IMPACT: "impact",
  INFLUENCE: "influence",
};

// Display number for the journey rail, dashboard overview, and stage
// headings — one source so they can't drift out of sync with each other.
export const STAGE_NUMBERS: Record<StageName, string> = {
  INSIGHT: "01",
  INVESTIGATE: "02",
  IMAGINE: "03",
  ITERATE: "04",
  IMPACT: "05",
  INFLUENCE: "06",
};

const SLUG_TO_STAGE: Record<string, StageName> = Object.fromEntries(
  Object.entries(STAGE_SLUGS).map(([stage, slug]) => [slug, stage as StageName])
) as Record<string, StageName>;

export function stageForSlug(slug: string): StageName | null {
  return SLUG_TO_STAGE[slug] ?? null;
}

export function canAccessStatus(status: StageStatus): boolean {
  return status !== "LOCKED";
}

// Idempotently backfills any missing StageProgress rows for a student and
// lazily promotes INSIGHT from LOCKED to CURRENT the first time their
// payment is VERIFIED. There's no "on payment verified" hook to trigger
// this from — payment verification is still a direct DB write until
// Sprint 6's admin UI exists (see CLAUDE.md) — so instead this runs
// reactively on every /dashboard and /dashboard/[stage] load, the same
// pattern dashboard/page.tsx already uses to read state off which rows
// exist rather than an enum.
export async function ensureStageProgressInitialized(studentId: string): Promise<void> {
  const existing = await prisma.stageProgress.findMany({ where: { studentId } });
  const existingStages = new Set(existing.map((row) => row.stageName));

  const missingStages = STAGE_ORDER.filter((stage) => !existingStages.has(stage));
  if (missingStages.length > 0) {
    await prisma.stageProgress.createMany({
      data: missingStages.map((stageName) => ({ studentId, stageName })),
      skipDuplicates: true,
    });
  }

  const insightRow = existing.find((row) => row.stageName === "INSIGHT");
  const insightStillLocked = !insightRow || insightRow.status === "LOCKED";
  if (!insightStillLocked) return;

  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId, seasonId: season.id } },
    include: { payment: true },
  });
  if (enrollment?.payment?.status === "VERIFIED") {
    await prisma.stageProgress.update({
      where: { studentId_stageName: { studentId, stageName: "INSIGHT" } },
      data: { status: "CURRENT", unlockedAt: new Date() },
    });
  }
}

export type JourneyItem = {
  stage: StageName;
  slug: string;
  status: StageStatus;
  module: { title: string; description: string | null } | null;
};

// Ordered stage list for the dashboard hub's journey overview and every
// stage page's journey rail, so the two can never drift out of sync.
export async function getJourney(studentId: string): Promise<JourneyItem[]> {
  await ensureStageProgressInitialized(studentId);
  const season = await getActiveSeason();

  const [progressRows, modules] = await Promise.all([
    prisma.stageProgress.findMany({ where: { studentId } }),
    prisma.curriculumModule.findMany({ where: { seasonId: season.id } }),
  ]);

  const progressByStage = new Map(progressRows.map((row) => [row.stageName, row]));
  const moduleByStage = new Map(modules.map((module) => [module.stageName, module]));

  return STAGE_ORDER.map((stage) => ({
    stage,
    slug: STAGE_SLUGS[stage],
    status: progressByStage.get(stage)?.status ?? "LOCKED",
    module: moduleByStage.get(stage) ?? null,
  }));
}

// Marks the current stage COMPLETE and promotes the next stage from LOCKED
// to CURRENT, if there is one. Doesn't touch a next stage that's already
// unlocked (e.g. via a future admin override), so this is safe to call
// idempotently.
export async function completeStage(studentId: string, stageName: StageName): Promise<void> {
  await prisma.stageProgress.update({
    where: { studentId_stageName: { studentId, stageName } },
    data: { status: "COMPLETE", completedAt: new Date() },
  });

  const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(stageName) + 1];
  if (!nextStage) return;

  const nextRow = await prisma.stageProgress.findUnique({
    where: { studentId_stageName: { studentId, stageName: nextStage } },
  });
  if (nextRow && nextRow.status === "LOCKED") {
    await prisma.stageProgress.update({
      where: { studentId_stageName: { studentId, stageName: nextStage } },
      data: { status: "CURRENT", unlockedAt: new Date() },
    });
  }
}
