import type { ReactNode } from "react";
import styles from "./StageBand.module.css";

export type BandTone = "paper" | "canvas";

type StageBandProps = {
  tone: BandTone;
  /** Anchor id, used by the sidebar section links. */
  id?: string;
  /** The section heading (and, for Show, the "Must include" list). When given,
   *  it is stacked above the content at the full container width, the way How
   *  It Works lays out its sections. Without it the band is a single 900px
   *  reading column. */
  rail?: ReactNode;
  /** Full container width without a rail (e.g. the Back / Next row, so it lines
   *  up with the edges of the railed bands above it). */
  wide?: boolean;
  children: ReactNode;
};

// One full-bleed band of a stage page, in warm paper (white) or the
// light-blue canvas, the same two surfaces Home / How It Works / Curriculum /
// Pricing alternate (docs/design-system.md Section 21.1). The stage hero above
// is canvas, so the open page starts with a paper band.
export function StageBand({ tone, id, rail, wide, children }: StageBandProps) {
  const toneClass = tone === "paper" ? styles.paper : styles.canvas;

  return (
    <section id={id} className={`${styles.band} ${toneClass}`}>
      {rail ? (
        <div className={styles.split}>
          <aside className={styles.rail}>{rail}</aside>
          <div className={styles.main}>{children}</div>
        </div>
      ) : (
        <div className={wide ? styles.innerWide : styles.inner}>{children}</div>
      )}
    </section>
  );
}

type RailHeadingProps = {
  /** Mono cobalt kicker above the title, e.g. "Learn". */
  kicker: string;
  title?: string;
};

// The heading that goes in a band's rail: a kicker, then the title in the
// display face. Every rail title is the same size (Observation Skills,
// 3-Day Friction Hunt, Must include, and the Review titles alike).
export function RailHeading({ kicker, title }: RailHeadingProps) {
  return (
    <div className={styles.railHeading}>
      <span className={styles.railKicker}>{kicker}</span>
      {title && <h2 className={styles.railTitle}>{title}</h2>}
    </div>
  );
}
