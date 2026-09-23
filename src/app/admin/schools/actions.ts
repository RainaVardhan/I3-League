"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { toTitleCase } from "@/lib/text-format";

const NAME_LIMIT = 160;
const PLACE_LIMIT = 80;

// School Management (CLAUDE.md Sprint 6): schools are otherwise only ever
// created implicitly, one at a time, wherever a student's registration form
// free-types one (see src/app/register — there is no lookup against this
// table today, so the same school can already exist under slightly
// different spellings). This is the first place an admin can add one
// directly; editing/merging existing rows is not built yet, noted on the
// page itself rather than left unstated.
export async function addSchoolAction(formData: FormData) {
  const { admin } = await requireAdmin();

  // Title-cased before anything else touches it (dedupe lookup, length
  // cap, storage) so "the new york one" and "THE NEW YORK ONE" both land
  // on the same title-cased row instead of two differently-cased ones.
  const name = toTitleCase(String(formData.get("name") ?? "").trim()).slice(0, NAME_LIMIT);
  // NULL never equals NULL for a unique constraint's purposes, so city/state
  // (both part of the @@unique) are coalesced to "" rather than left null —
  // otherwise two schools with the same name and no city/state on file
  // wouldn't be caught as duplicates at all.
  const city = toTitleCase(String(formData.get("city") ?? "").trim()).slice(0, PLACE_LIMIT);
  const state = toTitleCase(String(formData.get("state") ?? "").trim()).slice(0, PLACE_LIMIT);
  const country = toTitleCase(String(formData.get("country") ?? "").trim()).slice(0, PLACE_LIMIT) || null;

  if (!name) return;

  const school = await prisma.school.upsert({
    where: { name_city_state: { name, city, state } },
    update: {},
    // city/state stored as "" (not null) when left blank — see the note
    // above on why the unique constraint needs that to actually dedupe.
    create: { name, city, state, country },
  });

  await logAdminAction(admin.userId, "SCHOOL_CREATED", "School", school.id, { name, city, state, country });

  revalidatePath("/admin/schools");
  revalidatePath("/admin");
}
