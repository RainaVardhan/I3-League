import { CURRICULUM_STAGES, CURRICULUM_TIMELINE } from "./stages";
import styles from "./FrameworkCard.module.css";

// The hero's visual: a clean, numbered list of the whole journey — six
// stages plus the IP Checkpoint gate — with a large faint stage-count
// watermark and a solid offset cobalt plane behind the card, the same
// "hard offset shadow" depth language used across the site (docs/design-
// system.md Section 7B) rather than a second literal element.
export function FrameworkCard() {
  return (
    <div className={styles.card}>
      <span className={styles.watermark} aria-hidden="true">
        {String(CURRICULUM_STAGES.length).padStart(2, "0")}
      </span>
      <span className={styles.eyebrow}>THE FRAMEWORK</span>
      <ol className={styles.list}>
        {CURRICULUM_TIMELINE.map((entry) => (
          <li key={entry.name} className={styles.row}>
            <span className={entry.isGate ? styles.numberGate : styles.number}>
              {entry.number}
            </span>
            <span className={entry.isGate ? styles.nameGate : styles.name}>
              {entry.isGate ? "Checkpoint" : entry.name}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
