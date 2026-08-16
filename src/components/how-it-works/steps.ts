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
      "Takes just a few minutes: create your account, tell us a bit about yourself, and choose to go it alone or team up with others.",
  },
  {
    number: "02",
    title: "Learn",
    copy: "Complete the six innovation stages.",
    meta: "Build the skills",
    detail:
      "Work through Insight, Investigate, Imagine, the IP Checkpoint, Iterate, Impact, and Influence, the same six-stage foundation every innovator builds on.",
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
    copy: "Complete assessments and submissions.",
    meta: "Show the work",
    detail:
      "Each stage wraps with a project submission and a short assessment before the next one unlocks.",
  },
  {
    number: "05",
    title: "Earn",
    copy: "Become an I³League Certified Innovator.",
    meta: "Certification",
    detail:
      "Finish all six stages, their submissions, and their assessments, and you're recognized as an I³League Certified Innovator.",
  },
  {
    number: "06",
    title: "Qualify",
    copy: "Complete everything by April 30 or July 30.",
    meta: "Two deadlines",
    detail:
      "Two windows each year: Spring (April 30) and Summer (July 30). Miss both, and you can keep learning toward the next cycle.",
    variant: "deadline",
  },
  {
    number: "07",
    title: "Compete",
    copy: "Top innovators advance to the Finals.",
    meta: "Go to Finals",
    detail:
      "The strongest qualifying innovations are invited to represent at the I³League National Innovation Finals.",
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
