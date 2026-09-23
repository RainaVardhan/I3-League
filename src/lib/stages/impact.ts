import { joinActivities, type GuidedPage, type GuidedStage } from "@/lib/guided-stage";
import { ACTIVITIES_3_TO_6 } from "./activities";

const A = ACTIVITIES_3_TO_6.IMPACT.byTopic;
const SUP = ACTIVITIES_3_TO_6.IMPACT.supporting;

/** The final conclusion's three allowed answers (03_SHOW). */
export const CONCLUSION_OPTIONS = ["Supported", "Partially supported", "Not supported"] as const;

/**
 * Stage 5 (IMPACT) pages, in working order.
 *
 * The curriculum's required sequence is Define Impact → Choose Metric →
 * Establish Reference Point → Measure Result → Analyze → Challenge Your Own
 * Conclusion → Check Stakeholders & Side Effects → Consider Cost → State
 * What the Evidence Actually Supports. The ten CORE topics run in their
 * listed order, then Cost per User (also CORE), then the HS CORE and STRETCH
 * topics, and the stage ends on a Conclusion page with no lesson (the Final
 * Impact Conclusion supporting activity). The other two supporting
 * activities are joined onto the page they belong to: Impact Evidence
 * Collection Plan onto Baseline vs. Result, Evidence Quality Check onto
 * Responsible Claims.
 *
 * HS CORE pages are shown to high school students only. "When relevant" /
 * "where applicable" / STRETCH pages are shown but never gate Submit.
 */
