"use client";

import { useRef } from "react";
import { Button } from "@/components/design-system/Button";
import buttonStyles from "@/components/design-system/Button.module.css";
import { Textarea } from "@/components/design-system/Textarea";
import styles from "./RejectDialog.module.css";

type RejectDialogProps = {
  /** The queue's own reject server action (rejectPaymentAction, etc.). */
  action: (formData: FormData) => void | Promise<void>;
  /** The hidden id field the action expects, e.g. "paymentId". */
  idField: string;
  idValue: string;
  /** The action's reason field name — "reason" for payments, "notes" for
   *  safety reviews; the two queues named it differently before this
   *  existed, and this dialog doesn't change either action's contract. */
  reasonField: string;
  maxLength: number;
  /** What's being rejected, shown in the dialog's title (a student's name,
   *  a project title). */
  subject: string;
  /** Extra hidden fields the action needs beyond idField/idValue — e.g. the
   *  parent-links queue's action takes both a studentId and a parentId. */
  extraFields?: { name: string; value: string }[];
  /** Button/heading wording. Defaults to a rejection; a refund reuses this. */
  verb?: string;
  lead?: string;
};

// The Reject button on an admin queue row now opens this instead of
// revealing an always-visible reason box next to the button — a reason is
// required either way (the server actions already refuse an empty one),
// so asking for it in a focused popup reads as a real, deliberate action
// rather than a stray text field sitting in the row at all times. A native
// <dialog> (showModal), same recipe as MissingItemsDialog: the browser
// handles the backdrop, focus trap, and Escape to cancel.
export function RejectDialog({
  action,
  idField,
  idValue,
  reasonField,
  maxLength,
  subject,
  extraFields,
  verb = "Reject",
  lead = "This reason is what the student sees, so be specific about what to fix.",
}: RejectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button
        as="button"
        type="button"
        variant="ghost"
        showArrow={false}
        className={buttonStyles.danger}
        onClick={() => dialogRef.current?.showModal()}
      >
        {verb}
      </Button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={`reject-title-${idValue}`}
        // A click on the backdrop lands on the <dialog> element itself.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form action={action} className={styles.form}>
          <input type="hidden" name={idField} value={idValue} />
          {extraFields?.map((field) => (
            <input key={field.name} type="hidden" name={field.name} value={field.value} />
          ))}
          <div className={styles.head}>
            <span className={styles.kicker}>{verb}</span>
            <h2 id={`reject-title-${idValue}`} className={styles.title}>
              {subject}
            </h2>
            <p className={styles.lead}>{lead}</p>
          </div>

          <div className={styles.body}>
            <Textarea
              label={`Reason for ${verb.toLowerCase()}`}
              id={`reject-reason-${idValue}`}
              name={reasonField}
              required
              maxLength={maxLength}
            />
          </div>

          <div className={styles.foot}>
            <Button
              type="button"
              variant="ghost"
              showArrow={false}
              className={buttonStyles.ghostStrong}
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button
              as="button"
              type="submit"
              variant="ghost"
              showArrow={false}
              className={buttonStyles.danger}
            >
              {verb}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
