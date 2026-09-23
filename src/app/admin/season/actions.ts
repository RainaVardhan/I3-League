"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import type { SeasonFieldKey, SeasonFieldValue } from "@/lib/season-history";

const TEXT_LIMITS = {
  curriculumVersion: 50,
  paypalLink: 300,
  venmoHandle: 100,
  zelleInfo: 300,
} as const;

function parseDateField(formData: FormData, name: string): Date | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  // Dates come from <input type="date"> as "YYYY-MM-DD"; parsed at UTC
  // midnight to match formatSeasonDate's own timeZone: "UTC" everywhere
  // else in this codebase reads a Season date.
  const date = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Season Management (CLAUDE.md Sprint 6, and the Season model's own
// long-standing comment: "admin editing of these is Sprint 6"). Every field
// here is one CLAUDE.md already names as season-driven config that must
// never be hard-coded — this is the one place an admin can change it
// without a direct DB write. Editing the currently active season in place,
// not creating a new one: rolling over to a new season (e.g. 2027-2028) is
// a separate, larger step this doesn't attempt.
// Invalid input is refused (returns without writing) rather than surfaced
// inline — the same fire-and-forget convention this file's sibling actions
// (schools, payments, safety, parent-links) already use. The form's own
// required/min/max/pattern attributes are the first line of defense; this
// re-check is the real one, per this codebase's defense-in-depth convention.
export async function updateSeasonAction(formData: FormData) {
  const { admin } = await requireAdmin();

  const seasonId = String(formData.get("seasonId") ?? "");
  if (!seasonId) return;

  const springQualifyDeadline = parseDateField(formData, "springQualifyDeadline");
  const summerQualifyDeadline = parseDateField(formData, "summerQualifyDeadline");
  const nationalFinalsDate = parseDateField(formData, "nationalFinalsDate");
  if (!springQualifyDeadline || !summerQualifyDeadline || !nationalFinalsDate) return;

  const priceRaw = String(formData.get("perParticipantPriceUsd") ?? "").trim();
  const price = Number(priceRaw);
  if (!priceRaw || !Number.isFinite(price) || price <= 0 || price > 10000) return;

  const teamSizeRaw = String(formData.get("maxTeamSize") ?? "").trim();
  const maxTeamSize = Number(teamSizeRaw);
  if (!teamSizeRaw || !Number.isInteger(maxTeamSize) || maxTeamSize < 1 || maxTeamSize > 10) return;

  const curriculumVersion = String(formData.get("curriculumVersion") ?? "")
    .trim()
    .slice(0, TEXT_LIMITS.curriculumVersion);
  if (!curriculumVersion) return;

  const paypalLink = String(formData.get("paypalLink") ?? "").trim().slice(0, TEXT_LIMITS.paypalLink) || null;
  const venmoHandle = String(formData.get("venmoHandle") ?? "").trim().slice(0, TEXT_LIMITS.venmoHandle) || null;
  const zelleInfo = String(formData.get("zelleInfo") ?? "").trim().slice(0, TEXT_LIMITS.zelleInfo) || null;

  const before = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!before) return;

  await prisma.season.update({
    where: { id: seasonId },
    data: {
      springQualifyDeadline,
      summerQualifyDeadline,
      nationalFinalsDate,
      perParticipantPriceUsd: price,
      maxTeamSize,
      curriculumVersion,
      paypalLink,
      venmoHandle,
      zelleInfo,
    },
  });

  // Every edit is kept, not just the latest one: a full before/after per
  // changed field goes to AuditLog (the season page reads this back as its
  // own edit history) rather than overwriting anything, and a no-op save
  // (every field submitted unchanged) writes no history row at all.
  const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
  const fieldValues: Record<SeasonFieldKey, [SeasonFieldValue, SeasonFieldValue]> = {
    springQualifyDeadline: [toDateKey(before.springQualifyDeadline), toDateKey(springQualifyDeadline)],
    summerQualifyDeadline: [toDateKey(before.summerQualifyDeadline), toDateKey(summerQualifyDeadline)],
    nationalFinalsDate: [toDateKey(before.nationalFinalsDate), toDateKey(nationalFinalsDate)],
    perParticipantPriceUsd: [before.perParticipantPriceUsd.toNumber(), price],
    maxTeamSize: [before.maxTeamSize, maxTeamSize],
    curriculumVersion: [before.curriculumVersion, curriculumVersion],
    paypalLink: [before.paypalLink, paypalLink],
    venmoHandle: [before.venmoHandle, venmoHandle],
    zelleInfo: [before.zelleInfo, zelleInfo],
  };

  const changes: Partial<Record<SeasonFieldKey, { from: SeasonFieldValue; to: SeasonFieldValue }>> = {};
  for (const [field, [from, to]] of Object.entries(fieldValues) as [
    SeasonFieldKey,
    [SeasonFieldValue, SeasonFieldValue],
  ][]) {
    if (from !== to) changes[field] = { from, to };
  }

  if (Object.keys(changes).length > 0) {
    await logAdminAction(admin.userId, "SEASON_UPDATED", "Season", seasonId, { changes });
  }

  // Every public page that reads Season config (CLAUDE.md "Season-driven
  // config") needs a fresh render after this, not just /admin/season.
  revalidateSeasonDependentPaths();
}

