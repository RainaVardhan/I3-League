import styles from "./GridBackground.module.css";

// The nearly-subconscious fixed drafting grid behind page content — 72px
// cells, ~5% blue lines, fading toward the bottom. Purely decorative.
// See docs/design-system.md Section 8. Do not use the denser 30px
// "journey checker" grid here — that one is a hero-specific accent.
export function GridBackground() {
  return <div className={styles.grid} aria-hidden="true" />;
}
