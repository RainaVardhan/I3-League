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
      reserves the column for it. Omit entirely for a single-column,
      centered hero with no side widget (FAQs, Contact Us). */
  rightSlot?: ReactNode;
  /** Page-specific padding tuning applied on top of the shared layout
      below — How It Works and Curriculum each hand-tune this slightly
      differently, so it stays out of this component. */
  className?: string;
  innerClassName?: string;
};

// Shared shell for the checkerboard-backed page hero used by every content
// page — How It Works, Curriculum, Pricing, FAQs, and Contact Us
// (PageHero.tsx / CurriculumHero.tsx / PricingHero.tsx / FaqHero.tsx /
// ContactHero.tsx) — same Eyebrow + h1 + lede structure throughout. Pages
// that pass a rightSlot get the two-column layout with that widget; pages
// that don't (FaqHero, ContactHero — no widget worth building for them)
// collapse to a centered single column via .innerSingle below. The
// homepage's JourneyHero is a deliberately separate pattern (scroll-jacked
// cube choreography) and doesn't belong here.
export function SplitHero({ eyebrow, title, lede, rightSlot, className, innerClassName }: SplitHeroProps) {
  const innerClasses = [styles.inner, rightSlot ? null : styles.innerSingle, innerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={className ? `${styles.hero} ${className}` : styles.hero}
      aria-labelledby="page-title"
    >
      <Checkerboard className={styles.checkerboard} />
      <div className={innerClasses}>
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
