"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = { error: string | null };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  // Populated by the Turnstile widget in ForgotPasswordForm.tsx (absent if
  // the site key isn't configured yet — Supabase simply skips verification
  // in that case, so this is safe to send unconditionally).
  const captchaToken = formData.get("cf-turnstile-response");

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  // Supabase deliberately returns success here regardless of whether the
  // email is registered, to prevent an attacker from using this form to
  // discover which emails have accounts. Don't add an "already exists" /
  // "not found" branch like signupAction's — that would defeat the
  // protection Supabase already gives us for free on this endpoint.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
    captchaToken: captchaToken ? String(captchaToken) : undefined,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/forgot-password/check-email");
}
