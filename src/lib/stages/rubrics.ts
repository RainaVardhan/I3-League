import type { DetailedRubric } from "@/lib/stage-copy";

// GENERATED from docs/curriculum/04_REVIEW/i3league-stage{3,4,5,6}-rubric.md by a
// one-off script (em dashes rewritten). Verbatim otherwise.

export const RUBRICS_3_TO_6: Record<"IMAGINE" | "ITERATE" | "IMPACT" | "INFLUENCE", DetailedRubric> = {
  IMAGINE: {
    gateQuestion: "Has the team selected a defensible concept and does it know exactly what it must learn next?",
    notJudging: "We are judging solution reasoning, not prototype polish.",
    nonNegotiables: ["At least 3 genuinely different concepts were explored", "Selection followed, not preceded, the Decision Matrix", "A specific, non-trivial Critical Assumption is named"],
    dimensions: [
      {
        name: "Evidence Quality",
        checks: ["Do the concepts trace back to real needs identified in Stages 1–2?", "Is the value proposition grounded in evidence rather than assumption?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "Concepts have no clear connection to the research findings or affected group from earlier stages." },
          { level: "Developing", descriptor: "Some connection to earlier evidence exists, but concepts are only loosely tied to actual identified needs." },
          { level: "Meets Standard", descriptor: "Concepts clearly trace back to needs and evidence established in Stages 1–2." },
          { level: "Strong Evidence", descriptor: "Every major concept element is explicitly justified by a specific piece of prior evidence or research finding." },
        ],
      },
      {
        name: "Reasoning & Interpretation",
        checks: ["Was the Decision Matrix completed before the concept was selected, or after, to justify a favorite?", "Is the final choice actually supported by the comparison?", "Is the critical assumption genuinely capable of weakening or killing the concept if false?"],
        note: "Key test: Reviewer should be able to complete: \"We chose this concept because ___, and the thing that could prove us wrong is ___.\" Both halves must be genuinely supported.",
        levels: [
          { level: "Not Yet Evident", descriptor: "Only one real idea was explored, or the Decision Matrix appears reverse-engineered to justify a concept already chosen. The critical assumption is trivial or unfalsifiable." },
          { level: "Developing", descriptor: "Multiple concepts exist but comparison reasoning is thin, or the critical assumption is only loosely connected to what would actually make the concept fail." },
          { level: "Meets Standard", descriptor: "The Decision Matrix genuinely informed the selection, and the critical assumption is one that, if wrong, would meaningfully weaken or kill the concept." },
          { level: "Strong Evidence", descriptor: "The comparison reasoning is transparent and rigorous, and the critical assumption is sharply and specifically identified as the single highest-leverage thing to test next." },
        ],
      },
      {
        name: "Process Rigor",
        checks: ["Were at least 3 genuinely different concepts generated (not variations of one idea)?", "Were constraints, risk, accessibility, ethics, and AI fit (if relevant) actually considered for the concepts, not just the winner?", "Did selection happen only after comparison, per the required sequence?"],
        note: "Non-negotiable: Students cannot begin with \"this is the idea we're building.\" Alternatives must be genuinely explored first.",
        levels: [
          { level: "Not Yet Evident", descriptor: "Fewer than 3 genuinely different concepts were generated, or the required sequence (Explore → Compare → Decide) was skipped, the team appears to have decided first." },
          { level: "Developing", descriptor: "3 concepts exist but some are cosmetic variations of the same idea, or constraints/risk/accessibility/ethics checks were only applied superficially." },
          { level: "Meets Standard", descriptor: "At least 3 genuinely different concepts were explored and evaluated against constraints, risk, accessibility, ethics, and AI fit (where relevant), in the correct sequence." },
          { level: "Strong Evidence", descriptor: "The exploration process visibly broadened the team's thinking, the final concept benefits from ideas or considerations surfaced by the alternatives that weren't chosen." },
        ],
      },
      {
        name: "Integrity & Reflection",
        checks: ["Is originality honestly disclosed, what's original vs. adapted vs. inspired by existing work?", "Is attribution given where due?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "An adapted or borrowed concept is presented as entirely original, with no disclosure of inspiration or existing work." },
          { level: "Developing", descriptor: "Some acknowledgment of existing work exists but is incomplete or vague about what was adapted versus created." },
          { level: "Meets Standard", descriptor: "The team honestly documents what already exists, what was adapted, what is original, and any attribution needed." },
          { level: "Strong Evidence", descriptor: "The originality record is specific and thoughtful, clearly distinguishing inspiration, adaptation, and original contribution point by point." },
        ],
      },
      {
        name: "Completeness",
        checks: ["value proposition", "user needs", "3+ genuinely different concepts", "constraints", "key risks", "accessibility considerations", "ethical/responsible-design considerations", "AI Fit evaluation (if AI proposed)", "major assumptions", "Originality, Attribution & IP record", "Decision Matrix", "selected concept", "reason for selection", "named Critical Assumption", "(HS: Build vs. Buy vs. Partner analysis)"],
        levels: [
          { level: "Not Yet Evident", descriptor: "Multiple required components are missing, including components necessary to justify the selection." },
          { level: "Developing", descriptor: "Most components are present, but one or more required pieces are incomplete or insufficient." },
          { level: "Meets Standard", descriptor: "All required Stage 3 submission elements are present and usable by the reviewer." },
          { level: "Strong Evidence", descriptor: "All elements are present and clearly connected, the value proposition, comparison, and critical assumption read as one coherent argument." },
        ],
      },
      {
        name: "Communication & Clarity",
        checks: ["Can the reviewer follow why this concept was chosen over the alternatives?", "Is the Decision Matrix easy to interpret?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "The reviewer cannot determine why the selected concept was chosen over the alternatives." },
          { level: "Developing", descriptor: "The comparison is present but requires significant interpretation to understand the selection logic." },
          { level: "Meets Standard", descriptor: "The concepts, comparison, and selection reasoning are clearly presented and easy to follow." },
          { level: "Strong Evidence", descriptor: "The Concept Portfolio makes the entire reasoning trail, from needs to concepts to selection to critical assumption, immediately clear." },
        ],
      },
    ],
  },
  ITERATE: {
    gateQuestion: "Has the team demonstrated a real evidence-driven iteration cycle?",
    notJudging: "We are judging testing and iteration, not final-product completeness.",
    nonNegotiables: ["A real test directly tied to the critical assumption", "Success criteria defined before testing", "Evidence that a revised version was retested"],
    dimensions: [
      {
        name: "Evidence Quality",
        checks: ["Is there an actual test tied to the critical assumption from Stage 3?", "Are observation and opinion recorded separately, not blended?"],
        note: "Load-bearing requirement: A real test tied to the critical assumption must exist. Positive impressions alone cannot substitute for it.",
        levels: [
          { level: "Not Yet Evident", descriptor: "No real test occurred, or the test has no clear connection to the critical assumption. Only vague impressions (\"people liked it\") are offered." },
          { level: "Developing", descriptor: "A test occurred but is loosely connected to the critical assumption, or observation and opinion are blended together without distinction." },
          { level: "Meets Standard", descriptor: "A real test directly targets the critical assumption, with observed behavior and reported opinion recorded separately." },
          { level: "Strong Evidence", descriptor: "The test evidence is rich enough to clearly support or challenge the critical assumption, with behavior and opinion cross-referenced meaningfully." },
        ],
      },
      {
        name: "Reasoning & Interpretation",
        checks: ["Was success defined before testing, not after?", "Does the learning drawn from the test logically follow from what was observed?"],
        note: "Key test: Reviewer should be able to confirm the success criteria were written before the test happened, not reconstructed afterward.",
        levels: [
          { level: "Not Yet Evident", descriptor: "Success criteria were written after seeing the results (or not written at all), or the stated learning doesn't logically follow from what was observed." },
          { level: "Developing", descriptor: "Success criteria exist but are vague, or the connection between test results and stated learning is unclear." },
          { level: "Meets Standard", descriptor: "Success criteria were clearly defined before testing, and the learning drawn from results is logically supported by what was observed." },
          { level: "Strong Evidence", descriptor: "The pre-defined success criteria were specific and measurable, and the team's interpretation of results shows nuanced, honest reasoning, including when results were mixed." },
        ],
      },
      {
        name: "Process Rigor",
        checks: ["Was the prototype fidelity appropriate for what was being tested?", "Was the revised version actually retested?", "For HS: were formal variables/controls identified where appropriate?"],
        note: "Non-negotiable: Test → Learn → Revise → Retest. A revision that was never retested does not complete the loop.",
        levels: [
          { level: "Not Yet Evident", descriptor: "Testing was informal with no structured plan, or a revision was made but never retested." },
          { level: "Developing", descriptor: "A test plan exists but fidelity choice is poorly justified, or the retest is weak or incomplete." },
          { level: "Meets Standard", descriptor: "Prototype fidelity was appropriately matched to the test question, and the revised version was genuinely retested." },
          { level: "Strong Evidence", descriptor: "The fidelity choice, test design, and retest form a tight, well-reasoned loop, each step clearly informed by the one before it." },
        ],
      },
      {
        name: "Integrity & Reflection",
        checks: ["Are failed, partial, surprising, or inconclusive results reported honestly, not filtered out?", "Is at least one meaningful learning documented?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "Only positive feedback is recorded; failures or inconclusive results are omitted or minimized." },
          { level: "Developing", descriptor: "Some acknowledgment of imperfect results exists but is thin or defensive." },
          { level: "Meets Standard", descriptor: "The team honestly records failed, partial, surprising, or inconclusive findings and documents at least one meaningful learning from them." },
          { level: "Strong Evidence", descriptor: "The team treats an unexpected or negative result as valuable evidence and explains clearly how it shaped the next revision." },
        ],
      },
      {
        name: "Completeness",
        checks: ["critical assumption being tested", "MVP/Minimum Testable Version", "fidelity justification", "test question", "success criteria (pre-testing)", "test participants/context", "permissions where necessary", "observations", "participant feedback", "failed/partial/surprising/inconclusive findings", "what was learned", "V1→V2 changes", "reason for each revision", "retest evidence", "(HS: Formal Experiment Design", "technical: Git/README)"],
        levels: [
          { level: "Not Yet Evident", descriptor: "Multiple required components are missing, including components necessary to demonstrate a real iteration cycle." },
          { level: "Developing", descriptor: "Most components are present, but one or more required pieces are incomplete or insufficient." },
          { level: "Meets Standard", descriptor: "All required Stage 4 submission elements are present and usable by the reviewer." },
          { level: "Strong Evidence", descriptor: "All elements are present and clearly connected, the reviewer can follow the V1 → V2 learning trail without needing clarification." },
        ],
      },
      {
        name: "Communication & Clarity",
        checks: ["Can the reviewer follow the version history and understand why each change was made?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "The reviewer cannot reconstruct what changed between versions or why." },
          { level: "Developing", descriptor: "The version history is present but requires significant interpretation to follow." },
          { level: "Meets Standard", descriptor: "The Iteration Log clearly shows what changed at each version and why." },
          { level: "Strong Evidence", descriptor: "The full test → learn → revise → retest trail is immediately clear and easy to follow from start to finish." },
        ],
      },
    ],
  },
  IMPACT: {
    gateQuestion: "Can the team state honestly what changed, what did not, and what the evidence actually supports?",
    notJudging: "We are judging evidence of impact, not whether the result was positive.",
    nonNegotiables: ["A credible baseline, benchmark, comparison condition, or other appropriate reference point exists", "Limitations and alternative explanations are honestly addressed", "The final conclusion matches the evidence, regardless of whether impact was achieved"],
    dimensions: [
      {
        name: "Evidence Quality",
        checks: ["Is there a credible baseline, benchmark, or comparison condition?", "Is the result measured with appropriate quantitative and/or qualitative evidence?"],
        note: "Load-bearing requirement: A credible baseline, benchmark, comparison condition, or other appropriate reference point must exist. Without a meaningful comparison, an impact claim cannot be evaluated.",
        levels: [
          { level: "Not Yet Evident", descriptor: "No baseline, benchmark, or comparison condition exists, or the result is asserted without measurement (\"we finished the solution,\" \"people liked it\")." },
          { level: "Developing", descriptor: "A comparison point exists but is weak, estimated after the fact, or the result evidence is thin." },
          { level: "Meets Standard", descriptor: "A credible baseline, benchmark, or comparison condition and a measured result are both present, with quantitative and/or qualitative evidence appropriate to the project." },
          { level: "Strong Evidence", descriptor: "The comparison point and result are strong and well-documented, and the evidence mix (numbers plus stories, where each is appropriate) gives a fuller, more convincing picture." },
        ],
      },
      {
        name: "Reasoning & Interpretation",
        checks: ["Are alternative explanations for the result considered?", "Are claims proportional to what the evidence actually supports?", "(HS: is correlation vs. causation addressed?"],
        note: "Key test: Reviewer should be able to complete: \"The evidence shows ___ changed, and the most likely reason is ___ (having considered ___ as an alternative).\"",
        levels: [
          { level: "Not Yet Evident", descriptor: "Claims significantly exceed what the evidence supports, or no alternative explanation for the result was ever considered." },
          { level: "Developing", descriptor: "Some interpretation is offered but alternative explanations are shallow or claims are somewhat overstated." },
          { level: "Meets Standard", descriptor: "Claims are proportional to the evidence, and at least one credible alternative explanation is considered and addressed." },
          { level: "Strong Evidence", descriptor: "The interpretation is rigorous and honest, the team actively worked to rule out or account for competing explanations before making its claim." },
        ],
      },
      {
        name: "Process Rigor",
        checks: ["Was the success metric chosen because it reflects the real problem, not because it was easy to measure?", "Was the baseline, benchmark, or comparison condition established before or independent of the result, not reconstructed afterward?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "The metric doesn't meaningfully reflect the original problem, or the comparison point appears to have been estimated after seeing the result." },
          { level: "Developing", descriptor: "The metric is reasonable but its connection to the original problem is not clearly justified." },
          { level: "Meets Standard", descriptor: "The metric was chosen because it reflects the real problem, and the baseline/benchmark/comparison was established independently of the result." },
          { level: "Strong Evidence", descriptor: "Metric selection and comparison-point establishment are clearly and rigorously justified, showing the team thought this through before collecting the result." },
        ],
      },
      {
        name: "Integrity & Reflection",
        checks: ["Are limitations honestly named?", "Are unintended consequences considered?", "Does the final conclusion (supported / partially supported / not supported) match the evidence, even if the impact was not achieved?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "Limitations are hidden or absent, unintended consequences are not considered, or the conclusion overstates what the evidence shows." },
          { level: "Developing", descriptor: "Some limitations or unintended consequences are named but are minimal or vague." },
          { level: "Meets Standard", descriptor: "Limitations, alternative explanations, and unintended consequences are honestly documented, and the stated conclusion matches the evidence, whatever that conclusion is." },
          { level: "Strong Evidence", descriptor: "The team names the specific limitation a skeptical reviewer would raise first, and its conclusion reflects genuine intellectual honesty about what was and wasn't proven." },
        ],
      },
      {
        name: "Completeness",
        checks: ["impact statement", "success metric + why it matters", "baseline/benchmark/comparison", "result", "quantitative evidence (where appropriate)", "qualitative evidence (where appropriate)", "data interpretation", "alternative explanations", "responsible claims", "limitations", "unintended consequences", "stakeholder impact", "cost vs. benefit", "final conclusion (supported/partially supported/not supported)", "(HS: adoption/uptake, scalability, leading/lagging indicators, ROI/unit economics, advanced analysis where applicable)"],
        levels: [
          { level: "Not Yet Evident", descriptor: "Multiple required components are missing, including components necessary to evaluate whether the conclusion is credible." },
          { level: "Developing", descriptor: "Most components are present, but one or more required pieces are incomplete or insufficient." },
          { level: "Meets Standard", descriptor: "All required Stage 5 submission elements are present and usable by the reviewer." },
          { level: "Strong Evidence", descriptor: "All elements are present and clearly connected, baseline, result, interpretation, and conclusion read as one coherent argument." },
        ],
      },
      {
        name: "Communication & Clarity",
        checks: ["Can the reviewer clearly see what changed, compared to what, and how it was measured?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "The reviewer cannot determine what was measured, what changed, or how the conclusion was reached." },
          { level: "Developing", descriptor: "The Impact Report is understandable but requires significant interpretation to follow the evidence to the conclusion." },
          { level: "Meets Standard", descriptor: "Baseline, result, interpretation, and conclusion are clearly presented and easy to follow." },
          { level: "Strong Evidence", descriptor: "The evidence trail from baseline to conclusion is immediately clear, including the honest treatment of limitations." },
        ],
      },
    ],
  },
  INFLUENCE: {
    gateQuestion: "Can the team make a credible, evidence-backed case for what should happen next?",
    notJudging: "We are judging whether the full journey is credible and defensible, not merely presentation charisma.",
    nonNegotiables: ["Every major claim traces to Portfolio evidence", "Mock Reviewer Q&A was completed", "Every team member can explain the project and their own contribution", "The Ask is specific"],
    dimensions: [
      {
        name: "Evidence Quality",
        checks: ["Does every major claim in the pitch trace to evidence from the Portfolio?", "Is at least one strong evidence visual included?"],
        note: "Load-bearing requirement: Every major claim must trace to evidence. A pitch cannot advance on assertions alone, however well delivered.",
        levels: [
          { level: "Not Yet Evident", descriptor: "Major claims are unsupported, or the pitch relies on assertion rather than evidence from the Portfolio." },
          { level: "Developing", descriptor: "Some claims trace to evidence, but key claims are unsupported or the connection is unclear." },
          { level: "Meets Standard", descriptor: "Every major claim clearly traces to specific evidence in the Portfolio, including at least one clear evidence visual." },
          { level: "Strong Evidence", descriptor: "Claims and evidence are tightly and visibly linked throughout, and the visual evidence makes the strongest result immediately understandable." },
        ],
      },
      {
        name: "Reasoning & Interpretation",
        checks: ["Is the Ask specific and matched to what the evidence supports?", "Is the implementation/sustainability plan realistic given the evidence and constraints already established?"],
        note: "Key test: Reviewer should be able to complete: \"Based on what we learned, they are asking for ___, which makes sense because ___.\"",
        levels: [
          { level: "Not Yet Evident", descriptor: "The Ask is vague or absent (\"thank you for listening\"), or the implementation plan ignores constraints and risks already identified earlier in the project." },
          { level: "Developing", descriptor: "An Ask exists but is generic, or the implementation plan is only loosely connected to the evidence and realities of the project." },
          { level: "Meets Standard", descriptor: "The Ask is specific and proportional to the evidence, and the implementation plan realistically accounts for known constraints and risks." },
          { level: "Strong Evidence", descriptor: "The Ask and implementation plan together make a genuinely persuasive, realistic case for a concrete next step." },
        ],
      },
      {
        name: "Process Rigor",
        checks: ["Was Mock Reviewer Q&A actually completed?", "Was the pitch rehearsed and timed?", "Does the presentation follow the required sequence (Know audience → Story → Visualize → Demonstrate → Defend → Implementation → Ask)?"],
        note: "Non-negotiable: Mock Reviewer Q&A is required, not optional.",
        levels: [
          { level: "Not Yet Evident", descriptor: "Mock Reviewer Q&A was not completed, or the pitch appears unrehearsed and disorganized." },
          { level: "Developing", descriptor: "Some preparation occurred but Q&A prep or rehearsal was minimal." },
          { level: "Meets Standard", descriptor: "Mock Reviewer Q&A was completed, the pitch was rehearsed and timed, and it follows a clear, logical sequence." },
          { level: "Strong Evidence", descriptor: "Preparation is thorough, the team anticipated tough questions accurately and the pitch sequence flows naturally from evidence to Ask." },
        ],
      },
      {
        name: "Integrity & Reflection",
        checks: ["Does the team honestly discuss limitations and what remains unknown?", "Can each team member explain the project and their own specific contribution?"],
        note: "Non-negotiable: Every team member must be able to explain the project and their own contribution.",
        levels: [
          { level: "Not Yet Evident", descriptor: "Limitations are glossed over or hidden, or one team member appears to own the entire project while others cannot explain their role." },
          { level: "Developing", descriptor: "Some limitations are acknowledged, but individual accountability is uneven across the team." },
          { level: "Meets Standard", descriptor: "The team honestly discusses limitations and open questions, and every team member can explain both the project and their own specific contribution." },
          { level: "Strong Evidence", descriptor: "The team demonstrates genuine ownership, limitations are discussed candidly, and individual contributions are clear, specific, and consistent across members." },
        ],
      },
      {
        name: "Completeness",
        checks: ["audience definition", "evidence-based story", "clear problem", "research evidence", "solution selection reasoning", "prototype/iteration story", "impact evidence", "strong evidence visual", "appropriate demo", "claims linked to evidence", "limitations", "Implementation & Sustainability Model", "clear Ask", "reflection", "future direction", "Mock Reviewer Q&A completion", "(HS: budget/resources, funding/support model, partnerships, risk/mitigation, executive summary", "Stretch: GTM, opportunity sizing, technical architecture)"],
        levels: [
          { level: "Not Yet Evident", descriptor: "Multiple required components are missing, including components necessary to make the case Finals-ready." },
          { level: "Developing", descriptor: "Most components are present, but one or more required pieces are incomplete or insufficient." },
          { level: "Meets Standard", descriptor: "All required Stage 6 submission elements are present and usable by the reviewer." },
          { level: "Strong Evidence", descriptor: "All elements are present and integrated into one coherent, complete Innovation Portfolio and pitch." },
        ],
      },
      {
        name: "Communication & Clarity",
        checks: ["Can the reviewer follow the full six-stage story without confusion?", "Is the demo and visual evidence clear?", "Could a busy decision-maker understand the project quickly (via the executive summary, where applicable)?"],
        levels: [
          { level: "Not Yet Evident", descriptor: "The reviewer cannot follow the story, evidence, or Ask without significant clarification." },
          { level: "Developing", descriptor: "The pitch is understandable but requires interpretation to connect evidence to conclusions." },
          { level: "Meets Standard", descriptor: "The story, evidence, demo, and Ask are clearly presented and easy to follow." },
          { level: "Strong Evidence", descriptor: "The pitch is concise, coherent, evidence-centered, and makes the full case immediately understandable to the intended audience." },
        ],
      },
    ],
  },
};
