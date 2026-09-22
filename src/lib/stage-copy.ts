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

/**
 * A stage's full rubric detail (docs/curriculum/04_REVIEW/i3league-stage{N}-rubric.md).
 * Optional on StageCopy — only stages with a written rubric doc populate
 * this; the plain REVIEW_DIMENSIONS list above still renders for every
 * stage regardless.
 */
export type RubricLevelName = "Not Yet Evident" | "Developing" | "Meets Standard" | "Strong Evidence";

export type RubricDimension = {
  /** Must match one of REVIEW_DIMENSIONS. */
  name: string;
  /** What the reviewer is checking for, in this dimension, at this stage. */
  checks: string[];
  levels: { level: RubricLevelName; descriptor: string }[];
  /** The rubric doc's own callout for this dimension, if any (e.g. "Load-bearing requirement", "Key test"). */
  note?: string;
};

export type DetailedRubric = {
  gateQuestion: string;
  /** What reviewers are explicitly NOT judging at this stage, if stated. */
  notJudging?: string;
  dimensions: RubricDimension[];
  /** Non-negotiable requirements that must all be present regardless of dimension scores. */
  nonNegotiables: string[];
};

/**
 * The stage-level closing content of a stage's SHOW/REVIEW material: how the
 * stage's worksheets roll up into its artifact, the exact "Must include" list
 * of the final submission, the minimum evidence standard, the advancement
 * check, and the closing reflection. Shown on the stage's Review page.
 * Only stages whose full curriculum text has been transcribed populate it.
 */
// The stage-level closing content of the Review page. Deliberately small:
// the required artifact, format and guiding question are already in the stage
// hero, the "Must include" lists are on each section's Show page, "Advances
// when" is in How it's reviewed, and the minimum evidence standard is the
// rubric's non-negotiables, so none of those are repeated here.
export type FinalSubmission = {
  closingReflection: { text: string };
};

/**
 * Per-section (per-topic) Do and Show detail for a stage's guided pages:
 * the activity with its worksheet and output, plus the section's own "Must
 * include" list.
 */
export type SectionDetail = {
  do: {
    activity: string;
    /** What to do. Left out for a supporting activity the curriculum names
     *  without describing (Investigate's Root Cause Analysis etc.). */
    description?: string;
    /** The curriculum's "Why it's needed" line, for a supporting activity. */
    why?: string;
    /** A required supporting activity (no LEARN note of its own), labelled
     *  as one on the page. */
    supporting?: boolean;
    worksheet: string;
    output: string;
  };
  mustInclude: string[];
  /** Full page name, as shown in the navy bar (used in the Review overview). */
  page: string;
  /** What is and is not submitted for this section. The platform does not
   *  store worksheets (that is the Phase 2 evidence model), so the worksheet
   *  stays with the student and only the typed answers below are submitted. */
  submission: {
    /** The Do worksheet that stays with the student and is never uploaded. */
    keep: string;
    /** Optional extra sentence after "Not submitted: ..." in the Do footer. */
    note?: string;
  };
};

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
  /** The stage's guiding question as the stage page states it, when it is
   *  worded differently from `coreQuestion`. The stage hero prefers this. */
  guidingQuestion?: string;
  /** The stage's guiding principle, when the curriculum names one (Stage 2:
   *  "Good research can change your mind."). Shown in the stage hero. */
  guidingPrinciple?: string;
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
  /** The bar that sends a submission back for revision (Layer 3 "REVISE when"), if written. */
  revisesWhen?: string;
  /** The stage's one-line mental test (Layer 3). */
  mentalTest: string;
  /** Rollup, final submission, standards, and closing reflection, when written. */
  finalSubmission?: FinalSubmission;
  /** Extra depth expected of high-school / advanced projects, if any. */
  depthNote?: string;
  /** Anything stage-specific worth calling out on the dashboard. */
  finalsNote?: string;
  /** Full per-dimension rubric detail, if a stage rubric doc exists yet. */
  detailedRubric?: DetailedRubric;
};

