import Link from "next/link";
import type { StageName } from "@prisma/client";
import { Button } from "@/components/design-system/Button";
import { getStageCopy } from "@/lib/stage-copy";
import type { StageChecklist } from "@/lib/stage-checklist";
import styles from "./DashboardHub.module.css";

type NextActionCardProps = {
  stageName: StageName;
  slug: string;
  checklist: StageChecklist;
  /** Reviewer feedback when a revision has been requested. When set it
   *  replaces the normal next action until it's resolved. (Wired for the
   *  Sprint 6 review workflow — always null in the current build.) */
  reviewFeedback?: string | null;
};

// The single most prominent "do this next" prompt, laid out like the
// homepage's final CTA (FinalCta) — an ink card with a light eyebrow,
// headline, one line of copy, and one button, on a paper section.
export function NextActionCard({ stageName, slug, checklist, reviewFeedback }: NextActionCardProps) {
  const copy = getStageCopy(stageName);
  const href = `/dashboard/${slug}`;

  let eyebrow = "Next action";
  let title: string;
  let hint: string;
  let cta = "Continue";

  if (reviewFeedback) {
    eyebrow = "Revision requested";
    title = "Resolve the reviewer's feedback";
    hint = reviewFeedback;
    cta = `Open ${copy.name} to revise`;
  } else if (checklist.submissionStatus === "submitted") {
    title = `${copy.producesArtifact} submitted`;
    hint = "It's in the queue for review. You'll get feedback here if anything needs another pass.";
    cta = "Review your submission";
  } else if (checklist.submissionStatus === "ready") {
    title = `Submit your ${copy.producesArtifact}`;
    hint = "Every requirement is checked off. Give it one last look, then submit.";
  } else if (checklist.workspacePending) {
    title = checklist.nextIncomplete ?? `Start ${copy.name}`;
    hint = `The guided ${copy.name} workspace opens in a later release. Start gathering evidence for your ${copy.producesArtifact} now.`;
  } else {
    title = checklist.nextIncomplete ?? `Finish ${copy.name}`;
    hint = `This is the next thing your ${copy.producesArtifact} needs.`;
  }

  return (
    <div className={`${styles.nextAction} ${reviewFeedback ? styles.nextActionRevision : ""}`}>
      <div>
        <span className={styles.nextActionEyebrow}>{eyebrow}</span>
        <h2 className={styles.nextActionTitle}>{title}</h2>
        <p className={styles.nextActionHint}>{hint}</p>
      </div>
      <Button as={Link} href={href} className={styles.nextActionBtn}>
        {cta}
      </Button>
    </div>
  );
}
