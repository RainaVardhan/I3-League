import type { AnswerItem, AnswerSection } from "@/components/journey/SubmissionAnswers";
import { INSIGHT_SECTION_DETAILS, INVESTIGATE_PAGES, investigatePageDetail } from "@/lib/stage-copy";
import { INVESTIGATE_TEXT_KEYS, type InvestigateTextKey } from "@/lib/investigate-requirements";
import type { InsightContent, InvestigateContent } from "./actions";

// Turns a stage's answers into the sections shown in the Review page's "Your
// answers" box. The section names and order match the stage's own pages, so a
// student can find where each answer came from. Kept in a plain module (no
// "use client"/"use server") because both the server page (finished stage,
// read from the saved Submission) and InsightForm (live form values) call it.

export type InsightAnswers = Omit<InsightContent, "photoUrl"> & { title: string; category: string };

const TEXT_KEYS = [
  "title",
  "category",
  "problemStatement",
  "whoIsAffected",
  "whereItHappens",
  "whenItHappens",
  "whyItMatters",
  "observations",
  "participantLabel",
  "participantConnection",
  "whatLearned",
  "evidenceType",
  "firsthandEvidence",
  "before",
  "now",
  "whatCausedChange",
  "whyManageable",
] as const;

const CHECK_KEYS = [
  "consentGiven",
  "permissionToUse",
  "privacyRemoved",
  "rulesFollowed",
  "teamCharterComplete",
  "teamUnderstandsProblem",
  "teamUnderstandsEvidence",
  "teamCanExplainLearning",
  "teamAgreesRepresents",
] as const;

// Reads the current answers straight off the live <form>. Unchecked
// checkboxes are simply absent from FormData, so absent means false.
export function readInsightAnswers(form: HTMLFormElement): InsightAnswers {
  const data = new FormData(form);
  const answers: Record<string, string | boolean> = {};
  for (const key of TEXT_KEYS) answers[key] = String(data.get(key) ?? "");
  for (const key of CHECK_KEYS) answers[key] = data.get(key) !== null;
  return answers as unknown as InsightAnswers;
}

export function buildInsightSections(a: InsightAnswers, isTeamProject: boolean): AnswerSection[] {
  const sections: AnswerSection[] = [
    {
      title: "Observation Skills",
      items: [{ label: "Your strongest observations", value: a.observations }],
    },
    {
      title: "Empathy",
      items: [
        { label: "Who you learned from", value: a.participantLabel },
        { label: "Their connection to the problem", value: a.participantConnection },
        { label: "What you learned", value: a.whatLearned },
        { label: "Strongest firsthand evidence", value: a.evidenceType },
        { label: "Evidence", value: a.firsthandEvidence },
        { heading: "Responsible Research Confirmation" },
        { label: "The participant agreed to speak with me", checked: a.consentGiven },
        { label: "I have permission to use the information", checked: a.permissionToUse },
        { label: "I removed private or sensitive information", checked: a.privacyRemoved },
        { label: "I followed the research and safety rules", checked: a.rulesFollowed },
        { label: "Before, I thought", value: a.before },
        { label: "Now, I think", value: a.now },
        { label: "What caused the change", value: a.whatCausedChange },
      ],
    },
    {
      title: "Problem Scope",
      items: [
        { label: "Project title", value: a.title },
        { label: "Category", value: a.category },
        { label: "Final problem statement", value: a.problemStatement },
        { label: "Who is affected", value: a.whoIsAffected },
        { label: "Where it happens", value: a.whereItHappens },
        { label: "When it happens", value: a.whenItHappens },
        { label: "Why it matters", value: a.whyItMatters },
        { label: "Why the scope is manageable", value: a.whyManageable },
      ],
    },
  ];

  if (isTeamProject) {
    sections.push({
      title: "Team Charter",
      items: [
        { label: "Our Team Charter is complete", checked: a.teamCharterComplete },
        { label: "I understand the problem we are submitting", checked: a.teamUnderstandsProblem },
        { label: "I understand the main evidence supporting it", checked: a.teamUnderstandsEvidence },
        { label: "I can explain what we learned in Stage 1", checked: a.teamCanExplainLearning },
        { label: "This submission represents our team's understanding", checked: a.teamAgreesRepresents },
      ],
    });
  }

  return sections;
}

