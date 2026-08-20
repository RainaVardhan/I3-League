import type { ComponentType } from "react";
import styles from "./PaymentMethodIcon.module.css";

// Simplified, brand-colored renditions (not the exact trademarked
// wordmarks) — enough to read as "the real app" via color + silhouette
// without reproducing anyone's exact logo file.
function PayPalMark() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect width="40" height="40" fill="#003087" />
      <text x="21" y="27" fontFamily="var(--font-display), sans-serif" fontSize="21" fontWeight="700" fill="#5B8FF5" transform="skewX(-8)">
        P
      </text>
      <text x="14" y="27" fontFamily="var(--font-display), sans-serif" fontSize="21" fontWeight="700" fill="#FFFFFF" transform="skewX(-8)">
        P
      </text>
    </svg>
  );
}

function VenmoMark() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect width="40" height="40" fill="#008CFF" />
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontFamily="var(--font-display), sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#FFFFFF"
        transform="skewX(-8)"
      >
        V
      </text>
    </svg>
  );
}

function ZelleMark() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect width="40" height="40" fill="#6D1ED4" />
      {/* Bold "Z" built from strokes rather than a font glyph, closer to
          Zelle's own blocky arrow-like mark than a plain letterform. */}
      <path
        d="M11 12H27L15.5 25H27.5V28H10V25L21.5 15H11V12Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

const METHOD_MARKS: Record<"PAYPAL" | "VENMO" | "ZELLE", ComponentType> = {
  PAYPAL: PayPalMark,
  VENMO: VenmoMark,
  ZELLE: ZelleMark,
};

export function PaymentMethodIcon({ method }: { method: "PAYPAL" | "VENMO" | "ZELLE" }) {
  const Mark = METHOD_MARKS[method];
  return (
    <span className={styles.icon}>
      <Mark />
    </span>
  );
}