const STAGE_COPY: Record<StageName, StageCopy> = {
  INSIGHT: {
    name: "Insight",
    tagline: "Validate the problem",
    headline: "Start with the problem, not the idea.",
    coreQuestion: "Is this a real problem?",
    guidingQuestion: "Whose problem is this, and how do I know?",
    description:
      "Find a real, specific problem that someone other than you actually experiences, and gather firsthand evidence that it's real, before anything about a solution is decided.",
    // Verbatim from every curriculum doc that names it (03_SHOW full
    // requirements + master table, 04_REVIEW stage 1 rubric, 05_BUILD
    // submission reviewer + worksheet pack, 02_DO activities). "Evidence Notes"
    // is the name of the deliverable, made up of the observation, interview and
    // reflection answers; it is not a separate box to fill in.
    producesArtifact: "Validated Problem Statement + Evidence Notes",
    // What a student actually submits: typed answers in the platform. No
    // document or package is uploaded.
    submissionFormat: "Typed answers on the pages of this stage, submitted together on the Review page.",
    // Verbatim "Final Submission Check" from
    // docs/curriculum/05_BUILD/i3league-stage1-submission-reviewer.md Part A.
    submissionChecklist: [
      "Our problem is clearly stated",
      "We identify who experiences it",
      "We identify where and when it happens",
      "Our problem statement does not prescribe our solution",
      "We selected 3–5 meaningful observations",
      "We include at least one firsthand source",
      "Our evidence supports the problem",
      "We explain what we learned",
      "We handled participant information responsibly",
      "Our Team Charter is complete, if applicable",
    ],
    // Verbatim "Reviewer checks" from
    // docs/curriculum/03_SHOW/i3league-layer3-show-full-requirements.md.
    reviewerChecks: [
      "Is this actually a problem?",
      "Who experiences it?",
      "How does the student know?",
      "Is there firsthand evidence?",
      "Does the evidence support the stated problem?",
      "Is the scope manageable?",
      "Did the student challenge any assumptions?",
      "Was evidence gathered responsibly?",
    ],
    advancesWhen: "The problem is sufficiently validated to justify deeper investigation.",
    revisesWhen:
      "The problem is based mainly on assumptions, is too broad, is actually a proposed solution, lacks firsthand evidence, or is not supported by the evidence presented.",
    mentalTest: "Real → Specific → Human-centered → Firsthand-evidenced → Investigable",
    // Verbatim from the company's Stage 1 documents (docs/curriculum/01_LEARN
    // insight notes, 03_SHOW full requirements).
    finalSubmission: {
      closingReflection: {
        text: "Before moving to Stage 2 (Investigate), you should be able to answer \u201cWhose problem is this, and how do I know?\u201d in your own words, backed by at least one piece of firsthand evidence.",
      },
    },
    detailedRubric: {
      gateQuestion: "Is this problem sufficiently validated to justify deeper investigation?",
      notJudging:
        "Reviewers are not judging how innovative, technical, profitable, sophisticated, or impressive the future solution might be. Stage 1 judges the problem and the evidence behind it.",
      nonNegotiables: [
        "A real affected person or group",
        "Firsthand evidence",
        "A problem statement that does not contain the solution",
      ],
      dimensions: [
        {
          name: "Evidence Quality",
          checks: [
            "Is there real firsthand evidence?",
            "Does someone other than the student/team actually experience the problem?",
            "Do the observations support the stated problem?",
            "Is the evidence relevant rather than merely interesting?",
          ],
          note: "Load-bearing requirement: firsthand evidence must exist. No amount of writing quality can compensate for its absence.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Problem is based mostly on assumptions or personal opinion. No meaningful firsthand evidence is provided, or the evidence does not support the problem being claimed.",
            },
            {
              level: "Developing",
              descriptor:
                "Some firsthand evidence exists, but it is thin, vague, weakly connected to the problem, or comes from too narrow a perspective to support the current statement.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "Student provides credible firsthand evidence and meaningful observations from people actually affected by the problem. The evidence clearly supports the problem statement.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "Multiple relevant observations or perspectives reinforce the problem while also showing nuance, variation, or something the student did not initially expect.",
            },
          ],
        },
        {
          name: "Reasoning & Interpretation",
          checks: [
            "Does the problem statement logically follow from the evidence?",
            "Is the student distinguishing what they observed from what they assumed?",
            "Is the problem framed without prematurely prescribing a solution?",
            "Can the student explain why the problem matters?",
          ],
          note: 'Key test: reviewer should be able to complete "The evidence shows that ___ experiences ___ because/when ___." If that sentence cannot be supported, the reasoning is not ready.',
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                'The claimed problem does not logically follow from the evidence, or the "problem" is actually a proposed solution such as "we need an app."',
            },
            {
              level: "Developing",
              descriptor:
                "The student identifies a plausible problem, but the connection between evidence and conclusion is incomplete, overgeneralized, or contains significant assumptions.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "The student makes a clear, reasonable problem claim that follows from the evidence and explains why it matters without jumping to a solution.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "The student distinguishes assumptions from findings, explains how evidence shaped the problem framing, and demonstrates nuanced understanding of the affected person's experience.",
            },
          ],
        },
        {
          name: "Process Rigor",
          checks: [
            "Did the student actually observe before solving?",
            "Did they engage with someone affected by the problem?",
            "Did they narrow the scope using who, where, and when?",
            "Was interviewing conducted responsibly?",
            "For teams, was a Team Charter created?",
          ],
          note: "This is where i3League reinforces: notice before you solve.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Major required Stage 1 steps were skipped. Student jumped directly to a solution or relied almost entirely on their own assumptions.",
            },
            {
              level: "Developing",
              descriptor:
                "Some required steps were completed, but observation, interviewing, scope narrowing, or team setup was incomplete or superficial.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "Student followed the Stage 1 process: observed, engaged with an affected person, narrowed the problem appropriately, and documented team expectations where applicable.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "Student followed the process thoughtfully and used what they learned at one step to improve the next, showing that the process genuinely influenced their thinking.",
            },
          ],
        },
        {
          name: "Integrity & Reflection",
          checks: [
            "Did the student acknowledge assumptions?",
            "Did anything they heard or observed challenge their original thinking?",
            "Did they report evidence honestly rather than only selecting information that supports their preferred problem?",
            "Were consent and privacy expectations respected?",
          ],
          note: "Key question: what did you believe before, and what did you learn after talking to someone? This starts the Reflection thread in Stage 1 instead of introducing reflection suddenly at the end.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Student presents assumptions as facts, misrepresents participant input, ignores consent/privacy expectations, or gives no evidence of reflection.",
            },
            {
              level: "Developing",
              descriptor:
                "Student acknowledges some uncertainty but reflection is superficial, or they struggle to distinguish their interpretation from what participants actually said.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "Student honestly distinguishes assumptions from evidence, identifies at least one learning or changed understanding, and handles participant information responsibly.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "Student openly identifies a meaningful assumption that was challenged or changed and explains how that affected the final problem framing.",
            },
          ],
        },
        {
          name: "Completeness",
          checks: [
            "Final problem statement",
            "Affected group",
            "Why the problem matters",
            "3–5 meaningful observations",
            "At least one firsthand interview/conversation",
            "Something learned from the affected person",
            "Assumption changed or challenged",
            "Who/where/when scope",
            "Team Charter when applicable",
            "Responsible evidence/consent handling",
          ],
          note: "Strong Evidence should never mean “more pages.” It means stronger integration and evidence.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Multiple required components are missing, including one or more components necessary to validate the problem.",
            },
            {
              level: "Developing",
              descriptor:
                "Most components are present, but one or more required pieces are incomplete, unclear, or insufficient.",
            },
            {
              level: "Meets Standard",
              descriptor: "All required Stage 1 submission elements are present and usable by the reviewer.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "All required elements are complete, well integrated, and reinforce one another rather than appearing as disconnected requirements.",
            },
          ],
        },
        {
          name: "Communication & Clarity",
          checks: [
            "Can the reviewer quickly understand the problem?",
            "Is it clear who experiences it?",
            "Is the evidence organized logically?",
            "Is the submission understandable without the student having to explain missing information verbally?",
          ],
          note: "Stage 1 does not reward fancy design. A plain document can earn Strong Evidence.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Submission is so unclear or disorganized that the reviewer cannot determine the problem, affected group, or supporting evidence.",
            },
            {
              level: "Developing",
              descriptor:
                "Core ideas are understandable but require significant interpretation or clarification from the reviewer.",
            },
            {
              level: "Meets Standard",
              descriptor: "Problem, affected group, evidence, and reasoning are clearly presented and easy to follow.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "Submission is concise, coherent, and makes the evidence trail immediately understandable without unnecessary material.",
            },
          ],
        },
      ],
    },
  },
  INVESTIGATE: {
    name: "Investigate",
    tagline: "Research the causes",
    headline: "Research before you build, safely.",
    coreQuestion: "Why is it happening, and what does the evidence say?",
    guidingPrinciple: "Good research can change your mind.",
    description:
      "Find out why your problem is happening. Ask focused research questions, gather more than one type of evidence, check your sources, name a root cause rather than a symptom, and find what existing solutions miss.",
    // Verbatim from the Stage 2 documents (03_SHOW full requirements, 04_REVIEW
    // stage 2 rubric, 02_DO stage 2 activities). The Research Brief is made of
    // the typed answers on this stage's pages ("or equivalent digital format").
    producesArtifact: "Research Brief",
    submissionFormat:
      "One polished Research Brief, approximately 4–8 pages or equivalent digital format, depending on project complexity.",
    // "Final INVESTIGATE Submission: Must include", verbatim.
    submissionChecklist: [
      "2–4 focused research questions",
      "Firsthand research",
      "Relevant secondary research",
      "Source list",
      "Source credibility evaluation",
      "More than one type of evidence",
      "Evidence that challenges or complicates the student's thinking",
      "Triangulation of at least one important claim",
      "Root Cause Analysis",
      "Existing Solutions & Gap Analysis",
      "Stakeholder Map",
      "Research limitations",
      "HS: System Map",
    ],
    // "INVESTIGATE Reviewer Checks", verbatim.
    reviewerChecks: [
      "Are the research questions focused?",
      "Are multiple evidence types represented?",
      "Are sources credible?",
      "Was bias considered?",
      "Is contradictory evidence acknowledged?",
      "Does the proposed root cause follow from the evidence?",
      "Is the team describing a root cause rather than only a symptom?",
      "Do existing solutions actually leave the stated gap?",
      "Are the correct stakeholders identified?",
      "Did the research genuinely change or strengthen the team's understanding?",
    ],
    advancesWhen:
      "The team has enough credible evidence to explain what is happening, why it is happening, and what existing approaches currently miss.",
    revisesWhen:
      "Research relies on one source type, sources are weak, conclusions exceed the evidence, the stated root cause is unsupported, or the gap analysis ignores obvious existing solutions.",
    mentalTest: "Question → Evidence → Triangulate → Root Cause → Gap",
    depthNote: "High-school projects also include a System Map of the problem ecosystem.",
    finalSubmission: {
      closingReflection: {
        text: "Good research can change your mind. Before moving to Stage 3 (Imagine), you should be able to show multiple types of evidence, honestly explain what the research found, identify a credible root cause, and explain what existing solutions currently miss.",
      },
    },
    // docs/curriculum/04_REVIEW/i3league-stage2-rubric.md, verbatim apart from
    // em dashes rewritten per the project's no-em-dash rule.
    detailedRubric: {
      gateQuestion:
        "Does the team have enough credible evidence to explain what is happening, why it is happening, and what existing approaches currently miss?",
      notJudging: "We are judging understanding, not solution quality.",
      nonNegotiables: [
        "Multiple types of evidence",
        "An evidence-supported root cause (not a symptom)",
        "A credible existing-solutions gap",
      ],
      dimensions: [
        {
          name: "Evidence Quality",
          checks: [
            "Are multiple evidence types represented?",
            "Are sources credible?",
            "Is at least one important claim triangulated across evidence types?",
          ],
          note: "Load-bearing requirement: More than one type of evidence must exist. A single source type, however well executed, cannot pass this dimension.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Research relies on a single source or source type (“we asked some people and they agreed”), or sources are not credible.",
            },
            {
              level: "Developing",
              descriptor:
                "More than one source exists, but evidence types are weak, thin, or not meaningfully triangulated.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "Multiple credible evidence types are present (e.g., interview + survey + credible secondary source), and at least one key claim is triangulated.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "Evidence is rich, well-triangulated, and drawn from sources well-matched to the specific claims being made.",
            },
          ],
        },
        {
          name: "Reasoning & Interpretation",
          checks: [
            "Does the proposed root cause follow from the evidence, rather than describing only a symptom?",
            "Do existing solutions actually leave the stated gap?",
            "Was bias considered?",
          ],
          note: "Key test: Reviewer should be able to complete: “The evidence suggests this is happening because ___, and existing approaches miss ___.” If either half can't be supported, reasoning isn't ready.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "The stated root cause is unsupported by evidence, or is actually a symptom rather than a cause. Gap analysis ignores obvious existing solutions.",
            },
            {
              level: "Developing",
              descriptor:
                "A root cause is proposed but the reasoning connecting evidence to cause is incomplete, or the gap analysis is shallow.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "The root cause is a reasonable, evidence-supported explanation (not just a symptom), and the gap analysis credibly shows what existing solutions miss.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "The root cause explanation accounts for the evidence with nuance, and the gap analysis meaningfully positions the problem relative to what already exists.",
            },
          ],
        },
        {
          name: "Process Rigor",
          checks: [
            "Were focused research questions defined before collecting evidence?",
            "Was root cause analysis actually conducted (e.g., Five Whys), not just asserted?",
            "Was a stakeholder map completed? (HS: was a system map completed?)",
          ],
          note: "This is where i3League reinforces: Good research can change your mind.",
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Research proceeded without focused questions, or root cause / gap analysis / stakeholder mapping was skipped entirely.",
            },
            {
              level: "Developing",
              descriptor:
                "Some process steps were completed, but questions were unfocused, root cause analysis was superficial, or stakeholder mapping was thin.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "Student followed the Stage 2 process: focused research questions, structured root cause analysis, existing-solutions comparison, and stakeholder mapping.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "Each process step visibly informed the next: for example, an interview finding reshaped a research question, or a root cause reshaped the gap analysis.",
            },
          ],
        },
        {
          name: "Integrity & Reflection",
          checks: [
            "Is contradicting or complicating evidence acknowledged rather than dropped?",
            "Are research limitations named?",
            "Is bias in survey/interview design addressed?",
          ],
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Evidence that contradicts the student's preferred narrative is omitted or ignored. No limitations are named.",
            },
            {
              level: "Developing",
              descriptor:
                "Some acknowledgment of limitations or contradicting evidence exists but is minimal or vague.",
            },
            {
              level: "Meets Standard",
              descriptor:
                "The student honestly reports at least one piece of evidence that complicated or challenged their thinking, and names real research limitations.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "The student explains how a specific piece of contradicting evidence changed or refined their understanding of the problem.",
            },
          ],
        },
        {
          name: "Completeness",
          checks: [
            "2–4 focused research questions",
            "Firsthand and secondary research",
            "Source list",
            "Source credibility evaluation",
            "Multiple evidence types",
            "Contradicting evidence",
            "Triangulation of at least one claim",
            "Root cause analysis",
            "Existing solutions & gap analysis",
            "Stakeholder map",
            "Research limitations",
            "(HS: system map)",
          ],
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "Multiple required components are missing, including components necessary to establish a credible root cause or gap.",
            },
            {
              level: "Developing",
              descriptor:
                "Most components are present, but one or more required pieces are incomplete or insufficient.",
            },
            {
              level: "Meets Standard",
              descriptor: "All required Stage 2 submission elements are present and usable by the reviewer.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "All required elements are present and clearly build on one another: the research questions, evidence, and root cause read as one coherent investigation.",
            },
          ],
        },
        {
          name: "Communication & Clarity",
          checks: [
            "Can the reviewer follow the research questions through to the root cause and gap without needing clarification?",
            "Is the Research Brief organized logically?",
          ],
          levels: [
            {
              level: "Not Yet Evident",
              descriptor:
                "The Research Brief is disorganized enough that the reviewer cannot determine what was found or how it connects to the problem.",
            },
            {
              level: "Developing",
              descriptor: "Core findings are understandable but require significant interpretation from the reviewer.",
            },
            {
              level: "Meets Standard",
              descriptor: "Research questions, evidence, root cause, and gap are clearly presented and easy to follow.",
            },
            {
              level: "Strong Evidence",
              descriptor:
                "The Research Brief reads as a clear, coherent investigation: a reviewer can trace the logic end to end without help.",
            },
          ],
        },
      ],
    },
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

