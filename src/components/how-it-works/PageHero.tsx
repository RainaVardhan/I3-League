import { Eyebrow } from "@/components/design-system/Eyebrow";
import { Checkerboard } from "@/components/homepage/Checkerboard";
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
    <section className={styles.hero} aria-labelledby="page-title">
      <Checkerboard className={styles.checkerboard} />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Eyebrow>HOW I³ LEAGUE WORKS</Eyebrow>
          <h1 id="page-title" className={styles.heading}>
            From enrollment
            <br />
            to real impact.
          </h1>
          <p className={styles.lede}>
            One clear pathway takes you from your first profile to certification, Nationals, and
            the possibility of moving a promising innovation into the real world.
          </p>
        </div>
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
      </div>
    </section>
  );
}
