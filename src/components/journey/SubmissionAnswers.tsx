import { formatSeasonDate } from "@/lib/season-format";
import styles from "./SubmissionAnswers.module.css";

// One row inside a section: a written answer, a yes/no confirmation, or a
// small heading introducing the group of rows below it (e.g. a set of
// confirmations, which read as orphaned check marks without one).
export type AnswerItem =
  | { label: string; value: string; checked?: undefined; heading?: undefined }
  | { label: string; checked: boolean; value?: undefined; heading?: undefined }
  | { heading: string; label?: undefined; value?: undefined; checked?: undefined };

export type AnswerSection = { title: string; items: AnswerItem[] };

type AiDisclosureSummary = {
  usedAi: boolean;
  toolName: string | null;
  purpose: string | null;
};

type SubmissionAnswersProps = {
  sections: AnswerSection[];
  photoUrl?: string | null;
  /** Only known once the stage is submitted; before that it is left out. */
  aiDisclosure?: AiDisclosureSummary | null;
  submittedAt?: Date | null;
  /** One muted line under the box (e.g. what is not uploaded). */
  footnote?: string;
};

// Everything a student has written for a stage, in one boxed place on the
// Review page, grouped by the section they answered it in. Read-only and
// purely presentational: callers build `sections` (see summary-sections.ts) so
// the same component serves the live form (values held in client state) and a
// finished, submitted stage (values read from the saved Submission).
export function SubmissionAnswers({ sections, photoUrl, aiDisclosure, submittedAt, footnote }: SubmissionAnswersProps) {
  return (
    <>
      <div className={styles.plane}>
        {sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <dl className={styles.items}>
              {section.items.map((item) =>
                item.heading !== undefined ? (
                  <div key={`heading-${item.heading}`} className={styles.groupHeading} role="heading" aria-level={4}>
                    {item.heading}
                  </div>
                ) : item.checked === undefined ? (
                  <div key={item.label}>
                    <dt className={styles.label}>{item.label}</dt>
                    <dd className={item.value.trim() ? styles.value : styles.empty}>
                      {item.value.trim() || "Not answered yet"}
                    </dd>
                  </div>
                ) : (
                  <div key={item.label} className={styles.checkRow}>
                    <dt className={styles.checkMark} data-checked={item.checked}>
                      <span aria-hidden="true">{item.checked ? "✓" : "○"}</span>
                      <span className={styles.srOnly}>{item.checked ? "Confirmed: " : "Not confirmed: "}</span>
                    </dt>
                    <dd className={item.checked ? styles.checkText : styles.checkTextOff}>{item.label}</dd>
                  </div>
                ),
              )}
            </dl>
          </section>
        ))}

        {(photoUrl || aiDisclosure) && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Attachments and disclosure</h3>
            <dl className={styles.items}>
              {photoUrl && (
                <div>
                  <dt className={styles.label}>Photo of the problem</dt>
                  <dd className={styles.value}>
                    <a href={photoUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      View uploaded photo
                    </a>
                  </dd>
                </div>
              )}
              {aiDisclosure && (
                <div>
                  <dt className={styles.label}>AI-use disclosure</dt>
                  <dd className={styles.value}>
                    {aiDisclosure.usedAi
                      ? `Used AI (${aiDisclosure.toolName ?? "unspecified tool"}) for: ${aiDisclosure.purpose ?? "not specified"}`
                      : "No AI used for this submission."}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {submittedAt && <p className={styles.meta}>Submitted on {formatSeasonDate(submittedAt)}.</p>}
      </div>
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </>
  );
}
