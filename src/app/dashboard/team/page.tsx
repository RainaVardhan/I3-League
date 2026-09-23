import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { getJourney } from "@/lib/stage-progress";
import { isHighSchoolGrade } from "@/lib/investigate-requirements";
import { getTeamContext, getTeamContributions } from "@/lib/team-contribution";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/design-system/Button";
import { TeamHero } from "./TeamHero";
import { ContributionList } from "./ContributionList";
import styles from "./Team.module.css";

export const metadata = {
  title: "Team & Contributions | I³ League",
};

// Team Contribution Tracking (CLAUDE.md's data model, TeamContribution:
// "Only meaningful when Project.teamId is set. Tracks what each individual
// teammate contributed, independent of the shared project content."). Only
// makes sense on a team project — an individual student has no teammates'
// work to distinguish from their own, so this page redirects them (and a
// team student whose shared Project doesn't exist yet — see
// getTeamContext) back to the hub rather than showing an empty page.
export default async function TeamPage() {
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

  const contributions = await getTeamContributions(teamContext.project.id);
  const teammateNames = teamContext.teammates.map((t) => t.name);

  return (
    <AppShell
      studentName={student.displayName ?? student.firstName}
      studentMeta={`Grade ${student.grade} · ${teamContext.team.name}`}
      journey={journey}
      breadcrumb="Team"
      isHighSchool={isHighSchoolGrade(student.grade)}
      isTeamProject
    >
      <TeamHero
        teamName={teamContext.team.name}
        totalContributions={contributions.length}
        teammateCount={teamContext.teammates.length}
      />

      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Roster</p>
          <h2 className={styles.headingSm}>
            {teamContext.team.name} · {teamContext.project.title}
          </h2>
          <ul className={styles.roster}>
            {teamContext.teammates.map((teammate) => (
              <li key={teammate.studentId} className={styles.rosterRow}>
                <span className={styles.rosterName}>{teammate.name}</span>
                {teammate.roleLabel && <span className={styles.rosterRole}>{teammate.roleLabel}</span>}
                {teammate.studentId === student.id && <span className={styles.rosterYou}>You</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${styles.band} ${styles.bandBlue}`}>
        <div className={styles.inner}>
          <div className={styles.headRow}>
            <div>
              <p className={styles.eyebrow}>Contribution log</p>
              <h2 className={styles.headingSm}>
                {contributions.length === 0
                  ? "No contributions yet"
                  : `${contributions.length} ${contributions.length === 1 ? "contribution" : "contributions"}`}
              </h2>
            </div>
            {/* The empty state (inside ContributionList) already carries its
                own "Log your first contribution" CTA — showing this one too
                would be a second, equally loud button doing the same thing
                on the same screen, same reasoning as Journal's .headRow. */}
            {contributions.length > 0 && (
              <Button as={Link} href="/dashboard/team/new" className={styles.addBtn}>
                Log contribution
              </Button>
            )}
          </div>
          <ContributionList contributions={contributions} teammateNames={teammateNames} />
        </div>
      </section>
    </AppShell>
  );
}
