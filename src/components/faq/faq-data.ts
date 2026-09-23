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
  enrollmentOpenDate: string;
  nationalFinalsDate: string;
}): FaqSection[] {
  const {
    price,
    maxTeamSize,
    springQualifyDeadline,
    summerQualifyDeadline,
    curriculumVersion,
    enrollmentOpenDate,
    nationalFinalsDate,
  } = params;

  return [
    {
      title: "Registration & pricing",
      items: [
        {
          question: "When does enrollment open?",
          answer: `Enrollment opens ${enrollmentOpenDate}. You can create an account before then, but registration, payment, and the curriculum open on that date.`,
        },
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
            "The project itself can be shared across a team, while the learning always stays individual. Each student completes their own curriculum, stage submissions, and Innovation Journal, and earns their own Innovator Profile, badges, and certificate.",
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
          answer: `The ${curriculumVersion} curriculum is six stages, done in order: Insight (is this a real problem?), Investigate (why is it happening, and what does the evidence say?), Imagine (what could solve it, and what must we test first?), Iterate (can we build and test the critical assumption?), Impact (did it make a measurable difference?), and Influence (can we defend it, sustain it, and convince someone to take the next step?). You apply every stage directly to your own project.`,
        },
        {
          question: "What do I actually submit at each stage?",
          answer:
            "One artifact per stage: a Validated Problem Statement + Evidence Notes (Insight), a Research Brief (Investigate), a Concept Portfolio (Imagine), a Tested Prototype + Test Plan + Iteration Log (Iterate), an Impact Report (Impact), and a Final Pitch + Innovation Portfolio (Influence). Worksheets are working tools; the artifact is the polished evidence package.",
        },
        {
          question: "How are submissions reviewed?",
          answer:
            "Each submission is checked against a rubric with six dimensions: Evidence Quality, Reasoning & Interpretation, Process Rigor, Integrity & Reflection, Completeness, and Communication & Clarity. It is a gate, not a grade: you advance when every required dimension meets the standard. Otherwise you get specific feedback, revise, and resubmit. Needing a revision carries no penalty.",
        },
        {
          question: "Does my solution have to work?",
          answer:
            "No. Reviewers judge the quality of your evidence and thinking, not how impressive the final product looks. An unsuccessful solution can still be excellent innovation work if the learning is rigorous and your conclusions match your evidence.",
        },
        {
          question: "Is the curriculum different for middle school and high school?",
          answer:
            "No. Everyone follows the same six-stage pathway. Depth increases with grade level: some topics are marked for high school, and some are optional stretch topics for strong or older students.",
        },
        {
          question: "Can I use AI?",
          answer:
            "You may, but every stage submission includes a required AI-use disclosure, whether or not you used AI. Imagine also asks you to consider honestly whether your problem needs AI at all.",
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
            "Every project is confidential. It's never made public, and never appears in any public gallery, marketing material, or public-facing judge view.",
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
          question: "How does the National Finals work?",
          answer: `The National Finals are scheduled for ${nationalFinalsDate}. Only students and teams that have advanced through all six stages enter Finals selection, where their work is compared to choose among strong teams. The detailed Finals judging framework is still being finalized and will be shared with qualifying students ahead of the event.`,
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
