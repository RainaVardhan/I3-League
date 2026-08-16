"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { error: string | null };

// Enforced here, not just by the UI only offering these three radio options
// — per CLAUDE.md "enforce server-side, not just in the UI." Judge/Admin
// accounts are created manually in a later sprint, never through this form,
// even if someone posts role=ADMIN directly.
const SELF_SERVE_ROLES = ["STUDENT", "PARENT", "COACH"] as const;
type SelfServeRole = (typeof SELF_SERVE_ROLES)[number];

function isSelfServeRole(value: string): value is SelfServeRole {
  return (SELF_SERVE_ROLES as readonly string[]).includes(value);
}

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");
  // Populated by the Turnstile widget in SignupForm.tsx (absent if the site
  // key isn't configured yet — Supabase simply skips verification in that
  // case, so this is safe to send unconditionally).
  const captchaToken = formData.get("cf-turnstile-response");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  // The form's minLength={8} is a UI hint only — enforce it here too, since
  // a direct POST bypasses HTML attribute validation entirely.
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!isSelfServeRole(role)) {
    return { error: "Please choose a valid account type." };
  }

  const supabase = await createClient();

  // Server Actions don't get a request URL object the way Route Handlers do
  // — the Origin header (sent by the browser on the fetch-based form post)
  // is the reliable way to know what to redirect back to after email
  // confirmation. Falls back to localhost for the rare case it's absent.
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
      emailRedirectTo: `${origin}/auth/callback`,
      captchaToken: captchaToken ? String(captchaToken) : undefined,
    },
  });

  if (error) {
    // Supabase's raw message spells out every allowed character verbatim
    // (e.g. "...!@#$%^&*()_+-=[]{};'\:\"|<>?,./`~.") — readable to a
    // developer, not to a student. Swap in a plain-English version.
    if (error.code === "weak_password") {
      return {
        error:
          "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character.",
      };
    }
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with that email already exists. Try logging in instead." };
    }
    return { error: error.message };
  }

  // When email confirmation is required, Supabase deliberately returns a
  // fake success (no error) for a signup against an already-confirmed email,
  // to avoid leaking which emails are registered. An empty `identities`
  // array is the documented way to detect that case server-side.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "An account with that email already exists. Try logging in instead." };
  }

  redirect("/signup/check-email");
}
