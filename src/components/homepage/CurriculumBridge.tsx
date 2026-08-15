import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import styles from "./CurriculumBridge.module.css";

// Pattern D from docs/design-system.md Section 13 — a full-width ink band
// connecting the hero sequence to the editorial sections below it.
export function CurriculumBridge() {
  return (
    <section className={styles.bridge} aria-label="Explore the full curriculum">
      <div className={styles.inner}>
        <span className={styles.label}>THE SIX-STAGE FRAMEWORK</span>
        <Button as={Link} href="/curriculum" variant="ghost" className={styles.btn}>
          See the full curriculum
        </Button>
      </div>
    </section>
  );
}
