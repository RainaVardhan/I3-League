import { joinActivities, type GuidedPage, type GuidedStage } from "@/lib/guided-stage";
import { ACTIVITIES_3_TO_6 } from "./activities";

const A = ACTIVITIES_3_TO_6.INFLUENCE.byTopic;
const SUP = ACTIVITIES_3_TO_6.INFLUENCE.supporting;

/**
 * Stage 6 (INFLUENCE) pages, in the curriculum's topic order, which follows
 * its required sequence (Know the Audience → Build the Evidence Story →
 * Visualize → Demonstrate → Defend → Plan Implementation → Define the Ask →
 * Rehearse → Face Questions → Revise → Present → Decide What Comes Next).
 * The four required supporting activities are joined onto the page they
 * belong to: Pitch Rehearsal & Timing onto Demo Skills, Pitch Evidence Audit
 * onto Defending Your Evidence, Mock Reviewer Q&A (required) onto Q&A, and
 * Final Ask Test onto Clear Ask.
 *
 * The five HS CORE pages are shown to high school students only; Revenue /
 * Funding is "when relevant" so it never gates Submit. The three STRETCH
 * pages are shown to everyone and never gate Submit.
 */
const PAGES: GuidedPage[] = [
  {
    id: "audience",
    label: "Audience",
    title: "Know Your Audience / Audience Adaptation",
    lessonIndex: 0,
    activity: A[0],
    mustInclude: ["Audience definition"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "audienceDefinition",
            label: "Your audience profile",
            hint: "Who you are presenting to, what they care about, what they already know, and the decision you want them to make.",
          },
        ],
      },
    ],
  },
  {
    id: "story",
    label: "Story",
    title: "Evidence-Based Storytelling",
    lessonIndex: 1,
    activity: A[1],
    mustInclude: [
      "Evidence-based story",
      "Clear problem",
      "Research evidence",
      "Solution selection reasoning",
      "Prototype/iteration story",
      "Impact evidence",
    ],
    reviewerChecks: ["Can the team explain the problem clearly?", "Can they show what changed through the six stages?"],
    showNotes: [],
    groups: [
      {
        fields: [
          { key: "storyProblem", label: "The problem, in one or two sentences", limit: 1000 },
          { key: "storyResearch", label: "The research evidence that confirmed it", limit: 1000 },
          { key: "storySelection", label: "Why you chose this solution over the alternatives", limit: 1000 },
          { key: "storyIteration", label: "What you built, tested and changed", limit: 1000 },
          { key: "storyImpact", label: "What the evidence shows changed", limit: 1000 },
        ],
      },
    ],
  },
  {
    id: "visuals",
    label: "Visuals",
    title: "Visual Communication & Data Visualization",
    lessonIndex: 2,
    activity: A[2],
    mustInclude: ["At least one strong evidence visual"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "evidenceVisual",
            label: "Your strongest evidence visual",
            hint: "What it shows (a chart, diagram, image, comparison or other visual), which result it comes from, and why that is the one to show.",
          },
        ],
      },
    ],
  },
  {
    id: "demo",
    label: "Demo",
    title: "Demo Skills",
    lessonIndex: 3,
    activity: joinActivities(A[3], SUP[1]),
    mustInclude: ["Appropriate demo"],
    reviewerChecks: ["Can they demonstrate the solution appropriately?"],
    showNotes: [],
    groups: [
      {
        heading: "Demo",
        fields: [
          {
            key: "demoPlan",
            label: "Your demo sequence",
            hint: "What you show, in what order, in about 60 seconds, with as little explanation as possible.",
          },
        ],
      },
      {
        heading: "Rehearsal",
        fields: [
          {
            key: "rehearsalNotes",
            label: "Your timed rehearsal",
            hint: "How long the full pitch ran, what you cut or changed to fit the competition limit.",
            limit: 1000,
          },
        ],
      },
    ],
  },
  {
    id: "defend",
    label: "Defend",
    title: "Defending Your Evidence",
    lessonIndex: 4,
    activity: joinActivities(A[4], SUP[0]),
    mustInclude: ["Major claims linked to evidence", "Limitations"],
    reviewerChecks: ["Does every major claim trace to evidence?", "Can they explain failures and limitations?"],
    showNotes: [
      {
        label: "Load-bearing requirement",
        text: "Every major claim must trace to evidence. A pitch cannot advance on assertions alone, however well delivered.",
      },
    ],
    groups: [
      {
        heading: "Claim to evidence",
        fields: [
          {
            key: "claimEvidenceMap",
            label: "Your three strongest claims, and the evidence behind each",
            hint: "For each claim, name the exact evidence in your portfolio that supports it.",
            limit: 5000,
          },
        ],
      },
      {
        heading: "Limitations",
        fields: [
          {
            key: "pitchLimitations",
            label: "The limitations and unknowns you will state openly",
          },
        ],
      },
    ],
  },
  {
    id: "qa",
    label: "Q&A",
    title: "Q&A, Objections & Critical Questions",
    lessonIndex: 5,
    activity: joinActivities(A[5], SUP[2]),
    mustInclude: ["Mock Reviewer Q&A completion"],
    reviewerChecks: ["Can they answer difficult questions without bluffing?"],
    showNotes: [
      {
        label: "Non-negotiable",
        text: "Mock Reviewer Q&A is required, not optional. A polished pitch deck should not qualify a team for Finals if they cannot answer: How do you know? What didn't work? What are your limitations? Why did you choose this solution? What would happen next?",
      },
    ],
    groups: [
      {
        heading: "Hot seat",
        fields: [
          {
            key: "toughQuestions",
            label: "The hardest questions a skeptical reviewer could ask, and your answers",
            limit: 5000,
          },
        ],
      },
      {
        heading: "Mock reviewer Q&A",
        fields: [
          {
            key: "mockReviewFeedback",
            label: "Your mock review: who asked, what they said, and what you revised",
            hint: "A teacher, coach, parent or another team can play the reviewer.",
          },
        ],
      },
    ],
  },
  {
    id: "implementation",
    label: "Implementation",
    title: "Implementation & Sustainability Model",
    lessonIndex: 6,
    activity: A[6],
    mustInclude: ["Implementation & Sustainability Model"],
    reviewerChecks: ["Is implementation realistic?", "Is sustainability considered?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "implementationModel",
            label: "Your implementation and sustainability plan",
            hint: "Who uses, maintains, supports, approves or continues the solution after i3League, and what that takes.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "ask",
    label: "The Ask",
    title: "Clear Ask / Next Step",
    lessonIndex: 7,
    activity: joinActivities(A[7], SUP[3]),
    mustInclude: ["Clear next-step Ask"],
    reviewerChecks: ["Is the Ask specific?"],
    showNotes: [
      {
        label: "Key test",
        text: "Your reviewer should be able to complete: “Based on what we learned, they are asking for ___, which makes sense because ___.”",
      },
    ],
    groups: [
      {
        heading: "The Ask",
        fields: [
          {
            key: "clearAsk",
            label: "Your one specific closing Ask",
            hint: "Exactly what you want the audience to approve, support, fund, test, adopt or investigate next.",
            limit: 1000,
          },
        ],
      },
      {
        heading: "Final Ask test",
        fields: [
          {
            key: "askTest",
            label: "Why that Ask fits this audience",
            hint: "Check it against your Audience Map: is it something this audience can actually decide?",
            limit: 1000,
          },
        ],
      },
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    title: "Portfolio Documentation",
    lessonIndex: 8,
    activity: A[8],
    mustInclude: ["Complete Innovation Portfolio"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "portfolioChecklist",
            label: "Your evidence trail",
            hint: "The artifact from each of the six stages, in order, and where each one lives. Note anything still missing.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "reflection",
    label: "Reflection",
    title: "Reflection & Future Direction",
    lessonIndex: 9,
    activity: A[9],
    mustInclude: ["Reflection", "Future direction"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "reflection",
            label: "What changed in you and in the idea",
            hint: "What you believed at the start, and what the evidence taught you.",
          },
          { key: "futureDirection", label: "What should happen next" },
        ],
      },
    ],
  },
  {
    id: "budget",
    label: "Budget",
    title: "Budgeting & Resource Planning",
    lessonIndex: 10,
    hsOnly: true,
    activity: A[10],
    mustInclude: ["Budget/resources"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "resourceBudget",
            label: "What this would really take",
            hint: "People, time, money, materials, technology, permissions and other resources needed to implement it.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "funding",
    label: "Funding",
    title: "Revenue / Funding / Support Model",
    lessonIndex: 11,
    hsOnly: true,
    optionalTag: "When relevant",
    activity: A[11],
    mustInclude: ["Funding/support model, where applicable"],
    reviewerChecks: [],
    showNotes: [{ text: "Not every innovation needs revenue. Leave this page blank if your solution continues without a funding model." }],
    groups: [
      {
        fields: [
          {
            key: "fundingModel",
            label: "How this continues",
            hint: "The revenue, funding or support model that actually fits the project.",
          },
        ],
      },
    ],
  },
  {
    id: "partners",
    label: "Partners",
    title: "Partnership Strategy",
    lessonIndex: 12,
    hsOnly: true,
    activity: A[12],
    mustInclude: ["Partnerships"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "partnershipMap",
            label: "Who needs to say yes",
            hint: "The organizations, people, departments, experts or institutions needed for implementation, and each one's role.",
          },
        ],
      },
    ],
  },
  {
    id: "risk",
    label: "Risk & Mitigation",
    title: "Risk & Mitigation",
    lessonIndex: 13,
    hsOnly: true,
    activity: A[13],
    mustInclude: ["Implementation risks/mitigation"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "implementationRisks",
            label: "Key implementation risks and how you would respond",
            hint: "Imagine implementation failed. The most likely reasons, and your mitigation for each.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "summary",
    label: "Executive Summary",
    title: "Executive Summary",
    lessonIndex: 14,
    hsOnly: true,
    activity: A[14],
    mustInclude: ["Executive Summary"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "executiveSummary",
            label: "Your one-page decision brief",
            hint: "Problem, evidence, solution, impact, implementation and Ask, in one page.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "adoption",
    label: "Adoption",
    title: "Go-to-Market / Adoption Strategy",
    lessonIndex: 15,
    optionalTag: "Stretch",
    activity: A[15],
    mustInclude: ["Go-to-market/adoption"],
    reviewerChecks: [],
    showNotes: [{ text: "Stretch work. Leave this page blank if reaching additional users or adopters is not the next realistic step for your project." }],
    groups: [
      {
        fields: [
          {
            key: "adoptionStrategy",
            label: "Your path from pilot to adoption",
          },
        ],
      },
    ],
  },
  {
    id: "sizing",
    label: "Opportunity Sizing",
    title: "Formal Market / Opportunity Sizing",
    lessonIndex: 16,
    optionalTag: "Stretch",
    activity: A[16],
    mustInclude: ["Opportunity sizing"],
    reviewerChecks: [],
    showNotes: [{ text: "Stretch work. Leave this page blank unless you can size the opportunity with credible data." }],
    groups: [
      {
        fields: [
          {
            key: "opportunitySizing",
            label: "Your evidence-backed opportunity estimate",
            hint: "The relevant population, opportunity or market, the data it comes from, and how you calculated it.",
          },
        ],
      },
    ],
  },
  {
    id: "architecture",
    label: "Architecture",
    title: "Technical Architecture / Deployment Plan",
    lessonIndex: 17,
    optionalTag: "Stretch",
    activity: A[17],
    mustInclude: ["Technical architecture/deployment"],
    reviewerChecks: [],
    showNotes: [{ text: "Stretch work for technical projects. Leave this page blank if your solution has no technical components to deploy." }],
    groups: [
      {
        fields: [
          {
            key: "technicalArchitecture",
            label: "How this would work for real",
            hint: "Components, dependencies, data flows, infrastructure or deployment requirements.",
            limit: 5000,
          },
        ],
      },
    ],
  },
];

export const INFLUENCE_STAGE: GuidedStage = {
  stageName: "INFLUENCE",
  submitLabel: "Submit Influence",
  pages: PAGES,
  keepNote:
    "These answers make up your Final Pitch + Innovation Portfolio: Audience Map + Story Arc + Evidence Visuals + Demo + Evidence Defense + Q&A Preparation + Implementation & Sustainability Model + Clear Ask + Reflection. The pitch itself, your visuals and your worksheets are not uploaded; they stay with you.",
};