/**
 * Stage 1 (INSIGHT) per-section Do and Show detail, in the same order as the
 * section pages: Observation Skills, Ethical Interviewing & Consent (Learn and
 * Do only, so the script comes before the interview), Empathy Without
 * Assumption (its Show page holds the consent confirmations), Problem Scope,
 * Team Charter. From docs/curriculum/02_DO/i3league-stage1-activities.md and
 * 03_SHOW, reworded where the reorder needed it. The lessons and activities in
 * the database are in the company's original order (Consent fourth), so
 * page.tsx pairs them by index, not by this order.
 */
export const INSIGHT_SECTION_DETAILS: SectionDetail[] = [
  {
    do: {
      activity: "3-Day Friction Hunt",
      description:
        "Over three days, notice and record 5–15 moments of friction, confusion, delay, or workaround.",
      worksheet: "Friction Log",
      output: "5–15 logged observations",
    },
    mustInclude: ["3–5 meaningful observations"],
    page: "Observation Skills",
    submission: {
      keep: "Friction Log",
    },
  },
  {
    do: {
      activity: "Consent Script Practice",
      description:
        "Write and rehearse a one-sentence intro explaining the interview's purpose and the person's right to skip or stop.",
      worksheet: "Interview Consent Script",
      output: "1 written consent intro",
    },
    mustInclude: [],
    page: "Ethical Interviewing & Consent",
    submission: {
      keep: "Interview consent script",
      note: "You confirm you followed it on the Empathy page, after your interview.",
    },
  },
  {
    do: {
      activity: "Empathy Interview",
      description:
        "Using your consent script from the previous page, talk to one person affected by the problem and record their experience in their own words, without inserting your own interpretation.",
      worksheet: "Empathy Interview Guide",
      output: "1 completed interview record",
    },
    mustInclude: [
      "At least one firsthand interview/conversation",
      "Something learned from the affected person",
      "Any assumption that changed",
      "Confirmation that consent and privacy expectations were followed",
    ],
    page: "Empathy Without Assumption",
    submission: {
      keep: "Empathy Interview Guide and interview record",
    },
  },
  {
    do: {
      activity: "Scope Narrowing Drill",
      description:
        "Take a broad problem and narrow it by naming who, where, and when, until it's specific enough to act on.",
      worksheet: "Problem Scope Worksheet",
      output: "1 scoped problem statement",
    },
    mustInclude: [
      "Final problem statement",
      "Clearly identified affected group",
      "Why the problem matters",
      "Scope: who, where, when",
    ],
    page: "Problem Scope",
    submission: {
      keep: "Problem Scope Worksheet",
    },
  },
  {
    do: {
      activity: "Team Agreement Session",
      description:
        "As a team, agree on roles, check-in frequency, and how disagreements will be resolved.",
      worksheet: "Team Charter",
      output: "1 signed team agreement",
    },
    mustInclude: ["Confirmation that your Team Charter is complete"],
    page: "Team Charter",
    submission: {
      keep: "Team Charter",
    },
  },
];

