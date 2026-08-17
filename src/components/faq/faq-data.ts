import type { FaqItem } from "@/components/marketing/FaqAccordion";

export type FaqSection = {
  title: string;
  items: FaqItem[];
};

// Plain data module, not a component — keeps page.tsx's Season fetch (price,
// team size, deadlines) as the single source for any FAQ answer that states
// a number, per CLAUDE.md "Season-driven config — do not hard-code." Same
// build*(...) function pattern as how-it-works/steps.ts's buildSteps.
export function buildFaqSections(params: {
  price: number;
  maxTeamSize: number;
  springQualifyDeadline: string;
  summerQualifyDeadline: string;
  curriculumVersion: string;
}): FaqSection[] {
  const { price, maxTeamSize, springQualifyDeadline, summerQualifyDeadline, curriculumVersion } =
    params;

  return [
    {
      title: "Registration & pricing",
      items: [
        {
          question: "How much does I³ League cost?",
          answer: `Registration is $${price.toFixed(0)} per student, priced the same whether you register individually or as part of a team. A team of ${maxTeamSize} students pays $${price.toFixed(0)} each, and every student gets their own account, curriculum access, and certification regardless of team size.`,
        },
        {
          question: "How do we pay?",
          answer:
            "Payment is handled manually: at registration you'll see the organization's PayPal, Venmo, and Zelle details, pay your individual share, then submit a short payment confirmation form. An admin verifies each student's payment individually.",
        },
        {
          question: "If I'm on a team, does one unpaid teammate block the rest of us?",
          answer:
            "No. Payment and enrollment are tracked per student, so your access to your own dashboard, curriculum, and certification track always stays independent of your teammates' payment status.",
        },
      ],
    },
    {
      title: "Teams & projects",
      items: [
        {
          question: "Can I participate individually, or do I need a team?",
          answer: `Either. You can register as an individual or form a team of up to ${maxTeamSize} students, whichever suits your project best: a team of 2 is just as valid as a team of ${maxTeamSize}.`,
        },
        {
          question: "If I work on a team, is everything shared with my teammates?",
          answer:
            "The project itself can be shared across a team, while the learning always stays individual. Each student completes their own curriculum, assessments, Innovation Journal, and challenges, and earns their own Innovator Profile, badges, and certificate.",
        },
        {
          question: "Do we choose our own problem to work on?",
          answer:
            "Yes. There's no assigned prompt. Students pick a real problem they've noticed and use the I³ pathway to investigate and address it.",
        },
      ],
    },
    {
      title: "Curriculum & progress",
      items: [
        {
          question: "What does the curriculum actually cover?",
          answer: `The ${curriculumVersion} curriculum is six stages (Insight, Investigate, Imagine, Iterate, Impact, and Influence) plus the IP Checkpoint gate between Imagine and Iterate. Each stage builds a skill and applies it directly to your project.`,
        },
        {
          question: "Can I skip ahead to a later stage?",
          answer:
            "No. Stages unlock in order, and this is enforced by the platform itself, not just the interface: you can't reach a later stage by guessing its URL before finishing the one before it.",
        },
        {
          question: "What happens if my project involves something like human subjects, chemicals, or other higher-risk work?",
          answer:
            "The Investigate stage includes a short safety screening. Certain answers automatically route a project to admin review before it can continue. This protects students and keeps risky work from proceeding unsupervised, not to slow anyone down unnecessarily.",
        },
        {
          question: "Is my project public or private?",
          answer:
            "Every project starts confidential by default. It only becomes public if a student explicitly chooses that at or after the IP Checkpoint, roughly midway through the curriculum. If that step is skipped or left ambiguous, the project stays confidential.",
        },
      ],
    },
    {
      title: "Qualification & National Finals",
      items: [
        {
          question: "Does registering automatically qualify me for the National Finals?",
          answer:
            "No. Registering opens the curriculum for the season. Qualifying for the Finals is a separate, later achievement based on completing the required work by one of the qualification windows.",
        },
        {
          question: "When are the qualification windows?",
          answer: `There are two windows each season: one closing ${springQualifyDeadline} and one closing ${summerQualifyDeadline}. Completing the required work by either window keeps a student eligible to advance.`,
        },
        {
          question: "What if I miss both qualification windows?",
          answer:
            "You remain enrolled and keep full access to the curriculum, your Innovator Profile, and your certification track. You just don't advance to the Finals that season.",
        },
      ],
    },
  ];
}
