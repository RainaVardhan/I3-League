import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";
import { getStageCopy } from "@/lib/stage-copy";
import { STAGE_ORDER } from "@/lib/stage-progress";
import { applyRosterFilter, isRosterFilter, loadSeasonRoster, ROSTER_FILTERS } from "@/lib/admin-season";
import hub from "../AdminHub.module.css";

export const metadata = {
  title: "Season progress | Admin | I³ League",
};

// "Who is where?" for the active season: one row per enrolled student with
// payment, consent, team and stage state side by side, plus a funnel of how
// many students are on each stage. This is the qualification tracker's raw
// material: CLAUDE.md's eligibility rule also needs assessments, which are
// not built yet, so "all six stages complete" is shown as what it is (the
// stage half of eligibility), not labelled "Qualified".
export default async function AdminProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { admin } = await requireAdmin();
  const { filter: rawFilter } = await searchParams;
  const filter = isRosterFilter(rawFilter) ? rawFilter : "all";

  const season = await getActiveSeason();
  const now = new Date();
  const roster = await loadSeasonRoster(season.id);
  const rows = applyRosterFilter(roster, filter, now);

  // Funnel: only students who can be working (verified payment) are placed
  // on a stage; everyone else is counted under "Not started" or "Blocked".
  const verified = roster.filter((row) => row.paymentStatus === "VERIFIED");
  const funnel = STAGE_ORDER.map((stage) => ({
    stage,
    current: verified.filter((row) => row.currentStage === stage).length,
  }));
  const finished = verified.filter((row) => row.stagesComplete === STAGE_ORDER.length).length;
  const notStarted = verified.filter((row) => row.currentStage === null && row.stagesComplete < STAGE_ORDER.length).length;
  const blocked = roster.length - verified.length;

  const nextDeadline = [season.springQualifyDeadline, season.summerQualifyDeadline].find((date) => date > now) ?? null;

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Season progress">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Season progress · {season.label}</p>
          <h1 className={hub.heading}>Where every student is</h1>
          <p className={hub.lead}>
            {roster.length} enrolled, {verified.length} with a verified payment, {finished} with all six stages
            complete.
            {nextDeadline && ` Next qualification deadline: ${formatSeasonDate(nextDeadline)}.`}
          </p>

          <div className={hub.kpiGrid}>
            {funnel.map(({ stage, current }) => (
              <div key={stage} className={hub.kpiCard}>
                <span className={hub.kpiValue}>{current}</span>
                <span className={hub.kpiLabel}>On {getStageCopy(stage).name}</span>
                <span className={hub.kpiAccent} aria-hidden="true" />
              </div>
            ))}
            <div className={hub.kpiCard}>
              <span className={hub.kpiValue}>{finished}</span>
              <span className={hub.kpiLabel}>All six complete</span>
              <span className={hub.kpiAccent} aria-hidden="true" />
            </div>
            <div className={hub.kpiCard}>
              <span className={hub.kpiValue}>{notStarted}</span>
              <span className={hub.kpiLabel}>Verified, not started</span>
              <span className={hub.kpiAccent} aria-hidden="true" />
            </div>
            <div className={hub.kpiCard}>
              <span className={blocked > 0 ? `${hub.kpiValue} ${hub.kpiValueAlert}` : hub.kpiValue}>{blocked}</span>
              <span className={hub.kpiLabel}>Waiting on payment</span>
              <span className={hub.kpiAccent} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Roster</p>
          <h2 className={hub.heading}>{ROSTER_FILTERS.find((item) => item.key === filter)?.label}</h2>
          <p className={hub.lead}>
            {rows.length} student{rows.length === 1 ? "" : "s"}.{" "}
            <a className={hub.textLink} href={`/admin/progress/export?filter=${filter}`}>
              Download as CSV
            </a>
          </p>

          <nav className={hub.statusFilters} aria-label="Roster filter">
            {ROSTER_FILTERS.map((item) => (
              <Link
                key={item.key}
                href={item.key === "all" ? "/admin/progress" : `/admin/progress?filter=${item.key}`}
                className={item.key === filter ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill}
                aria-current={item.key === filter ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={hub.panel}>
            {rows.length === 0 ? (
              <p className={hub.empty}>Nobody matches this filter.</p>
            ) : (
              rows.map((row) => (
                <Link key={row.studentId} href={`/admin/users/${row.userId}`} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>{row.name}</p>
                    <p className={hub.rowMeta}>
                      Grade {row.grade}
                      {row.school && ` · ${row.school}`} · {row.teamName ?? "Individual"}
                    </p>
                    <p className={hub.rowMeta}>
                      {row.currentStage ? `On ${getStageCopy(row.currentStage).name}` : "No stage in progress"} ·{" "}
                      {row.stagesComplete} of 6 complete · {row.finalSubmissions} submitted
                      {row.lastActivity && ` · Last activity ${formatSeasonDate(row.lastActivity)}`}
                    </p>
                  </div>
                  <div className={hub.rowActions}>
                    <span className={row.paymentStatus === "VERIFIED" ? `${hub.tag} ${hub.tagBlue}` : `${hub.tag} ${hub.tagCoral}`}>
                      {row.paymentStatus ? `Payment ${row.paymentStatus.toLowerCase()}` : "No payment"}
                    </span>
                    <span className={row.consentComplete ? `${hub.tag} ${hub.tagBlue}` : `${hub.tag} ${hub.tagCoral}`}>
                      {row.consentComplete ? "Consent on file" : "Consent missing"}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