/**
 * Stage 2 (INVESTIGATE) pages, in the order a student works through them.
 *
 * Stage 2 has seven LEARN topics, five required supporting activities with no
 * LEARN note of their own, and the mandatory safety screening. Rather than one
 * page each (13 pages), each supporting activity is grouped with the topic it
 * works alongside, so every page keeps Learn → Do → Show (the owner's choice,
 * Sep 21 2026): research questions with bias (you check the questions you
 * plan to ask), privacy with the safety screening (both are about how you
 * treat the people you research), evidence collection with data literacy
 * (you check a statistic from what you collected), root cause with system
 * mapping (the System Mapping note: "alongside your root cause analysis").
 * The last page pairs the two supporting activities that remain and has no
 * Learn band, since no lesson exists for them and none is invented.
 *
 * The order follows the stage's own rules: research questions come "before
 * collecting evidence", bias and privacy checks happen "before using" your
 * research tools, and the mental test runs Question → Evidence → Triangulate →
 * Root Cause → Gap.
 *
 * Wording is the curriculum's (02_DO stage 2 activities, 03_SHOW), with em
 * dashes rewritten. `lessons` are positions in the seeded Lesson rows, which
 * follow the curriculum's topic order (0 Data Literacy, 1 Bias, 2 Privacy,
 * 3 Integrity, 4 Triangulation, 5 Citation, 6 System Mapping).
 */
