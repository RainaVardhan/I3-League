"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getOrCreateStudentProject } from "@/lib/project";
import { getActiveSeason } from "@/lib/season";
import { INSIGHT_EVIDENCE_TYPES } from "@/lib/insight-requirements";
import { completeStage } from "@/lib/stage-progress";
import { saveUploadedFile } from "@/lib/storage";
import { INNOVATION_FIELDS } from "@/lib/innovation-fields";
import { TEXT_LIMITS, type TextField } from "@/lib/stage-field-limits";
import {
  EVIDENCE_TYPES,
  INVESTIGATE_TEXT_KEYS,
  investigateRequirementsFor,
  isHighSchoolGrade,
  isInvestigateRequirementMet,
  type InvestigateTextKey,
} from "@/lib/investigate-requirements";

export type StageFormState = { error: string | null };

// Exported as types only (erased at compile time) — a "use server" file may
// only export async functions at runtime, but a type-only export doesn't
// exist at runtime, so page.tsx can still import these for typing its own
// reads of Submission.content.
// Matches docs/curriculum/05_BUILD/i3league-stage1-submission-reviewer.md
// Part A ("Student Submission Template") field-for-field. Two simplifications
// versus the doc, both noted where relevant: Section 2's observations are one
// free-text field instead of checkbox-selected saved Friction Log entries,
// and Section 6's "Team Charter status" is a self-reported checkbox instead
// of being read from a separately-modeled Team Charter document — neither
// exists as its own entity yet (that's the deferred platform-evidence-model /
// evidence-ID architecture from docs/curriculum/05_BUILD).
export type InsightContent = {
  // Section 1 — The problem
  problemStatement: string;
  whoIsAffected: string;
  whereItHappens: string;
  whenItHappens: string;
  whyItMatters: string;

  // Section 2 — Observation evidence
  observations: string;

  // Section 3 — Firsthand evidence
  participantLabel: string;
  participantConnection: string;
  whatLearned: string;
  evidenceType: string;
  firsthandEvidence: string;
  consentGiven: boolean;
  permissionToUse: boolean;
  privacyRemoved: boolean;
  rulesFollowed: boolean;

  // Section 4 — What changed in your thinking
  before: string;
  now: string;
  whatCausedChange: string;

  // Section 5 — Scope
  whyManageable: string;

  // Section 6 — Team confirmation (team projects only; this student's own answers)
  teamCharterComplete: boolean;
  teamUnderstandsProblem: boolean;
  teamUnderstandsEvidence: boolean;
  teamCanExplainLearning: boolean;
  teamAgreesRepresents: boolean;


  photoUrl: string | null;
};

// One key per field in src/lib/investigate-requirements.ts (every text field,
// plus the ticked evidence types). Drafts saved before this form existed used
// different keys; those are simply ignored.
export type InvestigateContent = Record<InvestigateTextKey, string> & {
  evidenceTypes: string[];
};

const SAFETY_CATEGORIES = [
  "humans",
  "animals",
  "healthInfo",
  "chemicals",
  "biologicalMaterials",
  "electricity",
  "machinery",
  "pii",
  "environmentalSampling",
  "drones",
  "ai",
] as const;


const TOO_LONG_ERROR =
  "One of your answers is longer than this form allows. Please shorten it and try again.";

// Reads the listed text fields, trimmed. Returns an error rather than silently
// truncating, so nothing a student actually typed is ever quietly thrown away.
function readTextFields<K extends TextField>(
  formData: FormData,
  fields: readonly K[]
): { values: Record<K, string>; error: string | null } {
  const values = {} as Record<K, string>;
  for (const field of fields) {
    const value = String(formData.get(field) ?? "").trim();
    if (value.length > TEXT_LIMITS[field]) {
      return { values, error: TOO_LONG_ERROR };
    }
    values[field] = value;
  }
  return { values, error: null };
}

const AI_TEXT_FIELDS = ["aiToolName", "aiPurpose", "aiSelfCreatedPortion", "aiVerificationMethod"] as const;

const INSIGHT_TEXT_FIELDS = [
  "title",
  "category",
  "problemStatement",
  "whoIsAffected",
  "whereItHappens",
  "whenItHappens",
  "whyItMatters",
  "observations",
  "participantLabel",
  "participantConnection",
  "whatLearned",
  "evidenceType",
  "firsthandEvidence",
  "before",
  "now",
  "whatCausedChange",
  "whyManageable",
] as const;


