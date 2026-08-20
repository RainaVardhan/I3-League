import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./Checkbox.module.css";

type CheckboxProps = {
  id: string;
  label: ReactNode;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "type">;

// One labeled checkbox row. Callers arrange several inside their own grid or
// list container (interests grid, consent list) — this only owns the row
// itself, not the surrounding layout.
export function Checkbox({ id, label, ...props }: CheckboxProps) {
  return (
    <label className={styles.option} htmlFor={id}>
      <input id={id} type="checkbox" className={styles.input} {...props} />
      <span className={styles.label}>{label}</span>
    </label>
  );
}
