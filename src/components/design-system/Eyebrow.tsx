import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

type EyebrowProps = {
  children: ReactNode;
  /**
   * "eyebrow" — 11px cobalt, the standard section/hero label.
   * "label" — 9-10px dim, small mono metadata (e.g. "PROBLEM FIELDS").
   */
  variant?: "eyebrow" | "label";
};

export function Eyebrow({ children, variant = "eyebrow" }: EyebrowProps) {
  return (
    <span className={variant === "eyebrow" ? styles.eyebrow : styles.label}>
      {children}
    </span>
  );
}
