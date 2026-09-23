"use client";

import { useRef } from "react";
import { Button } from "@/components/design-system/Button";
import styles from "./ConfirmSubmitButton.module.css";

type ConfirmSubmitButtonProps = {
  /** The `id` of the server-action `<form>` this button ultimately submits. */
  formId: string;
  label: string;
  title: string;
  message: string;
  confirmLabel?: string;
};

// A submit button that asks first — same native <dialog>/showModal() pattern
// as the stage pages' own MissingItemsDialog, sized down to a plain
// confirm/cancel instead of a checklist. The trigger is a plain type="button"
// (never submits on its own); the dialog's own confirm button is the real
// type="submit", associated with the outer form by `form={formId}` (the
// native attribute that lets a button submit a form it isn't nested inside —
// this dialog renders as its own top-level element once open, not a child of
// the form), so a click here is the only path that actually submits.
export function ConfirmSubmitButton({
  formId,
  label,
  title,
  message,
  confirmLabel = "Yes, save changes",
}: ConfirmSubmitButtonProps) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button as="button" type="button" showArrow={false} onClick={() => ref.current?.showModal()}>
        {label}
      </Button>
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby="confirm-submit-title"
        // A click on the backdrop lands on the <dialog> element itself.
        onClick={(event) => {
          if (event.target === ref.current) ref.current?.close();
        }}
      >
        <div className={styles.head}>
          <span className={styles.kicker}>Confirm</span>
          <h2 id="confirm-submit-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.lead}>{message}</p>
        </div>
        <div className={styles.foot}>
          <Button type="button" variant="ghost" showArrow={false} onClick={() => ref.current?.close()}>
            Cancel
          </Button>
          <Button
            as="button"
            type="submit"
            form={formId}
            showArrow={false}
            onClick={() => ref.current?.close()}
          >
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