async function requireCurrentStudent() {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }
  const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
  if (!student) {
    redirect("/register");
  }
  // Same gate as the stage page: stage work needs this student's own payment
  // to be VERIFIED for the active season. Checked here too because a direct
  // POST never loads the page, and a payment can be moved back to REJECTED or
  // REFUNDED after the stages were unlocked. Per student, never per team.
  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
    include: { payment: true },
  });
  if (enrollment?.payment?.status !== "VERIFIED") {
    redirect("/dashboard");
  }
  return student;
}

// Re-checked here, not just on the page — a direct POST to this action
// (bypassing the page's own LOCKED/COMPLETE guard) must not be able to
// write to a stage the student hasn't reached yet, or re-submit one that's
// already done. Same "defense in depth" pattern as the rest of this
// codebase's server actions.
async function requireCurrentStage(studentId: string, stageName: "INSIGHT" | "INVESTIGATE") {
  const stageProgress = await prisma.stageProgress.findUnique({
    where: { studentId_stageName: { studentId, stageName } },
  });
  if (!stageProgress || stageProgress.status !== "CURRENT") {
    redirect(`/dashboard/${stageName.toLowerCase()}`);
  }
}

// CLAUDE.md: "AI-use disclosure is required on every stage's SUBMIT step."
// Read once, reused for both validating a final submit and writing the
// AIDisclosure row. Returns an error if any field is over its cap.
function readAiDisclosure(formData: FormData) {
  const answer = formData.get("usedAi");
  const usedAi = answer === "yes";
  const { values, error } = readTextFields(formData, AI_TEXT_FIELDS);
  return {
    error,
    /** The student actually answered yes or no. The form always sends one;
     *  a final submit without it (a crafted POST) is refused, so the
     *  disclosure can never be skipped. */
    answered: answer === "yes" || answer === "no",
    disclosure: {
      usedAi,
      toolName: usedAi ? values.aiToolName || null : null,
      purpose: usedAi ? values.aiPurpose || null : null,
      selfCreatedPortion: usedAi ? values.aiSelfCreatedPortion || null : null,
      verificationMethod: usedAi ? values.aiVerificationMethod || null : null,
    },
  };
}

