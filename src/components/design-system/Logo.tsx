import Link from "next/link";
import styles from "./Logo.module.css";

type LogoProps = {
  href?: string;
  /** Light wordmark for placement on a dark surface (the app sidebar). */
  onDark?: boolean;
};

// The canonical lockup: square ink "I³" mark + "League" wordmark.
// See docs/design-system.md Section 4 — do not place this inside circles,
// cubes, hexagons, or decorative badges; the square is the canonical mark.
export function Logo({ href = "/", onDark = false }: LogoProps) {
  return (
    <Link href={href} className={onDark ? `${styles.brand} ${styles.brandOnDark}` : styles.brand}>
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.markText}>
          I<sup>3</sup>
        </span>
      </span>
      <span className={styles.word}>League</span>
    </Link>
  );
}
