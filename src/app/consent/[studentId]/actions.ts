"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";

export type ConsentState = { error: string | null };

const REQUIRED_FIELDS = [
  "participationAccepted",
  "privacyAccepted",
  "codeOfConductAccepted",
  "competitionRulesAccepted",
  "academicIntegrityAccepted",
  "aiUseAccepted",
  "safetyAccepted",
  "ipPolicyAccepted",
] as const;

// studentId is bound via .bind() from the client component rather than
// carried in a hidden form field, but that alone isn't an authorization
// check — re-verify the parent<->student link server-side below regardless
// of how the id arrived here (CLAUDE.md: role-based access enforced at the
// data layer, not just by the UI not offering another family's link).
export async function submitConsentAction(
  studentId: string,
  _prevState: ConsentState,
  formData: FormData
): Promise<ConsentState> {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "PARENT") {
    redirect("/login");
  }

  const parent = await prisma.parent.findUnique({ where: { userId: appUser.id } });
  if (!parent) {
    redirect("/register");
  }

  const link = await prisma.studentParent.findUnique({
    where: { studentId_parentId: { studentId, parentId: parent.id } },
  });
  if (!link) {
    redirect("/dashboard");
  }

  // Must be re-checked here, not just on the page — see the StudentParent
  // model comment in schema.prisma. Without this, a direct POST to this
  // action (bypassing the page's own guard) could submit consent through
  // an unverified, self-reported link.
  if (!link.verifiedAt) {
    redirect(`/consent/${studentId}`);
  }

  const existing = await prisma.consent.findFirst({ where: { studentId, parentId: parent.id } });
  if (existing) {
    redirect(`/consent/${studentId}`);
  }

  const missing = REQUIRED_FIELDS.some((field) => formData.get(field) !== "on");
  if (missing) {
    return { error: "Every consent item is required. Please check all boxes to continue." };
  }

  const mediaGranted = formData.get("mediaConsent") === "on";

  await prisma.$transaction([
    prisma.consent.create({
      data: {
        parentId: parent.id,
        studentId,
        participationAccepted: true,
        privacyAccepted: true,
        codeOfConductAccepted: true,
        competitionRulesAccepted: true,
        academicIntegrityAccepted: true,
        aiUseAccepted: true,
        safetyAccepted: true,
        ipPolicyAccepted: true,
      },
    }),
    prisma.mediaConsent.create({
      data: {
        parentId: parent.id,
        studentId,
        granted: mediaGranted,
        grantedAt: mediaGranted ? new Date() : null,
      },
    }),
  ]);

  redirect("/dashboard");
}