// Shared by the final submit and the background autosave: validates (final
// only), writes the Submission/Project rows, and completes the stage on a
// final submit. Returns instead of redirecting so autosave can call it
// without reloading the page.
async function persistInsight(formData: FormData, intent: "draft" | "final"): Promise<StageFormState> {
  const student = await requireCurrentStudent();
  await requireCurrentStage(student.id, "INSIGHT");
  const project = await getOrCreateStudentProject(student.id);

  const { values, error: tooLong } = readTextFields(formData, INSIGHT_TEXT_FIELDS);
  if (tooLong) return { error: tooLong };
  const {
    title,
    category,
    problemStatement,
    whoIsAffected,
    whereItHappens,
    whenItHappens,
    whyItMatters,
    observations,
    participantLabel,
    participantConnection,
    whatLearned,
    evidenceType,
    firsthandEvidence,
    before,
    now,
    whatCausedChange,
    whyManageable,
  } = values;

  const consentGiven = formData.get("consentGiven") === "on";
  const permissionToUse = formData.get("permissionToUse") === "on";
  const privacyRemoved = formData.get("privacyRemoved") === "on";
  const rulesFollowed = formData.get("rulesFollowed") === "on";

  const teamCharterComplete = formData.get("teamCharterComplete") === "on";
  const teamUnderstandsProblem = formData.get("teamUnderstandsProblem") === "on";
  const teamUnderstandsEvidence = formData.get("teamUnderstandsEvidence") === "on";
  const teamCanExplainLearning = formData.get("teamCanExplainLearning") === "on";
  const teamAgreesRepresents = formData.get("teamAgreesRepresents") === "on";

  const { disclosure: aiDisclosure, answered: aiAnswered, error: aiTooLong } = readAiDisclosure(formData);
  if (aiTooLong) return { error: aiTooLong };

  // Only ever one of the three offered choices, like the category below.
  const evidenceTypeIsValid = (INSIGHT_EVIDENCE_TYPES as readonly string[]).includes(evidenceType);

  // Only ever persisted when it is one of the known innovation fields, on a
  // draft as well as a final submit — otherwise a crafted POST could put
  // arbitrary text in Project.category, which is shown back on the dashboard.
  const categoryIsValid = (INNOVATION_FIELDS as readonly string[]).includes(category);

  if (intent === "final") {
    // The project row itself says whether this is a team project; no separate
    // teamMembership lookup, and it is only needed for this validation, so
    // autosave never pays for it.
    const isTeamProject = project.teamId !== null;

    if (!title || !categoryIsValid) {
      return { error: "Please give your project a title and choose a category." };
    }
    if (
      !problemStatement ||
      !whoIsAffected ||
      !whereItHappens ||
      !whenItHappens ||
      !whyItMatters ||
      !observations ||
      !participantLabel ||
      !participantConnection ||
      !whatLearned ||
      !evidenceTypeIsValid ||
      !firsthandEvidence ||
      !before ||
      !now ||
      !whatCausedChange ||
      !whyManageable
    ) {
      return { error: "Please fill in every required field before submitting." };
    }
    if (!consentGiven || !permissionToUse || !privacyRemoved || !rulesFollowed) {
      return { error: "Please confirm all four responsible-research checks before submitting." };
    }
    if (isTeamProject && (!teamUnderstandsProblem || !teamUnderstandsEvidence || !teamCanExplainLearning || !teamAgreesRepresents)) {
      return { error: "Please complete your team member confirmation before submitting." };
    }
    if (!aiAnswered) {
      return { error: "Please answer whether you used AI for this stage." };
    }
    if (aiDisclosure.usedAi && (!aiDisclosure.toolName || !aiDisclosure.purpose)) {
      return { error: "Please fill in which AI tool you used and what for." };
    }
  }

  const existing = await prisma.submission.findUnique({
    where: {
      studentId_projectId_stageName: { studentId: student.id, projectId: project.id, stageName: "INSIGHT" },
    },
  });
  // A late autosave must never turn a submitted stage back into a draft.
  if (intent === "draft" && existing?.isFinal) return { error: null };
  const existingContent = existing?.content as InsightContent | undefined;

  // A rejected photo must not cost the student the answers they have typed:
  // on a draft the text is still written and the problem is reported
  // afterwards, keeping whatever photo was already saved. A final submit
  // still stops, so nobody submits believing a photo went with it.
  const photo = formData.get("photo");
  let photoUrl: string | null = existingContent?.photoUrl ?? null;
  let photoError: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    try {
      photoUrl = await saveUploadedFile(photo, "insight-photos");
    } catch (err) {
      if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
        photoError = "That photo is too large. Please keep it under 5MB.";
      } else if (err instanceof Error && err.message === "FILE_TYPE_NOT_ALLOWED") {
        photoError = "Please upload a PNG, JPEG, or WebP image.";
      } else {
        throw err;
      }
      if (intent === "final") return { error: photoError };
    }
  }

  const content: InsightContent = {
    problemStatement,
    whoIsAffected,
    whereItHappens,
    whenItHappens,
    whyItMatters,
    observations,
    participantLabel,
    participantConnection,
    whatLearned,
    evidenceType: evidenceTypeIsValid ? evidenceType : "",
    firsthandEvidence,
    consentGiven,
    permissionToUse,
    privacyRemoved,
    rulesFollowed,
    before,
    now,
    whatCausedChange,
    whyManageable,
    teamCharterComplete,
    teamUnderstandsProblem,
    teamUnderstandsEvidence,
    teamCanExplainLearning,
    teamAgreesRepresents,
    photoUrl,
  };

  // Autosave runs about once a second while typing, so the Project row is only
  // written when the title or category actually changed.
  const nextTitle = title && title !== project.title ? title : undefined;
  const nextCategory = categoryIsValid && category !== project.category ? category : undefined;

  await prisma.$transaction(async (tx) => {
    if (nextTitle !== undefined || nextCategory !== undefined) {
      await tx.project.update({
        where: { id: project.id },
        data: {
          ...(nextTitle !== undefined ? { title: nextTitle } : {}),
          ...(nextCategory !== undefined ? { category: nextCategory } : {}),
        },
      });
    }

    // A draft only ever updates a row that is still a draft (the isFinal
    // condition is checked by the database in the same statement), so an
    // autosave that races a final submit can't undo it.
    if (intent === "draft" && existing) {
      await tx.submission.updateMany({ where: { id: existing.id, isFinal: false }, data: { content } });
      return;
    }

    const submission = await tx.submission.upsert({
      where: {
        studentId_projectId_stageName: { studentId: student.id, projectId: project.id, stageName: "INSIGHT" },
      },
      update: {
        content,
        isFinal: intent === "final",
        submittedAt: intent === "final" ? new Date() : existing?.submittedAt ?? null,
      },
      create: {
        studentId: student.id,
        projectId: project.id,
        stageName: "INSIGHT",
        content,
        isFinal: intent === "final",
        submittedAt: intent === "final" ? new Date() : null,
      },
    });

    if (intent === "final") {
      await tx.aIDisclosure.upsert({
        where: { submissionId: submission.id },
        update: aiDisclosure,
        create: { submissionId: submission.id, ...aiDisclosure },
      });
    }
  });

  if (intent === "final") {
    await completeStage(student.id, "INSIGHT");
  }

  return { error: photoError };
}

