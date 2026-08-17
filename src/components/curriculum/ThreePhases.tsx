import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./ThreePhases.module.css";

const PHASE_ITEMS = [
  {
    kicker: "FOUNDATION",
    title: "Think",
    body: "Problem framing, research, evidence, and creative alternatives.",
  },
  {
    kicker: "DEVELOPMENT",
    title: "Build",
    body: "Testing, iteration, failure analysis, value, and real-world use.",
  },
  {
    kicker: "EXPRESSION",
    title: "Lead",
    body: "Communication, defense, reflection, and confident presentation.",
  },
];

// Three-up "proof group" grid (docs/design-system.md Section 13, Pattern C)
// — same boxed/shadowed-plane treatment as the homepage's "Why I³ League"
// boxes (ProofSection) and How It Works' WhoItsFor. Sits right after the
// six-stage breakdown, grouping those stages into the three broader phases
// of the journey.
export function ThreePhases() {
  return (
    <section className={styles.section} aria-labelledby="phases-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>THE THREE PHASES</Eyebrow>
          <h2 id="phases-title" className={styles.heading}>
            Think. Build. Lead.
          </h2>
          <p className={styles.copy}>
            Every stage in the curriculum builds toward one of three outcomes.
          </p>
        </div>

        <div className={styles.grid}>
          {PHASE_ITEMS.map((item) => (
            <article key={item.kicker}>
              <span className={styles.kicker}>{item.kicker}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
