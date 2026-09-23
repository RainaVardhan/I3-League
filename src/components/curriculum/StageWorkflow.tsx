import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./StageWorkflow.module.css";

// The six stages don't just teach concepts — they leave behind four
// concrete bodies of work. This section names those four outputs once, up
// front, instead of leaving a reader to infer them stage by stage.
const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Learn",
    body: "Short student notes for every topic: what it is, why it matters, an example, a common mistake, and a question to think about.",
  },
  {
    number: "02",
    title: "Do",
    body: "Activities and worksheets that turn each topic into something you actually produce for your own project.",
  },
  {
    number: "03",
    title: "Show",
    body: "One polished artifact per stage. Worksheets are working tools; the artifact is the evidence package you submit.",
  },
  {
    number: "04",
    title: "Review",
    body: "A rubric decides whether the work is ready to advance. If not, you get specific feedback, revise, and resubmit. Revision is expected, not penalized.",
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
          <Eyebrow>HOW EVERY STAGE WORKS</Eyebrow>
          <h2 id="workflow-title" className={styles.heading}>
            Learn. Do. Show. Review.
          </h2>
          <p className={styles.copy}>
            Every stage follows the same four layers. By the end, the six stage artifacts come
            together as a Final Innovation Portfolio that shows how you think, research, build,
            improve, and communicate.
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
