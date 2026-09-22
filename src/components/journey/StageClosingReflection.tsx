import type { StageName } from "@prisma/client";
import { getStageCopy } from "@/lib/stage-copy";
import styles from "./StageInfo.module.css";

// The stage's closing reflection: a self-check before moving on. It points at
// the guiding question in the stage hero rather than repeating it. Content
// only: the band and its rail heading come from StageReviewPage.
export function StageClosingReflection({ stageName }: { stageName: StageName }) {
  const final = getStageCopy(stageName).finalSubmission;
  if (!final) return null;

  return <p className={styles.reflectionText}>{final.closingReflection.text}</p>;
}
