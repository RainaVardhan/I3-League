import type { StageName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStageCopy } from "@/lib/stage-copy";
import type { InsightContent, InvestigateContent } from "@/app/dashboard/[stage]/actions";

// The dashboard's current-stage checklist. Every item is derived from real
// rows the student has actually saved — a text field is "done" once it has
// content, the safety screening is "done" once an admin has cleared it.
// Nothing here is a manual tick: the list reflects the database, so it
// can't drift out of sync with what's really been completed.
//
// There is still no per-checklist-item field in the schema (that's the
// Phase 2 platform-evidence-model), so for the stages whose guided workspace
// isn't built yet (IMAGINE, ITERATE, IMPACT, INFLUENCE) we fall back to the
// curriculum's own "must include" list as a read-only preview — workspacePending
// tells the UI to present it that way rather than as trackable progress.

export type ChecklistItem = { label: string; done: boolean };

// Where a stage submission sits in the stage-gate flow. Today's build only
// ever reaches "not-ready" / "ready" for the current stage (a final submit
// currently advances the stage straight away); "submitted" / "in-review" /
// "revision-requested" / "approved" are here for when the Sprint 6 review
// workflow lands and a submit no longer auto-advances.
export type SubmissionStatus =
  | "not-ready"
  | "ready"
  | "submitted"
  | "in-review"
  | "revision-requested"
  | "approved";

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  "not-ready": "Not ready to submit",
  ready: "Ready to submit",
  submitted: "Submitted",
  "in-review": "In review",
  "revision-requested": "Revision requested",
  approved: "Approved",
};

export type StageChecklist = {
  items: ChecklistItem[];
  doneCount: number;
  total: number;
  /** true for stages with no guided workspace yet — items are a preview, none checkable. */
  workspacePending: boolean;
  /** First unfinished requirement, or null when everything is checked off. */
  nextIncomplete: string | null;
  /** Where this stage's submission stands right now. */
  submissionStatus: SubmissionStatus;
};

function summarize(
  items: ChecklistItem[],
  workspacePending: boolean,
  hasFinalSubmission: boolean
): StageChecklist {
  const doneCount = items.filter((item) => item.done).length;
  const total = items.length;
  const nextIncomplete = items.find((item) => !item.done)?.label ?? null;

  let submissionStatus: SubmissionStatus;
  if (hasFinalSubmission) {
    submissionStatus = "submitted";
  } else if (!workspacePending && total > 0 && doneCount === total) {
    submissionStatus = "ready";
  } else {
    submissionStatus = "not-ready";
  }

  return { items, doneCount, total, workspacePending, nextIncomplete, submissionStatus };
}

function filled(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getStageChecklist(
  studentId: string,
  stageName: StageName,
  projectId: string | null
): Promise<StageChecklist> {
  if (stageName === "INSIGHT" && projectId) {
    const [project, submission] = await Promise.all([
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.submission.findUnique({
        where: {
          studentId_projectId_stageName: { studentId, projectId, stageName: "INSIGHT" },
        },
      }),
    ]);
    const content = (submission?.content ?? {}) as Partial<InsightContent>;
    const named =
      !!project &&
      filled(project.title) &&
      project.title !== "Untitled project" &&
      filled(project.category) &&
      project.category !== "Other";

    return summarize(
      [
        { label: "Project named and innovation area chosen", done: named },
        { label: "What you noticed firsthand", done: filled(content.observation) },
        {
          label: "A clear problem statement, with no solution inside it",
          done: filled(content.problemStatement),
        },
        { label: "Who is affected by the problem", done: filled(content.whoIsAffected) },
        { label: "How often the problem happens", done: filled(content.howOften) },
        { label: "Firsthand evidence the problem is real", done: filled(content.evidence) },
      ],
      false,
      !!submission?.isFinal
    );
  }

  if (stageName === "INVESTIGATE" && projectId) {
    const [submission, safetyReview] = await Promise.all([
      prisma.submission.findUnique({
        where: {
          studentId_projectId_stageName: { studentId, projectId, stageName: "INVESTIGATE" },
        },
      }),
      prisma.safetyReview.findUnique({ where: { projectId } }),
    ]);
    const content = (submission?.content ?? {}) as Partial<InvestigateContent>;

    return summarize(
      [
        {
          label: "Safety screening completed and cleared",
          done: safetyReview?.status === "CLEARED",
        },
        {
          label: "Research findings from more than one kind of source",
          done: filled(content.researchFindings),
        },
        { label: "Conversations with people affected", done: filled(content.conversations) },
        {
          label: "What the research changed about your thinking",
          done: filled(content.whatChangedYourMind),
        },
        { label: "Revised problem statement", done: filled(content.revisedProblemStatement) },
      ],
      false,
      !!submission?.isFinal
    );
  }

  // Stages 3–6: guided workspace not built yet — show the curriculum's own
  // "must include" list as a preview, nothing to auto-check.
  const items = getStageCopy(stageName).submissionChecklist.map((label) => ({
    label,
    done: false,
  }));
  return summarize(items, true, false);
}
