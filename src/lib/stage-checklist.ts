import type { StageName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStageCopy } from "@/lib/stage-copy";
import { insightRequirementsFor, isInsightRequirementMet } from "@/lib/insight-requirements";
import {
  investigateRequirementsFor,
  isHighSchoolGrade,
  isInvestigateRequirementMet,
} from "@/lib/investigate-requirements";
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

// `group` is the stage page the item belongs to (e.g. "Problem Scope"), shown
// small above the label so the list reads in the same order as the pages.
export type ChecklistItem = {
  label: string;
  done: boolean;
  group?: string;
  /** The stage page this item is answered on (the `?page=` id), so the hub can
   *  link the row straight there instead of to the top of the stage. */
  page?: string;
  /** The id of the form element the row should land on within that page. */
  anchor?: string;
  /** Part of the submission but not required to submit: shown so the list is
   *  the whole picture, and left out of the count so "Ready to submit" means
   *  exactly what the Submit button allows. */
  optional?: boolean;
};

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

/** Where a checklist item lives: the exact page and field on a built stage
 *  (`/dashboard/insight?page=empathy#evidence`, which opens that page and
 *  focuses that field), or the stage brief for a stage with no workspace yet.
 *  Shared by the "What's left" rows and the Next action button, so both land
 *  in the same place. */
export function checklistItemHref(
  slug: string,
  item: Pick<ChecklistItem, "page" | "anchor">,
  workspacePending: boolean
): string {
  if (workspacePending) return `/dashboard/${slug}#stage-brief`;
  return item.page
    ? `/dashboard/${slug}?page=${item.page}#${item.anchor ?? "stage-work"}`
    : `/dashboard/${slug}#stage-work`;
}

export type StageChecklist = {
  items: ChecklistItem[];
  doneCount: number;
  total: number;
  /** true for stages with no guided workspace yet — items are a preview, none checkable. */
  workspacePending: boolean;
  /** First unfinished requirement, or null when everything is checked off. */
  nextIncomplete: string | null;
  /** The same item in full, so the hub's Next action can link to its field. */
  nextIncompleteItem: ChecklistItem | null;
  /** Where this stage's submission stands right now. */
  submissionStatus: SubmissionStatus;
};

function summarize(
  items: ChecklistItem[],
  workspacePending: boolean,
  hasFinalSubmission: boolean
): StageChecklist {
  // Only the items that actually gate the Submit button are counted, so
  // "N of M" and "Ready to submit" always agree with what the stage form does.
  const required = items.filter((item) => !item.optional);
  const doneCount = required.filter((item) => item.done).length;
  const total = required.length;
  const nextIncompleteItem = required.find((item) => !item.done) ?? null;
  const nextIncomplete = nextIncompleteItem?.label ?? null;

  let submissionStatus: SubmissionStatus;
  if (hasFinalSubmission) {
    submissionStatus = "submitted";
  } else if (!workspacePending && total > 0 && doneCount === total) {
    submissionStatus = "ready";
  } else {
    submissionStatus = "not-ready";
  }

  return { items, doneCount, total, workspacePending, nextIncomplete, nextIncompleteItem, submissionStatus };
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

    // Built from the shared requirement list, so this checklist is exactly the
    // list the Submit button checks (see src/lib/insight-requirements.ts).
    // title/category live on Project rather than in Submission.content, and the
    // placeholders the form treats as "not chosen yet" are mapped to empty here
    // so the hub and the form agree on whether they are done.
    const answers: Record<string, unknown> = {
      ...content,
      title: project && project.title !== "Untitled project" ? project.title : "",
      category: project && project.category !== "Other" ? project.category : "",
    };

    const items: ChecklistItem[] = insightRequirementsFor(!!project?.teamId).map((item) => ({
      label: item.label,
      group: item.pageLabel,
      page: item.page,
      anchor: item.anchor ?? item.key,
      optional: item.optional,
      done: isInsightRequirementMet(item, answers[item.key]),
    }));

    return summarize(items, false, !!submission?.isFinal);
  }

  if (stageName === "INVESTIGATE" && projectId) {
    const [student, submission, safetyReview] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, select: { grade: true } }),
      prisma.submission.findUnique({
        where: {
          studentId_projectId_stageName: { studentId, projectId, stageName: "INVESTIGATE" },
        },
      }),
      prisma.safetyReview.findUnique({ where: { projectId } }),
    ]);
    const content = (submission?.content ?? {}) as Partial<InvestigateContent>;

    // Built from the shared requirement list, the same one the Submit popup
    // and the server's final check use (src/lib/investigate-requirements.ts).
    // The safety screening counts as done once an admin (or the no-risk
    // screening itself) has CLEARED it.
    const answers: Record<string, unknown> = { ...content, safetyCleared: safetyReview?.status === "CLEARED" };
    const items: ChecklistItem[] = investigateRequirementsFor(isHighSchoolGrade(student?.grade ?? "")).map((item) => ({
      label: item.label,
      group: item.pageLabel,
      page: item.page,
      // The screening's first box; everything else is its own field name.
      anchor: item.key === "safetyCleared" ? "safety-section" : item.key,
      optional: item.optional,
      done: isInvestigateRequirementMet(item, answers[item.key]),
    }));

    return summarize(items, false, !!submission?.isFinal);
  }

  // Stages 3–6: guided workspace not built yet — show the curriculum's own
  // "must include" list as a preview, nothing to auto-check.
  const items = getStageCopy(stageName).submissionChecklist.map((label) => ({
    label,
    done: false,
  }));
  return summarize(items, true, false);
}
