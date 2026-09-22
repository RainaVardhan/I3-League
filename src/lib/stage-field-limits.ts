// Maximum length of every text entry on the stage forms, by form field name.
// One source of truth: the server actions enforce it (that is the real limit,
// since a POST straight to a server action never touches the form), and the
// form imports it to set a matching maxLength on each input so a student is
// stopped at the box instead of losing a long answer on save.
//
// Kept in a plain module rather than actions.ts because a "use server" file
// may only export async functions, and the client form needs these values.
export const TEXT_LIMITS = {
  // Short, single-line answers.
  title: 200,
  category: 200,
  whoIsAffected: 300,
  whereItHappens: 300,
  whenItHappens: 300,
  participantLabel: 300,
  participantConnection: 300,
  evidenceType: 100,
  // Longer written answers.
  problemStatement: 2000,
  whyItMatters: 2000,
  observations: 5000,
  whatLearned: 2000,
  firsthandEvidence: 5000,
  before: 2000,
  now: 2000,
  whatCausedChange: 2000,
  whyManageable: 2000,
  // Investigate. Lists and write-ups that can run long get 5000; single
  // answers get 2000; one-line answers get 300-500.
  researchQuestions: 2000,
  biasRevisions: 5000,
  dataMinimization: 2000,
  researchInstrument: 5000,
  firsthandFindings: 5000,
  secondaryResearch: 5000,
  statistic: 1000,
  statisticSampleSize: 300,
  statisticWhoIncluded: 1000,
  statisticRepresentative: 1000,
  researchLimitations: 2000,
  challengingEvidence: 2000,
  challengingInterpretation: 2000,
  understandingChange: 2000,
  triangulatedClaim: 500,
  triangulationEvidence: 5000,
  triangulationResult: 2000,
  sourceList: 5000,
  sourceCredibility: 5000,
  rootCauseChain: 5000,
  proposedRootCause: 2000,
  rootCauseEvidence: 2000,
  systemActors: 2000,
  systemCauses: 2000,
  systemConstraints: 2000,
  systemFeedbackLoops: 2000,
  systemRelationships: 2000,
  stakeholderUsers: 1000,
  stakeholderBeneficiaries: 1000,
  stakeholderDecisionMakers: 1000,
  stakeholderFunders: 1000,
  stakeholderInfluencers: 1000,
  existingSolutions: 5000,
  identifiedGap: 2000,
  // Safety screening.
  otherDescription: 2000,
  // AI-use disclosure.
  aiToolName: 200,
  aiPurpose: 1000,
  aiSelfCreatedPortion: 1000,
  aiVerificationMethod: 1000,
} as const;

export type TextField = keyof typeof TEXT_LIMITS;
