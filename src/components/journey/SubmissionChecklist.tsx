import type { StageName } from "@prisma/client";
import { getStageCopy } from "@/lib/stage-copy";
import { StageChecklist } from "./StageChecklist";
import styles from "./SubmissionChecklist.module.css";

// The SHOW layer, condensed: exactly what the one polished stage
// submission has to contain (docs/curriculum/03_SHOW), as an interactive
// checklist the student can tick off, with a done / left count. Styled as
// an ink "artifact card" per the client-provided stage-page mockup — the
// Show tab's one dark surface, matching the artifact-card pattern already
// used elsewhere (DeadlineCard, FinalCta).
export function SubmissionChecklist({ stageName }: { stageName: StageName }) {
  const copy = getStageCopy(stageName);

  return (
    <section className={styles.card}>
      <span className={styles.kicker}>Stage submission</span>
      <h3 className={styles.name}>{copy.producesArtifact}</h3>
      <p className={styles.format}>{copy.submissionFormat}</p>
      <StageChecklist stageName={stageName} items={copy.submissionChecklist} variant="dark" />
    </section>
  );
}
