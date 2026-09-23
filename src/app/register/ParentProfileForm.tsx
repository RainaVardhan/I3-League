"use client";

import { useActionState, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { PHONE_MAX_LENGTH } from "@/lib/account-field-limits";
import { NAME_MAX_LENGTH } from "@/lib/reasonable-text";
import authFormStyles from "@/components/auth/AuthForm.module.css";
import { parentRegisterAction, type RegisterState } from "./actions";

const initialState: RegisterState = { error: null };

export function ParentProfileForm() {
  const [state, formAction, pending] = useActionState(parentRegisterAction, initialState);

  // Controlled so a validation error doesn't wipe what was already typed —
  // React 19 resets a <form action={...}> after every call, success or
  // error, which an uncontrolled field can't survive.
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const flagged = state.fields ?? [];
  function fieldError(field: string): string | undefined {
    if (!flagged.includes(field)) return undefined;
    return flagged.length === 1 ? state.error ?? undefined : "Please fill this in.";
  }

  return (
    <form className={authFormStyles.form} action={formAction}>
      <Input
        label="Full name"
        id="fullName"
        name="fullName"
        autoComplete="name"
        required
        maxLength={NAME_MAX_LENGTH}
        value={fullName}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setFullName(event.target.value)}
        error={fieldError("fullName")}
      />
      <Input
        label="Phone"
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        maxLength={PHONE_MAX_LENGTH}
        value={phone}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)}
        error={fieldError("phone")}
      />

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
