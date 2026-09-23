import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { getJourney } from "@/lib/stage-progress";
import { isHighSchoolGrade } from "@/lib/investigate-requirements";
import { getTeamContext } from "@/lib/team-contribution";
import { AppShell } from "@/components/app/AppShell";
import { RailHeading, StageBand } from "@/components/journey/StageBand";
import { ContributionComposer } from "../ContributionComposer";
import styles from "../Team.module.css";

export const metadata = {
  title: "Log a Contribution | I³ League",
};

// The dedicated "log a contribution" page a student lands on from the Team
// page's "Log contribution" button — a focused writing view, separate from
// the shared log itself, same split as the Innovation Journal's own
// /dashboard/journal + /dashboard/journal/new pages.
export default async function NewTeamContributionPage() {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
  if (!student) {
    redirect("/register");
  }

  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
    include: { payment: true },
  });
  if (enrollment?.payment?.status !== "VERIFIED") {
    redirect("/dashboard");
  }

  const [journey, teamContext] = await Promise.all([getJourney(student.id), getTeamContext(student.id)]);
  if (!teamContext) {
    redirect("/dashboard");
  }

  const currentStage = journey.find((item) => item.status === "CURRENT")?.stage ?? null;

  return (
    <AppShell
      studentName={student.displayName ?? student.firstName}
      studentMeta={`Grade ${student.grade} · ${teamContext.team.name}`}
      journey={journey}
      breadcrumb="Team / New contribution"
      isHighSchool={isHighSchoolGrade(student.grade)}
      isTeamProject
    >
      {/* Reuses the stage pages' StageBand/RailHeading recipe (docs/design-
          system.md Section 22.1: heading stacked above content, both at the
          full 1160px container), same as journal/new/page.tsx, so the form
          actually uses the page width. */}
      <StageBand
        tone="paper"
        rail={
          <>
            <Link href="/dashboard/team" className={styles.backLink}>
              ← Back to team
            </Link>
            <RailHeading kicker="Team" title="Log a contribution" />
            <p className={`${styles.lead} ${styles.leadWide}`}>
              A short, specific note your teammates will see: what you did, not just what you plan to do. The shared
              project is one record; what each of you actually contributed is another.
            </p>
          </>
        }
      >
        <ContributionComposer defaultStage={currentStage} />
      </StageBand>
    </AppShell>
  );
}
