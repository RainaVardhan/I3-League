import { SplitHero } from "@/components/design-system/SplitHero";
import { STEP_COUNT } from "./steps";
import styles from "./PageHero.module.css";

// Spelled-out form for the aria-label, e.g. "Eight steps..." — this page's
// journey is always a small, single-digit count, so a short lookup here is
// simpler than pulling in a number-to-words library for one label.
const COUNT_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

export function PageHero() {
  const stepCountLabel = String(STEP_COUNT).padStart(2, "0");
  const stepCountWord = COUNT_WORDS[STEP_COUNT] ?? String(STEP_COUNT);

  return (
    <SplitHero
      className={styles.hero}
      innerClassName={styles.inner}
      eyebrow="HOW I³ LEAGUE WORKS"
      title={
        <>
          From enrollment
          <br />
          to real impact.
        </>
      }
      lede="One clear pathway takes you from building your first profile to earning certification, competing in the Finals, and potentially turning a promising innovation into a real-world solution."
      rightSlot={
        <div
          className={styles.statBox}
          aria-label={`${stepCountWord} steps, one innovation journey`}
        >
          <span className={styles.number}>{stepCountLabel}</span>
          <span className={styles.label}>steps. One innovation.</span>
          <span className={styles.sub}>
            A structured path from getting started to making something matter.
          </span>
          <span className={styles.rule} aria-hidden="true" />
        </div>
      }
    />
  );
}
