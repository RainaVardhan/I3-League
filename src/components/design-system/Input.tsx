import type { ComponentPropsWithoutRef } from "react";
import styles from "./Input.module.css";

type InputProps = {
  label: string;
  id: string;
  error?: string;
  /** Instructions / example wording, shown above the box instead of as
   *  placeholder text inside it. */
  hint?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "id">;

// Canonical form input per docs/design-system.md Section 17 "Form inputs".
// Error state pairs a coral border with explicit text — never color alone.
export function Input({ label, id, error, hint, className, ...props }: InputProps) {
  const inputClassName = error
    ? `${styles.input} ${styles.inputError}`
    : styles.input;

  return (
    <div className={className}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <input
        id={id}
        className={inputClassName}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
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
