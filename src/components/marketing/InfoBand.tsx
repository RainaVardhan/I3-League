import type { ReactNode } from "react";
import styles from "./InfoBand.module.css";

type InfoBandProps = {
  title: string;
  children: ReactNode;
};

// Pattern B ("information band") from docs/design-system.md Section 13 —
// tinted band with a strong cobalt left rule, used for eligibility,
// deadlines, requirements, and other structured summaries instead of a
// pile of small pills/cards.
export function InfoBand({ title, children }: InfoBandProps) {
  return (
    <div className={styles.band}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
