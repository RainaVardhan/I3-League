import type { StageName } from "@prisma/client";
import { getStageCopy } from "@/lib/stage-copy";
import styles from "./StageInfo.module.css";

// The full per-dimension rubric (docs/curriculum/04_REVIEW/i3league-stage{N}-rubric.md),
// when a stage has one written yet (only INSIGHT so far). Each dimension is a
// <details> disclosure so the page isn't a wall of text by default; no client
// JS needed. Content only: the band and its rail heading come from
// StageReviewPage.
export function StageRubricDetail({ stageName }: { stageName: StageName }) {
  const copy = getStageCopy(stageName);
  const rubric = copy.detailedRubric;
  if (!rubric) return null;

  return (
    <>
      {/* The gate question is the same sentence as "Advances when" in How
          it's reviewed, so it is not repeated here. */}
      {rubric.notJudging && <p className={styles.footnote}>{rubric.notJudging}</p>}

      <p className={styles.mustHave}>
        <span className={styles.label}>All three must be present</span>
        {rubric.nonNegotiables.join(" · ")}
      </p>

      <div className={styles.rubricList}>
        {rubric.dimensions.map((dimension) => (
          <details key={dimension.name} className={styles.rubricItem}>
            <summary className={styles.rubricSummary}>
              {dimension.name}
              <span className={styles.rubricIcon} aria-hidden="true" />
            </summary>
            <div className={styles.rubricBody}>
              <ul className={styles.asks}>
                {dimension.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
              {dimension.note && <p className={styles.rubricNote}>{dimension.note}</p>}
              {/* The four level descriptions are long, so they stay folded
                  until asked for. */}
              <details className={styles.levelsToggle}>
                <summary className={styles.levelsSummary}>See the four levels</summary>
                <dl className={styles.levels}>
                  {dimension.levels.map((level) => (
                    <div key={level.level}>
                      <dt>{level.level}</dt>
                      <dd>{level.descriptor}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