// A saved Submission plus the project's title/category, as the answers shape.
export function insightAnswersFromSaved(
  content: Partial<InsightContent> | undefined,
  project: { title: string; category: string },
): InsightAnswers {
  return {
    title: project.title === "Untitled project" ? "" : project.title,
    category: project.category === "Other" ? "" : project.category,
    problemStatement: content?.problemStatement ?? "",
    whoIsAffected: content?.whoIsAffected ?? "",
    whereItHappens: content?.whereItHappens ?? "",
    whenItHappens: content?.whenItHappens ?? "",
    whyItMatters: content?.whyItMatters ?? "",
    observations: content?.observations ?? "",
    participantLabel: content?.participantLabel ?? "",
    participantConnection: content?.participantConnection ?? "",
    whatLearned: content?.whatLearned ?? "",
    evidenceType: content?.evidenceType ?? "",
    firsthandEvidence: content?.firsthandEvidence ?? "",
    consentGiven: content?.consentGiven ?? false,
    permissionToUse: content?.permissionToUse ?? false,
    privacyRemoved: content?.privacyRemoved ?? false,
    rulesFollowed: content?.rulesFollowed ?? false,
    before: content?.before ?? "",
    now: content?.now ?? "",
    whatCausedChange: content?.whatCausedChange ?? "",
    whyManageable: content?.whyManageable ?? "",
    teamCharterComplete: content?.teamCharterComplete ?? false,
    teamUnderstandsProblem: content?.teamUnderstandsProblem ?? false,
    teamUnderstandsEvidence: content?.teamUnderstandsEvidence ?? false,
    teamCanExplainLearning: content?.teamCanExplainLearning ?? false,
    teamAgreesRepresents: content?.teamAgreesRepresents ?? false,
  };
}

// ---------------------------------------------------------------- Investigate

export type InvestigateAnswers = Record<InvestigateTextKey, string> & { evidenceTypes: string[] };

// Reads the Investigate answers straight off the live <form>. The safety
// screening's fields belong to their own <form> (the `form` attribute), so
// FormData leaves them out, as it should.
export function readInvestigateAnswers(form: HTMLFormElement): InvestigateAnswers {
  const data = new FormData(form);
  const answers = {} as InvestigateAnswers;
  for (const key of INVESTIGATE_TEXT_KEYS) answers[key] = String(data.get(key) ?? "");
  answers.evidenceTypes = data.getAll("evidenceTypes").map(String);
  return answers;
}

export function investigateAnswersFromSaved(content: Partial<InvestigateContent> | undefined): InvestigateAnswers {
  const answers = {} as InvestigateAnswers;
  for (const key of INVESTIGATE_TEXT_KEYS) {
    const value = content?.[key];
    answers[key] = typeof value === "string" ? value : "";
  }
  answers.evidenceTypes = Array.isArray(content?.evidenceTypes) ? content.evidenceTypes : [];
  return answers;
}

/** What the safety screening's state reads as in "Your answers". */
export function safetyStatusLabel(status: string | null): string {
  if (status === "CLEARED") return "Completed and cleared";
  if (status === "PENDING_REVIEW") return "Submitted, waiting for an admin to review it";
  if (status === "REJECTED") return "Not cleared. Please contact an admin.";
  return "";
}

