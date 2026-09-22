import type { StageName, StageStatus } from "@prisma/client";
import { SplitHero } from "@/components/design-system/SplitHero";
import { STAGE_ORDER } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";
import styles from "./StageHero.module.css";

type StageHeroProps = {
  stageName: StageName;
  stageNumber: string;
  status: StageStatus;
  lessonsCount: number;
  assignmentsCount: number;
};

const STATUS_LABEL: Record<StageStatus, string> = {
  LOCKED: "Locked",
  CURRENT: "In progress",
  COMPLETE: "Complete",
};

// Opening band of every /dashboard/[stage] page. Built on the same shared
// SplitHero shell as How It Works / Curriculum / Pricing (docs/design-system.md
// Section 21.2): checkerboard canvas band, mono eyebrow, display H1, muted
// lede, and one paper "stat box" in the right slot. The stat box follows
// PricingHero's recipe (big numeral, label, sub line, 64 x 4 cobalt rule,
// mono caption). Everything shown is real data from src/lib/stage-copy.ts
// plus real lesson/activity counts.
export function StageHero({ stageName, stageNumber, status, lessonsCount, assignmentsCount }: StageHeroProps) {
  const copy = getStageCopy(stageName);
  const total = STAGE_ORDER.length.toString().padStart(2, "0");
  const lessonWord = lessonsCount === 1 ? "lesson" : "lessons";
  const activityWord = assignmentsCount === 1 ? "activity" : "activities";

  return (
    <SplitHero
      className={styles.hero}
      eyebrow={`Stage ${stageNumber} of ${total} · ${STATUS_LABEL[status]}`}
      title={copy.name}
      lede={
        <>
          <span className={styles.question}>
            <span className={styles.questionLabel}>Guiding question</span>
            {copy.guidingQuestion ?? copy.coreQuestion}
          </span>
          {copy.guidingPrinciple && (
            <span className={styles.question}>
              <span className={styles.questionLabel}>Guiding principle</span>
              {copy.guidingPrinciple}
            </span>
          )}
          {copy.description}
        </>
      }
      rightSlot={
        <div className={styles.statBox}>
          <span className={styles.bigNumber}>{stageNumber}</span>
          <h2 className={styles.label}>{copy.producesArtifact}</h2>
          <p className={styles.sub}>{copy.submissionFormat}</p>
          <span className={styles.rule} aria-hidden="true" />
          {/* Stages whose workspace is not built yet have no lessons or
              activities in the database; "0 lessons · 0 activities" read as a
              broken page rather than "coming later", so it is left out. */}
          {(lessonsCount > 0 || assignmentsCount > 0) && (
            <span className={styles.caption}>
              {`${lessonsCount} ${lessonWord} · ${assignmentsCount} ${activityWord}`}
            </span>
          )}
        </div>
      }
    />
  );
}
