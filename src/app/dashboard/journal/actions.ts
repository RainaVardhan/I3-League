"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { formatSeasonDate, getActiveSeason } from "@/lib/season";
import { saveUploadedFile } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { containsInappropriateLanguage, INAPPROPRIATE_LANGUAGE_ERROR } from "@/lib/content-filter";
import { Prisma, type StageName } from "@prisma/client";
import {
  isJournalEntryType,
  isJournalStage,
  JOURNAL_TEXT_LIMIT,
  JOURNAL_TITLE_LIMIT,
  journalEarliestDate,
  toJournalAttachments,
  type JournalAttachment,
} from "@/lib/journal";

export type JournalFormState = { error: string | null };

// Prisma's Json columns need the sentinel Prisma.JsonNull to actually store
// a JSON null, rather than the field being left unset — plain `null` is a
// TypeScript error on a Json input.
function jsonAttachments(attachments: JournalAttachment[] | null) {
  return attachments === null ? Prisma.JsonNull : attachments;
}

// Same "student's own payment must be VERIFIED for the active season" gate
// every other dashboard server action re-checks independently of the page
// (see dashboard/[stage]/actions.ts's requireCurrentStudent) — a direct POST
// never loads the page, and a payment can move to REJECTED/REFUNDED after
// the Journal was already unlocked. Per student, never per team.
async function requireVerifiedStudent() {
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
  return { student, season };
}

// Generous enough that a real student typing, retrying a failed save, or
// double-clicking never notices it, but low enough to stop a script (or a
// stuck retry loop) from hammering these writes — there's no autosave on
// the Journal, only explicit Add entry / Save as new version submits, so
// legitimate traffic here is naturally low-frequency to begin with.
const JOURNAL_WRITE_LIMIT = 20;
const JOURNAL_WRITE_WINDOW_MS = 60_000;

function assertNotRateLimited(studentId: string): JournalFormState | null {
  const allowed = checkRateLimit(`journal-write:${studentId}`, JOURNAL_WRITE_LIMIT, JOURNAL_WRITE_WINDOW_MS);
  if (allowed) return null;
  return { error: "You're saving too quickly. Please wait a moment and try again." };
}

// Shared by create and revise: reads/validates the fields both forms send.
// `existingAttachments` is only ever non-null on a revision — it's what the
// previous version had, carried forward when this submission neither
// uploads a new photo nor checks "Remove the current photo". Without this,
// leaving the photo field blank on a revision (the normal case — you're
// only updating the text) would silently drop the entry's existing photo,
// since a revision always inserts a brand-new row rather than patching the
// old one. `seasonOpenDate` bounds how far back an entry can be dated — see
// the entryDate range check below. Returns an error string, or the values
// ready to write.
async function readEntryFields(
  formData: FormData,
  seasonOpenDate: Date,
  existingAttachments: JournalAttachment[] | null = null,
): Promise<
  | { error: string; values?: undefined }
  | {
      error: null;
      values: {
        entryType: string;
        title: string;
        stage: StageName | null;
        text: string | null;
        entryDate: Date;
        attachments: JournalAttachment[] | null;
      };
    }
> {
  const entryType = String(formData.get("entryType") ?? "");
  if (!isJournalEntryType(entryType)) {
    return { error: "Choose what kind of entry this is." };
  }

  const rawStage = String(formData.get("stage") ?? "");
  if (rawStage && !isJournalStage(rawStage)) {
    return { error: "Choose which stage this entry is about." };
  }
  const stage = rawStage ? (rawStage as StageName) : null;

  const rawTitle = String(formData.get("title") ?? "").trim();
  if (!rawTitle) {
    return { error: "Give this entry a title." };
  }
  if (rawTitle.length > JOURNAL_TITLE_LIMIT) {
    return { error: `That title is longer than ${JOURNAL_TITLE_LIMIT} characters. Please shorten it.` };
  }
  if (containsInappropriateLanguage(rawTitle)) {
    return { error: INAPPROPRIATE_LANGUAGE_ERROR };
  }

  const rawText = String(formData.get("text") ?? "").trim();
  if (rawText.length > JOURNAL_TEXT_LIMIT) {
    return { error: `That entry is longer than ${JOURNAL_TEXT_LIMIT.toLocaleString()} characters. Please shorten it.` };
  }
  if (containsInappropriateLanguage(rawText)) {
    return { error: INAPPROPRIATE_LANGUAGE_ERROR };
  }

  const rawDate = String(formData.get("entryDate") ?? "");
  const entryDate = rawDate ? new Date(`${rawDate}T00:00:00`) : new Date();
  if (Number.isNaN(entryDate.getTime())) {
    return { error: "That date doesn't look right." };
  }
  // A journal entry logs something that already happened, so it can't be
  // dated in the future — and it can't predate the season it's being kept
  // for. The ceiling allows through the end of today (not just "now") so a
  // student in a timezone ahead of the server isn't rejected for picking
  // today's date on their own calendar.
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  if (entryDate.getTime() > endOfToday.getTime()) {
    return { error: "That date is in the future. Journal entries are for things that have already happened." };
  }
  if (entryDate.getTime() < seasonOpenDate.getTime()) {
    return { error: `That date is before this season started (${formatSeasonDate(seasonOpenDate)}).` };
  }

  let attachments: JournalAttachment[] | null = existingAttachments;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    let url: string | null;
    try {
      url = await saveUploadedFile(photo, "journal");
    } catch (err) {
      if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
        return { error: "That photo is over 5MB. Please choose a smaller one." };
      }
      return { error: "Please upload a PNG, JPEG, or WebP image." };
    }
    if (url) attachments = [{ type: "image", url }];
  } else if (String(formData.get("removePhoto") ?? "")) {
    // The revise form's explicit "Remove the current photo" checkbox — the
    // only way to clear a photo without replacing it with another one.
    attachments = null;
  }

  if (!rawText && (!attachments || attachments.length === 0)) {
    return { error: "Add some text or a photo before saving." };
  }

  return {
    error: null,
    values: { entryType, title: rawTitle, stage, text: rawText || null, entryDate, attachments },
  };
}

