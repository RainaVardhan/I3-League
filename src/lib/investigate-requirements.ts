// The single list of what an Investigate submission requires. Three places
// read it, so they can never disagree:
//
//   - the dashboard hub's "Finish Investigate" checklist (src/lib/stage-checklist.ts),
//     which marks each item done from the rows saved in the database,
//   - the "what's left to finish" popup on the Submit button (InvestigateForm),
//     which marks each item done from the live form as it is typed, and
//   - saveInvestigateAction's final-submit check (actions.ts), which refuses a
//     submission while any required item is unmet.
//
// One entry per form field, so the popup and the hub can jump to the exact
// box. Every field traces to a Stage 2 "Must include" item or activity output
// (the curriculum has no field-level Stage 2 submission template yet, unlike
// Stage 1's 05_BUILD reviewer doc, so the fields are the smallest set that
// captures each required item). See INVESTIGATE_PAGE_DETAILS in
// src/lib/stage-copy.ts for the per-page wording.

import { investigatePageDetail, type InvestigatePageId } from "@/lib/stage-copy";

/** A student in grade 9 or above. Student.grade is free text ("8", "9th"),
 *  so anything that doesn't start with a number counts as not high school,
 *  and the HS-only System Map then stays optional rather than blocking. */
export function isHighSchoolGrade(grade: string): boolean {
  const n = parseInt(grade, 10);
  return Number.isFinite(n) && n >= 9;
}

/** The evidence types a student can tick on Evidence Collection. From the
 *  minimum evidence standard's own examples ("interview + survey + credible
 *  secondary source, or observation + expert interview + published data"). */
export const EVIDENCE_TYPES = [
  "Interview",
  "Survey",
  "Observation",
  "Expert interview",
  "Credible secondary source",
  "Published data",
] as const;

/** "More than one type of evidence" (the Stage 2 load-bearing requirement). */
export const MIN_EVIDENCE_TYPES = 2;

export type InvestigateRequirement = {
  /** The form field's `name`, which is also its key in Submission.content. */
  key: string;
  label: string;
  /** The stage page it is answered on (the `?page=` id) and that page's name. */
  page: string;
  pageLabel: string;
  /** A written answer, a confirmation, or a set of ticked boxes (see `min`). */
  kind: "text" | "check" | "multi";
  /** For "multi": how many boxes must be ticked. */
  min?: number;
  /** Required for high school students only (HS CORE); optional otherwise. */
  hsOnly?: boolean;
};

