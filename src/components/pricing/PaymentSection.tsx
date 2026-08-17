import { Eyebrow } from "@/components/design-system/Eyebrow";
import styles from "./PaymentSection.module.css";

const PAYMENT_METHODS = ["PayPal", "Venmo", "Zelle"];

// Full-width ink band — Pattern D from docs/design-system.md Section 13,
// used for a high-confidence program statement (payment verification is
// per-student, see CLAUDE.md "Payment flow & pricing model"). Not Pattern
// E: there's no CTA button here, and Pattern E is reserved for the
// homepage's FinalCta (see that component's own comment).
export function PaymentSection() {
  return (
    <section className={styles.section} aria-labelledby="payment-title">
      <div className={styles.inner}>
        <div className={styles.panel}>
          <div className={styles.eyebrowWrap}>
            <Eyebrow>HOW PAYMENT WORKS</Eyebrow>
          </div>
          <h2 id="payment-title" className={styles.heading}>
            Payment stays individual.
          </h2>

          <div className={styles.methods} aria-label="Accepted payment methods">
            {PAYMENT_METHODS.map((method) => (
              <div key={method} className={styles.method}>
                <span className={styles.name}>{method}</span>
              </div>
            ))}
          </div>

          <p className={styles.verification}>
            An admin verifies each student&apos;s payment individually. One teammate&apos;s
            payment being unverified never blocks another teammate&apos;s dashboard,
            curriculum, or certification track.
          </p>
        </div>
      </div>
    </section>
  );
}
