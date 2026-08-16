import type { ComponentPropsWithoutRef } from "react";
import styles from "./Input.module.css";

type InputProps = {
  label: string;
  id: string;
  error?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "id">;

// Canonical form input per docs/design-system.md Section 17 "Form inputs".
// Error state pairs a coral border with explicit text — never color alone.
export function Input({ label, id, error, className, ...props }: InputProps) {
  const inputClassName = error
    ? `${styles.input} ${styles.inputError}`
    : styles.input;

  return (
    <div className={className}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={inputClassName}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
