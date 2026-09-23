import { SplitHero } from "@/components/design-system/SplitHero";
import styles from "./JournalHero.module.css";

type JournalHeroProps = {
  totalEntries: number;
  entriesThisWeek: number;
  lastEntryLabel: string | null;
};

// Same SplitHero shell as every marketing page and the dashboard hub
// (DashboardHero.tsx) — checkerboard canvas band, mono eyebrow, Chakra
// Petch H1, muted lede — with a right-slot stat box built to the exact
// PricingHero/PageHero .statBox recipe (paper, 1px line, hard
// 8px 9px 0 blue-soft offset shadow, big Chakra Petch numeral, a 64x4
// cobalt rule, mono caption) so this hero reads as the same widget family
// as every other hero on the site (docs/design-system.md Section 21.2).
export function JournalHero({ totalEntries, entriesThisWeek, lastEntryLabel }: JournalHeroProps) {
  return (
    <SplitHero
      className={styles.hero}
      eyebrow="INNOVATION JOURNAL"
      title="Your Innovation Journal"
      lede="A running, dated record of your thinking as you work through the six stages: what you tried, what you saw, what changed your mind. Editing an entry never erases the original; it adds a new, dated version underneath it."
      rightSlot={
        <div className={styles.statBox}>
          <span className={styles.label}>Entries logged</span>
          <span className={styles.amount}>{totalEntries}</span>
          <span className={styles.unit}>{totalEntries === 1 ? "entry" : "entries"} total</span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.status}>
            {entriesThisWeek} this week{lastEntryLabel ? ` · last entry ${lastEntryLabel}` : ""}
          </span>
        </div>
      }
    />
  );
}
