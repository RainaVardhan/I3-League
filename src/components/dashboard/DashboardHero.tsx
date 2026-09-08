import type { StageName } from "@prisma/client";
import { SplitHero } from "@/components/design-system/SplitHero";
import { StageCard } from "./StageCard";
import styles from "./DashboardHero.module.css";

type DashboardHeroProps = {
  firstName: string;
  /** The one-line "Your innovation: …" identity for the project. */
  innovation: string;
  /** For a team project: the team name and member first names. */
  team?: { name: string; members: string[] } | null;
  currentStage: StageName | null;
};

// The dashboard "Top" — answers "where am I?" at a glance. Same checkerboard
// SplitHero shell as every marketing page, with the current stage's card
// (StageCard, styled after the company's Stage Icon System cards) as the
// visual. Deliberately minimal: welcome line + what they're actually
// building. Everything else (stage detail, next action, checklist,
// deadline) lives in its own block below.
export function DashboardHero({ firstName, innovation, team, currentStage }: DashboardHeroProps) {
  return (
    <SplitHero
      className={styles.hero}
      eyebrow="STUDENT DASHBOARD"
      title={<>Welcome back, {firstName}.</>}
      lede={
        <>
          <span className={styles.innovation}>Your innovation: {innovation}</span>
          {team && (
            <span className={styles.team}>
              Team {team.name}
              {team.members.length > 0 && ` · ${team.members.join(", ")}`}
            </span>
          )}
        </>
      }
      rightSlot={
        <div className={styles.visual}>
          <StageCard stage={currentStage ?? "COMPLETE"} />
        </div>
      }
    />
  );
}
