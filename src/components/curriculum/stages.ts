// Plain data module (no "use client") so it can be imported from Server
// Components without pulling any client-only code across the boundary —
// same reasoning as src/components/how-it-works/steps.ts.
export type CurriculumStage = {
  number: string;
  name: string;
  /** Short punchy thesis statement shown above the paragraph description. */
  headline: string;
  /** One entry per paragraph — StageDetailList renders each as its own <p>. */
  description: string[];
};

// The 6 core learn/apply/submit stages, in order — CLAUDE.md "Core business
// rules: Sequential stage unlocking".
export const CURRICULUM_STAGES: CurriculumStage[] = [
  {
    number: "01",
    name: "Insight",
    headline: "Start with the problem, not the idea.",
    description: [
      "Core question: Is this a real problem? Insight teaches students to observe closely, understand the people affected without assuming what they think, and narrow a broad concern into a problem small enough to work on. Topics: Observation Skills, Empathy Without Assumption, Problem Scope, Ethical Interviewing & Consent, and Team Charter.",
      "Students practice by logging real frictions, interviewing someone affected (with consent), and rewriting a vague concern into a specific problem statement that names who is affected, where, when, and why it matters. A problem statement that is really a hidden solution does not pass.",
      "Required artifact: Validated Problem Statement + Evidence Notes. It includes the problem statement, the affected group, observation evidence, firsthand interview evidence, the reason the scope is manageable, and, for teams, a team charter. To advance, the problem must be specific, evidenced, and something the student can explain.",
    ],
  },
  {
    number: "02",
    name: "Investigate",
    headline: "Research before you build, safely.",
    description: [
      "Core question: Why is it happening, and what does the evidence say? Investigate tests the problem against evidence. Topics: Basic Data Literacy, Bias Awareness, Data Privacy Basics, Research Integrity, Source Triangulation, and Citation vs. Plagiarism, plus Problem Ecosystem / System Mapping for high school students. The guiding principle: good research can change your mind.",
      "Students collect more than one type of evidence, check each claim against independent sources, look honestly at evidence that contradicts them, find a credible root cause, and identify the gap in what already exists. Every project also completes a safety screening here. Any higher-risk answer sends the project to admin review before the student can continue.",
      "Required artifact: Research Brief. It includes research questions, survey or interview evidence, a source list, triangulation, root cause analysis, the existing-solutions gap, and a stakeholder map (plus a System Map for high school). To advance, findings must be honest, the evidence varied, and the root cause and gap credible.",
    ],
  },
  {
    number: "03",
    name: "Imagine",
    headline: "Create options before choosing one.",
    description: [
      "Core question: What could solve it, which direction should we choose, and what must we test first? Imagine covers Value Proposition, User Needs vs. Features, Divergent Thinking, Constraints Thinking, Risk Identification, Accessibility & Inclusion, Responsible & Ethical Design, AI Fit & Responsible Use, Assumption Prioritization, Originality, Attribution & IP, and Decision Matrix / Concept Selection, plus Build vs. Buy vs. Partner for high school.",
      "Students develop three or more genuinely different concepts, test them against real constraints, risks, accessibility, and ethics, ask honestly whether AI is actually needed, and record what is original and what is borrowed. A decision matrix then justifies the choice of one concept.",
      "Required artifact: Concept Portfolio. It includes the value proposition, needs and features map, the concepts, constraints, risks, the originality record, the decision matrix, the selected concept, and the critical assumption to test first. To advance, multiple real options must have been considered, the selection justified, and the critical assumption named.",
    ],
  },
  {
    number: "04",
    name: "Iterate",
    headline: "Use failure as evidence.",
    description: [
      "Core question: Can we build and test the critical assumption? Iterate covers MVP Thinking, Prototype Fidelity, Experiment Design Basics, Test Questions & Success Criteria, Usability Basics, Observation vs. Opinion, Learning From Failure, Feedback to Revision, Versioning, and Team Execution & Task Tracking, plus Formal Experiment Controls and Git & Technical Documentation (when relevant) for high school. A prototype is not a product: build only enough to learn something.",
      "Students define a minimum viable version, set a test question and success criteria in advance, run a real test with real participants, log what worked and what failed, revise based on the feedback, and then retest the revised version.",
      "Required artifact: Tested Prototype + Test Plan + Iteration Log. It includes the MVP definition, the prototype, the test question, success criteria, observations, feedback, the learning log, revisions, version history, and retest evidence. To advance, the critical assumption must be tested, evidence collected, a revision made, and the revised version retested.",
    ],
  },
  {
    number: "05",
    name: "Impact",
    headline: "Make it matter beyond the prototype.",
    description: [
      "Core question: Did it actually make a measurable difference? Impact walks through what changed, compared to what, how we know, who benefited, at what cost, what was not proven, and whether it would still work at scale. Topics include Choosing the Right Success Metric, Baseline and Comparison, Quantitative vs. Qualitative Evidence, Responsible Claims, Limitations, Unintended Consequences, and Cost vs. Benefit. High school adds Correlation vs. Causation, Leading vs. Lagging Indicators, Adoption Metrics, Scalability, and Unit Economics.",
      "Students choose a meaningful metric, measure against a baseline or comparison, analyze the result, and state honestly what the evidence does and does not support, including limitations and unintended consequences.",
      "Required artifact: Impact Report. To advance, the conclusion must match the evidence, even if the innovation did not achieve its impact. A null or negative result can still meet the standard, because review checks the evidence and rigor, never whether the outcome was positive.",
    ],
  },
  {
    number: "06",
    name: "Influence",
    headline: "Explain the work. Defend the decisions.",
    description: [
      "Core question: Can we defend it, sustain it, and convince someone to take the next step? Influence covers Audience Adaptation, Evidence-Based Storytelling, Visual Communication, Demo Skills, Defending Your Evidence, Q&A and Objections, Implementation & Sustainability Model, Clear Ask / Next Step, Portfolio Documentation, and Reflection. High school adds Budgeting, Funding and Support Models, Partnership Strategy, Risk & Mitigation, and an Executive Summary. The goal of a pitch is not applause. The goal is a decision.",
      "Students plan for their audience, build a story from their evidence, demonstrate the work, prepare for hard questions, and present a realistic path to implementation, adoption, continuation, or further investigation. On a team, every member must be able to explain the project and their own contribution.",
      "Required artifact: Final Pitch + Innovation Portfolio, which brings the artifacts from all six stages together with a reflection and an implementation and sustainability plan. To advance, the story must be clear, the evidence defensible, the next step realistic, and the Q&A strong.",
    ],
  },
];
