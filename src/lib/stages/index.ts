import type { StageName } from "@prisma/client";
import type { GuidedStage } from "@/lib/guided-stage";
import { IMAGINE_STAGE } from "./imagine";
import { ITERATE_STAGE } from "./iterate";
import { IMPACT_STAGE } from "./impact";
import { INFLUENCE_STAGE } from "./influence";

/** The stages built on the guided-stage engine (see src/lib/guided-stage.ts).
 *  Insight and Investigate have their own hand-built forms. */
export const GUIDED_STAGES = {
  IMAGINE: IMAGINE_STAGE,
  ITERATE: ITERATE_STAGE,
  IMPACT: IMPACT_STAGE,
  INFLUENCE: INFLUENCE_STAGE,
} as const satisfies Partial<Record<StageName, GuidedStage>>;

export type GuidedStageName = keyof typeof GUIDED_STAGES;

export function isGuidedStage(stageName: string): stageName is GuidedStageName {
  return stageName in GUIDED_STAGES;
}

export function getGuidedStage(stageName: GuidedStageName): GuidedStage {
  return GUIDED_STAGES[stageName];
}
