"use client";

import { useActionState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import authFormStyles from "@/components/auth/AuthForm.module.css";
import { parentRegisterAction, type RegisterState } from "./actions";

const initialState: RegisterState = { error: null };

export function ParentProfileForm() {
  const [state, formAction, pending] = useActionState(parentRegisterAction, initialState);

  return (
    <form className={authFormStyles.form} action={formAction}>
      <Input label="Full name" id="fullName" name="fullName" autoComplete="name" required />
      <Input label="Phone" id="phone" name="phone" type="tel" autoComplete="tel" required />

      {state.error && (
        <p className={authFormStyles.formError} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className={authFormStyles.submitButton}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
