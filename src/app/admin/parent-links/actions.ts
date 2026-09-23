"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

// See CLAUDE.md status log, Aug 19 2026 "self-consent bypass" entry: a
// StudentParent row auto-links on a self-reported email match with no
// verification that the matched Parent is the student's real guardian, so
// verifiedAt starts null and the row is not consent-eligible until an admin
// confirms the relationship here — the one place that gap actually closes.
export async function verifyParentLinkAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const studentId = String(formData.get("studentId") ?? "");
  const parentId = String(formData.get("parentId") ?? "");
  if (!studentId || !parentId) return;

  const result = await prisma.studentParent.updateMany({
    where: { studentId, parentId, verifiedAt: null, rejectedAt: null },
    data: { verifiedAt: new Date(), verifiedByAdminId: admin.id },
  });

  if (result.count > 0) {
    await logAdminAction(admin.userId, "PARENT_LINK_VERIFIED", "StudentParent", `${studentId}:${parentId}`);
  }

  revalidatePath("/admin/parent-links");
  revalidatePath("/admin");
}

// Marks a link an admin determines is not a real guardian relationship
// (e.g. the self-consent-bypass pattern above) rather than leaving it
// pending forever. Sets rejectedAt instead of deleting the row (same shape
// as Payment's REJECTED state) so it still shows up in the queue's
// rejected history, alongside a reason for why.
export async function rejectParentLinkAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const studentId = String(formData.get("studentId") ?? "");
  const parentId = String(formData.get("parentId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!studentId || !parentId || !reason) return;

  const result = await prisma.studentParent.updateMany({
    where: { studentId, parentId, verifiedAt: null, rejectedAt: null },
    data: {
      rejectedAt: new Date(),
      rejectedByAdminId: admin.id,
      rejectionReason: reason.slice(0, 500),
    },
  });

  if (result.count > 0) {
    await logAdminAction(admin.userId, "PARENT_LINK_REJECTED", "StudentParent", `${studentId}:${parentId}`, { reason });
  }

  revalidatePath("/admin/parent-links");
  revalidatePath("/admin");
}
