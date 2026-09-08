import { formatSeasonDate } from "@/lib/season";
import styles from "./DashboardHub.module.css";

type DeadlineCardProps = {
  deadline: Date;
  /** Whole days from today until the deadline (computed by the caller so
   *  this stays a pure render). */
  daysLeft: number;
};

// A full-width navy band sitting directly under the hero — same Pattern-D
// ink band as the homepage's "THE SIX-STAGE FRAMEWORK" bar
// (CurriculumBridge): a mono label, the value, and one supporting readout,
// in a single row on ink.
export function DeadlineCard({ deadline, daysLeft }: DeadlineCardProps) {
  return (
    <section className={styles.deadlineBand} aria-label="Final qualification deadline">
      <div className={styles.deadlineInner}>
        <div className={styles.deadlineMain}>
          <span className={styles.deadlineLabel}>FINAL DEADLINE</span>
          <span className={styles.deadlineDate}>{formatSeasonDate(deadline)}</span>
        </div>
        <span className={styles.deadlineDays}>
          {daysLeft <= 0 ? "Due today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`}
        </span>
      </div>
    </section>
  );
}
