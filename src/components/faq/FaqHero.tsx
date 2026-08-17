import { SplitHero } from "@/components/design-system/SplitHero";
import styles from "./FaqHero.module.css";

// Same SplitHero shell as How It Works, Curriculum, and Pricing, but with
// no rightSlot — collapses to SplitHero's centered single-column mode
// (SplitHero.module.css's .innerSingle) instead of a stat-card widget.
export function FaqHero() {
  return (
    <SplitHero
      className={styles.hero}
      eyebrow="FREQUENTLY ASKED QUESTIONS"
      title="Questions, answered."
      lede="Everything students, parents, and coaches most often ask about registering, teaming up, and moving through the I³ pathway."
    />
  );
}
