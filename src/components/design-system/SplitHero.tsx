import type { ReactNode } from "react";
import { Checkerboard } from "@/components/homepage/Checkerboard";
import { Eyebrow } from "./Eyebrow";
import styles from "./SplitHero.module.css";

type SplitHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  /** The right-hand column widget — a stat box, a framework card, etc.
      Each page owns its own widget's markup/styling; this component just
      reserves the column for it. */
  rightSlot: ReactNode;
  /** Page-specific padding tuning applied on top of the shared layout
      below — How It Works and Curriculum each hand-tune this slightly
      differently, so it stays out of this component. */
  className?: string;
  innerClassName?: string;
};

// Shared shell for the two-column, checkerboard-backed page hero used by
// How It Works and Curriculum (PageHero.tsx / CurriculumHero.tsx) — same
// Eyebrow + h1 + lede + right-side widget structure, differing only in
// copy and what fills rightSlot. The homepage's JourneyHero and the
// lighter Sprint 2 pages' PageIntro are deliberately separate patterns
// (scroll-jacked cube choreography and a simpler single-column editorial
// opener, respectively) and don't belong here.
export function SplitHero({ eyebrow, title, lede, rightSlot, className, innerClassName }: SplitHeroProps) {
  return (
    <section
      className={className ? `${styles.hero} ${className}` : styles.hero}
      aria-labelledby="page-title"
    >
      <Checkerboard className={styles.checkerboard} />
      <div className={innerClassName ? `${styles.inner} ${innerClassName}` : styles.inner}>
        <div className={styles.copy}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id="page-title" className={styles.heading}>
            {title}
          </h1>
          <p className={styles.lede}>{lede}</p>
        </div>
        {rightSlot}
      </div>
    </section>
  );
}
