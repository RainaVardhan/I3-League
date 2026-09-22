import type { StageName } from "@prisma/client";
import { REVIEW_DIMENSIONS, getStageCopy } from "@/lib/stage-copy";
import styles from "./StageInfo.module.css";

// The REVIEW layer, condensed: what a reviewer is actually checking for,
// the bar to advance, the six rated dimensions, and the fact that revision
// is expected, not penalized (docs/curriculum/04_REVIEW). A gate check, not a
// grade. Content only: the band and its rail heading come from StageReviewPage.
export function StageReviewNote({
  stageName,
  showRevisionNote = true,
}: {
  stageName: StageName;
  /** False when a Submit band follows and already says revising is expected. */
  showRevisionNote?: boolean;
}) {
  const copy = getStageCopy(stageName);

  return (
    <>
      <div className={styles.twoUp}>
        <div className={styles.group}>
          <p className={styles.label}>Advances when</p>
          <p className={styles.text}>{copy.advancesWhen}</p>
        </div>
        {copy.revisesWhen && (
          <div className={styles.group}>
            <p className={styles.label}>Sent back for revision when</p>
            <p className={styles.text}>{copy.revisesWhen}</p>
          </div>
        )}
      </div>

      {/* A stage with a full rubric gets these same questions, in more detail,
          under each dimension, so the short list only shows without one. */}
      {!copy.detailedRubric && copy.reviewerChecks.length > 0 && (
        <div className={styles.group}>
          <p className={styles.label}>Reviewer checks</p>
          <ul className={`${styles.asks} ${styles.asksTwo}`}>
            {copy.reviewerChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </div>
      )}

      {/* The full rubric (below) already lists the six dimensions, so the
          chip row only shows for stages that don't have one yet. */}
      {!copy.detailedRubric && (
        <div className={styles.group}>
          <p className={styles.label}>A reviewer rates six things</p>
          <p className={styles.chips}>{REVIEW_DIMENSIONS.join(" · ")}</p>
        </div>
      )}

      {showRevisionNote && (
        <p className={styles.footnote}>
          Feedback → revise → resubmit, as often as you need. Never penalized.
        </p>
      )}
      {copy.finalsNote && <p className={styles.footnote}>{copy.finalsNote}</p>}
    </>
  );
}
