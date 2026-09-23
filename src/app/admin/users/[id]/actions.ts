"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { StageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { deleteUserAccount } from "@/lib/delete-account";
import { completeStage, ensureStageProgressInitialized, STAGE_ORDER } from "@/lib/stage-progress";

// Permanently deletes an account: every row this schema has for it (see
// src/lib/delete-account.ts for the full table-by-table list) and the
// Supabase Auth account itself — not a soft delete, not reversible. Three
// guards before anything is touched: (1) the admin can't delete their own
// account (self-lockout), (2) the last remaining Admin account can't be
// deleted (system lockout — there'd be no one left who could use this
// page at all), (3) the confirmation field must match the target's email
// exactly, the same "type it to confirm" friction a plain Yes/No dialog
// doesn't provide for something this destructive.
export async function deleteUserAction(formData: FormData) {
  const { admin, user: adminUser } = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const confirmEmail = String(formData.get("confirmEmail") ?? "").trim();
  if (!userId) return;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return;

  if (target.id === adminUser.id) return; // can't delete your own account from here

  if (confirmEmail.toLowerCase() !== target.email.toLowerCase()) return;

  if (target.role === "ADMIN") {
    const adminCount = await prisma.admin.count();
    if (adminCount <= 1) return; // never delete the last admin account
  }

  // Logged before deletion — AuditLog.actorUserId is the admin performing
  // this (still exists), but targetId will reference an id that's about to
  // stop existing; that's fine, targetId is a plain string everywhere else
  // in this table too, not an enforced foreign key.
  await logAdminAction(admin.userId, "USER_DELETED", target.role, target.id, {
    email: target.email,
    role: target.role,
  });

  await deleteUserAccount(userId);

  redirect("/admin/users");
}

// The "Admin can override/unlock manually" escape hatch CLAUDE.md's
// sequential-stage-unlocking rule names — for a student stuck on a stage
// through no fault of the curriculum (a data entry mistake, a real-world
// exception), an admin can unlock the next stage, mark the current one
// complete (the same completeStage() a real final submit calls, so the
// stage after IT unlocks the normal way too), or reopen a completed stage.
// Only ever touches this one student's own StageProgress row.
const OVERRIDE_ACTIONS = new Set(["unlock", "complete", "reopen"]);

export async function overrideStageAction(formData: FormData) {
  const { admin } = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const stageName = String(formData.get("stageName") ?? "");
  const overrideAction = String(formData.get("overrideAction") ?? "");

  if (!userId || !studentId || !STAGE_ORDER.includes(stageName as (typeof STAGE_ORDER)[number])) return;
  if (!OVERRIDE_ACTIONS.has(overrideAction)) return;

  await ensureStageProgressInitialized(studentId);
  const stage = stageName as (typeof STAGE_ORDER)[number];

  // "unlock" and "reopen" both land on CURRENT (unlock a locked stage;
  // reopen a completed one for revision) — "complete" is the only one that
  // reuses completeStage() so the stage after it unlocks the normal way too.
  let newStatus: StageStatus;
  if (overrideAction === "complete") {
    await completeStage(studentId, stage);
    await prisma.stageProgress.update({
      where: { studentId_stageName: { studentId, stageName: stage } },
      data: { unlockedByAdminOverride: true },
    });
    newStatus = "COMPLETE";
  } else {
    newStatus = "CURRENT";
    await prisma.stageProgress.update({
      where: { studentId_stageName: { studentId, stageName: stage } },
      data: { status: newStatus, unlockedAt: new Date(), completedAt: null, unlockedByAdminOverride: true },
    });
  }

  await logAdminAction(admin.userId, "STAGE_OVERRIDE", "StageProgress", `${studentId}:${stage}`, {
    stage,
    overrideAction,
    newStatus,
  });

  revalidatePath(`/admin/users/${userId}`);
}
