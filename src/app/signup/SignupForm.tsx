"use client";

import Script from "next/script";
import { useActionState } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { useTurnstile } from "@/lib/useTurnstile";
import authFormStyles from "@/components/auth/AuthForm.module.css";
import { signupAction, type SignupState } from "./actions";

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "PARENT", label: "Parent / Guardian" },
  { value: "COACH", label: "Coach / Teacher" },
] as const;

const initialState: SignupState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const { containerRef, handleScriptLoad } = useTurnstile(!!state.error);

  return (
    <form className={authFormStyles.form} action={formAction}>
      <RadioGroup
        legend="I am a..."
        name="role"
        options={ROLE_OPTIONS}
        defaultValue={ROLE_OPTIONS[0].value}
        required
      />

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
        autoComplete="new-password"
        minLength={8}
        required
      />

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
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
