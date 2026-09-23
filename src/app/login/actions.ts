"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/account-field-limits";
import { getCurrentAppUser } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // Populated by the Turnstile widget in LoginForm.tsx (absent if the site
  // key isn't configured yet — Supabase simply skips verification in that
  // case, so this is safe to send unconditionally).
  const captchaToken = formData.get("cf-turnstile-response");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  // No real account has credentials this long — reject before ever calling
  // Supabase, both to avoid sending an oversized payload and to stop this
  // form from being used to throw arbitrarily large input at that API.
  // Same generic message as a real wrong-credentials failure below, so this
  // can't be used to distinguish "too long" from "wrong" (enumeration).
  if (email.length > EMAIL_MAX_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return { error: "Incorrect email or password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken: String(captchaToken) } : undefined,
  });

  if (error) {
    // Deliberately generic — don't reveal whether the email exists.
    return { error: "Incorrect email or password." };
  }

  // Admin has its own landing page — everyone else goes to the shared hub.
  const appUser = await getCurrentAppUser();
  redirect(appUser?.role === "ADMIN" ? "/admin" : "/dashboard");
}
