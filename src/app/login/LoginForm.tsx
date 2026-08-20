"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { useTurnstile } from "@/lib/useTurnstile";
import authFormStyles from "@/components/auth/AuthForm.module.css";
import { loginAction, type LoginState } from "./actions";
import styles from "./LoginForm.module.css";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const { containerRef, handleScriptLoad } = useTurnstile(!!state.error);

  return (
    <form className={authFormStyles.form} action={formAction}>
      <Input
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <div className={styles.forgotRow}>
        <Link href="/forgot-password" className={styles.forgotLink}>
          Forgot password?
        </Link>
      </div>

      {/* Cloudflare Turnstile — renders into a hidden "cf-turnstile-response"
          form field automatically since it's inside the <form>; actions.ts
          reads that field and passes it to Supabase as the captcha token.
          Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set yet. */}
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
        <p className={authFormStyles.formError} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className={authFormStyles.submitButton}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
