import styles from "./ProofSection.module.css";

const PROOF_ITEMS = [
  {
    kicker: "WHAT",
    title: "A platform for student innovation.",
    body: "Turn a problem you care about into a researched, tested, defensible innovation.",
  },
  {
    kicker: "WHO",
    title: "Students interested in solving real problems.",
    body: "Work independently or with a team, with a clear structure from first insight to final presentation.",
  },
  {
    kicker: "OUTCOME",
    title: "More than a school project.",
    body: "Build a portfolio, earn recognition, and create evidence of how your thinking changed.",
  },
];

// Connected proof group (Pattern C) — one shared paper plane subdivided by
// hairline borders rather than separate floating cards. See
// docs/design-system.md Section 13.
export function ProofSection() {
  return (
    <section className={styles.section} aria-label="Quick answers">
      <span className={styles.eyebrow}>WHY I³ LEAGUE</span>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {PROOF_ITEMS.map((item) => (
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