export async function saveInsightAction(
  _prevState: StageFormState,
  formData: FormData
): Promise<StageFormState> {
  const intent = formData.get("intent") === "final" ? "final" : "draft";
  const result = await persistInsight(formData, intent);
  if (result.error) {
    return result;
  }
  redirect("/dashboard/insight");
}

// Background autosave for the Insight form (no Save draft button any more):
// always a draft, never redirects, and never writes the AI-use disclosure
// (that is only recorded on the final submit).
export async function autosaveInsightAction(formData: FormData): Promise<StageFormState> {
  return persistInsight(formData, "draft");
}

// Project-level, not per-student — SafetyReview.projectId is @unique, so
// this covers the whole team at once. Once it exists it's not
// resubmittable by a student; only an admin can clear a PENDING_REVIEW
// project (CLAUDE.md "Safety screening").
export async function saveSafetyScreeningAction(
  _prevState: StageFormState,
  formData: FormData
): Promise<StageFormState> {
  const student = await requireCurrentStudent();
  await requireCurrentStage(student.id, "INVESTIGATE");
  const project = await getOrCreateStudentProject(student.id);

  // The screening lives inside the Investigate page's one shared form layout
  // (see InvestigateForm), so it refreshes the page in place rather than
  // redirecting: a redirect would drop ?page= and send the student back to
  // the first page.
  const existingReview = await prisma.safetyReview.findUnique({ where: { projectId: project.id } });
  if (existingReview) {
    revalidatePath("/dashboard/investigate");
    return { error: null };
  }

  const answers = Object.fromEntries(
    SAFETY_CATEGORIES.map((key) => [key, formData.get(key) === "on"])
  ) as Record<(typeof SAFETY_CATEGORIES)[number], boolean>;
  const { values: safetyText, error: safetyTooLong } = readTextFields(formData, ["otherDescription"] as const);
  if (safetyTooLong) return { error: safetyTooLong };
  const otherDescription = safetyText.otherDescription;

  const isHighRisk = SAFETY_CATEGORIES.some((key) => answers[key]) || otherDescription.length > 0;

  try {
    await prisma.safetyReview.create({
      data: {
        projectId: project.id,
        answers: { ...answers, otherDescription },
        isHighRisk,
        status: isHighRisk ? "PENDING_REVIEW" : "CLEARED",
      },
    });
  } catch (err) {
    // A teammate saved the shared screening at the same moment
    // (SafetyReview.projectId is @unique): theirs stands, like the check above.
    if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
  }

  revalidatePath("/dashboard/investigate");
  return { error: null };
}

