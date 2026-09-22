// The single list of what an Insight submission requires. Both places that
// talk about "what's left" read from here, so they can never disagree:
//
//   - the dashboard hub's "Finish Insight" checklist, which marks each item
//     done from the rows actually saved in the database, and
//   - the "what's left to finish" popup on the Submit button, which marks each
//     item done from the live form as it is typed.
//
// Keeping one entry per form field (rather than grouping several fields into
// one line) is what lets the popup jump straight to the exact box, and it
// keeps the two counts identical. This list must stay in step with what
// saveInsightAction enforces for a final submit.
/** The three kinds of strongest firsthand evidence a student can choose on
 *  Empathy (the Stage 1 reviewer doc's evidence-type choice). The form offers
 *  exactly these and the server only stores one of them. */
export const INSIGHT_EVIDENCE_TYPES = [
  "Anonymous quote",
  "Interview observation",
  "Summary of participant experience",
] as const;

export type InsightRequirement = {
  /** The form field's `name`, which is also its key in Submission.content. */
  key: string;
  label: string;
  /** The stage page this is answered on (the `?page=` id) and its display name. */
  page: string;
  pageLabel: string;
  /** A written answer, or a confirmation box. */
  kind: "text" | "check";
  /** Part of the submission, but does not gate the Submit button. */
  optional?: boolean;
  /** Only applies to a team project. */
  teamOnly?: boolean;
  /** The id of the element to jump to, when it is not the same as `key`. */
  anchor?: string;
};

export const INSIGHT_REQUIREMENTS = [
  // --- Observation Skills ---
  { key: "observations", label: "Your 3–5 strongest observations", page: "observation", pageLabel: "Observation Skills", kind: "text" },
  { key: "photoUrl", label: "A photo of the problem", page: "observation", pageLabel: "Observation Skills", kind: "text", optional: true, anchor: "photo" },

  // --- Empathy (the Consent page has no fields of its own; its
  //     confirmations are answered here, alongside the interview evidence) ---
  { key: "participantLabel", label: "Who you learned from", page: "empathy", pageLabel: "Empathy", kind: "text" },
  { key: "participantConnection", label: "How they are connected to the problem", page: "empathy", pageLabel: "Empathy", kind: "text" },
  { key: "whatLearned", label: "What this person helped you understand", page: "empathy", pageLabel: "Empathy", kind: "text" },
  { key: "evidenceType", label: "Which kind of firsthand evidence is strongest", page: "empathy", pageLabel: "Empathy", kind: "text" },
  { key: "firsthandEvidence", label: "The evidence itself", page: "empathy", pageLabel: "Empathy", kind: "text" },
  { key: "consentGiven", label: "Confirm: the participant agreed to speak with you", page: "empathy", pageLabel: "Empathy", kind: "check" },
  { key: "permissionToUse", label: "Confirm: you have permission to use the information", page: "empathy", pageLabel: "Empathy", kind: "check" },
  { key: "privacyRemoved", label: "Confirm: you removed private or sensitive information", page: "empathy", pageLabel: "Empathy", kind: "check" },
  { key: "rulesFollowed", label: "Confirm: you followed the research and safety rules", page: "empathy", pageLabel: "Empathy", kind: "check" },
  { key: "before", label: "What you thought before observing and speaking with someone", page: "empathy", pageLabel: "Empathy", kind: "text" },
  { key: "now", label: "What you think now, after collecting evidence", page: "empathy", pageLabel: "Empathy", kind: "text" },
  { key: "whatCausedChange", label: "What caused that change", page: "empathy", pageLabel: "Empathy", kind: "text" },

  // --- Problem Scope (title and category live on Project, not on
  //     Submission.content; both readers pass them in the same way) ---
  { key: "title", label: "Project title", page: "scope", pageLabel: "Problem Scope", kind: "text" },
  { key: "category", label: "Innovation area", page: "scope", pageLabel: "Problem Scope", kind: "text" },
  { key: "problemStatement", label: "Final problem statement", page: "scope", pageLabel: "Problem Scope", kind: "text" },
  { key: "whoIsAffected", label: "Who experiences the problem", page: "scope", pageLabel: "Problem Scope", kind: "text" },
  { key: "whereItHappens", label: "Where it happens", page: "scope", pageLabel: "Problem Scope", kind: "text" },
  { key: "whenItHappens", label: "When it happens", page: "scope", pageLabel: "Problem Scope", kind: "text" },
  { key: "whyItMatters", label: "Why it matters", page: "scope", pageLabel: "Problem Scope", kind: "text" },
  { key: "whyManageable", label: "Why the scope is manageable", page: "scope", pageLabel: "Problem Scope", kind: "text" },

  // --- Team Charter (team projects only). "Our Team Charter is complete" is
  //     the curriculum's "if applicable" line and does not gate Submit. ---
  { key: "teamUnderstandsProblem", label: "Confirm: you understand the problem you are submitting", page: "team", pageLabel: "Team Charter", kind: "check", teamOnly: true },
  { key: "teamUnderstandsEvidence", label: "Confirm: you understand the main evidence", page: "team", pageLabel: "Team Charter", kind: "check", teamOnly: true },
  { key: "teamCanExplainLearning", label: "Confirm: you can explain what you learned in Stage 1", page: "team", pageLabel: "Team Charter", kind: "check", teamOnly: true },
  { key: "teamAgreesRepresents", label: "Confirm: this submission represents your team's understanding", page: "team", pageLabel: "Team Charter", kind: "check", teamOnly: true },
  { key: "teamCharterComplete", label: "Your Team Charter is complete", page: "team", pageLabel: "Team Charter", kind: "check", teamOnly: true, optional: true },
] as const satisfies readonly InsightRequirement[];

/** Every field name in the list above, as a union, so callers key off it safely. */
export type InsightRequirementKey = (typeof INSIGHT_REQUIREMENTS)[number]["key"];

// The list is declared `as const` to keep those literal key names, which also
// means an entry that omits `optional`/`teamOnly` has no such property at all.
// Reading it back through this type restores them as optional, while the
// `satisfies` above has already checked every entry's shape.
export type InsightRequirementEntry = InsightRequirement & { key: InsightRequirementKey };

/** The requirements that apply to this project, in page order. */
export function insightRequirementsFor(isTeamProject: boolean): InsightRequirementEntry[] {
  return (INSIGHT_REQUIREMENTS as readonly InsightRequirementEntry[]).filter(
    (item) => !item.teamOnly || isTeamProject
  );
}

/** Whether one requirement is satisfied by the value saved or typed for it. */
export function isInsightRequirementMet(item: { kind: "text" | "check" }, value: unknown): boolean {
  if (item.kind === "check") return value === true;
  return typeof value === "string" && value.trim().length > 0;
}
