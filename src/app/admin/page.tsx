import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin, getAdminOverviewCounts } from "@/lib/admin";
import { formatSeasonDate } from "@/lib/season";
import { prisma } from "@/lib/prisma";
import { loadSeasonRoster } from "@/lib/admin-season";
import styles from "./AdminHub.module.css";

export const metadata = {
  title: "Admin | I³ League",
};

// e.g. count(0, "coach", "coaches") -> "0 coaches". Every role shows, even
// at 0 — a role with nobody in it yet (Judge/Admin are Phase-2 provisioned,
// see CLAUDE.md) is still a real fact about the platform, not something to
// hide from the count.
function count(n: number, singular: string, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}

// The admin landing page: what needs a human's attention right now, plus a
// jump to the directory and platform config. Every count here is real — the
// same pending states this codebase has otherwise required a direct DB
// write to clear (see CLAUDE.md status log, "direct DB write" pattern for
// Payment.status, SafetyReview.status, StudentParent.verifiedAt) now have a
// real queue.
export default async function AdminOverviewPage() {
  const { admin } = await requireAdmin();
  const counts = await getAdminOverviewCounts();

  // Season-scoped operations numbers (the KPIs above are queues, these are
  // the live season's own state).
  const season = counts.activeSeason;
  const roster = season ? await loadSeasonRoster(season.id) : [];
  const [teamCount, teamsWithoutCoach, submittedCount] = season
    ? await Promise.all([
        prisma.team.count({ where: { seasonId: season.id } }),
        prisma.team.count({ where: { seasonId: season.id, coachId: null } }),
        prisma.submission.count({
          where: { isFinal: true, student: { enrollments: { some: { seasonId: season.id } } } },
        }),
      ])
    : [0, 0, 0];
  const verifiedCount = roster.filter((row) => row.paymentStatus === "VERIFIED").length;
  const noConsentCount = roster.filter((row) => !row.consentComplete).length;
  const finishedCount = roster.filter((row) => row.stagesComplete === 6).length;

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Overview">
      <section className={styles.sectionPaper}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Admin</p>
          <h1 className={styles.heading}>What needs a look</h1>
          <p className={styles.lead}>
            These are the queues that block a student or parent from moving forward until an admin
            clears them.
          </p>

          <div className={styles.kpiGrid}>
            <Link href="/admin/payments" className={styles.kpiCard}>
              <span className={counts.pendingPayments > 0 ? `${styles.kpiValue} ${styles.kpiValueAlert}` : styles.kpiValue}>
                {counts.pendingPayments}
              </span>
              <span className={styles.kpiLabel}>Payments awaiting verification</span>
              <span className={styles.kpiAccent} aria-hidden="true" />
            </Link>
            <Link href="/admin/safety" className={styles.kpiCard}>
              <span className={counts.pendingSafetyReviews > 0 ? `${styles.kpiValue} ${styles.kpiValueAlert}` : styles.kpiValue}>
                {counts.pendingSafetyReviews}
              </span>
              <span className={styles.kpiLabel}>Safety screenings pending review</span>
              <span className={styles.kpiAccent} aria-hidden="true" />
            </Link>
            <Link href="/admin/parent-links" className={styles.kpiCard}>
              <span className={counts.pendingParentLinks > 0 ? `${styles.kpiValue} ${styles.kpiValueAlert}` : styles.kpiValue}>
                {counts.pendingParentLinks}
              </span>
              <span className={styles.kpiLabel}>Parent links pending verification</span>
              <span className={styles.kpiAccent} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionBlue}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Season operations</p>
          <h2 className={styles.heading}>{season ? `${season.label} at a glance` : "No active season"}</h2>
          <div className={styles.panel}>
            <Link href="/admin/progress" className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>Season progress</p>
                <p className={styles.rowMeta}>
                  {roster.length} enrolled · {verifiedCount} verified · {noConsentCount} missing consent ·{" "}
                  {finishedCount} with all six stages complete
                </p>
              </div>
              <span className={`${styles.tag} ${styles.tagBlue}`}>View</span>
            </Link>
            <Link href="/admin/submissions" className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>Submissions</p>
                <p className={styles.rowMeta}>{submittedCount} submitted stages to look at</p>
              </div>
              <span className={`${styles.tag} ${styles.tagBlue}`}>View</span>
            </Link>
            <Link href="/admin/teams" className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>Teams</p>
                <p className={styles.rowMeta}>
                  {teamCount} team{teamCount === 1 ? "" : "s"} · {teamsWithoutCoach} without a coach
                </p>
              </div>
              <span className={`${styles.tag} ${styles.tagBlue}`}>View</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionPaper}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Directory</p>
          <h2 className={styles.heading}>Everyone on the platform</h2>
          <p className={styles.lead}>Who&apos;s registered, and where they go to school.</p>

          <div className={styles.panel}>
            <Link href="/admin/users" className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>Users</p>
                <p className={styles.rowMeta}>
                  {count(counts.totalStudents, "student")} · {count(counts.totalParents, "parent")} ·{" "}
                  {count(counts.totalCoaches, "coach", "coaches")} · {count(counts.totalJudges, "judge")} ·{" "}
                  {count(counts.totalAdmins, "admin")}
                </p>
              </div>
              <span className={`${styles.tag} ${styles.tagBlue}`}>View</span>
            </Link>
            <Link href="/admin/schools" className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>Schools</p>
                <p className={styles.rowMeta}>{count(counts.totalSchools, "school")} on file</p>
              </div>
              <span className={`${styles.tag} ${styles.tagBlue}`}>View</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionBlue}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Configuration</p>
          <h2 className={styles.heading}>This season, at a glance</h2>
          <p className={styles.lead}>
            {counts.activeSeason
              ? `The ${counts.activeSeason.label} season is live: $${counts.activeSeason.perParticipantPriceUsd} per student, teams of up to ${counts.activeSeason.maxTeamSize}, and qualification windows closing ${formatSeasonDate(counts.activeSeason.springQualifyDeadline)} and ${formatSeasonDate(counts.activeSeason.summerQualifyDeadline)}.`
              : "No season is currently active."}
          </p>

          <div className={styles.panel}>
            <Link href="/admin/season" className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>Season settings</p>
                <p className={styles.rowMeta}>Pricing, deadlines, team size, and payment contact info</p>
              </div>
              <span className={`${styles.tag} ${styles.tagBlue}`}>Edit</span>
            </Link>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