// Shared by the final submit and the background autosave, the same shape as
// persistInsight: validates (final only), writes the Submission, and completes
// the stage on a final submit. The required fields come from the shared list
// in src/lib/investigate-requirements.ts, the same one the Submit popup and the
// hub checklist read, so all three agree on what "finished" means.
async function persistInvestigate(formData: FormData, intent: "draft" | "final"): Promise<StageFormState> {
  const student = await requireCurrentStudent();
  await requireCurrentStage(student.id, "INVESTIGATE");
  const project = await getOrCreateStudentProject(student.id);

  const { values, error: tooLong } = readTextFields(formData, INVESTIGATE_TEXT_KEYS);
  if (tooLong) return { error: tooLong };

  // Only known evidence types are kept (a crafted POST can't store arbitrary
  // text here), each once.
  const known = EVIDENCE_TYPES as readonly string[];
  const evidenceTypes = [...new Set(formData.getAll("evidenceTypes").map(String))].filter((type) =>
    known.includes(type)
  );

  const { disclosure: aiDisclosure, answered: aiAnswered, error: aiTooLong } = readAiDisclosure(formData);
  if (aiTooLong) return { error: aiTooLong };

  if (intent === "final") {
    // CLAUDE.md "Safety screening": progression is blocked until it's cleared.
    const safetyReview = await prisma.safetyReview.findUnique({ where: { projectId: project.id } });
    if (!safetyReview) {
      return { error: "Please complete the safety screening (see the Safety Screening page) before submitting." };
    }
    if (safetyReview.status === "PENDING_REVIEW") {
      return {
        error:
          "Your project is under safety review. An admin needs to clear it before you can complete Investigate.",
      };
    }
    if (safetyReview.status === "REJECTED") {
      return { error: "Your project's safety review wasn't cleared. Please contact an admin." };
    }

    const answers: Record<string, unknown> = { ...values, evidenceTypes };
    const unmet = investigateRequirementsFor(isHighSchoolGrade(student.grade)).filter(
      (item) => !item.optional && item.key !== "safetyCleared" && !isInvestigateRequirementMet(item, answers[item.key])
    );
    if (unmet.some((item) => item.key === "evidenceTypes")) {
      return { error: "Please choose at least two types of evidence on the Evidence Collection page." };
    }
    if (unmet.length > 0) {
      return { error: "Please fill in every required field before submitting." };
    }
    if (!aiAnswered) {
      return { error: "Please answer whether you used AI for this stage." };
    }
    if (aiDisclosure.usedAi && (!aiDisclosure.toolName || !aiDisclosure.purpose)) {
      return { error: "Please fill in which AI tool you used and what for." };
    }
  }

  const existing = await prisma.submission.findUnique({
    where: {
      studentId_projectId_stageName: { studentId: student.id, projectId: project.id, stageName: "INVESTIGATE" },
    },
  });
  // A late autosave must never turn a submitted stage back into a draft.
  if (intent === "draft" && existing?.isFinal) return { error: null };

  const content: InvestigateContent = { ...values, evidenceTypes };

  await prisma.$transaction(async (tx) => {
    // A draft only ever updates a row that is still a draft (the isFinal
    // condition is checked by the database in the same statement), so an
    // autosave that races a final submit can't undo it.
    if (intent === "draft" && existing) {
      await tx.submission.updateMany({ where: { id: existing.id, isFinal: false }, data: { content } });
      return;
    }

    const submission = await tx.submission.upsert({
      where: {
        studentId_projectId_stageName: { studentId: student.id, projectId: project.id, stageName: "INVESTIGATE" },
      },
      update: {
        content,
        isFinal: intent === "final",
        submittedAt: intent === "final" ? new Date() : existing?.submittedAt ?? null,
      },
      create: {
        studentId: student.id,
        projectId: project.id,
        stageName: "INVESTIGATE",
        content,
        isFinal: intent === "final",
        submittedAt: intent === "final" ? new Date() : null,
      },
    });

    if (intent === "final") {
      await tx.aIDisclosure.upsert({
        where: { submissionId: submission.id },
        update: aiDisclosure,
        create: { submissionId: submission.id, ...aiDisclosure },
      });
    }
  });

  if (intent === "final") {
    await completeStage(student.id, "INVESTIGATE");
  }

  return { error: null };
}

export async function saveInvestigateAction(
  _prevState: StageFormState,
  formData: FormData
): Promise<StageFormState> {
  const intent = formData.get("intent") === "final" ? "final" : "draft";
  const result = await persistInvestigate(formData, intent);
  if (result.error) {
    return result;
  }
  redirect("/dashboard/investigate");
}

// Background autosave for the Investigate form, same as Insight's: always a
// draft, never redirects, never writes the AI-use disclosure.
export async function autosaveInvestigateAction(formData: FormData): Promise<StageFormState> {
  return persistInvestigate(formData, "draft");
}
