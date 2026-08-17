import { SplitHero } from "@/components/design-system/SplitHero";
import styles from "./ContactHero.module.css";

// Same SplitHero shell as How It Works, Curriculum, Pricing, and FAQs, but
// with no rightSlot — collapses to SplitHero's centered single-column mode
// (SplitHero.module.css's .innerSingle) instead of a stat-card widget.
export function ContactHero() {
  return (
    <SplitHero
      className={styles.hero}
      eyebrow="CONTACT US"
      title="We're here to help."
      lede="Have a question that's not answered on the FAQ page? Reach the right team below."
    />
  );
}
