import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Panel } from "@/components/design-system/Panel";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { PaymentForm } from "./PaymentForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Payment | I³ League",
};

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ joinCode?: string }>;
}) {
  const { joinCode } = await searchParams;

  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { userId: appUser.id },
    include: { teamMemberships: { include: { team: true } } },
  });
  if (!student) {
    redirect("/register");
  }

  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
    include: { payment: true },
  });

  const team = student.teamMemberships[0]?.team;
  const joinCodeBanner = joinCode && team && team.joinCode === joinCode;
  const price = Number(season.perParticipantPriceUsd).toFixed(0);

  if (enrollment?.payment?.status === "VERIFIED") {
    return (
      <AuthCard heading="You're enrolled!" wide>
        <p className={styles.notice}>
          Your payment has been verified. Your six-stage learning path will unlock here once
          it&apos;s built.
        </p>
      </AuthCard>
    );
  }

  if (enrollment?.payment?.status === "SUBMITTED") {
    return (
      <AuthCard heading="Payment under review" wide>
        <p className={styles.notice}>
          Thanks, we&apos;ve received your payment confirmation. An admin will verify it shortly;
          this page will update once it&apos;s done. This doesn&apos;t affect any teammates: each
          person&apos;s payment is reviewed independently.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      heading="Registration fee"
      subheading={`$${price} per student.`}
      wide
    >
      {joinCodeBanner && (
        <Panel variant="selected">
          <div className={styles.joinCodeBanner}>
            <strong>Share this code with your teammates:</strong>
            <span className={styles.joinCodeValue}>{team.joinCode}</span>
            <span className={styles.notice}>
              Each teammate registers and pays separately using this code.
            </span>
          </div>
        </Panel>
      )}
      <PaymentForm
        priceUsd={price}
        paypalLink={season.paypalLink}
        venmoHandle={season.venmoHandle}
        zelleInfo={season.zelleInfo}
        rejectionReason={enrollment?.payment?.status === "REJECTED" ? enrollment.payment.rejectionReason : null}
      />
    </AuthCard>
  );
}
