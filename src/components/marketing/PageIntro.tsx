import type { ReactNode } from "react";
import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./PageIntro.module.css";

type PageIntroProps = {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
};

// Shared header for the lighter Sprint 2 content pages (Pricing, National
// Finals, FAQ, Contact, legal pages) — the
// full checkerboard/stat-box hero on the homepage and How It Works is
// deliberately reserved for those two pages (docs/design-system.md Section
// 18, rule 15: "keep the full cube-scroll sequence exclusive to places
// where storytelling warrants it"). This is just Pattern A's left-aligned
// editorial opener, single column per rule 10 ("do not center whole pages").
export function PageIntro({ eyebrow, title, lede }: PageIntroProps) {
  return (
    <section className={styles.intro}>
      <div className={styles.inner}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className={styles.heading}>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
      </div>
    </section>
  );
}
