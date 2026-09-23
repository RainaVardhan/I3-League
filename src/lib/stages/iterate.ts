import { joinActivities, type GuidedPage, type GuidedStage } from "@/lib/guided-stage";
import { ACTIVITIES_3_TO_6 } from "./activities";

const A = ACTIVITIES_3_TO_6.ITERATE.byTopic;
const SUP = ACTIVITIES_3_TO_6.ITERATE.supporting;

/** The fidelity choices the curriculum names (02_DO: "sketch, mockup,
 *  physical model, simulation, or working version"). */
export const FIDELITY_OPTIONS = ["Sketch", "Mockup", "Physical model", "Simulation", "Working version"] as const;

/**
 * Stage 4 (ITERATE) pages, in the curriculum's topic order, which already
 * follows its required loop (Critical Assumption → MVP → Test → Observe →
 * Learn → Revise → Retest → Document). The two required supporting
 * activities are joined onto the page they belong to: Pilot/Test Participant
 * Plan onto Experiment Design (it is part of the Test Plan), and Retest After
 * Revision onto Feedback → Revision (the loop is Test → Learn → Revise →
 * Retest). Usability Basics and Team Execution are Learn + Do pages with no
 * Show (their outputs are the observations and the task board, which are
 * recorded elsewhere). Formal Experiment Controls is HS CORE (high school
 * only); Git & Technical Documentation is HS CORE "when relevant", so it is
 * shown to high school students but does not gate Submit.
 */
