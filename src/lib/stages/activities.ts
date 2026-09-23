import type { GuidedActivity } from "@/lib/guided-stage";

// GENERATED from docs/curriculum/02_DO/i3league-stage{3,4,5,6}-activities.md by a
// one-off script (em dashes rewritten). `byTopic` follows the curriculum topic
// order (the same order as the seeded lessons); `supporting` are the required
// supporting activities, which have a "Why it's needed" line instead of a
// description.

export const ACTIVITIES_3_TO_6: Record<"IMAGINE" | "ITERATE" | "IMPACT" | "INFLUENCE", { byTopic: GuidedActivity[]; supporting: GuidedActivity[] }> = {
  IMAGINE: {
    byTopic: [
      { activity: "Value in One Sentence", description: "Complete \"Someone would use this because…\" and refine until it names a real user benefit.", worksheet: "Value Proposition Builder", output: "1 clear value proposition" },
      { activity: "Feature Trace", description: "Connect every proposed feature to a real need from Stages 1–2 and remove weak ones.", worksheet: "Needs vs. Features Map", output: "Need-to-feature map" },
      { activity: "Three Different Ways", description: "Generate at least 3 genuinely different solution approaches, not variations of one idea.", worksheet: "Idea Generation Sheet", output: "3+ distinct concepts" },
      { activity: "Reality Check", description: "Identify time, money, policy, skills, materials, technology, or other limits that affect each concept.", worksheet: "Constraints Checklist", output: "Constraints list by concept" },
      { activity: "Pre-Mortem", description: "Imagine the idea failed and identify the most likely reasons why.", worksheet: "Risk Register", output: "Top risks + early warning signs" },
      { activity: "Who Might Be Left Out?", description: "Identify users or groups the solution could exclude and revise accordingly.", worksheet: "Accessibility & Inclusion Check", output: "1+ accessibility considerations" },
      { activity: "Could This Cause Harm?", description: "Identify misuse, unfairness, privacy, safety, or unintended-effect risks.", worksheet: "Ethical Design Check", output: "Ethical concerns + response" },
      { activity: "Does This Need AI?", description: "Answer what AI adds, what could go wrong, what data it needs, and whether a simpler solution could work.", worksheet: "AI Fit Check", output: "AI fit decision + reasoning" },
      { activity: "Assumption Hunt", description: "List what must be true for the selected concept to work.", worksheet: "Assumption Map", output: "Assumption list" },
      { activity: "Make or Leverage?", description: "Identify what should be built, adapted, purchased, or supported through partnership.", worksheet: "Build vs. Buy vs. Partner", output: "Build/buy/partner decision" },
      { activity: "What Exists Already?", description: "Document inspirations, existing solutions, adapted elements, original contributions, and attribution needs.", worksheet: "Originality, Attribution & IP Record", output: "Originality / attribution record" },
      { activity: "Compare Before You Commit", description: "Score the concepts against shared criteria such as impact, feasibility, cost, responsibility, and fit.", worksheet: "Decision Matrix", output: "Completed concept comparison + selected concept" },
    ],
    supporting: [
      { activity: "Critical Assumption Selection", supporting: true, why: "Creates the direct handoff into ITERATE.", worksheet: "Critical Assumption Prioritizer", output: "1 named critical assumption + explanation of why it matters most" },
    ],
  },
  ITERATE: {
    byTopic: [
      { activity: "Smallest Testable Version", description: "Reduce the chosen concept to the smallest version that can test the critical assumption.", worksheet: "MVP Planner", output: "MVP definition + what it is meant to learn" },
      { activity: "Choose the Right Fidelity", description: "Decide whether the test needs a sketch, mockup, physical model, simulation, or working version.", worksheet: "Prototype Fidelity Selector", output: "Chosen fidelity + justification" },
      { activity: "One-Thing Test", description: "Define the one important thing being tested and keep other conditions as consistent as practical.", worksheet: "Test Plan", output: "Simple experiment structure" },
      { activity: "Define Success Before Testing", description: "Write the test question and measurable success criteria before running the test.", worksheet: "Test Question & Success Criteria Builder", output: "Test question + success threshold" },
      { activity: "Silent Use Test", description: "Give the prototype to someone unfamiliar with it and observe without explaining unless safety requires it.", worksheet: "Usability Observation Sheet", output: "Usability observations" },
      { activity: "Watch vs. Ask", description: "Record what testers actually did separately from what they said afterward.", worksheet: "Observation vs. Opinion Log", output: "Behavior evidence + reported feedback" },
      { activity: "What Did This Teach Us?", description: "Record failed, partial, surprising, or inconclusive outcomes and what they revealed.", worksheet: "Failure / Learning Log", output: "Meaningful learning entries" },
      { activity: "Evidence-to-Change", description: "Connect each meaningful finding to a specific design change, or explain why no change was made.", worksheet: "Feedback Log + Iteration Log", output: "Feedback-to-revision links" },
      { activity: "V1 → V2 → V3", description: "Preserve each meaningful prototype version and document what changed and why.", worksheet: "Version History", output: "Version sequence + change rationale" },
      { activity: "Build Sprint", description: "Assign current tasks by owner, deadline, status, and blocker.", worksheet: "Team Task Tracker", output: "Active execution board" },
      { activity: "Controlled Test Design", description: "Identify variables, controlled conditions, and comparison/control group when appropriate.", worksheet: "Formal Experiment Design", output: "More rigorous experiment plan" },
      { activity: "Document the Build", description: "Create version-control checkpoints and explain how the technical project works.", worksheet: "Technical Documentation / Git Checklist", output: "Repository/version evidence + README" },
    ],
    supporting: [
      { activity: "Pilot/Test Participant Plan", supporting: true, why: "Makes testing real and safe rather than informal.", worksheet: "Test Plan", output: "Who will test, how many, where, when, permissions needed" },
      { activity: "Retest After Revision", supporting: true, why: "Proves iteration actually happened, not just Test → change → stop, but Test → Learn → Revise → Retest.", worksheet: "Iteration Log + Test Plan", output: "Evidence from at least one revised version" },
    ],
  },
  IMPACT: {
    byTopic: [
      { activity: "Impact in One Sentence", description: "Complete \"Because of our solution, ___ changed for ___.\".", worksheet: "Impact Statement Builder", output: "1 clear impact statement" },
      { activity: "Measure What Matters", description: "Compare several possible metrics and choose the one that best reflects the original problem.", worksheet: "Success Metric Selector", output: "Selected metric + justification" },
      { activity: "Before vs. After", description: "Document your reference point (a before-state baseline, benchmark, control/comparison condition, or existing standard, as appropriate to your project) and compare it with the measured result.", worksheet: "Baseline / Benchmark / Comparison Sheet", output: "Reference point/result comparison" },
      { activity: "Numbers + Stories", description: "Pair at least one quantitative result with one qualitative observation, quote, or story.", worksheet: "Quantitative / Qualitative Evidence Table", output: "Mixed-evidence summary" },
      { activity: "What Else Could Explain This?", description: "Identify patterns, anomalies, and at least one alternative explanation for the result.", worksheet: "Data Interpretation Worksheet", output: "Written interpretation + alternative explanation" },
      { activity: "Claim Audit", description: "Compare every major impact claim against the actual evidence and rewrite anything overstated.", worksheet: "Responsible Claims Check", output: "Evidence-aligned claims" },
      { activity: "Name the Weak Spot", description: "Identify sample, timing, location, method, or other limitations honestly.", worksheet: "Limitations Log", output: "Limitations section" },
      { activity: "What Else Changed?", description: "Look for positive, neutral, or negative effects you did not originally intend to create.", worksheet: "Unintended Consequences Check", output: "Side-effect findings" },
      { activity: "Who Benefited, Who Didn't?", description: "Compare effects across affected stakeholder groups.", worksheet: "Stakeholder Impact Matrix", output: "Stakeholder-by-stakeholder impact view" },
      { activity: "Was It Worth It?", description: "Compare money, time, effort, materials, and other resources against the benefit produced.", worksheet: "Cost vs. Benefit Worksheet", output: "Cost-benefit summary" },
      { activity: "What Else Changed?", description: "Identify competing explanations and decide how strongly you can claim the solution caused the result.", worksheet: "Data Interpretation Worksheet", output: "Causation-strength statement" },
      { activity: "Early Signal vs. Final Result", description: "Identify one leading and one lagging indicator.", worksheet: "Success Metric Selector", output: "Leading/lagging indicator pair" },
      { activity: "Did It Stick?", description: "Track whether people continued using, following, or implementing the solution after the initial test.", worksheet: "Adoption / Uptake Tracker", output: "Adoption/uptake evidence" },
      { activity: "10× Test", description: "Imagine the project operating at ten times the pilot size and identify what would break or need to change.", worksheet: "Scalability Check", output: "Scalability risks + changes needed" },
      { activity: "Break Down the Cost", description: "Calculate pilot cost and, where relevant, cost per person/use/beneficiary.", worksheet: "Cost per User / Use Calculator", output: "Simple cost metric" },
      { activity: "Is the Return Worth It?", description: "Calculate simple ROI or unit economics only where the project supports a meaningful calculation.", worksheet: "ROI / Unit Economics Worksheet", output: "ROI/unit-economics summary" },
      { activity: "Strengthen the Claim", description: "Design a stronger comparison, causal check, or forecast using available data.", worksheet: "Advanced Analysis Planning Sheet", output: "Advanced analysis plan/result" },
    ],
    supporting: [
      { activity: "Impact Evidence Collection Plan", supporting: true, why: "Prevents students from trying to invent a reference point after the pilot.", worksheet: "Success Metric Selector + Baseline / Benchmark / Comparison Sheet", output: "What will be measured, when, from whom, and how" },
      { activity: "Evidence Quality Check", supporting: true, why: "Keeps the Impact Report credible.", worksheet: "Evidence Tracker + Responsible Claims Check", output: "Check for missing, weak, biased, or unsupported evidence" },
      { activity: "Final Impact Conclusion", supporting: true, why: "Forces students to state what the evidence actually proved.", worksheet: "Impact Statement Builder", output: "Supported / partially supported / not supported conclusion" },
    ],
  },
  INFLUENCE: {
    byTopic: [
      { activity: "Audience Shift", description: "Identify the target audience, what they care about, what they already know, and what decision you want them to make.", worksheet: "Audience Map", output: "Audience profile + communication priorities" },
      { activity: "Tell the Journey", description: "Turn the six stages into a concise story where each major claim is backed by evidence.", worksheet: "Story Arc Builder", output: "Evidence-based pitch storyline" },
      { activity: "Show the Evidence", description: "Convert the strongest result into a clear chart, diagram, image, comparison, or other visual.", worksheet: "Visual Evidence Planner", output: "1+ evidence visuals" },
      { activity: "60-Second Demo", description: "Demonstrate the solution in action with minimal explanation.", worksheet: "Demo Planner", output: "Rehearsed demo sequence" },
      { activity: "Prove the Claim", description: "Take the three strongest claims and identify exactly what evidence supports each.", worksheet: "Evidence Defense Sheet", output: "Claim-to-evidence map" },
      { activity: "Hot Seat", description: "Generate and practice answering the hardest questions a skeptical reviewer could ask.", worksheet: "Tough Questions / Q&A Prep", output: "Prepared responses to critical questions" },
      { activity: "Beyond the Competition", description: "Define who uses, maintains, supports, approves, or continues the solution after i3League.", worksheet: "Implementation & Sustainability Model", output: "Implementation/sustainability plan" },
      { activity: "Make the Decision Easy", description: "Define exactly what you want the audience to approve, support, fund, test, adopt, or investigate next.", worksheet: "Ask Builder", output: "1 specific closing Ask" },
      { activity: "Build the Evidence Trail", description: "Assemble the required artifacts from all six stages in a logical sequence.", worksheet: "Innovation Portfolio Checklist", output: "Complete Innovation Portfolio" },
      { activity: "What Changed in Me and the Idea?", description: "Compare what you believed at the beginning with what the evidence taught you.", worksheet: "Reflection Worksheet", output: "Final reflection + next direction" },
      { activity: "What Would This Really Take?", description: "Identify people, time, money, materials, technology, permissions, and other resources needed.", worksheet: "Resource & Budget Planner", output: "Resource and budget plan" },
      { activity: "How Does This Continue?", description: "Identify the financial/support model that actually fits the project.", worksheet: "Funding / Support Model", output: "Revenue/funding/support approach" },
      { activity: "Who Needs to Say Yes?", description: "Identify organizations, people, departments, experts, or institutions needed for implementation.", worksheet: "Partnership Map", output: "Priority partner list + roles" },
      { activity: "Implementation Pre-Mortem", description: "Imagine implementation failed and identify the most likely reasons and responses.", worksheet: "Risk & Mitigation Plan", output: "Key implementation risks + mitigation" },
      { activity: "One-Page Decision Brief", description: "Summarize problem, evidence, solution, impact, implementation, and Ask.", worksheet: "Executive Summary Template", output: "1-page executive summary" },
      { activity: "From Pilot to Adoption", description: "Map the next realistic path for reaching additional users, organizations, or adopters.", worksheet: "Adoption / Go-to-Market Plan", output: "Adoption/growth pathway" },
      { activity: "Size It With Evidence", description: "Estimate the relevant population, opportunity, or market using credible data.", worksheet: "Opportunity Sizing Worksheet", output: "Evidence-backed opportunity estimate" },
      { activity: "How Would This Work for Real?", description: "Map the technical components, dependencies, data flows, infrastructure, or deployment requirements.", worksheet: "Technical Architecture Template", output: "Architecture/deployment plan" },
    ],
    supporting: [
      { activity: "Pitch Evidence Audit", supporting: true, why: "Prevents unsupported storytelling.", worksheet: "Evidence Defense Sheet + Innovation Portfolio Checklist", output: "Every major pitch claim traced to portfolio evidence" },
      { activity: "Pitch Rehearsal & Timing", supporting: true, why: "Ensures students can deliver within competition limits.", worksheet: "Demo Planner + Story Arc Builder", output: "Full timed rehearsal" },
      { activity: "Mock Reviewer Q&A", supporting: true, why: "Tests whether students can truly defend the work.", worksheet: "Tough Questions / Q&A Prep", output: "Reviewer feedback + revised answers" },
      { activity: "Final Ask Test", supporting: true, why: "Ensures the pitch ends in a real decision.", worksheet: "Ask Builder + Audience Map", output: "Audience-appropriate final Ask" },
    ],
  },
};