// Every route that reads getActiveSeason() (directly or through a page that
// does) has to be revalidated any time the active season's own fields
// change, or which Season row counts as active changes — both
// updateSeasonAction and activateSeasonAction call this rather than each
// keeping its own copy of the list.
function revalidateSeasonDependentPaths() {
  revalidatePath("/admin/season");
  revalidatePath("/admin");
  revalidatePath("/pricing");
  revalidatePath("/faqs");
  revalidatePath("/how-it-works");
  revalidatePath("/competition-policies");
  revalidatePath("/register/payment");
  revalidatePath("/dashboard");
}

const SEASON_LABEL_LIMIT = 30;

// Rolling over to a new season (CLAUDE.md: "This is what lets a 2027-2028
// season exist later without a rebuild"). Always created INACTIVE — the
// live site keeps reading whichever season is currently active until an
// admin deliberately flips it with activateSeasonAction below, so filling
// out this form can never silently break registration/pricing/the
// dashboard mid-edit.
//
// A brand-new Season has no CurriculumModule rows of its own, and every
// stage page looks up its module by the *active* season's id (see
// src/app/dashboard/[stage]/page.tsx) — so a season with nothing cloned
// into it would 404 every stage the moment it went active. Cloning the
// current active season's modules/lessons/assignments into the new one
// (checkbox, on by default) is what keeps a freshly created season
// actually usable; unchecking it is for a season whose curriculum will be
// reseeded from scratch some other way.
export async function createSeasonAction(formData: FormData) {
  const { admin } = await requireAdmin();

  const label = String(formData.get("label") ?? "").trim().slice(0, SEASON_LABEL_LIMIT);
  if (!label) return;

  const openDate = parseDateField(formData, "openDate");
  const springQualifyDeadline = parseDateField(formData, "springQualifyDeadline");
  const summerQualifyDeadline = parseDateField(formData, "summerQualifyDeadline");
  const nationalFinalsDate = parseDateField(formData, "nationalFinalsDate");
  if (!openDate || !springQualifyDeadline || !summerQualifyDeadline || !nationalFinalsDate) return;

  const priceRaw = String(formData.get("perParticipantPriceUsd") ?? "").trim();
  const price = Number(priceRaw);
  if (!priceRaw || !Number.isFinite(price) || price <= 0 || price > 10000) return;

  const teamSizeRaw = String(formData.get("maxTeamSize") ?? "").trim();
  const maxTeamSize = Number(teamSizeRaw);
  if (!teamSizeRaw || !Number.isInteger(maxTeamSize) || maxTeamSize < 1 || maxTeamSize > 10) return;

  const curriculumVersion = String(formData.get("curriculumVersion") ?? "")
    .trim()
    .slice(0, TEXT_LIMITS.curriculumVersion);
  if (!curriculumVersion) return;

  const paypalLink = String(formData.get("paypalLink") ?? "").trim().slice(0, TEXT_LIMITS.paypalLink) || null;
  const venmoHandle = String(formData.get("venmoHandle") ?? "").trim().slice(0, TEXT_LIMITS.venmoHandle) || null;
  const zelleInfo = String(formData.get("zelleInfo") ?? "").trim().slice(0, TEXT_LIMITS.zelleInfo) || null;
  const cloneCurriculum = formData.get("cloneCurriculum") === "on";

  const sourceSeasonId = String(formData.get("cloneFromSeasonId") ?? "") || null;

  let seasonId: string;
  try {
    seasonId = await prisma.$transaction(async (tx) => {
      const season = await tx.season.create({
        data: {
          label,
          openDate,
          springQualifyDeadline,
          summerQualifyDeadline,
          nationalFinalsDate,
          perParticipantPriceUsd: price,
          maxTeamSize,
          curriculumVersion,
          paypalLink,
          venmoHandle,
          zelleInfo,
          isActive: false,
        },
      });

      if (cloneCurriculum && sourceSeasonId) {
        const sourceModules = await tx.curriculumModule.findMany({
          where: { seasonId: sourceSeasonId },
          include: { lessons: true, assignments: true },
        });
        for (const source of sourceModules) {
          await tx.curriculumModule.create({
            data: {
              seasonId: season.id,
              stageName: source.stageName,
              title: source.title,
              description: source.description,
              order: source.order,
              lessons: {
                create: source.lessons.map((lesson) => ({
                  title: lesson.title,
                  contentType: lesson.contentType,
                  contentUrl: lesson.contentUrl,
                  bodyMarkdown: lesson.bodyMarkdown,
                  order: lesson.order,
                })),
              },
              assignments: {
                create: source.assignments.map((assignment) => ({
                  title: assignment.title,
                  instructions: assignment.instructions,
                  order: assignment.order,
                })),
              },
            },
          });
        }
      }

      return season.id;
    });
  } catch (error) {
    // Season.label is @unique — a duplicate label is the one realistic
    // failure here, refused the same silent way every other admin form in
    // this codebase refuses invalid input.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
    throw error;
  }

  await logAdminAction(admin.userId, "SEASON_CREATED", "Season", seasonId, {
    label,
    clonedFrom: cloneCurriculum ? sourceSeasonId : null,
  });

  revalidatePath("/admin/season");
  revalidatePath("/admin");
}

// Switches which Season row is the one every public page and every
// student's registration/dashboard reads (getActiveSeason() picks the
// isActive:true row). Deliberately does not touch existing Enrollment/
// Payment/StageProgress rows — a student already enrolled in the season
// being deactivated keeps their own records exactly as they are, but
// CLAUDE.md's per-student "requires a VERIFIED payment for the active
// season" checks (see requireCurrentStudent) mean their dashboard/stage
// pages will read as unpaid for the new active season until they have an
// Enrollment/Payment there too. There's no migration step for that yet —
// this only flips which season is "current," it doesn't carry students
// across the rollover. That tradeoff is spelled out on the page itself so
// an admin doesn't activate a new season expecting continuing students to
// be unaffected.
export async function activateSeasonAction(formData: FormData) {
  const { admin } = await requireAdmin();

  const seasonId = String(formData.get("seasonId") ?? "");
  if (!seasonId) return;

  const target = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!target || target.isActive) return;

  await prisma.$transaction([
    prisma.season.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.season.update({ where: { id: seasonId }, data: { isActive: true } }),
  ]);

  await logAdminAction(admin.userId, "SEASON_ACTIVATED", "Season", seasonId, { label: target.label });

  revalidateSeasonDependentPaths();
}
