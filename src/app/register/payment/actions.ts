"use server";

import { redirect } from "next/navigation";
import type { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { saveUploadedFile } from "@/lib/storage";

export type PaymentState = { error: string | null };

const PAYMENT_METHODS = ["PAYPAL", "VENMO", "ZELLE"];

export async function submitPaymentAction(
  _prevState: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { userId: appUser.id },
    include: { teamMemberships: true },
  });
  if (!student) {
    redirect("/register");
  }

  const season = await getActiveSeason();
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
    include: { payment: true },
  });

  // Only a fresh submission or a resubmission after REJECTED may write here
  // — a SUBMITTED/VERIFIED enrollment already has nothing left to change on
  // this form (the page itself hides the form in those states, this is
  // defense in depth against a direct POST).
  if (existingEnrollment && existingEnrollment.payment?.status !== "REJECTED") {
    redirect("/register/payment");
  }

  const method = String(formData.get("method") ?? "");
  const paymentReference = String(formData.get("paymentReference") ?? "").trim();
  const screenshot = formData.get("screenshot");

  if (!PAYMENT_METHODS.includes(method)) {
    return { error: "Please choose how you paid." };
  }
  if (!paymentReference) {
    return { error: "Please enter your transaction or confirmation number." };
  }

  let screenshotUrl: string | null = null;
  if (screenshot instanceof File && screenshot.size > 0) {
    try {
      screenshotUrl = await saveUploadedFile(screenshot, "payment-screenshots");
    } catch (err) {
      if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
        return { error: "That screenshot is too large. Please keep it under 5MB." };
      }
      if (err instanceof Error && err.message === "FILE_TYPE_NOT_ALLOWED") {
        return { error: "Please upload a PNG, JPEG, or WebP image." };
      }
      throw err;
    }
  }

  const participationType = student.teamMemberships.length > 0 ? "TEAM" : "INDIVIDUAL";
  const teamId = student.teamMemberships[0]?.teamId;

  if (existingEnrollment?.payment) {
    // Resubmission after REJECTED — update the existing 1:1 Payment row
    // rather than create a second one.
    await prisma.payment.update({
      where: { enrollmentId: existingEnrollment.id },
      data: {
        method: method as PaymentMethod,
        paymentReference,
        screenshotUrl: screenshotUrl ?? existingEnrollment.payment.screenshotUrl,
        status: "SUBMITTED",
        submittedAt: new Date(),
        rejectionReason: null,
        verifiedAt: null,
        verifiedByAdminId: null,
      },
    });
  } else {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        seasonId: season.id,
        participationType,
        teamId,
        payment: {
          create: {
            amountUsd: season.perParticipantPriceUsd,
            method: method as PaymentMethod,
            paymentReference,
            screenshotUrl,
            status: "SUBMITTED",
            submittedAt: new Date(),
          },
        },
      },
    });
  }

  redirect("/register/payment");
}
