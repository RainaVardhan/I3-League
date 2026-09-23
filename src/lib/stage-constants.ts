import type { StageName, StageStatus } from "@prisma/client";

// Browser-safe half of src/lib/stage-progress.ts: constants and pure helpers
// only, NO database code. Client components import from here; importing
// stage-progress.ts from the browser would drag the Prisma client and its
// Postgres driver into the browser bundle. stage-progress.ts re-exports all of
// this, so server code can keep importing from either place.

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

export type JourneyItem = {
  stage: StageName;
  slug: string;
  status: StageStatus;
  module: { title: string; description: string | null } | null;
};

