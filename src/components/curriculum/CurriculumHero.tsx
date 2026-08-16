import { Eyebrow } from "@/components/design-system/Eyebrow";
import { Checkerboard } from "@/components/homepage/Checkerboard";
import { FrameworkCard } from "./FrameworkCard";
import styles from "./CurriculumHero.module.css";

// Same checkerboard-hero treatment as How It Works (src/components/how-it-
// works/PageHero.tsx): a full-bleed Checkerboard behind the section, scoped
// with isolation: isolate so its negative z-index resolves against this
// section instead of drifting behind unrelated page-level layers.
export function CurriculumHero() {
  return (
    <section className={styles.hero} aria-labelledby="page-title">
      <Checkerboard className={styles.checkerboard} />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Eyebrow>THE I³ CURRICULUM</Eyebrow>
          <h1 id="page-title" className={styles.heading}>
            Learn to think.
            <br />
            Build to prove it.
          </h1>
          <p className={styles.lede}>
            Six stages teach students how to move from a real problem to a researched, tested,
            valuable innovation, then explain and defend the work with confidence.
          </p>
        </div>
        <FrameworkCard />
      </div>
    </section>
  );
}
