import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { getJourney } from "@/lib/stage-progress";
import { isHighSchoolGrade } from "@/lib/investigate-requirements";
import { AppShell } from "@/components/app/AppShell";
import { RailHeading, StageBand } from "@/components/journey/StageBand";
import { journalEarliestDate, toDateInputValue } from "@/lib/journal";
import { JournalComposer } from "../JournalComposer";
import styles from "../Journal.module.css";

export const metadata = {
  title: "New Journal Entry | I³ League",
};

// The dedicated "add an entry" page a student lands on from the Journal
// list's Add entry button — a focused writing view, separate from the list
// itself, rather than an always-open form crowding the top of the timeline.
export default async function NewJournalEntryPage() {
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

  const [journey, teamMembership] = await Promise.all([
    getJourney(student.id),
    prisma.teamMembership.findFirst({ where: { studentId: student.id }, include: { team: true } }),
  ]);

  const studentMeta = `Grade ${student.grade} · ${teamMembership?.team.name ?? "Individual"}`;
  const currentStage = journey.find((item) => item.status === "CURRENT")?.stage ?? null;

  return (
    <AppShell
      studentName={student.displayName ?? student.firstName}
      studentMeta={studentMeta}
      journey={journey}
      breadcrumb="Journal / New entry"
      isHighSchool={isHighSchoolGrade(student.grade)}
      isTeamProject={Boolean(teamMembership)}
    >
      {/* Reuses the stage pages' StageBand/RailHeading recipe (docs/design-
          system.md Section 22.1: heading stacked above content, both at the
          full 1160px container) instead of a narrow centered panel, so the
          form actually uses the page width. */}
      <StageBand
        tone="paper"
        rail={
          <>
            <Link href="/dashboard/journal" className={styles.backLink}>
              ← Back to journal
            </Link>
            <RailHeading kicker="Journal" title="Log a new entry" />
            <p className={`${styles.lead} ${styles.leadWide}`}>
              Write down what you tried, saw, or decided, in your own words and dated to today. If you come back and
              add more later, nothing here gets erased: your update is saved right below it.
            </p>
          </>
        }
      >
        <JournalComposer defaultStage={currentStage} minEntryDate={toDateInputValue(journalEarliestDate(season.openDate))} />
      </StageBand>
    </AppShell>
  );
}
