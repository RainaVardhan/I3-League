import { joinActivities, type GuidedPage, type GuidedStage } from "@/lib/guided-stage";
import { ACTIVITIES_3_TO_6 } from "./activities";

const A = ACTIVITIES_3_TO_6.IMAGINE.byTopic;
const SUP = ACTIVITIES_3_TO_6.IMAGINE.supporting;

/**
 * Stage 3 (IMAGINE) pages, in working order.
 *
 * The curriculum lists twelve topics (Value Proposition ... Decision Matrix)
 * and one required supporting activity (Critical Assumption Selection). Its
 * required sequence is Explore → Compare → Check Responsibility/Originality
 * → Decide → Identify Critical Assumption, so the Decision Matrix page comes
 * before the Assumption Prioritization page (the Assumption Hunt lists what
 * must be true "for the selected concept", so there has to be one first),
 * and Critical Assumption Selection is joined onto that last page. Build vs.
 * Buy vs. Partner is HS CORE and is shown to high school students only.
 *
 * Lesson text, activity names, worksheets and outputs are the curriculum's
 * (01_LEARN, 02_DO); "Must include" items are from 03_SHOW; the field labels
 * and hints are ours, one field per required item or activity output.
 */
const PAGES: GuidedPage[] = [
  {
    id: "value",
    label: "Value Proposition",
    title: "Value Proposition",
    lessonIndex: 0,
    activity: A[0],
    mustInclude: ["Value proposition"],
    reviewerChecks: ["Is the value proposition grounded in evidence rather than assumption?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "valueProposition",
            label: "Your value proposition",
            hint: "Finish the sentence “Someone would use this because...” and refine it until it names a real user benefit, not what the solution does.",
            limit: 1000,
          },
        ],
      },
    ],
  },
  {
    id: "needs",
    label: "Needs vs. Features",
    title: "User Needs vs. Features",
    lessonIndex: 1,
    activity: A[1],
    mustInclude: ["User needs", "Concepts that trace back to those needs"],
    reviewerChecks: ["Do the concepts trace back to real needs identified in Stages 1–2?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "userNeeds",
            label: "The user needs your solution serves",
            hint: "The underlying things people are trying to accomplish, from your Stage 1 and 2 evidence. One per line.",
          },
          {
            key: "featureTrace",
            label: "Your need-to-feature map",
            hint: "For each proposed feature, name the need it serves. List any feature you removed because it did not trace back to a real need.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "concepts",
    label: "Concepts",
    title: "Divergent Thinking / Solution Exploration",
    lessonIndex: 2,
    activity: A[2],
    mustInclude: ["At least 3 genuinely different concepts"],
    reviewerChecks: ["Were at least 3 genuinely different concepts generated (not variations of one idea)?"],
    showNotes: [
      {
        label: "Minimum evidence standard",
        text: "Students cannot begin with “this is the idea we're building.” Alternatives must be genuinely explored first.",
      },
    ],
    groups: [
      {
        fields: [
          {
            key: "concepts",
            label: "Your concepts (at least 3, genuinely different)",
            hint: "Name each concept and say in a sentence how it works differently from the others. Variations of one idea do not count.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "constraints",
    label: "Constraints",
    title: "Constraints Thinking",
    lessonIndex: 3,
    activity: A[3],
    mustInclude: ["Constraints considered"],
    reviewerChecks: ["Were real constraints considered?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "constraints",
            label: "Constraints, by concept",
            hint: "For each concept: the time, money, policy, skills, materials, technology or other limits that affect it.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "risks",
    label: "Risks",
    title: "Risk Identification",
    lessonIndex: 4,
    activity: A[4],
    mustInclude: ["Key risks"],
    reviewerChecks: ["Were risks considered honestly?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "keyRisks",
            label: "Your top risks and their early warning signs",
            hint: "Imagine the idea failed. For each likely reason, note what you would notice first.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    title: "Accessibility & Inclusion",
    lessonIndex: 5,
    activity: A[5],
    mustInclude: ["Accessibility considerations"],
    reviewerChecks: ["Is the solution inclusive?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "accessibility",
            label: "Who might be left out, and how you revised for them",
            hint: "Users or groups the solution could exclude (disability, background, access to technology), and what you changed in response.",
          },
        ],
      },
    ],
  },
  {
    id: "ethics",
    label: "Ethical Design",
    title: "Responsible / Ethical Design",
    lessonIndex: 6,
    activity: A[6],
    mustInclude: ["Ethical/responsible-design considerations"],
    reviewerChecks: ["Is the solution responsible?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "ethicalConsiderations",
            label: "Ethical concerns and your response",
            hint: "Misuse, unfairness, privacy, safety or unintended-effect risks, and what you will do about each.",
          },
        ],
      },
    ],
  },
  {
    id: "aifit",
    label: "AI Fit",
    title: "AI Fit & Responsible Use",
    lessonIndex: 7,
    activity: A[7],
    mustInclude: ["AI Fit evaluation, if AI is proposed"],
    reviewerChecks: ["If AI is used, does it actually add value?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "aiFit",
            label: "Your AI fit decision and reasoning",
            hint: "If your concept uses AI: what AI adds, what could go wrong, what data it needs, and whether a simpler solution could work. If it does not use AI, say so and why.",
          },
        ],
      },
    ],
  },
  {
    id: "buildbuy",
    label: "Build, Buy or Partner",
    title: "Build vs. Buy vs. Partner",
    lessonIndex: 9,
    hsOnly: true,
    activity: A[9],
    mustInclude: ["Build vs. Buy vs. Partner analysis"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "buildBuyPartner",
            label: "Your build / buy / partner decision",
            hint: "What you will build yourself, what you will adapt or purchase, and what a partner could supply, with the reason for each.",
          },
        ],
      },
    ],
  },
  {
    id: "originality",
    label: "Originality & IP",
    title: "Originality, Attribution & IP",
    lessonIndex: 10,
    activity: A[10],
    mustInclude: ["Originality, Attribution & IP record"],
    reviewerChecks: ["Does the student acknowledge existing work and inspiration?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "originalityRecord",
            label: "Your originality, attribution and IP record",
            hint: "Inspirations, existing solutions, adapted elements, original contributions, and anyone who needs credit.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "decision",
    label: "Decision Matrix",
    title: "Decision Matrix / Concept Selection",
    lessonIndex: 11,
    activity: A[11],
    mustInclude: ["Decision Matrix", "Selected concept", "Reason for selection"],
    reviewerChecks: ["Was the Decision Matrix completed before selection?", "Is the final choice supported by the comparison?"],
    showNotes: [{ text: "The Decision Matrix must be completed before the concept is selected." }],
    groups: [
      {
        fields: [
          {
            key: "decisionMatrix",
            label: "Your decision matrix",
            hint: "The criteria you scored against (impact, feasibility, cost, responsibility, fit) and each concept's score on each. One concept per line.",
            limit: 5000,
          },
          { key: "selectedConcept", label: "The concept you selected", short: true },
          {
            key: "selectionReason",
            label: "Why you selected it",
            hint: "What the comparison showed. Would your choice change if you were more honest about your scores?",
          },
        ],
      },
    ],
  },
  {
    id: "assumptions",
    label: "Critical Assumption",
    title: "Assumption Prioritization",
    lessonIndex: 8,
    activity: joinActivities(A[8], SUP[0]),
    mustInclude: ["Major assumptions", "One clearly named Critical Assumption"],
    reviewerChecks: ["Is the critical assumption actually capable of killing or significantly weakening the concept?"],
    showNotes: [],
    groups: [
      {
        heading: "Assumption hunt",
        fields: [
          {
            key: "assumptions",
            label: "What must be true for your selected concept to work",
            hint: "Every belief the idea depends on. One per line.",
            limit: 5000,
          },
        ],
      },
      {
        heading: "Critical assumption",
        fields: [
          {
            key: "criticalAssumption",
            label: "The one critical assumption",
            hint: "The belief that, if wrong, would break the idea. This is what you test first in Iterate.",
            short: true,
            limit: 500,
          },
          { key: "criticalAssumptionWhy", label: "Why it matters most" },
        ],
      },
    ],
  },
];

export const IMAGINE_STAGE: GuidedStage = {
  stageName: "IMAGINE",
  submitLabel: "Submit Imagine",
  pages: PAGES,
  keepNote:
    "These answers make up your Concept Portfolio: Value Proposition + Need/Feature Map + 3+ Concepts + Constraints + Risks + Accessibility/Ethics + AI Fit + Originality/IP record + Decision Matrix + Assumptions, with the selected concept and its Critical Assumption. Your worksheets are not uploaded; they stay with you.",
};
