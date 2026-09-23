"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

// CLAUDE.md "Safety screening": a high-risk answer blocks progression until
// an admin clears it. Clearing here is what unblocks
// submitInvestigateAction server-side (it checks SafetyReview.status), not
// just a UI flag.
export async function clearSafetyReviewAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) return;

  const result = await prisma.safetyReview.updateMany({
    where: { id: reviewId, status: "PENDING_REVIEW" },
    data: { status: "CLEARED", reviewedAt: new Date(), reviewedByAdminId: admin.id, reviewNotes: null },
  });

  if (result.count > 0) {
    await logAdminAction(admin.userId, "SAFETY_REVIEW_CLEARED", "SafetyReview", reviewId);
  }

  revalidatePath("/admin/safety");
  revalidatePath(`/admin/safety/${reviewId}`);
  revalidatePath("/admin");
}

export async function rejectSafetyReviewAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!reviewId || !notes) return;

  const result = await prisma.safetyReview.updateMany({
    where: { id: reviewId, status: "PENDING_REVIEW" },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewedByAdminId: admin.id, reviewNotes: notes.slice(0, 1000) },
  });

  if (result.count > 0) {
    await logAdminAction(admin.userId, "SAFETY_REVIEW_REJECTED", "SafetyReview", reviewId, { notes });
  }

  revalidatePath("/admin/safety");
  revalidatePath(`/admin/safety/${reviewId}`);
  revalidatePath("/admin");
}