export type InvestigatePageId = "questions" | "privacy" | "evidence" | "triangulation" | "integrity" | "sources" | "rootcause" | "gap";

export const INVESTIGATE_PAGES: readonly InvestigatePageId[] = [
  "questions",
  "privacy",
  "evidence",
  "triangulation",
  "integrity",
  "sources",
  "rootcause",
  "gap",
];

/** One activity on a page. A required supporting activity has `why` (the
 *  curriculum's "Why it's needed") instead of a description. */
export type InvestigateActivity = SectionDetail["do"];

export type InvestigatePage = {
  /** Short name for the sidebar and the navy page bar. */
  label: string;
  /** Full page name, the Learn heading when a page has two lessons. */
  title: string;
  /** This page's lessons: position in the seeded Lesson rows, and an
   *  optional depth tag shown beside the Learn kicker. */
  lessons: { index: number; tag?: string }[];
  activities: InvestigateActivity[];
  /** The page's "Must include" items, from each of its topics' Show steps. */
  mustInclude: string[];
  /** The page's "The reviewer checks" items, from each of its topics. */
  reviewerChecks: string[];
  /** Short notes under the Show heading's lists. */
  showNotes: { label?: string; text: string }[];
  /** What a middle school student sees instead, when a page carries HS CORE
   *  content (System Mapping). Rather than one page with a "required for high
   *  school" note, each grade band gets its own wording and fields. */
  middleSchool?: Partial<Omit<InvestigatePage, "middleSchool">>;
};

