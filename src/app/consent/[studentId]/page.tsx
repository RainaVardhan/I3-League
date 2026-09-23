import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { formatSeasonDate } from "@/lib/season";
import { ConsentForm } from "./ConsentForm";

export const metadata = {
  title: "Consent | I³ League",
};

export default async function ConsentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "PARENT") {
    redirect("/login");
  }

  const parent = await prisma.parent.findUnique({ where: { userId: appUser.id } });
  if (!parent) {
    redirect("/register");
  }

  // CLAUDE.md: "a parent should never be able to fetch another family's
  // data even via direct API call" — verified here, not just by the
  // dashboard not linking to it. No link means bounce home without
  // confirming or denying the student id exists.
  const link = await prisma.studentParent.findUnique({
    where: { studentId_parentId: { studentId, parentId: parent.id } },
    include: { student: true },
  });
  if (!link) {
    redirect("/dashboard");
  }

  // A row existing isn't enough — see the StudentParent model comment in
  // schema.prisma. The link is only consent-eligible once an admin has
  // verified it's a real guardian relationship, not just a self-reported
  // email match. A rejected link now persists (rejectedAt set) instead of
  // being deleted, so it needs its own message distinct from "still
  // pending" — otherwise a rejected parent sees the same reassuring
  // "usually happens within a day or two" copy as someone genuinely waiting.
  if (link.rejectedAt) {
    return (
      <AuthCard heading={`Link to ${link.student.firstName} was not approved`} wide>
        <p>
          {link.rejectionReason || "An admin reviewed this guardian relationship and could not confirm it."}{" "}
          If this is a mistake, contact us so it can be looked at again.
        </p>
      </AuthCard>
    );
  }
  if (!link.verifiedAt) {
    return (
      <AuthCard heading={`Link to ${link.student.firstName} pending review`} wide>
        <p>
          An admin needs to verify your guardian relationship to {link.student.firstName} before
          you can submit consent. This usually happens within a day or two.
        </p>
      </AuthCard>
    );
  }

  const existing = await prisma.consent.findFirst({ where: { studentId, parentId: parent.id } });

  if (existing) {
    return (
      <AuthCard heading={`Consent recorded for ${link.student.firstName}`} wide>
        <p>Submitted on {formatSeasonDate(existing.acceptedAt)}.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      heading={`Consent for ${link.student.firstName} ${link.student.lastName}`}
      subheading="Every item below is required to continue."
      wide
    >
      <ConsentForm studentId={studentId} />
    </AuthCard>
  );
}
