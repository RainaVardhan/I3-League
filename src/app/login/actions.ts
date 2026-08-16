"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  redirect("/dashboard");
}
