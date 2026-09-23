"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/design-system/Button";
import buttonStyles from "@/components/design-system/Button.module.css";
import { Input } from "@/components/design-system/Input";
import styles from "./DeleteAccountDialog.module.css";

type DeleteAccountDialogProps = {
  /** The account's own delete server action. */
  action: (formData: FormData) => void | Promise<void>;
  userId: string;
  email: string;
  name: string;
  /** What gets destroyed with this specific role — shown as a plain list, not a generic warning. */
  consequences: string[];
};

// Every other destructive admin action in this codebase (Reject a payment,
// Reject a parent link) only needs a reason typed in — the action itself
// is recoverable (a student can resubmit, an admin can re-verify later).
// Deleting an account is not recoverable, so this asks for one more thing
// a plain Yes/No confirm doesn't: typing the exact email address, the same
// "type it to confirm" friction GitHub/Vercel use for a delete this
// permanent. The submit button stays disabled until the typed text
// matches, client-side — the real check is still server-side in
// deleteUserAction, this is just to stop an accidental click.
export function DeleteAccountDialog({ action, userId, email, name, consequences }: DeleteAccountDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

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
        Delete account
      </Button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="delete-account-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form action={action} className={styles.form}>
          <input type="hidden" name="userId" value={userId} />
          <div className={styles.head}>
            <span className={styles.kicker}>Delete account: permanent</span>
            <h2 id="delete-account-title" className={styles.title}>
              {name}
            </h2>
            <p className={styles.lead}>This can&apos;t be undone. It removes, immediately and permanently:</p>
            <ul className={styles.list}>
              {consequences.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>Their login itself.</li>
            </ul>
          </div>

          <div className={styles.body}>
            <Input
              label={`Type "${email}" to confirm`}
              id="confirmEmail"
              name="confirmEmail"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              required
            />
            <p className={styles.matchHint}>{matches ? "Matches." : "Must match exactly."}</p>
          </div>

          <div className={styles.foot}>
            <Button
              type="button"
              variant="ghost"
              showArrow={false}
              className={buttonStyles.ghostStrong}
              onClick={() => {
                setTyped("");
                dialogRef.current?.close();
              }}
            >
              Cancel
            </Button>
            <Button
              as="button"
              type="submit"
              variant="ghost"
              showArrow={false}
              className={buttonStyles.danger}
              aria-disabled={!matches}
              onClick={(event) => {
                if (!matches) event.preventDefault();
              }}
            >
              Permanently delete
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