const PAGES: GuidedPage[] = [
  {
    id: "mvp",
    label: "MVP",
    title: "MVP Thinking",
    lessonIndex: 0,
    activity: A[0],
    mustInclude: ["Critical assumption being tested", "MVP / Minimum Testable Version"],
    reviewerChecks: ["Does the MVP actually test the critical assumption?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "criticalAssumptionTested",
            label: "The critical assumption you are testing",
            hint: "The one named in your Concept Portfolio (Imagine).",
            limit: 500,
          },
          {
            key: "mvpDefinition",
            label: "Your MVP / Minimum Testable Version, and what it is meant to learn",
            hint: "The smallest version you can build that tests that assumption. Say what it is and what result you are looking for.",
          },
        ],
      },
    ],
  },
  {
    id: "fidelity",
    label: "Fidelity",
    title: "Prototype Fidelity",
    lessonIndex: 1,
    activity: A[1],
    mustInclude: ["Why the chosen prototype fidelity is appropriate"],
    reviewerChecks: ["Was the test appropriate?"],
    showNotes: [],
    groups: [
      {
        fields: [
          { key: "fidelityChoice", label: "The fidelity you chose", options: FIDELITY_OPTIONS },
          {
            key: "fidelityJustification",
            label: "Why that level of fidelity is right for this test",
            hint: "Could something simpler answer your test question? Why or why not?",
          },
        ],
      },
    ],
  },
  {
    id: "experiment",
    label: "Test Plan",
    title: "Experiment Design Basics",
    lessonIndex: 2,
    activity: joinActivities(A[2], SUP[0]),
    mustInclude: ["Test participants/context", "Permissions where necessary"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        heading: "One-thing test",
        fields: [
          {
            key: "variableTested",
            label: "The one thing you are testing, and what you kept the same",
            hint: "Name the single variable you changed and the conditions you held as consistent as practical.",
          },
        ],
      },
      {
        heading: "Participants and context",
        fields: [
          {
            key: "testParticipants",
            label: "Who tested it, how many, where and when",
          },
          {
            key: "testPermissions",
            label: "Permissions needed, and how you got them",
            hint: "Consent from participants, a teacher or school, or a parent. If no permission was needed, say so and why.",
            limit: 1000,
          },
        ],
      },
    ],
  },
  {
    id: "success",
    label: "Success Criteria",
    title: "Test Questions & Success Criteria",
    lessonIndex: 3,
    activity: A[3],
    mustInclude: ["Test question", "Success criteria defined before testing"],
    reviewerChecks: ["Was success defined before testing?"],
    showNotes: [
      {
        label: "Key test",
        text: "Your reviewer checks that the success criteria were written before the test happened, not reconstructed afterward.",
      },
    ],
    groups: [
      {
        fields: [
          { key: "testQuestion", label: "Your test question", limit: 500 },
          {
            key: "successCriteria",
            label: "Your success criteria, written before the test",
            hint: "A measurable bar. For example: “At least 8 of 10 students explain what the alert means within 5 seconds.”",
          },
        ],
      },
    ],
  },
  {
    id: "usability",
    label: "Usability",
    title: "Usability Basics",
    lessonIndex: 4,
    activity: A[4],
    mustInclude: [],
    reviewerChecks: [],
    showNotes: [],
    groups: [],
  },
  {
    id: "observation",
    label: "Observation",
    title: "Observation vs. Opinion",
    lessonIndex: 5,
    activity: A[5],
    mustInclude: ["Observations", "Participant/user feedback"],
    reviewerChecks: ["Are observation and opinion separated?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "observations",
            label: "What testers actually did",
            hint: "Behavior you saw, including from your silent use test: where they paused, what confused them, what they did without being told.",
            limit: 5000,
          },
          {
            key: "participantFeedback",
            label: "What testers said afterward",
            hint: "Their opinions and reported feedback, kept separate from what you observed.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "failure",
    label: "Learning",
    title: "Learning From Failure / Failure Logging",
    lessonIndex: 6,
    activity: A[6],
    mustInclude: ["Failed, partial, surprising, or inconclusive findings", "What was learned"],
    reviewerChecks: ["Did the team report inconvenient results honestly?", "What did the team learn?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "inconclusiveFindings",
            label: "What failed, only partly worked, surprised you, or was inconclusive",
            limit: 5000,
          },
          { key: "whatWasLearned", label: "What those results taught you" },
        ],
      },
    ],
  },
  {
    id: "revision",
    label: "Revision & Retest",
    title: "Feedback → Revision",
    lessonIndex: 7,
    activity: joinActivities(A[7], SUP[1]),
    mustInclude: ["Reason for every meaningful revision", "Evidence of retesting"],
    reviewerChecks: ["Did evidence cause an actual revision?", "Was the revised version tested again?"],
    showNotes: [
      {
        label: "Minimum evidence standard",
        text: "Students cannot advance with “people liked our prototype.” There must be an actual test tied to the critical assumption, and: Test → Learn → Revise → Retest.",
      },
    ],
    groups: [
      {
        heading: "Evidence to change",
        fields: [
          {
            key: "revisionReasons",
            label: "Each meaningful finding, and the change it led to",
            hint: "One per line. If a finding led to no change, say why not.",
            limit: 5000,
          },
        ],
      },
      {
        heading: "Retest",
        fields: [
          {
            key: "retestEvidence",
            label: "Evidence from testing the revised version",
            hint: "What you tested again after the change, who with, and whether the change actually helped.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "versions",
    label: "Version History",
    title: "Versioning / Iteration History",
    lessonIndex: 8,
    activity: A[8],
    mustInclude: ["V1 → V2 changes"],
    reviewerChecks: ["Can the reviewer follow the V1 → V2 learning trail?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "versionHistory",
            label: "Your version history",
            hint: "V1, V2, V3...: what each version was, what changed from the one before, and why. One version per line.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "team",
    label: "Task Tracking",
    title: "Team Execution & Task Tracking",
    lessonIndex: 9,
    activity: A[9],
    mustInclude: [],
    reviewerChecks: [],
    showNotes: [],
    groups: [],
  },
  {
    id: "controls",
    label: "Experiment Controls",
    title: "Formal Experiment Controls",
    lessonIndex: 10,
    hsOnly: true,
    activity: A[10],
    mustInclude: ["Formal Experiment Design, where applicable"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "formalExperimentDesign",
            label: "Your formal experiment design",
            hint: "Independent variable (what you change), dependent variable (what you measure), controlled conditions, and a comparison or control group if one applies.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "technical",
    label: "Technical Docs",
    title: "Git & Technical Documentation",
    lessonIndex: 11,
    hsOnly: true,
    optionalTag: "When relevant",
    activity: A[11],
    mustInclude: ["Technical projects: Git/repository + README"],
    reviewerChecks: [],
    showNotes: [{ text: "For software or technical projects. Leave this page blank if your project has no code." }],
    groups: [
      {
        fields: [
          {
            key: "technicalDocumentation",
            label: "Your repository and README",
            hint: "A link to the repository (or where the version checkpoints live) and a short summary of what the README explains.",
          },
        ],
      },
    ],
  },
];

export const ITERATE_STAGE: GuidedStage = {
  stageName: "ITERATE",
  submitLabel: "Submit Iterate",
  pages: PAGES,
  keepNote:
    "These answers make up your Tested Prototype + Test Plan + Iteration Log: MVP Planner + Prototype Fidelity + Test Question + Success Criteria + Test Evidence + Feedback + Learning Log + Revision History + Retest Evidence. Your worksheets and the prototype itself are not uploaded; they stay with you.",
};
