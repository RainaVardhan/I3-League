import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./StageWorkflow.module.css";

// The Learn/Apply/Show/Defend pattern repeats inside every one of the six
// stages (see each entry's description in stages.ts) — this section names
// that recurring shape once, up front, instead of leaving a reader to infer
// it stage by stage.
const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Learn",
    body: "Understand the principle and why it matters.",
  },
  {
    number: "02",
    title: "Apply",
    body: "Use the principle directly on your own innovation.",
  },
  {
    number: "03",
    title: "Show",
    body: "Produce evidence of the thinking, research, testing, or decision.",
  },
  {
    number: "04",
    title: "Defend",
    body: "Explain what you did, what changed, and why your conclusion holds up.",
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
          <Eyebrow>HOW EACH STAGE WORKS</Eyebrow>
          <h2 id="workflow-title" className={styles.heading}>
            Knowledge becomes evidence.
          </h2>
          <p className={styles.copy}>
            Students do more than understand innovation concepts. They repeatedly turn what they
            learn into work that can be reviewed, tested, improved, and defended.
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
