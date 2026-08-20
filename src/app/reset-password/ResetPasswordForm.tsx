"use client";

import { useActionState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import styles from "@/components/auth/AuthForm.module.css";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = { error: null };

// No Turnstile here, unlike login/signup/forgot-password — reaching this
// form at all already required clicking a real emailed reset link, which
// established the recovery session this action acts on. There's no
// unauthenticated endpoint here for a bot to hit.
export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form className={styles.form} action={formAction}>
      <Input
        label="New password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      <Input
        label="Confirm new password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {state.error && (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className={styles.submitButton}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
