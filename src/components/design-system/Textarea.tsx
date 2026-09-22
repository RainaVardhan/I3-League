import type { ComponentPropsWithoutRef } from "react";
import styles from "./Textarea.module.css";

type TextareaProps = {
  label: string;
  id: string;
  /** Instructions / example wording. Rendered ABOVE the box as normal text,
   *  never as placeholder text inside it, so the answer box stays empty. */
  hint?: string;
  /** Keep the label for screen readers but do not show it. */
  hideLabel?: boolean;
} & Omit<ComponentPropsWithoutRef<"textarea">, "id">;

// Same canonical treatment as Input (docs/design-system.md Section 17
// "Form inputs"), for the multi-line fields the stage submission forms
// need that Input.tsx doesn't cover.
export function Textarea({ label, id, hint, hideLabel, className, ...props }: TextareaProps) {
  return (
    <div className={className}>
      <label className={hideLabel ? "sr-only" : styles.label} htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <textarea id={id} className={styles.textarea} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
    </div>
  );
}
