// Plain data module (no "use client") so both ProcessSection.tsx (a
// Client Component, for its scroll/toggle interactivity) and PageHero.tsx
// (a Server Component) can import STEPS/STEP_COUNT directly. Exporting
// this from ProcessSection.tsx instead would make PageHero import a value
// across the client boundary — Next wraps every export of a "use client"
// module in a client reference, so a plain constant like STEP_COUNT
// becomes an unusable proxy when read from a Server Component and throws
// at render instead of returning the number.
export type Step = {
  number: string;
  title: string;
  copy: string;
  meta: string;
  detail: string;
  variant?: "deadline";
};

export const STEPS: Step[] = [
  {
    number: "01",
    title: "Enroll",
    copy: "Create your Innovator Profile.",
    meta: "Get started",
    detail:
      "Create your account, register, and choose to go solo or join a team. A parent or guardian gives consent, each student pays their own share, and an admin verifies each payment individually.",
  },
  {
    number: "02",
    title: "Learn",
    copy: "Complete the six innovation stages.",
    meta: "Build the skills",
    detail:
      "Work through Insight, Investigate, Imagine, Iterate, Impact, and Influence in order. Each stage has notes to learn from, activities to do, and one artifact to submit.",
  },
  {
    number: "03",
    title: "Apply",
    copy: "Use every stage on your own innovation.",
    meta: "Make it yours",
    detail:
      "No hypothetical exercises: every lesson gets applied directly to the real problem you chose to solve.",
  },
  {
    number: "04",
    title: "Pass",
    copy: "Pass each stage's review.",
    meta: "Show the work",
    detail:
      "Every stage ends with one artifact, reviewed against a rubric. If it is ready, the next stage unlocks. If not, you get specific feedback, revise, and resubmit. Revision is expected, not penalized.",
  },
  {
    number: "05",
    title: "Earn",
    copy: "Become an I³League Certified Innovator.",
    meta: "Certification",
    detail:
      "Complete all six stages and their reviews, and you're recognized as an I³League Certified Innovator.",
  },
  {
    number: "06",
    title: "Qualify",
    // Placeholder copy — real Season dates are Season-driven config (see
    // CLAUDE.md), never hardcoded here. buildSteps() below overrides this
    // step's copy/detail with the live springQualifyDeadline/
    // summerQualifyDeadline before rendering.
    copy: "Complete everything by the qualification deadline.",
    meta: "Two deadlines",
    detail:
      "Two windows each year, Spring and Summer. Miss both, and you can keep learning toward the next cycle.",
    variant: "deadline",
  },
  {
    number: "07",
    title: "Compete",
    copy: "Top innovators advance to the Finals.",
    meta: "Go to Finals",
    detail:
      "Teams that clear all six stages enter Finals selection, where the strongest innovations are compared and invited to the I³League National Innovation Finals.",
  },
  {
    number: "08",
    title: "Impact",
    copy: "Promising innovations may move toward pilots, partnerships and adoption.",
    meta: "Make it real",
    detail:
      "For the projects with real staying power, the finish line isn't the finish line: pilots, partnerships, and adoption can follow.",
  },
];

export const STEP_COUNT = STEPS.length;

// Injects the real, Season-sourced qualification dates into the "Qualify"
// step at render time, instead of hardcoding them into STEPS above.
export function buildSteps(springQualifyDeadline: string, summerQualifyDeadline: string): Step[] {
  return STEPS.map((step) =>
    step.number === "06"
      ? {
          ...step,
          copy: `Complete everything by ${springQualifyDeadline} or ${summerQualifyDeadline}.`,
          detail: `Two windows each year: Spring (${springQualifyDeadline}) and Summer (${summerQualifyDeadline}). Miss both, and you can keep learning toward the next cycle.`,
        }
      : step,
  );
}
