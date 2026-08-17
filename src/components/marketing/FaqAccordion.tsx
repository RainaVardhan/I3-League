import styles from "./FaqAccordion.module.css";

export type FaqItem = {
  question: string;
  answer: string;
};

// Native <details>/<summary> instead of a hand-rolled JS accordion —
// keyboard/screen-reader behavior comes for free (Section 16: "navigation
// must be keyboard operable"), and it works with JS disabled, so this stays
// a plain Server Component.
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.question} className={styles.item}>
          <summary className={styles.question}>
            {item.question}
            <span className={styles.icon} aria-hidden="true" />
          </summary>
          <p className={styles.answer}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
