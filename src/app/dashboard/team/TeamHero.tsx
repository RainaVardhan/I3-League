import { SplitHero } from "@/components/design-system/SplitHero";
import heroStyles from "../journal/JournalHero.module.css";

type TeamHeroProps = {
  teamName: string;
  totalContributions: number;
  teammateCount: number;
};

// Same SplitHero shell + stat-box recipe as JournalHero, DashboardHero, and
// every other hero on the site (docs/design-system.md Section 21.2) — reuses
// JournalHero's CSS module directly rather than duplicating the identical
// stat-box rules in a second file.
export function TeamHero({ teamName, totalContributions, teammateCount }: TeamHeroProps) {
  return (
    <SplitHero
      className={heroStyles.hero}
      eyebrow="TEAM & CONTRIBUTIONS"
      title={`${teamName}'s shared record`}
      lede="A project is shared across your team, but what each of you actually did isn't. Log what you worked on here so the record of who contributed what stays honest and visible to your whole team."
      rightSlot={
        <div className={heroStyles.statBox}>
          <span className={heroStyles.label}>Contributions logged</span>
          <span className={heroStyles.amount}>{totalContributions}</span>
          <span className={heroStyles.unit}>
            {totalContributions === 1 ? "entry" : "entries"} total
          </span>
          <span className={heroStyles.rule} aria-hidden="true" />
          <span className={heroStyles.status}>
            {teammateCount} {teammateCount === 1 ? "teammate" : "teammates"} on this project
          </span>
        </div>
      }
    />
  );
}
