import type { StageName } from "@prisma/client";

// ---------------------------------------------------------------------------
// Canonical stage copy for the student dashboard.
//
// This is now the single source of truth for what each stage asks, what a
// student produces, and how it is reviewed. Every field below is taken
// straight from the i3League company curriculum docs in `docs/curriculum/`
// (the authoritative source per docs/curriculum/README.md), NOT from the
// marketing curriculum copy in src/components/curriculum/stages.ts — that
// module stays as-is for the public site, but the dashboard should describe
// the real working process, not the marketing paraphrase.
//
// Sources:
//  - coreQuestion / mentalTest / advancesWhen ...... 03_SHOW/i3league-layer3-show-full-requirements.md
//  - producesArtifact / submissionFormat / checklist  03_SHOW/i3league-layer3-show-full-requirements.md
//  - reviewerChecks ................................ 03_SHOW/i3league-layer3-show-full-requirements.md
//  - depthNote (HS / Stretch additions) ............ 03_SHOW/i3league-layer3-show-master-table.md
//  - review model (dimensions, gate, cycle) ........ 04_REVIEW/i3league-layer4-review-master-architecture.md
// ---------------------------------------------------------------------------

/** The recurring one-line framing the company uses across the whole program. */
export const PROGRAM_TAGLINE = "Students build evidence, not just ideas.";

/**
 * Every stage is built the same way across four layers. Shown on the
 * dashboard so a student knows what the parts of a stage page are for.
 */
export const CURRICULUM_LAYERS: { key: string; label: string; blurb: string }[] = [
  { key: "LEARN", label: "Learn", blurb: "Short teaching notes for every topic in the stage." },
  {
    key: "DO",
    label: "Do",
    blurb: "Activities and worksheets that turn each topic into something you actually produce.",
  },
  {
    key: "SHOW",
    label: "Show",
    blurb: "Pull your strongest evidence into the one artifact the stage requires.",
  },
  {
    key: "REVIEW",
    label: "Review",
    blurb: "A reviewer checks whether your thinking and evidence are ready to advance.",
  },
];

/**
 * The operating cycle that runs on top of REVIEW. Revision is expected,
 * never penalized — the number of cycles is not tracked as a negative
 * signal (04_REVIEW master architecture).
 */
export const OPERATING_CYCLE = {
  steps: ["Feedback", "Revise", "Resubmit", "Advance"] as const,
  blurb:
    "A submission that isn't ready yet comes back with specific, dimension-tied feedback. You revise and resubmit as many times as the calendar allows before the stage deadline. Revision is expected, never penalized.",
};

/**
 * The six rubric dimensions are identical at every stage. Advancement is a
 * floor-based gate, not an average: you advance only when every required
 * dimension is at least "Meets Standard."
 */
export const REVIEW_DIMENSIONS = [
  "Evidence Quality",
  "Reasoning & Interpretation",
  "Process Rigor",
  "Integrity & Reflection",
  "Completeness",
  "Communication & Clarity",
] as const;

export const ADVANCEMENT_GATE_NOTE =
  "Review is a gate check, not a grade. You advance when every required dimension is at least “Meets Standard.” Being strong in one area can't make up for a missing load-bearing piece.";

export type StageCopy = {
  /** Title-case display name, e.g. "Insight" — use in headings and buttons. */
  name: string;
  /** Three-word summary for the dashboard's six-stage list — the full
   *  explanation of the stage lives on the stage's own page, not here. */
  tagline: string;
  /** Short punchy thesis, kept from the approved editorial voice. */
  headline: string;
  /** The canonical stage question from the curriculum architecture summary. */
  coreQuestion: string;
  /** One or two sentences describing the real work of the stage. */
  description: string;
  /** The polished artifact the stage requires (Layer 3 SHOW). */
  producesArtifact: string;
  /** Expected form/length of the submission. */
  submissionFormat: string;
  /** Everything the submission must include (Layer 3 "Must include"). */
  submissionChecklist: string[];
  /** What a reviewer actually checks (Layer 3 "Reviewer checks"). */
  reviewerChecks: string[];
  /** The bar the submission has to clear to move on (Layer 3 "ADVANCE when"). */
  advancesWhen: string;
  /** The stage's one-line mental test (Layer 3). */
  mentalTest: string;
  /** Extra depth expected of high-school / advanced projects, if any. */
  depthNote?: string;
  /** Anything stage-specific worth calling out on the dashboard. */
  finalsNote?: string;
};

