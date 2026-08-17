import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./StageWorkflow.module.css";

// The six stages don't just teach concepts — they leave behind four
// concrete bodies of work. This section names those four outputs once, up
// front, instead of leaving a reader to infer them stage by stage.
const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Research Record",
    body: "Evidence, sources, interviews, assumptions, and decisions.",
  },
  {
    number: "02",
    title: "Innovation Portfolio",
    body: "The evolution of the problem, ideas, prototypes, tests, and improvements.",
  },
  {
    number: "03",
    title: "Impact Case",
    body: "Who the innovation helps, how it creates value, and what a real pilot could prove.",
  },
  {
    number: "04",
    title: "Final Defense",
    body: "A clear presentation of the innovation, the evidence behind it, and how the student's thinking changed.",
  },
];

// Heading-on-top, full-width subtext below (matching WhoItsFor/ThreePhases,
// not the old side-by-side split this used to have), connected proof group
// (Pattern C) for the four-step grid — see docs/design-system.md Section 13.
export function StageWorkflow() {
  return (
    <section className={styles.section} aria-labelledby="workflow-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>WHAT STUDENTS BUILD</Eyebrow>
          <h2 id="workflow-title" className={styles.heading}>
            The curriculum leaves evidence behind.
          </h2>
          <p className={styles.copy}>
            By the end of the I³ journey, students don&apos;t just understand innovation, they
            have a body of work that shows how they think, research, build, improve, and
            communicate.
          </p>
        </div>

        <div className={styles.grid}>
          {WORKFLOW_STEPS.map((step) => (
            <article key={step.number}>
              <span className={styles.number}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
