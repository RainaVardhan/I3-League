import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./FinalCta.module.css";

// Pattern E from docs/design-system.md Section 13 — the strongest dark
// moment on the page, near the end, not a dark full-page shell.
export function FinalCta() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div>
            <div className={styles.eyebrowWrap}>
              <Eyebrow>ENROLLMENT OPENS SEPTEMBER 2026</Eyebrow>
            </div>
            <h2 className={styles.heading}>Your problem is the starting line.</h2>
            <p className={styles.copy}>
              Bring the question. I³ League gives you the process to turn it into something real.
            </p>
          </div>
          <Button as={Link} href="/pricing" className={styles.btn}>
            Start Your Innovation
          </Button>
        </div>
      </div>
    </section>
  );
}