const STAGE_COPY: Record<StageName, StageCopy> = {
  INSIGHT: {
    name: "Insight",
    tagline: "Validate the problem",
    headline: "Start with the problem, not the idea.",
    coreQuestion: "Is this a real problem?",
    description:
      "Find a real, specific problem that someone other than you actually experiences, and gather firsthand evidence that it's real, before anything about a solution is decided.",
    producesArtifact: "Validated Problem Statement + Evidence Notes",
    submissionFormat: "One polished evidence package, roughly 2–4 pages or the digital equivalent.",
    submissionChecklist: [
      "Final problem statement (no solution hidden inside it)",
      "Clearly identified affected group",
      "Why the problem matters",
      "3–5 meaningful observations",
      "At least one firsthand interview or conversation",
      "Something you learned from the affected person",
      "Any assumption that changed",
      "Scope: who, where, when",
      "Team Charter (team projects)",
      "Evidence that consent and privacy expectations were followed",
    ],
    reviewerChecks: [
      "Is this actually a problem?",
      "Who experiences it, and how do you know?",
      "Is there firsthand evidence, and does it support the stated problem?",
      "Is the scope manageable?",
      "Did you challenge any of your assumptions?",
      "Was the evidence gathered responsibly?",
    ],
    advancesWhen:
      "The problem is specific, human-centered, backed by firsthand evidence, narrow enough to investigate, and has no solution hidden inside it.",
    mentalTest: "Real → Specific → Human-centered → Firsthand-evidenced → Investigable",
  },
  INVESTIGATE: {
    name: "Investigate",
    tagline: "Research the causes",
    headline: "Research before you build, safely.",
    coreQuestion: "Why is it happening, and what does the evidence say?",
    description:
      "Test your problem against real evidence from more than one kind of source, find the credible root cause rather than a symptom, and clear the mandatory safety screening before going further.",
    producesArtifact: "Research Brief",
    submissionFormat:
      "One polished Research Brief, roughly 4–8 pages or the digital equivalent, depending on project complexity.",
    submissionChecklist: [
      "2–4 focused research questions",
      "Firsthand research",
      "Relevant secondary research with a source list",
      "Source credibility evaluation",
      "More than one type of evidence",
      "Evidence that challenges or complicates your thinking",
      "Triangulation of at least one important claim",
      "Root cause analysis",
      "Existing solutions and gap analysis",
      "Stakeholder map",
      "Research limitations",
      "Cleared safety screening",
    ],
    reviewerChecks: [
      "Are the research questions focused?",
      "Are multiple evidence types represented, and are sources credible?",
      "Was bias considered and contradictory evidence acknowledged?",
      "Does the proposed root cause follow from the evidence, not just a symptom?",
      "Do existing solutions actually leave the stated gap?",
      "Are the right stakeholders identified?",
      "Did the research genuinely change or strengthen your understanding?",
    ],
    advancesWhen:
      "You have enough credible evidence to explain what is happening, why it is happening, and what existing approaches currently miss.",
    mentalTest: "Question → Evidence → Triangulate → Root Cause → Gap",
    depthNote: "High-school projects also include a System Map of the problem ecosystem.",
  },
  IMAGINE: {
    name: "Imagine",
    tagline: "Explore the options",
    headline: "Create options before choosing one.",
    coreQuestion:
      "What could solve it, which direction should we choose, and what must we test first?",
    description:
      "Generate at least three genuinely different concepts, compare them with a decision matrix completed before you choose, disclose your originality and influences, and name the one assumption that could sink the idea.",
    producesArtifact: "Concept Portfolio",
    submissionFormat:
      "One Concept Portfolio, roughly 4–8 pages or an equivalent visual/digital format.",
    submissionChecklist: [
      "Value proposition and user needs",
      "At least 3 genuinely different concepts",
      "Constraints considered",
      "Key risks",
      "Accessibility considerations",
      "Ethical and responsible-design considerations",
      "AI Fit evaluation (if AI is proposed)",
      "Major assumptions",
      "Originality, attribution & IP record",
      "Decision matrix",
      "Selected concept and the reason for selecting it",
      "One clearly named critical assumption",
    ],
    reviewerChecks: [
      "Were genuinely different solutions considered, and do they trace back to user needs?",
      "Were real constraints and risks considered honestly?",
      "Is the solution inclusive and responsible?",
      "If AI is used, does it actually add value?",
      "Is existing work and inspiration acknowledged?",
      "Was the decision matrix completed before the selection?",
      "Is the final choice supported by the comparison?",
      "Could the critical assumption actually kill or seriously weaken the concept?",
    ],
    advancesWhen:
      "You've selected a defensible concept and know exactly what you must learn next.",
    mentalTest: "Explore → Compare → Decide → What could prove us wrong?",
    depthNote: "High-school projects also include a Build vs. Buy vs. Partner analysis.",
  },
  ITERATE: {
    name: "Iterate",
    tagline: "Build and test",
    headline: "Use failure as evidence.",
    coreQuestion: "Can we build and test the critical assumption?",
    description:
      "Build the smallest version that can actually test your critical assumption, set success criteria before testing, run a real test, revise based on what you learn, and retest.",
    producesArtifact: "Tested Prototype + Test Plan + Iteration Log",
    submissionFormat:
      "A prototype or other appropriate testable representation, plus a Test Plan and an Iteration Log.",
    submissionChecklist: [
      "The critical assumption being tested",
      "MVP / minimum testable version",
      "Why the chosen prototype fidelity is appropriate",
      "Test question",
      "Success criteria defined before testing",
      "Test participants and context, with permissions where needed",
      "Observations",
      "Participant / user feedback",
      "Failed, partial, surprising, or inconclusive findings",
      "What was learned",
      "V1 → V2 changes, with a reason for every meaningful revision",
      "Evidence of retesting",
    ],
    reviewerChecks: [
      "Does the MVP actually test the critical assumption?",
      "Was success defined before testing?",
      "Was the test appropriate, and are observation and opinion kept separate?",
      "Were inconvenient results reported honestly?",
      "Did the evidence cause an actual revision?",
      "Was the revised version tested again?",
      "Can a reviewer follow the V1 → V2 learning trail?",
    ],
    advancesWhen:
      "You've demonstrated a real, evidence-driven iteration cycle: test, learn, revise, retest.",
    mentalTest: "Assumption → Build → Test → Learn → Change → Retest",
    depthNote:
      "High-school projects add a Formal Experiment Design; technical projects add a Git repository and README where relevant.",
  },
  IMPACT: {
    name: "Impact",
    tagline: "Measure the difference",
    headline: "Make it matter beyond the prototype.",
    coreQuestion: "Did it actually make a measurable difference?",
    description:
      "Choose a metric that reflects the original problem, compare it against a credible baseline or benchmark, report what actually changed, and state honestly what you did and didn't prove.",
    producesArtifact: "Impact Report",
    submissionFormat:
      "One polished Impact Report, roughly 4–8 pages or an equivalent evidence package.",
    submissionChecklist: [
      "Impact statement",
      "Success metric, and why that metric matters",
      "Baseline, benchmark, or comparison condition",
      "Result",
      "Quantitative evidence where appropriate",
      "Qualitative evidence where appropriate",
      "Data interpretation and alternative explanations",
      "Responsible claims",
      "Limitations",
      "Unintended consequences",
      "Impact across relevant stakeholders",
      "Cost vs. benefit",
      "Final conclusion: supported / partially supported / not supported",
    ],
    reviewerChecks: [
      "Does the metric actually relate to the original problem?",
      "Is there a credible baseline, benchmark, or comparison condition?",
      "What changed, and how was it measured?",
      "Are the claims proportional to the evidence?",
      "Are alternative explanations acknowledged and limitations clearly stated?",
      "Were unintended consequences investigated?",
      "Did different stakeholders experience different outcomes?",
      "Was the benefit worth the cost?",
      "Does the final conclusion match the evidence?",
    ],
    advancesWhen:
      "You can state honestly what changed, what didn't, and what the evidence supports. A null or negative result still advances if the learning is rigorous.",
    mentalTest:
      "Compared to what? → What changed? → How do we know? → What didn't we prove?",
    depthNote:
      "Advanced projects add adoption/uptake, scalability, ROI / unit economics, and leading vs. lagging indicators where relevant.",
  },
  INFLUENCE: {
    name: "Influence",
    tagline: "Make the case",
    headline: "Explain the work. Defend the decisions.",
    coreQuestion: "Can we defend it, sustain it, and convince someone to take the next step?",
    description:
      "Bring all six stages into one evidence-backed story with a live demo, defend your claims in Q&A without bluffing, lay out a realistic implementation and sustainability model, and make one specific Ask.",
    producesArtifact: "Final Pitch + Innovation Portfolio",
    submissionFormat:
      "The Final Innovation Portfolio, a Final Pitch / Presentation, and an appropriate demonstration of the solution.",
    submissionChecklist: [
      "Audience definition",
      "Evidence-based story: clear problem, research evidence, solution-selection reasoning",
      "Prototype and iteration story",
      "Impact evidence",
      "At least one strong evidence visual",
      "An appropriate demo",
      "Major claims linked to evidence",
      "Limitations",
      "Implementation & sustainability model",
      "A clear next-step Ask",
      "Reflection and future direction",
      "Completed mock reviewer Q&A",
      "The complete portfolio",
    ],
    reviewerChecks: [
      "Can the team explain the problem clearly?",
      "Does every major claim trace to evidence?",
      "Can they show what changed through the six stages?",
      "Can they demonstrate the solution appropriately?",
      "Can they explain failures and limitations?",
      "Can they answer hard questions without bluffing?",
      "Is implementation realistic, and is sustainability considered?",
      "Is the Ask specific?",
      "Does every team member understand the project and can each explain their own contribution?",
    ],
    advancesWhen:
      "The team can make a credible, evidence-backed case for what should happen next, and every member can explain the project and their own contribution.",
    mentalTest: "Explain → Show → Prove → Defend → Ask",
    depthNote:
      "High-school projects add a budget, funding/support model, partnerships, implementation risks, and an executive summary; Stretch work adds go-to-market, opportunity sizing, and technical architecture.",
    finalsNote:
      "This is the only stage scored comparatively. After you pass the Stage 6 gate, Finals selection ranks qualified teams on the same six dimensions.",
  },
};

export function getStageCopy(stageName: StageName): StageCopy {
  return STAGE_COPY[stageName];
}
