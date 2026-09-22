import Link from "next/link";
import type { StageName } from "@prisma/client";
import { getStageCopy } from "@/lib/stage-copy";
import { SUBMISSION_STATUS_LABEL, checklistItemHref, type StageChecklist } from "@/lib/stage-checklist";
import styles from "./DashboardHub.module.css";

type StageProgressPanelProps = {
  stage: StageName;
  slug: string;
  checklist: StageChecklist;
};

// The "What's left" panel — the stage checklist and the submission status
// merged into one boxed surface. The requirements count + the ready/not-ready
// state sit at the top; the checklist itself is a single column of boxes
// below. Every item links straight to the place you'd go to finish it: the
// stage's submission form when that stage has one built, otherwise the
// stage brief (what the stage asks for). Items tick themselves off — each
// `done` flag is derived from real saved data in src/lib/stage-checklist.ts,
// so completing a piece on the stage page updates this list and the count
// the next time the hub loads. There are no manual checkboxes here.
export function StageProgressPanel({ stage, slug, checklist }: StageProgressPanelProps) {
  const copy = getStageCopy(stage);
  const { items, doneCount, total, workspacePending, submissionStatus } = checklist;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Built stages deep-link to the exact page and field the item is answered
  // on; stages without a workspace yet point at the brief.
  const hrefFor = (item: { page?: string; anchor?: string }) => checklistItemHref(slug, item, workspacePending);

  const statusTone =
    submissionStatus === "ready"
      ? styles.statusReady
      : submissionStatus === "submitted" || submissionStatus === "in-review"
        ? styles.statusInfo
        : submissionStatus === "revision-requested"
          ? styles.statusWarn
          : submissionStatus === "approved"
            ? styles.statusDone
            : styles.statusMuted;

  return (
    <div className={styles.progressPanel}>
      <div className={styles.progressTop}>
        <div className={styles.progressMeter}>
          <p className={styles.progressCount}>
            <strong>
              {doneCount} of {total}
            </strong>{" "}
            requirements complete
          </p>
          <span className={styles.progressBar} aria-hidden="true">
            <span className={styles.progressFill} style={{ width: `${pct}%` }} />
          </span>
        </div>
        <span className={`${styles.progressStatus} ${statusTone}`}>
          {SUBMISSION_STATUS_LABEL[submissionStatus]}
        </span>
      </div>

      {workspacePending && (
        <p className={styles.progressNote}>
          The guided workspace for {copy.name} opens in a later release. Here&apos;s what it will ask
          you to show. Open the stage for the full brief.
        </p>
      )}

      <ul className={styles.progressList}>
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={hrefFor(item)}
              className={`${styles.progressItem} ${item.done ? styles.progressItemDone : ""}`}
            >
              <span className={styles.progressBox} aria-hidden="true">
                {item.done && (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={styles.progressText}>
                {item.group && <span className={styles.progressGroup}>{item.group}</span>}
                <span className={styles.progressLabel}>
                  {item.label}
                  {item.optional && <span className={styles.progressOptional}>Optional</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Not derivable from saved data: the AI-use disclosure is only written
          when the stage is submitted, so it is stated rather than ticked. */}
      {!workspacePending && (
        <p className={styles.progressNote}>
          You will also declare whether you used AI when you submit.
        </p>
      )}
    </div>
  );
}