// One section per page, in page order, with the field labels the pages use.
// A page that groups two activities gets a small heading over each group, the
// same headings its Show band uses.
export function buildInvestigateSections(
  a: InvestigateAnswers,
  opts: { isHighSchool: boolean; safetyStatus: string | null }
): AnswerSection[] {
  // Page names as this student sees them (a middle school student's Root
  // Cause page has its own name), so each section matches its page.
  const d = Object.fromEntries(
    INVESTIGATE_PAGES.map((page) => [page, investigatePageDetail(page, opts.isHighSchool)])
  ) as Record<(typeof INVESTIGATE_PAGES)[number], ReturnType<typeof investigatePageDetail>>;

  // The System Map is required in high school and optional before it; a
  // middle school student who left it blank doesn't get an empty group.
  const systemAnswered = [a.systemActors, a.systemCauses, a.systemConstraints, a.systemFeedbackLoops, a.systemRelationships].some(
    (value) => value.trim().length > 0
  );
  const systemItems: AnswerItem[] =
    opts.isHighSchool || systemAnswered
      ? [
          { heading: "System map" },
          { label: "Actors", value: a.systemActors },
          { label: "Causes", value: a.systemCauses },
          { label: "Constraints", value: a.systemConstraints },
          { label: "Feedback loops", value: a.systemFeedbackLoops },
          { label: "Relationships", value: a.systemRelationships },
        ]
      : [];

  return [
    {
      title: d.questions.label,
      items: [
        { label: "Research questions", value: a.researchQuestions },
        { label: "Questions rewritten to remove bias", value: a.biasRevisions },
      ],
    },
    {
      title: d.privacy.label,
      items: [
        { label: "Personal information removed, and why", value: a.dataMinimization },
        { label: "Safety screening", value: safetyStatusLabel(opts.safetyStatus) },
      ],
    },
    {
      title: d.evidence.label,
      items: [
        { heading: "Evidence collection" },
        { label: "Types of evidence", value: a.evidenceTypes.join(", ") },
        { label: "Survey or interview questions", value: a.researchInstrument },
        { label: "Firsthand research findings", value: a.firsthandFindings },
        { label: "Secondary research", value: a.secondaryResearch },
        { heading: "Data reality check" },
        { label: "Statistic", value: a.statistic },
        { label: "Sample size", value: a.statisticSampleSize },
        { label: "Who was included", value: a.statisticWhoIncluded },
        { label: "Is it representative?", value: a.statisticRepresentative },
        { label: "Research limitations", value: a.researchLimitations },
      ],
    },
    {
      title: d.triangulation.label,
      items: [
        { heading: "Triangulate a claim" },
        { label: "Claim", value: a.triangulatedClaim },
        { label: "Evidence types it was checked against", value: a.triangulationEvidence },
        { label: "Support or challenge", value: a.triangulationResult },
      ],
    },
    {
      title: d.integrity.label,
      items: [
        { heading: "Contradicting evidence" },
        { label: "Challenging evidence", value: a.challengingEvidence },
        { label: "What it means for your thinking", value: a.challengingInterpretation },
        { label: "How your understanding changed", value: a.understandingChange },
      ],
    },
    {
      title: d.sources.label,
      items: [
        { label: "Source list", value: a.sourceList },
        { label: "Source credibility", value: a.sourceCredibility },
      ],
    },
    {
      title: d.rootcause.label,
      items: [
        { heading: "Root cause analysis" },
        { label: "Root cause chain", value: a.rootCauseChain },
        { label: "Proposed root cause", value: a.proposedRootCause },
        { label: "Supporting evidence", value: a.rootCauseEvidence },
        ...systemItems,
      ],
    },
    {
      title: d.gap.label,
      items: [
        { heading: "Stakeholder map" },
        { label: "Users", value: a.stakeholderUsers },
        { label: "Beneficiaries", value: a.stakeholderBeneficiaries },
        { label: "Decision-makers", value: a.stakeholderDecisionMakers },
        { label: "Funders/supporters", value: a.stakeholderFunders },
        { label: "Influencers", value: a.stakeholderInfluencers },
        { heading: "Existing solutions & gap" },
        { label: "Existing approaches", value: a.existingSolutions },
        { label: "The gap", value: a.identifiedGap },
      ],
    },
  ];
}

// The Stage 2 Output Rollup (02_DO stage 2 activities), under the answers box:
// what these answers add up to, and that the worksheets themselves stay with
// the student.
export function investigateKeepNote(isHighSchool: boolean): string {
  return `These answers make up your Research Brief${isHighSchool ? " and System Map" : ""}: Research Questions + Survey/Interview Evidence + Evidence Tracker + Source Triangulation + Root Cause Analysis + Existing Solutions & Gap Analysis + Stakeholder Map. Your worksheets are not uploaded; they stay with you.`;
}

// The one thing the answers box can't show: worksheets are not uploaded, they
// stay with the student. Shown as a footnote under the box so the Review page
// says it once (the hero already states what is submitted).
export function insightKeepNote(isTeamProject: boolean): string {
  const sections = isTeamProject ? INSIGHT_SECTION_DETAILS : INSIGHT_SECTION_DETAILS.slice(0, 4);
  return `Your worksheets are not uploaded; they stay with you: ${sections.map((d) => d.submission.keep).join(", ")}.`;
}
