import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/design-system/Button";
import buttonStyles from "@/components/design-system/Button.module.css";
import { GridBackground } from "@/components/design-system/GridBackground";
import { Logo } from "@/components/design-system/Logo";
import { Panel } from "@/components/design-system/Panel";
import { prisma } from "@/lib/prisma";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "./actions";
import styles from "./page.module.css";

export const metadata = {
  title: "Dashboard | I³ League",
};

// Sprint 3 turned this from a pure identity-chain proof into the real
// "what's my next step" hub for Student/Parent, reading state off which
// rows exist rather than a status enum. Real per-role dashboard content
// (the six-stage journey, etc.) is still later-sprint work — this only
// covers registration/consent/payment status.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — src/proxy.ts already redirects unauthenticated
  // requests away from /dashboard, but this page shouldn't assume that.
  if (!user) {
    redirect("/login");
  }

  const appUser = await prisma.user.findUnique({
    where: { supabaseUid: user.id },
    include: { student: true, parent: true, coach: true },
  });

  // Built once and threaded into each status branch below so the "next
  // step" action button (Complete registration, Submit payment, etc.) and
  // Log out render side by side in one row, instead of Log out always
  // being pinned on its own line underneath.
  const logoutButton = (
    <form action={logoutAction} className={styles.logoutForm}>
      <Button
        as="button"
        type="submit"
        variant="ghost"
        showArrow={false}
        className={buttonStyles.ghostStrong}
      >
        Log out
      </Button>
    </form>
  );

  return (
    <>
      <GridBackground />
      <main className={styles.main}>
        <div className={styles.card}>
          <Logo />
          <Panel variant="standard" prominent>
            {appUser ? (
              <>
                <h1 className={styles.heading}>
                  Logged in as {appUser.email}, role {appUser.role}
                </h1>
                {appUser.role === "STUDENT" && (
                  <StudentStatus studentId={appUser.student?.id ?? null} logoutButton={logoutButton} />
                )}
                {appUser.role === "PARENT" && (
                  <ParentStatus parentId={appUser.parent?.id ?? null} logoutButton={logoutButton} />
                )}
                {appUser.role === "COACH" && !appUser.coach && (
                  <>
                    <p className={styles.notice}>
                      Registration incomplete, profile details coming in a later step.
                    </p>
                    {logoutButton}
                  </>
                )}
                {appUser.role === "COACH" && appUser.coach && logoutButton}
              </>
            ) : (
              // Would mean the auth.users -> public.User trigger didn't fire
              // — shouldn't happen in normal flow, but a clear message beats
              // a crash while this is still being hand-tested.
              <>
                <p className={styles.notice}>
                  Something went wrong setting up your account. Please contact support.
                </p>
                {logoutButton}
              </>
            )}
          </Panel>
        </div>
      </main>
    </>
  );
}

async function StudentStatus({
  studentId,
  logoutButton,
}: {
  studentId: string | null;
  logoutButton: ReactNode;
}) {
  if (!studentId) {
    return (
      <>
        <p className={styles.notice}>You haven&apos;t completed registration yet.</p>
        <div className={styles.actionsRow}>
          <Button as={Link} href="/register">
            Complete registration
          </Button>
          {logoutButton}
        </div>
      </>
    );
  }

  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId, seasonId: season.id } },
    include: { payment: true },
  });

  if (!enrollment?.payment) {
    return (
      <>
        <p className={styles.notice}>Registration complete. One step left: your payment.</p>
        <div className={styles.actionsRow}>
          <Button as={Link} href="/register/payment">
            Submit payment
          </Button>
          {logoutButton}
        </div>
      </>
    );
  }

  if (enrollment.payment.status === "VERIFIED") {
    return (
      <>
        <p className={styles.notice}>
          You&apos;re enrolled for {season.label}. Your six-stage learning path will unlock here
          once it&apos;s built.
        </p>
        {logoutButton}
      </>
    );
  }

  if (enrollment.payment.status === "REJECTED") {
    return (
      <>
        <p className={styles.notice}>Your payment needs another look. See details and resubmit.</p>
        <div className={styles.actionsRow}>
          <Button as={Link} href="/register/payment">
            Review payment
          </Button>
          {logoutButton}
        </div>
      </>
    );
  }

  return (
    <>
      <p className={styles.notice}>
        Payment submitted on {formatSeasonDate(enrollment.payment.submittedAt ?? enrollment.payment.createdAt)}.
        An admin will verify it shortly.
      </p>
      {logoutButton}
    </>
  );
}

async function ParentStatus({
  parentId,
  logoutButton,
}: {
  parentId: string | null;
  logoutButton: ReactNode;
}) {
  if (!parentId) {
    return (
      <>
        <p className={styles.notice}>You haven&apos;t completed your profile yet.</p>
        <div className={styles.actionsRow}>
          <Button as={Link} href="/register">
            Complete your profile
          </Button>
          {logoutButton}
        </div>
      </>
    );
  }

  const links = await prisma.studentParent.findMany({
    where: { parentId },
    include: { student: true },
  });

  if (links.length === 0) {
    return (
      <>
        <p className={styles.notice}>
          No students linked yet. Once your student registers using this account&apos;s email as
          their parent/guardian email, they&apos;ll show up here for consent.
        </p>
        {logoutButton}
      </>
    );
  }

  const consents = await prisma.consent.findMany({
    where: { parentId, studentId: { in: links.map((link) => link.studentId) } },
  });
  const consentedStudentIds = new Set(consents.map((consent) => consent.studentId));

  return (
    <>
      <div className={styles.studentList}>
        {links.map((link) => (
          <div key={link.studentId} className={styles.studentRow}>
            <span className={styles.studentName}>
              {link.student.firstName} {link.student.lastName}
            </span>
            {!link.verifiedAt ? (
              <span className={styles.consentDone}>Link pending admin review</span>
            ) : consentedStudentIds.has(link.studentId) ? (
              <span className={styles.consentDone}>Consent recorded</span>
            ) : (
              <Link className={styles.consentLink} href={`/consent/${link.studentId}`}>
                Give consent
              </Link>
            )}
          </div>
        ))}
      </div>
      {logoutButton}
    </>
  );
}
