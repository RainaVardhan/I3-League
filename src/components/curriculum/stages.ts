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
      "Every innovation starts with a real, specific problem, not a hypothetical one. In Insight, students learn to look closely at their own school, neighborhood, or community and notice something that is genuinely broken, inefficient, or unfair, then describe it in concrete terms instead of a vague statement like \"people should recycle more.\"",
      "The core skill here is turning an observation into a problem statement that can actually be worked on: who is affected, how often, and what evidence supports that it's a real problem, not just an assumption. Students practice separating what they think is true from what they can actually show is true.",
      "By the end of Insight, a student has a single, focused problem statement, the raw material every later stage builds on. Nothing about the eventual solution is decided yet, on purpose. Jumping to a solution before understanding the problem is one of the most common ways youth innovation projects go wrong.",
    ],
  },
  {
    number: "02",
    name: "Investigate",
    headline: "Research before you build, safely.",
    description: [
      "Investigate is where the problem statement gets tested against evidence. Students dig into what's already known: existing research, prior attempts to solve similar problems, and, where appropriate, direct conversations with the people actually affected by the problem they identified in Insight.",
      "Every project also passes a mandatory safety screening in this stage. Any high-risk answer, involving people, animals, health information, chemicals, biological materials, electricity, machinery, personal data, environmental sampling, drones, or AI, automatically routes the project to admin review before the student can continue. This isn't optional and it isn't a formality; it's the point where an adult reviews what a student is proposing before they go do it.",
      "Students are expected to leave this stage having changed their mind about something. If the research only ever confirms what a student already believed going in, that's usually a sign it wasn't real research. A revised, evidence-backed problem statement is what carries forward into Imagine.",
    ],
  },
  {
    number: "03",
    name: "Imagine",
    headline: "Create options before choosing one.",
    description: [
      "Imagine is the only stage built around volume, not judgment. Students generate as many possible solutions to their researched problem as they reasonably can, deliberately withholding judgment about which ones are \"good\" until there's a real set of options to compare.",
      "Once a reasonable set of ideas exists, students evaluate them against real constraints: feasibility (can this actually be built with the time, materials, and skills available), impact (does it address the root problem from Investigate, not just a symptom of it), and safety.",
      "The stage ends with a single committed direction, not a menu of options. That decision is what the student carries into the IP Checkpoint and then Iterate; everything from here on assumes the idea has already been chosen.",
    ],
  },
  {
    number: "04",
    name: "Iterate",
    headline: "Use failure as evidence.",
    description: [
      "Iterate is where the idea from Imagine becomes something real: a prototype, a written plan, a working process, a piece of code, whatever form the solution actually takes. Students build a first real version, then test it against something outside their own head, feedback from another person, a trial run, a comparison against the original problem statement from Insight.",
      "Failure is treated as data here, not as a setback to hide. When something doesn't work the way a student expected, the useful move is to write down what broke, why it broke, and what that implies for the next version, then actually build that next version.",
      "This is also where the append-only Innovation Journal fills in fastest, one dated entry at a time. Editing a past entry creates a new version instead of overwriting it, so a student's actual thinking over time stays visible instead of getting quietly cleaned up after the fact.",
    ],
  },
  {
    number: "05",
    name: "Impact",
    headline: "Make it matter beyond the prototype.",
    description: [
      "A working prototype isn't the finish line. In Impact, students step back from what they built and ask an honest question: did the problem from Insight actually get smaller because of this, and what evidence supports that, not what they hope is true, what they can actually show.",
      "This stage rewards specificity over enthusiasm. \"It helped a lot of people\" isn't evidence; \"three teachers piloted this for two weeks and reported X\" is. Students are expected to name real limitations, what this doesn't solve yet, who it doesn't reach, what would break at a larger scale, rather than presenting the work as finished.",
      "The output of Impact is a clear-eyed account of what changed and what a next version would need to do better. That honesty is itself part of what's being evaluated here, not just the outcome.",
    ],
  },
  {
    number: "06",
    name: "Influence",
    headline: "Explain the work. Defend the decisions.",
    description: [
      "Influence is the closing stage, where a student has to explain and defend everything the previous five stages produced, not just present it. It brings together a speaking submission, the Character Challenge, the Ethics Challenge, and a final AI-use disclosure into one finished package.",
      "The AI-use disclosure at this stage isn't unique to Influence, it's required at the submission step of every stage, including this one, whether or not a student used AI at all. The point is a consistent, honest record, not a one-time confession.",
      "Everything from Insight through Influence, the journal entries, the safety review, the IP Checkpoint decision, the prototype, the impact evidence, and this closing package, compiles into the student's finished Innovation Portfolio: the artifact that follows them through certification and, if they qualify, into the National Finals.",
    ],
  },
];

// The gate between Imagine and Iterate — not a numbered stage (no
// assessment, per prisma/seed.ts), so it's kept separate and spliced into
// CURRICULUM_TIMELINE at the right position instead of living in the array
// above.
export const IP_CHECKPOINT: CurriculumStage = {
  number: "IP",
  name: "IP Checkpoint",
  headline: "Protect before you publish.",
  description: [
    "The IP Checkpoint is a deliberate pause between choosing a direction (Imagine) and building it (Iterate). Its only job is to get a student to make one specific decision on purpose: should this project be visible to the public, or should it stay confidential?",
    "Every project is Confidential from the moment it's created, that's the default at the database level, not just a form default, and it stays that way unless a student explicitly asks for it to be made Public, at or after this checkpoint. If a student skips this step, abandons it partway through, or answers ambiguously, the project simply stays Confidential. There's no path by which a project becomes public automatically.",
    "This matters because a Public project can eventually appear in galleries, marketing materials, or in front of judges outside the student's own team; a Confidential one never does. Students building something they consider sensitive, personal, or not yet ready to share always have the safer default working in their favor.",
  ],
};

export type TimelineEntry = CurriculumStage & { isGate?: boolean };

// The full ordered sequence a student moves through, stages and the gate
// together — the single source both the hero's framework card and the
// stage-by-stage detail list render from, so the two can never drift out
// of order with each other.
export const CURRICULUM_TIMELINE: TimelineEntry[] = [
  ...CURRICULUM_STAGES.slice(0, 3),
  { ...IP_CHECKPOINT, isGate: true },
  ...CURRICULUM_STAGES.slice(3),
];
