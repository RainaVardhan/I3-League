import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Season, Student } from "@prisma/client";
import { Button } from "@/components/design-system/Button";
import buttonStyles from "@/components/design-system/Button.module.css";
import { GridBackground } from "@/components/design-system/GridBackground";
import { Logo } from "@/components/design-system/Logo";
import { Panel } from "@/components/design-system/Panel";
import { AppShell } from "@/components/app/AppShell";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StageNodeTrack } from "@/components/dashboard/StageNodeTrack";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { StageProgressPanel } from "@/components/dashboard/StageProgressPanel";
import { DeadlineCard } from "@/components/dashboard/DeadlineCard";
import hubStyles from "@/components/dashboard/DashboardHub.module.css";
import { prisma } from "@/lib/prisma";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";
import { getJourney, STAGE_NUMBERS } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";
import { isHighSchoolGrade } from "@/lib/investigate-requirements";
import { getStageChecklist } from "@/lib/stage-checklist";
import { getOrCreateStudentProject } from "@/lib/project";
import { createClient } from "@/lib/supabase/server";
import { isAccountLocked } from "@/lib/launch";
import { logoutAction } from "./actions";
import styles from "./page.module.css";

export const metadata = {
  title: "Dashboard | I³ League",
};

// Sprint 3 turned this from a pure identity-chain proof into the real
// "what's my next step" hub for Student/Parent, reading state off which
// rows exist rather than a status enum. Sprint 4 added the real six-stage
// journey for a fully-enrolled Student (StudentHub below) — every other
// state (registration incomplete, payment pending, Parent/Coach) still
// uses the original narrow centered-card layout, since none of those have
// enough real content yet to fill a full-width hub.
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

  // Pre-launch (src/lib/launch.ts): only approved accounts see their real
  // dashboard. Everyone else gets the "coming soon" card below.
  const comingSoon = appUser !== null && (await isAccountLocked(appUser));

  if (appUser?.role === "STUDENT" && appUser.student) {
    const season = await getActiveSeason();
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_seasonId: { studentId: appUser.student.id, seasonId: season.id } },
      include: { payment: true },
    });
    if (enrollment?.payment?.status === "VERIFIED") {
      return <StudentHub student={appUser.student} season={season} />;
    }
  }

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
            {comingSoon ? (
              // Pre-launch (src/lib/launch.ts): no registration, payment or
              // dashboard yet. Full flow is intact behind PLATFORM_OPEN.
              <>
                <h1 className={styles.heading}>Coming soon</h1>
                <p className={styles.notice}>
                  Your account is created. Registration and the student
                  dashboard are not open yet. We will let you know when they
                  are.
                </p>
                {logoutButton}
              </>
            ) : appUser ? (
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

// The authenticated dashboard for a Student whose payment is VERIFIED.
// One job: answer "what do I need to do next?" — in this order:
//   Where am I?   → the hero + the current-stage block + six-stage track
//   What next?    → the Next action block (the most prominent thing)
//   What's left?  → Finish {stage}: the auto-checking requirements list
//   Can I submit? → the Submission block: artifact, count, gate status
//   When is it due? → the Deadline block: date + days remaining
// Nothing else goes here — badges, activity, journal, rubrics, stats, and
// full stage explanations all live on their own pages. Chrome (the dark
// sidebar + topbar) comes from the shared AppShell.
async function StudentHub({ student, season }: { student: Student; season: Season }) {
  const [journey, teamMemberships, project] = await Promise.all([
    getJourney(student.id),
    prisma.teamMembership.findMany({
      where: { studentId: student.id },
      include: { team: { include: { project: true } } },
    }),
    // Lazily creates the student's (or team's shared) Project right here,
    // not just on the Insight page — a teammate who never opens Insight
    // themselves should still see the Team tab work as soon as they open
    // the dashboard, since whichever teammate gets there first creates the
    // one shared Project (see getOrCreateStudentProject's own comment).
    getOrCreateStudentProject(student.id),
  ]);

  const team = teamMemberships[0]?.team;

  const currentItem = journey.find((item) => item.status === "CURRENT");
  const stagesCleared = journey.filter((item) => item.status === "COMPLETE").length;
  const stagesLeft = journey.length - stagesCleared;

  // Project identity — for teams, the name + member first names.
  let teamInfo: { name: string; members: string[] } | null = null;
  if (team) {
    const members = await prisma.teamMembership.findMany({
      where: { teamId: team.id },
      include: { student: { select: { firstName: true } } },
      orderBy: { joinedAt: "asc" },
    });
    teamInfo = { name: team.name, members: members.map((m) => m.student.firstName) };
  }

  // The project is titled on Insight's Problem Scope page, so pointing there is
  // only right while Insight is still open. A normal submit requires a title,
  // but a stage can also be completed by an admin override, and a finished
  // Insight is read-only; telling that student to "title it in Insight" would
  // send them to a page where they cannot.
  const insightComplete = journey.find((item) => item.stage === "INSIGHT")?.status === "COMPLETE";
  const innovation =
    project && project.title !== "Untitled project"
      ? project.title
      : insightComplete
        ? "not named yet"
        : "not named yet; you'll title it in Insight";
  const participation = teamInfo ? `Team of ${teamInfo.members.length}` : "Individual";

  const checklist = currentItem
    ? await getStageChecklist(student.id, currentItem.stage, project?.id ?? null)
    : null;

  // The one qualification deadline that still applies, plus days remaining.
  const now = new Date();
  const deadline =
    now < season.springQualifyDeadline
      ? season.springQualifyDeadline
      : season.summerQualifyDeadline;
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000));

  return (
    <>
      <GridBackground />
      <AppShell
        studentName={student.displayName ?? student.firstName}
        studentMeta={`Grade ${student.grade} · ${participation}`}
        journey={journey}
        breadcrumb="Dashboard"
        isHighSchool={isHighSchoolGrade(student.grade)}
        isTeamProject={Boolean(team)}
      >
        <DashboardHero
          firstName={student.firstName}
          innovation={innovation}
          team={teamInfo}
          currentStage={currentItem?.stage ?? null}
        />

        {/* Navy Pattern-D band, directly under the hero. */}
        <DeadlineCard deadline={deadline} daysLeft={daysLeft} />

        {/* Where am I? — white section, the six stages as plain boxes. */}
        <section className={hubStyles.sectionPaper}>
          <div className={hubStyles.inner}>
            <p className={hubStyles.eyebrow}>Current stage</p>
            {currentItem ? (
              <>
                <h2 className={hubStyles.heading}>
                  {STAGE_NUMBERS[currentItem.stage]} · {getStageCopy(currentItem.stage).name}
                </h2>
                <p className={hubStyles.lead}>{getStageCopy(currentItem.stage).coreQuestion}</p>
              </>
            ) : (
              <h2 className={hubStyles.heading}>All six stages cleared</h2>
            )}
            <StageNodeTrack items={journey} />
            <p className={hubStyles.trackNote}>
              {stagesCleared} done · {stagesLeft} left
            </p>
          </div>
        </section>

        {currentItem && checklist && (
          <>
            {/* What's left? — light-blue section, checklist + submission merged. */}
            <section className={hubStyles.sectionBlue}>
              <div className={hubStyles.inner}>
                <p className={hubStyles.eyebrow}>What&apos;s left</p>
                <h2 className={hubStyles.heading}>Finish {getStageCopy(currentItem.stage).name}</h2>
                <StageProgressPanel
                  stage={currentItem.stage}
                  slug={currentItem.slug}
                  checklist={checklist}
                />
              </div>
            </section>

            {/* What do I do next? — white section, final-CTA-style card. */}
            <section className={hubStyles.sectionPaper}>
              <div className={hubStyles.inner}>
                <NextActionCard
                  stageName={currentItem.stage}
                  slug={currentItem.slug}
                  checklist={checklist}
                  reviewFeedback={null}
                />
              </div>
            </section>
          </>
        )}
      </AppShell>
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

  // VERIFIED is handled by StudentHub above, before this component is ever
  // reached — this function only still needs the pre-enrollment states.
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
            {link.rejectedAt ? (
              <span className={styles.consentDone}>Link not approved</span>
            ) : !link.verifiedAt ? (
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
