import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./ProblemSection.module.css";

const PROBLEM_FIELDS = [
  "Science",
  "Environment",
  "AI & Technology",
  "Healthcare",
  "Education",
  "Communities",
  "Energy",
  "Arts & Design",
  "+ anything worth solving",
];

// Editorial split (Pattern A) + information band (Pattern B) from
// docs/design-system.md Section 13.
export function ProblemSection() {
  return (
    <section className={styles.section} aria-labelledby="fields-heading">
      <div className={styles.inner}>
        <div className={styles.split}>
          <div>
            <Eyebrow>YOUR STARTING POINT</Eyebrow>
            <h2 id="fields-heading" className={styles.heading}>
              You choose the problem.
            </h2>
          </div>
          <p className={styles.copy}>
            No assigned prompt. Start with something you notice in the world around you, then use the
            I³ pathway to investigate it seriously.
          </p>
        </div>
        <div className={styles.fieldLine} aria-label="Example problem areas">
          {PROBLEM_FIELDS.map((field) => (
            <span key={field}>{field}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
