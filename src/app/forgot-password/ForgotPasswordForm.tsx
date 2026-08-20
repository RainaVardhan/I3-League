"use client";

import Script from "next/script";
import { useActionState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { useTurnstile } from "@/lib/useTurnstile";
import styles from "@/components/auth/AuthForm.module.css";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);
  const { containerRef, handleScriptLoad } = useTurnstile(!!state.error);

  return (
    <form className={styles.form} action={formAction}>
      <Input
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            onLoad={handleScriptLoad}
          />
          <div ref={containerRef} />
        </>
      )}

      {state.error && (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className={styles.submitButton}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
