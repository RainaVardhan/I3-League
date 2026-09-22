import { formatSeasonDate } from "@/lib/season";
import styles from "./SubmissionSummary.module.css";

type SummaryField = { label: string; value: string };

type AiDisclosureSummary = {
  usedAi: boolean;
  toolName: string | null;
  purpose: string | null;
  selfCreatedPortion: string | null;
  verificationMethod: string | null;
};

type SubmissionSummaryProps = {
  fields: SummaryField[];
  photoUrl?: string | null;
  aiDisclosure: AiDisclosureSummary | null;
  submittedAt: Date | null;
};

// Read-only view of an already-COMPLETE stage's Submission — a student (or
// their parent looking over their shoulder) should be able to look back at
// finished work, not just at what's currently in progress.
export function SubmissionSummary({ fields, photoUrl, aiDisclosure, submittedAt }: SubmissionSummaryProps) {
  return (
    <dl className={styles.list}>
      {fields.map((field) => (
        <div key={field.label}>
          <dt className={styles.term}>{field.label}</dt>
          <dd className={styles.value}>{field.value || "Not provided"}</dd>
        </div>
      ))}

      {photoUrl && (
        <div>
          <dt className={styles.term}>Photo</dt>
          <dd className={styles.value}>
            <a href={photoUrl} target="_blank" rel="noopener noreferrer" className={styles.photoLink}>
              View uploaded photo
            </a>
          </dd>
        </div>
      )}

      {aiDisclosure && (
        <div>
          <dt className={styles.term}>AI-use disclosure</dt>
          <dd className={styles.value}>
            {aiDisclosure.usedAi
              ? `Used AI (${aiDisclosure.toolName ?? "unspecified tool"}) for: ${aiDisclosure.purpose ?? "not specified"}`
              : "No AI used for this submission."}
          </dd>
        </div>
      )}

      {submittedAt && <p className={styles.meta}>Submitted on {formatSeasonDate(submittedAt)}.</p>}
    </dl>
  );
}