const PAGES: GuidedPage[] = [
  {
    id: "impact",
    label: "Impact Statement",
    title: "What Does Impact Mean?",
    lessonIndex: 0,
    activity: A[0],
    mustInclude: ["Impact statement"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "impactStatement",
            label: "Your impact statement",
            hint: "Complete “Because of our solution, ___ changed for ___.”",
            limit: 1000,
          },
        ],
      },
    ],
  },
  {
    id: "metric",
    label: "Success Metric",
    title: "Choosing the Right Success Metric",
    lessonIndex: 1,
    activity: A[1],
    mustInclude: ["Success metric", "Why that metric matters"],
    reviewerChecks: ["Does the metric actually relate to the original problem?"],
    showNotes: [],
    groups: [
      {
        fields: [
          { key: "successMetric", label: "The success metric you chose", short: true, limit: 500 },
          {
            key: "metricWhy",
            label: "Why that metric matters",
            hint: "Which other metrics you considered, and why this one best reflects the original problem.",
          },
        ],
      },
    ],
  },
  {
    id: "baseline",
    label: "Baseline & Result",
    title: "Baseline / Benchmark / Comparison vs. Result",
    lessonIndex: 2,
    activity: joinActivities(A[2], SUP[0]),
    mustInclude: ["Baseline, benchmark, comparison condition, or other appropriate reference point", "Result"],
    reviewerChecks: ["Is there a credible baseline, benchmark, or comparison condition?", "What changed?", "How was it measured?"],
    showNotes: [
      {
        label: "Load-bearing requirement",
        text: "A credible baseline, benchmark, comparison condition, or other appropriate reference point must exist. Without a meaningful comparison, an impact claim cannot be evaluated.",
      },
    ],
    groups: [
      {
        heading: "Evidence collection plan",
        fields: [
          {
            key: "evidencePlan",
            label: "What you measured, when, from whom, and how",
          },
        ],
      },
      {
        heading: "Before vs. after",
        fields: [
          {
            key: "referencePoint",
            label: "Your reference point",
            hint: "A before-state baseline, a benchmark, a control or comparison condition, an existing standard, or another credible reference point, with its value.",
          },
          { key: "result", label: "Your measured result" },
        ],
      },
    ],
  },
  {
    id: "evidence",
    label: "Numbers & Stories",
    title: "Quantitative vs. Qualitative Evidence",
    lessonIndex: 3,
    activity: A[3],
    mustInclude: ["Quantitative evidence where appropriate", "Qualitative evidence where appropriate"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "quantitativeEvidence",
            label: "Your quantitative evidence",
            hint: "Counts, percentages, measurements.",
            limit: 5000,
          },
          {
            key: "qualitativeEvidence",
            label: "Your qualitative evidence",
            hint: "At least one observation, quote or story that shows what the numbers meant to the people affected.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "interpretation",
    label: "Interpretation",
    title: "Data Analysis & Interpretation Basics",
    lessonIndex: 4,
    activity: A[4],
    mustInclude: ["Data interpretation", "Alternative explanations"],
    reviewerChecks: ["Are alternative explanations acknowledged?"],
    showNotes: [
      {
        label: "Key test",
        text: "Your reviewer should be able to complete: “The evidence shows ___ changed, and the most likely reason is ___ (having considered ___ as an alternative).”",
      },
    ],
    groups: [
      {
        fields: [
          {
            key: "dataInterpretation",
            label: "What your results actually show",
            hint: "Patterns, anomalies, and what is unclear.",
          },
          {
            key: "alternativeExplanations",
            label: "At least one alternative explanation for the result",
          },
        ],
      },
    ],
  },
  {
    id: "claims",
    label: "Responsible Claims",
    title: "Responsible Claims",
    lessonIndex: 5,
    activity: joinActivities(A[5], SUP[1]),
    mustInclude: ["Responsible claims"],
    reviewerChecks: ["Are claims proportional to the evidence?"],
    showNotes: [],
    groups: [
      {
        heading: "Claim audit",
        fields: [
          {
            key: "responsibleClaims",
            label: "Your impact claims, each matched to its evidence",
            hint: "Rewrite anything that goes further than the evidence supports. One claim per line, with the evidence beside it.",
            limit: 5000,
          },
        ],
      },
      {
        heading: "Evidence quality check",
        fields: [
          {
            key: "evidenceQualityCheck",
            label: "Missing, weak, biased or unsupported evidence you found, and what you did about it",
          },
        ],
      },
    ],
  },
  {
    id: "limitations",
    label: "Limitations",
    title: "Limitations & Research Integrity",
    lessonIndex: 6,
    activity: A[6],
    mustInclude: ["Limitations"],
    reviewerChecks: ["Are limitations clearly stated?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "limitations",
            label: "The limitations of your results",
            hint: "Sample, timing, location, method, or anything else that means the results might not apply everywhere.",
          },
        ],
      },
    ],
  },
  {
    id: "unintended",
    label: "Side Effects",
    title: "Unintended Consequences",
    lessonIndex: 7,
    activity: A[7],
    mustInclude: ["Unintended consequences"],
    reviewerChecks: ["Were unintended consequences investigated?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "unintendedConsequences",
            label: "What else changed",
            hint: "Positive, neutral or negative effects you did not set out to create. If you looked and found none, say where you looked.",
          },
        ],
      },
    ],
  },
  {
    id: "stakeholders",
    label: "Stakeholders",
    title: "Impact Across Stakeholders",
    lessonIndex: 8,
    activity: A[8],
    mustInclude: ["Impact across relevant stakeholders"],
    reviewerChecks: ["Did different stakeholders experience different outcomes?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "stakeholderImpact",
            label: "Who benefited, who didn't",
            hint: "The effect on each stakeholder group, one per line.",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "cost",
    label: "Cost vs. Benefit",
    title: "Cost vs. Benefit",
    lessonIndex: 9,
    activity: A[9],
    mustInclude: ["Cost vs. benefit"],
    reviewerChecks: ["Was the benefit worth the cost/resources?"],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "costBenefit",
            label: "Was it worth it?",
            hint: "The money, time, effort, materials and other resources it took, against the benefit it produced.",
          },
        ],
      },
    ],
  },
  {
    id: "costper",
    label: "Cost per Use",
    title: "Cost per User / Cost per Use / Pilot Cost",
    lessonIndex: 14,
    activity: A[14],
    mustInclude: ["Cost vs. benefit"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "costPerUse",
            label: "Your pilot cost, and cost per person or per use",
            hint: "Total pilot cost, how many people or uses it served, and the simple per-person or per-use figure.",
            limit: 1000,
          },
        ],
      },
    ],
  },
  {
    id: "causation",
    label: "Causation",
    title: "Correlation vs. Causation",
    lessonIndex: 10,
    hsOnly: true,
    activity: A[10],
    mustInclude: ["Alternative explanations"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "causationStrength",
            label: "How strongly can you claim your solution caused the result?",
            hint: "What else changed at the same time, and how confident you are, and why, that the solution rather than something else explains the change.",
          },
        ],
      },
    ],
  },
  {
    id: "indicators",
    label: "Indicators",
    title: "Leading vs. Lagging Indicators",
    lessonIndex: 11,
    hsOnly: true,
    activity: A[11],
    mustInclude: ["Leading/lagging indicators"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "leadingLagging",
            label: "One leading and one lagging indicator",
            hint: "The early signal that predicts your result, and the later result that confirms it.",
            limit: 1000,
          },
        ],
      },
    ],
  },
  {
    id: "adoption",
    label: "Adoption",
    title: "Adoption, Uptake & Usage Metrics",
    lessonIndex: 12,
    hsOnly: true,
    optionalTag: "When relevant",
    activity: A[12],
    mustInclude: ["Adoption/Uptake, where applicable"],
    reviewerChecks: [],
    showNotes: [{ text: "For solutions people choose to use, follow or implement. Leave this page blank if adoption does not apply to your project." }],
    groups: [
      {
        fields: [
          {
            key: "adoptionEvidence",
            label: "Did it stick?",
            hint: "Whether people kept using, following or implementing the solution after the first test, and the evidence for it.",
          },
        ],
      },
    ],
  },
  {
    id: "scalability",
    label: "Scalability",
    title: "Scalability",
    lessonIndex: 13,
    hsOnly: true,
    activity: A[13],
    mustInclude: ["Scalability"],
    reviewerChecks: [],
    showNotes: [],
    groups: [
      {
        fields: [
          {
            key: "scalability",
            label: "The 10× test: what would break or need to change",
            hint: "Imagine the project running at ten times the pilot size.",
          },
        ],
      },
    ],
  },
  {
    id: "roi",
    label: "ROI",
    title: "Unit Economics & ROI",
    lessonIndex: 15,
    hsOnly: true,
    optionalTag: "Where applicable",
    activity: A[15],
    mustInclude: ["ROI/unit economics, where applicable"],
    reviewerChecks: [],
    showNotes: [{ text: "Only where your project supports a meaningful calculation. Leave this page blank if it does not." }],
    groups: [
      {
        fields: [
          {
            key: "roiSummary",
            label: "Your ROI or unit-economics summary",
            hint: "The cost and value of one unit at scale, or the benefit gained against the cost required to get it.",
          },
        ],
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced Analysis",
    title: "Advanced Causal Analysis / Forecasting",
    lessonIndex: 16,
    optionalTag: "Stretch",
    activity: A[16],
    mustInclude: ["Advanced analysis, where applicable"],
    reviewerChecks: [],
    showNotes: [{ text: "Stretch work for advanced or complex projects. Leave this page blank unless you have a genuine comparison case or forecast." }],
    groups: [
      {
        fields: [
          {
            key: "advancedAnalysis",
            label: "Your stronger comparison, causal check or forecast",
            limit: 5000,
          },
        ],
      },
    ],
  },
  {
    id: "conclusion",
    label: "Conclusion",
    title: "Final Impact Conclusion",
    activity: SUP[2],
    mustInclude: ["Final conclusion: Supported / Partially supported / Not supported"],
    reviewerChecks: ["Does the final conclusion match the evidence?"],
    showNotes: [
      {
        text: "A null or negative result can advance. The project does not have to prove the solution worked; it has to prove learning with credible evidence.",
      },
    ],
    groups: [
      {
        fields: [
          { key: "finalConclusion", label: "What the evidence supports", options: CONCLUSION_OPTIONS },
          {
            key: "conclusionReasoning",
            label: "Why the evidence supports that conclusion",
            hint: "State honestly what changed, what did not, and what your evidence actually proves.",
          },
        ],
      },
    ],
  },
];

export const IMPACT_STAGE: GuidedStage = {
  stageName: "IMPACT",
  submitLabel: "Submit Impact",
  pages: PAGES,
  keepNote:
    "These answers make up your Impact Report: Impact Statement + Success Metric + Reference Point + Results + Quantitative/Qualitative Evidence + Interpretation + Limitations + Unintended Consequences + Stakeholder Impact + Cost Analysis + Final Conclusion. Your worksheets are not uploaded; they stay with you.",
};