export const INVESTIGATE_REQUIREMENTS = [
  // --- Questions & Bias ---
  { key: "researchQuestions", label: "2–4 focused research questions", page: "questions", pageLabel: "Questions & Bias", kind: "text" },
  { key: "biasRevisions", label: "The questions you rewrote to remove bias", page: "questions", pageLabel: "Questions & Bias", kind: "text" },

  // --- Privacy & Safety. The safety screening is not a form field: it is done
  //     once the project's SafetyReview is CLEARED, and both readers pass that
  //     in as a boolean. ---
  { key: "dataMinimization", label: "The personal information you removed, and why", page: "privacy", pageLabel: "Privacy & Safety", kind: "text" },
  { key: "safetyCleared", label: "Safety screening completed and cleared", page: "privacy", pageLabel: "Privacy & Safety", kind: "check" },

  // --- Collecting Evidence (Evidence Collection + Data Reality Check) ---
  { key: "evidenceTypes", label: "At least two types of evidence", page: "evidence", pageLabel: "Collecting Evidence", kind: "multi", min: MIN_EVIDENCE_TYPES },
  { key: "researchInstrument", label: "Your survey or interview questions", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },
  { key: "firsthandFindings", label: "What your firsthand research found", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },
  { key: "secondaryResearch", label: "Your relevant secondary research", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },
  { key: "statistic", label: "One statistic from your research", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },
  { key: "statisticSampleSize", label: "Its sample size", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },
  { key: "statisticWhoIncluded", label: "Who was included", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },
  { key: "statisticRepresentative", label: "Whether it is representative", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },
  { key: "researchLimitations", label: "Your research limitations", page: "evidence", pageLabel: "Collecting Evidence", kind: "text" },

  // --- Triangulation (Triangulate a Claim) and Research Integrity (Contradicting Evidence) ---
  { key: "triangulatedClaim", label: "The claim you triangulated", page: "triangulation", pageLabel: "Triangulation", kind: "text" },
  { key: "triangulationEvidence", label: "The 2–3 evidence types you checked it against", page: "triangulation", pageLabel: "Triangulation", kind: "text" },
  { key: "triangulationResult", label: "Whether they support or challenge the claim", page: "triangulation", pageLabel: "Triangulation", kind: "text" },
  { key: "challengingEvidence", label: "Evidence that challenges or complicates your thinking", page: "integrity", pageLabel: "Research Integrity", kind: "text" },
  { key: "challengingInterpretation", label: "What that evidence means for your thinking", page: "integrity", pageLabel: "Research Integrity", kind: "text" },
  { key: "understandingChange", label: "How the research changed or strengthened your understanding", page: "integrity", pageLabel: "Research Integrity", kind: "text" },

  // --- Sources ---
  { key: "sourceList", label: "Your source list", page: "sources", pageLabel: "Sources", kind: "text" },
  { key: "sourceCredibility", label: "Your source credibility evaluation", page: "sources", pageLabel: "Sources", kind: "text" },

  // --- Root Cause & Systems (the System Map is HS CORE) ---
  { key: "rootCauseChain", label: "Your root cause chain (Five Whys)", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text" },
  { key: "proposedRootCause", label: "Your proposed root cause", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text" },
  { key: "rootCauseEvidence", label: "The evidence that supports it", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text" },
  { key: "systemActors", label: "System map: actors", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text", hsOnly: true },
  { key: "systemCauses", label: "System map: causes", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text", hsOnly: true },
  { key: "systemConstraints", label: "System map: constraints", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text", hsOnly: true },
  { key: "systemFeedbackLoops", label: "System map: feedback loops", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text", hsOnly: true },
  { key: "systemRelationships", label: "System map: relationships", page: "rootcause", pageLabel: "Root Cause & Systems", kind: "text", hsOnly: true },

  // --- Stakeholders & Gap ---
  { key: "stakeholderUsers", label: "Stakeholders: users", page: "gap", pageLabel: "Stakeholders & Gap", kind: "text" },
  { key: "stakeholderBeneficiaries", label: "Stakeholders: beneficiaries", page: "gap", pageLabel: "Stakeholders & Gap", kind: "text" },
  { key: "stakeholderDecisionMakers", label: "Stakeholders: decision-makers", page: "gap", pageLabel: "Stakeholders & Gap", kind: "text" },
  { key: "stakeholderFunders", label: "Stakeholders: funders/supporters", page: "gap", pageLabel: "Stakeholders & Gap", kind: "text" },
  { key: "stakeholderInfluencers", label: "Stakeholders: influencers", page: "gap", pageLabel: "Stakeholders & Gap", kind: "text" },
  { key: "existingSolutions", label: "2–4 existing approaches compared", page: "gap", pageLabel: "Stakeholders & Gap", kind: "text" },
  { key: "identifiedGap", label: "The gap they leave", page: "gap", pageLabel: "Stakeholders & Gap", kind: "text" },
] as const satisfies readonly InvestigateRequirement[];

export type InvestigateRequirementKey = (typeof INVESTIGATE_REQUIREMENTS)[number]["key"];

/** A requirement as it applies to one student: `optional` is true when it does
 *  not gate Submit (an HS-only item for a middle school student). */
export type InvestigateRequirementEntry = InvestigateRequirement & {
  key: InvestigateRequirementKey;
  optional: boolean;
};

/** Every requirement, in page order. HS-only items (the System Map) are
 *  required in high school and optional for a middle school student, whose
 *  Root Cause page offers a simpler optional map; each item's page name is the
 *  one this student sees (see investigatePageDetail). */
export function investigateRequirementsFor(isHighSchool: boolean): InvestigateRequirementEntry[] {
  return (INVESTIGATE_REQUIREMENTS as readonly (InvestigateRequirement & { key: InvestigateRequirementKey })[])
    .map((item) => ({
      ...item,
      pageLabel: investigatePageDetail(item.page as InvestigatePageId, isHighSchool).label,
      optional: Boolean(item.hsOnly) && !isHighSchool,
    }));
}

/** Whether one requirement is satisfied by the value saved or typed for it. */
export function isInvestigateRequirementMet(item: InvestigateRequirement, value: unknown): boolean {
  if (item.kind === "check") return value === true;
  if (item.kind === "multi") return Array.isArray(value) && value.length >= (item.min ?? 1);
  return typeof value === "string" && value.trim().length > 0;
}

/** The text fields among the requirements (everything but the safety check
 *  and the evidence-type boxes), used to read and cap form input. */
export const INVESTIGATE_TEXT_KEYS = INVESTIGATE_REQUIREMENTS.filter((item) => item.kind === "text").map(
  (item) => item.key
) as Exclude<InvestigateRequirementKey, "safetyCleared" | "evidenceTypes">[];

export type InvestigateTextKey = (typeof INVESTIGATE_TEXT_KEYS)[number];
