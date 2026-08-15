import type { ReactNode } from "react";
import styles from "./Panel.module.css";

type PanelProps = {
  children: ReactNode;
  /**
   * "standard" — paper background, hairline border, no shadow.
   * "selected" — blue-pale background with a cobalt left rule, for the one
   * thing that needs to stand out on a page.
   */
  variant?: "standard" | "selected";
  /** Adds the hard pale-blue offset shadow — reserve for real prominence. */
  prominent?: boolean;
};

export function Panel({ children, variant = "standard", prominent = false }: PanelProps) {
  const variantClass = variant === "selected" ? styles.selected : styles.standard;
  const className = prominent ? `${variantClass} ${styles.prominent}` : variantClass;
  return <div className={className}>{children}</div>;
}
