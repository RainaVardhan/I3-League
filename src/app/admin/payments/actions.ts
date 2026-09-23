"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

// Both actions re-check the payment is still SUBMITTED before writing —
// two admins racing the same queue (or a double-click) must not double-log
// or overwrite an already-verified/rejected row.
export async function verifyPaymentAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");
  if (!paymentId) return;

  const result = await prisma.payment.updateMany({
    where: { id: paymentId, status: "SUBMITTED" },
    data: { status: "VERIFIED", verifiedAt: new Date(), verifiedByAdminId: admin.id, rejectionReason: null },
  });

  if (result.count > 0) {
    await logAdminAction(admin.userId, "PAYMENT_VERIFIED", "Payment", paymentId);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

export async function rejectPaymentAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!paymentId || !reason) return;

  const result = await prisma.payment.updateMany({
    where: { id: paymentId, status: "SUBMITTED" },
    data: { status: "REJECTED", rejectionReason: reason.slice(0, 500), verifiedAt: null, verifiedByAdminId: null },
  });

  if (result.count > 0) {
    await logAdminAction(admin.userId, "PAYMENT_REJECTED", "Payment", paymentId, { reason });
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

// A verified payment can later be refunded (family withdrew, duplicate
// payment). REFUNDED is a real PaymentStatus, and the stage actions require
// a VERIFIED payment per student, so this locks that one student out of
// further writes without touching any teammate. The reason is kept in
// rejectionReason (the only free-text field on Payment) and in the audit log.
export async function refundPaymentAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!paymentId || !reason) return;

  const result = await prisma.payment.updateMany({
    where: { id: paymentId, status: "VERIFIED" },
    data: { status: "REFUNDED", rejectionReason: reason.slice(0, 500) },
  });

  if (result.count > 0) {
    await logAdminAction(admin.userId, "PAYMENT_REFUNDED", "Payment", paymentId, { reason });
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}