/** A page as one student sees it: the middle school version when there is
 *  one and the student is below grade 9. */
export function investigatePageDetail(page: InvestigatePageId, isHighSchool: boolean): InvestigatePage {
  const detail = INVESTIGATE_PAGE_DETAILS[page];
  return !isHighSchool && detail.middleSchool ? { ...detail, ...detail.middleSchool } : detail;
}

const ACTIVITY = {
  // Research Question Planning and Bias Hunt as one activity on the Questions
  // & Bias page: the two curriculum descriptions run together, and the
  // worksheets and outputs are joined.
  questionsAndBias: {
    activity: "Research Question Planning + Bias Hunt",
    description:
      "Before collecting any evidence, turn your Stage 1 problem statement into 2–4 focused, open questions your research can answer, including at least one about why the problem happens. Then review your survey/interview questions and rewrite any that are leading or loaded.",
    worksheet: "Research Question Planner + Bias Check",
    output: "2–4 focused research questions + revised unbiased questions",
  },
  dataMinimization: {
    activity: "Data Minimization Review",
    description: "Remove any personal information you do not actually need to answer your research question.",
    worksheet: "Data Privacy Check",
    output: "Cleaned survey/interview instrument",
  },
  // Evidence Collection and Data Reality Check as one activity on the
  // Collecting Evidence page (owner request): the supporting activity's "Why
  // it's needed" line leads, the Data Reality Check description follows, and
  // the worksheets and outputs are joined.
  evidenceAndReality: {
    activity: "Evidence Collection + Data Reality Check",
    description:
      "Collect the actual evidence Stage 2 depends on. Then review one statistic from your research and identify sample size, who was included, and whether it is representative.",
    worksheet: "Survey Builder and/or Interview Question Builder + Evidence Tracker",
    output: "Survey/interview instrument + collected responses + 1 annotated statistic with sample-size/context notes",
  },
  triangulate: {
    activity: "Triangulate a Claim",
    description: "Take one major claim and support/check it using multiple evidence types.",
    worksheet: "Source Triangulation Matrix",
    output: "1 key claim checked against 2–3 different evidence types",
  },
  contradicting: {
    activity: "Contradicting Evidence Challenge",
    description:
      "Deliberately identify at least one finding that weakens, complicates, or challenges your current thinking.",
    worksheet: "Evidence Tracker",
    output: "1 documented piece of challenging evidence + interpretation",
  },
  sourceAudit: {
    activity: "Source Audit",
    description:
      "Identify where every non-original fact, idea, image, statistic, or quote came from and check source credibility.",
    worksheet: "Source Credibility Checklist + Evidence Tracker",
    output: "Completed source list + credibility review",
  },
  // One Do box per page (owner request, Sep 21 2026): a page with two
  // activities shows them as one combined activity, like Questions & Bias.
  // The curriculum names these supporting activities without describing
  // them, so the descriptions are built from their outputs and "Why it's
  // needed" lines (our wording).
  rootCauseAndMap: {
    activity: "Root Cause Analysis + Map the System",
    description:
      "Trace the problem back to its root cause, the cause underneath the symptoms, which the Stage 2 advancement criteria require. Then identify actors, causes, constraints, feedback loops, and relationships around the problem.",
    worksheet: "Five Whys / Root Cause Worksheet + System Map",
    output: "Root cause chain + proposed root cause + 1 completed problem ecosystem map",
  },
  // Middle school's version of the Root Cause page's activity: the root cause
  // is required, and a simpler System Map is offered as optional extra depth
  // (System Mapping is HS CORE, so it is required only in high school).
  rootCauseWithOptionalMap: {
    activity: "Root Cause Analysis",
    supporting: true,
    description:
      "Trace the problem back to its root cause, the cause underneath the symptoms, which the Stage 2 advancement criteria require. Optional, for extra depth: sketch a simple map of who and what is involved in the problem and how they affect each other.",
    worksheet: "Five Whys / Root Cause Worksheet (+ System Map, optional)",
    output: "Root cause chain + proposed root cause (+ a simple system map, optional)",
  },
  stakeholdersAndGap: {
    activity: "Stakeholder Mapping + Existing Solutions & Gap Analysis",
    supporting: true,
    description:
      "Map the users, beneficiaries, decision-makers, funders/supporters, and influencers around your problem; this strengthens later interviews, impact analysis, and implementation. Then compare 2–4 existing approaches and identify the gap they leave, which is required before entering IMAGINE.",
    worksheet: "Stakeholder Map + Existing Solutions & Gap Analysis",
    output: "Users, beneficiaries, decision-makers, funders/supporters, influencers + comparison of 2–4 existing approaches + identified gap",
  },
} satisfies Record<string, InvestigateActivity>;

