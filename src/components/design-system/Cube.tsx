import { forwardRef } from "react";
import type { CSSProperties } from "react";
import styles from "./Cube.module.css";

type CubeFace = {
  num: string;
  label: string;
};

type CubeProps = {
  /** Width/height in px. Desktop default per docs/design-system.md Section 11.
   *  The responsive size cascade (220/200/158/146px) is a hero-page concern,
   *  not baked into this primitive — pass a different size per breakpoint
   *  when wiring this into an actual page. */
  size?: number;
  /** front/right/back/left/top/bottom, matching the canonical journey order. */
  faces?: [CubeFace, CubeFace, CubeFace, CubeFace, CubeFace, CubeFace];
  /** Slow idle yaw, as at the top of the homepage hero before scroll takes
   *  over. Respects prefers-reduced-motion. */
  idleSpin?: boolean;
};

const DEFAULT_FACES: [CubeFace, CubeFace, CubeFace, CubeFace, CubeFace, CubeFace] = [
  { num: "01", label: "Insight" },
  { num: "02", label: "Investigate" },
  { num: "03", label: "Imagine" },
  { num: "04", label: "Iterate" },
  { num: "05", label: "Impact" },
  { num: "06", label: "Influence" },
];

// forwardRef exposes the rotating face element (not the outer perspective
// wrapper) so a scroll-driven sequence can override its transform every
// frame — see JourneyHero, which passes idleSpin={false} and sets
// rotateX/rotateY directly instead of relying on the idle CSS animation.
export const Cube = forwardRef<HTMLDivElement, CubeProps>(function Cube(
  { size = 248, faces = DEFAULT_FACES, idleSpin = true },
  ref,
) {
  const [front, right, back, left, top, bottom] = faces;
  const stageStyle = { "--cs": `${size}px` } as CSSProperties;

  return (
    <div className={styles.stage} style={stageStyle}>
      <div ref={ref} className={`${styles.cube} ${idleSpin ? styles.idleSpin : ""}`}>
        <div className={`${styles.face} ${styles.front}`}>
          <span className={styles.num}>{front.num}</span>
          <span className={styles.label}>{front.label}</span>
        </div>
        <div className={`${styles.face} ${styles.right}`}>
          <span className={styles.num}>{right.num}</span>
          <span className={styles.label}>{right.label}</span>
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <span className={styles.num}>{back.num}</span>
          <span className={styles.label}>{back.label}</span>
        </div>
        <div className={`${styles.face} ${styles.left}`}>
          <span className={styles.num}>{left.num}</span>
          <span className={styles.label}>{left.label}</span>
        </div>
        <div className={`${styles.face} ${styles.top}`}>
          <span className={styles.num}>{top.num}</span>
          <span className={styles.label}>{top.label}</span>
        </div>
        <div className={`${styles.face} ${styles.bottom}`}>
          <span className={styles.num}>{bottom.num}</span>
          <span className={styles.label}>{bottom.label}</span>
        </div>
      </div>
    </div>
  );
});
