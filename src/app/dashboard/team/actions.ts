"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { checkRateLimit } from "@/lib/rate-limit";
import { containsInappropriateLanguage, INAPPROPRIATE_LANGUAGE_ERROR } from "@/lib/content-filter";
import { CONTRIBUTION_RESULT_LIMIT, CONTRIBUTION_TEXT_LIMIT, getTeamContext, isTeamStage } from "@/lib/team-contribution";

export type ContributionFormState = { error: string | null };

// Same "student's own payment must be VERIFIED for the active season" gate
// every other dashboard server action re-checks independently of the page
// (see dashboard/[stage]/actions.ts's requireCurrentStudent, journal/
// actions.ts's requireVerifiedStudent) — a direct POST never loads the page,
// and a payment can move to REJECTED/REFUNDED after this page was already
// unlocked. Per student, never per team (CLAUDE.md "Team billing/access
// independence"). Also re-confirms this student actually has a team with a
// shared Project — an individual student, or a team that hasn't reached
// INSIGHT yet, has nothing to log a contribution against.
async function requireTeamStudent() {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }
  const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
  if (!student) {
    redirect("/register");
  }
  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
    include: { payment: true },
  });
  if (enrollment?.payment?.status !== "VERIFIED") {
    redirect("/dashboard");
  }
  const teamContext = await getTeamContext(student.id);
  if (!teamContext) {
    redirect("/dashboard");
  }
  return { student, teamContext };
}

// Generous enough that a real student typing and submitting never notices
// it, low enough to stop a script from hammering this write — same
// reasoning as journal/actions.ts's JOURNAL_WRITE_LIMIT (this page also has
// no autosave, only an explicit submit).
const CONTRIBUTION_WRITE_LIMIT = 20;
const CONTRIBUTION_WRITE_WINDOW_MS = 60_000;

// TeamContribution has no version/edit concept in the schema (unlike
// JournalEntry's entryGroupId+version) — this action only ever inserts a
// new row. A teammate who wants to correct or add detail logs a new entry
// rather than editing an old one, keeping the shared record an honest,
// unedited run of what was actually said and when, the same append-only
// spirit CLAUDE.md requires for the Journal.
export async function addTeamContributionAction(
  _prev: ContributionFormState,
  formData: FormData,
): Promise<ContributionFormState> {
  const { student, teamContext } = await requireTeamStudent();

  const allowed = checkRateLimit(`team-contribution:${student.id}`, CONTRIBUTION_WRITE_LIMIT, CONTRIBUTION_WRITE_WINDOW_MS);
  if (!allowed) {
    return { error: "You're saving too quickly. Please wait a moment and try again." };
  }

  const description = String(formData.get("description") ?? "").trim();
  if (!description) {
    return { error: "Describe what you worked on." };
  }
  if (description.length > CONTRIBUTION_TEXT_LIMIT) {
    return { error: `That's longer than ${CONTRIBUTION_TEXT_LIMIT.toLocaleString()} characters. Please shorten it.` };
  }
  // Every teammate sees this entry, not just an admin reviewer — see
  // src/lib/content-filter.ts.
  if (containsInappropriateLanguage(description)) {
    return { error: INAPPROPRIATE_LANGUAGE_ERROR };
  }

  // Evidence/result is optional — a contribution can be logged before
  // there's a result yet (work still in progress).
  const result = String(formData.get("result") ?? "").trim();
  if (result.length > CONTRIBUTION_RESULT_LIMIT) {
    return { error: `That's longer than ${CONTRIBUTION_RESULT_LIMIT.toLocaleString()} characters. Please shorten it.` };
  }
  if (result && containsInappropriateLanguage(result)) {
    return { error: INAPPROPRIATE_LANGUAGE_ERROR };
  }

  // "" (the "General" radio option) reads back as no stage, matching the
  // nullable TeamContribution.stage column — same convention as the
  // Journal's own stage field.
  const rawStage = String(formData.get("stage") ?? "");
  const stage = rawStage === "" ? null : isTeamStage(rawStage) ? rawStage : undefined;
  if (stage === undefined) {
    return { error: "That stage isn't valid. Please choose again." };
  }

  await prisma.teamContribution.create({
    data: {
      projectId: teamContext.project.id,
      studentId: student.id,
      description,
      result: result || null,
      stage,
    },
  });

  revalidatePath("/dashboard/team");
  return { error: null };
}