export const INVESTIGATE_PAGE_DETAILS: Record<InvestigatePageId, InvestigatePage> = {
  questions: {
    label: "Questions & Bias",
    title: "Research Questions & Bias",
    lessons: [{ index: 1 }],
    // One combined activity (owner request): plan the questions, then check
    // them for bias, both before any evidence is collected.
    activities: [ACTIVITY.questionsAndBias],
    mustInclude: ["2–4 focused research questions"],
    reviewerChecks: ["Are the research questions focused?", "Was bias considered?"],
    showNotes: [],
  },
  privacy: {
    label: "Privacy & Safety",
    title: "Privacy & Safety",
    lessons: [{ index: 2 }],
    activities: [ACTIVITY.dataMinimization],
    mustInclude: ["Firsthand research conducted responsibly as part of the evidence-gathering process"],
    reviewerChecks: [],
    showNotes: [],
  },
  evidence: {
    label: "Collecting Evidence",
    title: "Collecting Evidence",
    lessons: [{ index: 0 }],
    // One combined activity (owner request), like Questions & Bias.
    activities: [ACTIVITY.evidenceAndReality],
    mustInclude: [
      "Firsthand research",
      "Relevant secondary research",
      "More than one type of evidence",
      "Research limitations",
    ],
    reviewerChecks: [],
    showNotes: [],
  },
  // Triangulation and Research Integrity were one "Testing Your Evidence"
  // page; split into two at the owner's request (Sep 21 2026), each with its
  // own lesson, activity, Must include items, and Show fields.
  triangulation: {
    label: "Triangulation",
    title: "Source Triangulation",
    lessons: [{ index: 4 }],
    activities: [ACTIVITY.triangulate],
    mustInclude: ["More than one type of evidence", "Triangulation of at least one important claim"],
    reviewerChecks: [],
    showNotes: [
      {
        label: "Minimum evidence standard",
        text: "Students should not be able to advance based on \u201cwe asked some people and they agreed.\u201d They need multiple forms of evidence appropriate to the project, e.g., interview + survey + credible secondary source, or observation + expert interview + published data.",
      },
    ],
  },
  integrity: {
    label: "Research Integrity",
    title: "Research Integrity",
    lessons: [{ index: 3 }],
    activities: [ACTIVITY.contradicting],
    mustInclude: ["Evidence that challenges or complicates the student's thinking"],
    reviewerChecks: [
      "Is contradictory evidence acknowledged?",
      "Did the research genuinely change or strengthen the team's understanding?",
    ],
    showNotes: [],
  },
  sources: {
    label: "Sources",
    title: "Sources",
    lessons: [{ index: 5 }],
    activities: [ACTIVITY.sourceAudit],
    mustInclude: ["Source list", "Source credibility evaluation", "Relevant secondary research"],
    reviewerChecks: ["Are sources credible?"],
    showNotes: [],
  },
  rootcause: {
    // High school: System Mapping is HS CORE, so it is part of this page.
    label: "Root Cause & Systems",
    title: "Root Cause & Systems",
    // No "HS Core" tag: only high school students see this lesson now.
    lessons: [{ index: 6 }],
    activities: [ACTIVITY.rootCauseAndMap],
    mustInclude: ["Root Cause Analysis", "System Map"],
    reviewerChecks: [
      "Does the proposed root cause follow from the evidence?",
      "Is the team describing a root cause rather than only a symptom?",
    ],
    showNotes: [],
    // Middle school: the Root Cause Analysis is required and a simpler System
    // Map is optional extra depth, worded for them rather than flagged with a
    // "high school only" note. No Learn band: the only lesson here (System
    // Mapping) is HS CORE, so the page opens on its Do band.
    middleSchool: {
      label: "Root Cause",
      title: "Root Cause",
      lessons: [],
      activities: [ACTIVITY.rootCauseWithOptionalMap],
      mustInclude: ["Root Cause Analysis"],
    },
  },
  gap: {
    label: "Stakeholders & Gap",
    title: "Stakeholders & Gap",
    lessons: [],
    activities: [ACTIVITY.stakeholdersAndGap],
    mustInclude: ["Stakeholder Map", "Existing Solutions & Gap Analysis"],
    reviewerChecks: [
      "Are the correct stakeholders identified?",
      "Do existing solutions actually leave the stated gap?",
    ],
    showNotes: [],
  },
};
