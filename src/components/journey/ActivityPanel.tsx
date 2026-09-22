import type { SectionDetail } from "@/lib/stage-copy";
import styles from "./ContentBlocks.module.css";

type Assignment = { id: string; title: string; instructions: string };

type ActivityPanelProps = {
  assignment?: Assignment;
  /** Structured Do detail (activity, worksheet, output). When given, it is shown instead of the database
   *  assignment's free-text instructions. */
  details?: SectionDetail["do"];
};

// One practice activity, used inside a topic's Do band (see TaskSection).
// Ungraded, not gated on completion (no AssignmentSubmission model exists to
// gate on). Formal graded assessments are Sprint 6 scope (Question/Attempt).
export function ActivityPanel({ assignment, details }: ActivityPanelProps) {
  if (details) {
    // The activity's name is the Do band's rail heading (TaskSection's doTitle),
    // so only the description and the worksheet / output / contribution strip
    // are shown here.
    return (
      <div className={styles.item}>
        {details.description && <p className={styles.activityDescription}>{details.description}</p>}
        {/* A required supporting activity has no description, only the
            curriculum's reason it is required. */}
        {details.why && (
          <p className={styles.activityDescription}>Why it&apos;s needed: {details.why}</p>
        )}
        <dl className={styles.activityMeta}>
          <div>
            <dt>Worksheet</dt>
            <dd>{details.worksheet}</dd>
          </div>
          <div>
            <dt>Output</dt>
            <dd>{details.output}</dd>
          </div>
        </dl>
      </div>
    );
  }

  if (!assignment) return null;
  return (
    <div className={styles.item}>
      <h3 className={styles.itemTitle}>{assignment.title}</h3>
      <p className={styles.instructions}>{assignment.instructions}</p>
    </div>
  );
}