// A brand-new entry: a fresh entryGroupId, version 1.
export async function createJournalEntryAction(
  _prev: JournalFormState,
  formData: FormData,
): Promise<JournalFormState> {
  const { student, season } = await requireVerifiedStudent();
  const limited = assertNotRateLimited(student.id);
  if (limited) return limited;
  const parsed = await readEntryFields(formData, journalEarliestDate(season.openDate));
  if (parsed.error !== null) return { error: parsed.error };

  await prisma.journalEntry.create({
    data: {
      studentId: student.id,
      entryGroupId: crypto.randomUUID(),
      version: 1,
      entryType: parsed.values.entryType,
      title: parsed.values.title,
      stage: parsed.values.stage,
      text: parsed.values.text,
      entryDate: parsed.values.entryDate,
      attachments: jsonAttachments(parsed.values.attachments),
    },
  });

  revalidatePath("/dashboard/journal");
  return { error: null };
}

// Revising an existing entry never touches the old row(s) — CLAUDE.md
// "Innovation Journal is append-only: edits create a new version; don't
// overwrite/delete history." This inserts a new row sharing the same
// entryGroupId, one version higher than whatever this student has already
// written under that group.
export async function reviseJournalEntryAction(
  _prev: JournalFormState,
  formData: FormData,
): Promise<JournalFormState> {
  const { student, season } = await requireVerifiedStudent();
  const limited = assertNotRateLimited(student.id);
  if (limited) return limited;

  const entryGroupId = String(formData.get("entryGroupId") ?? "");
  if (!entryGroupId) return { error: "Missing entry." };

  // The entryGroupId comes from a hidden form field, so it's client-supplied
  // — re-confirm this group actually belongs to the signed-in student before
  // appending to it, the same defense-in-depth every other server action in
  // this codebase applies to a client-supplied id.
  const existing = await prisma.journalEntry.findFirst({
    where: { entryGroupId, studentId: student.id },
    orderBy: { version: "desc" },
    select: { version: true, attachments: true },
  });
  if (!existing) return { error: "That entry couldn't be found." };

  const parsed = await readEntryFields(formData, journalEarliestDate(season.openDate), toJournalAttachments(existing.attachments));
  if (parsed.error !== null) return { error: parsed.error };

  // Two near-simultaneous revisions of the same entry (a double-click, or a
  // second tab) could both read the same current-max version and then both
  // try to insert that version + 1. @@unique([entryGroupId, version]) on
  // JournalEntry makes the loser's insert fail instead of silently landing
  // two rows at the same version number (which would leave "the latest
  // version" ambiguous); retry once with a freshly read version rather than
  // surfacing that as an error for what's normally just a stray double-tap.
  let nextVersion = existing.version + 1;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.journalEntry.create({
        data: {
          studentId: student.id,
          entryGroupId,
          version: nextVersion,
          entryType: parsed.values.entryType,
          title: parsed.values.title,
          stage: parsed.values.stage,
          text: parsed.values.text,
          entryDate: parsed.values.entryDate,
          attachments: jsonAttachments(parsed.values.attachments),
        },
      });
      break;
    } catch (err) {
      const isUniqueConflict =
        typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002";
      if (!isUniqueConflict || attempt === 2) throw err;
      const latest = await prisma.journalEntry.findFirst({
        where: { entryGroupId, studentId: student.id },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      nextVersion = (latest?.version ?? nextVersion) + 1;
    }
  }

  revalidatePath("/dashboard/journal");
  return { error: null };
}
