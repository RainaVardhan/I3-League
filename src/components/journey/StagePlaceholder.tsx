import type { StageName } from "@prisma/client";
import { Panel } from "@/components/design-system/Panel";
import { SubmissionChecklist } from "./SubmissionChecklist";
import { StageReviewNote } from "./StageReviewNote";
import styles from "./StagePlaceholder.module.css";

// For the stages whose guided lessons/activities and submission form aren't
// built yet (IMAGINE, ITERATE, IMPACT, INFLUENCE — Sprint 5 scope). They're
// still real, still unlockable via the normal sequential-unlock flow. The
// StageHero above this (rendered by the stage page) already shows the core
// question and required artifact; here we add what the submission must
// contain and how it's reviewed, straight from src/lib/stage-copy.ts, so
// the page is genuinely useful even before the guided flow lands.
export function StagePlaceholder({
  stageName,
  isComplete,
}: {
  stageName: StageName;
  isComplete: boolean;
}) {
  if (isComplete) {
    return (
      <Panel variant="standard">
        <p className={styles.notice}>
          You&apos;ve moved past this stage. Its guided lessons are still being built.
        </p>
      </Panel>
    );
  }

  return (
    <>
      <Panel variant="standard">
        <p className={styles.notice}>
          Guided lessons for this stage are on the way. Here&apos;s what it asks for and how it&apos;s
          reviewed. You can start gathering evidence now.
        </p>
      </Panel>
      <SubmissionChecklist stageName={stageName} />
      <StageReviewNote stageName={stageName} />
    </>
  );
}
