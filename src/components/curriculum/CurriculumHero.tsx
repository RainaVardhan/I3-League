import { SplitHero } from "@/components/design-system/SplitHero";
import { FrameworkCard } from "./FrameworkCard";
import styles from "./CurriculumHero.module.css";

export function CurriculumHero() {
  return (
    <SplitHero
      className={styles.hero}
      eyebrow="THE I³ CURRICULUM"
      title={
        <>
          Learn to think.
          <br />
          Build to prove it.
        </>
      }
      lede="Six stages teach students how to move from a real problem to a researched, tested, valuable innovation, then explain and defend the work with confidence."
      rightSlot={<FrameworkCard />}
    />
  );
}
