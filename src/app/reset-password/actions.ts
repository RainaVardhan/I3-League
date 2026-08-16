"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/passwordRecoveryCookie";
import { createClient } from "@/lib/supabase/server";

export type ResetPasswordState = { error: string | null };

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // ResetPasswordPage already redirects away without this cookie, but a
  // Server Action is its own callable endpoint — reachable directly by ID,
  // independent of whether the page that normally renders its form would
  // have redirected. The page-level check alone doesn't gate this. Checked,
  // not consumed, here: a retry after a validation error below (e.g. weak
  // password) needs the cookie to still be there.
  const cookieStore = await cookies();
  if (!cookieStore.has(PASSWORD_RECOVERY_COOKIE)) {
    return { error: "This reset link has expired. Please request a new one." };
  }

  if (!password) {
    return { error: "Password is required." };
  }
  // The form's minLength={8} is a UI hint only — enforce it here too, since
  // a direct POST bypasses HTML attribute validation entirely.
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  // No password param here beyond this — updateUser() acts on whatever
  // session is in the request's cookies, which is the short-lived recovery
  // session /auth/callback established from the emailed reset link. There's
  // no email/identity to re-check here, unlike login/signup.
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    // Same rationale as signupAction — Supabase's raw message spells out
    // every allowed character verbatim; swap in a plain-English version.
    if (error.code === "weak_password") {
      return {
        error:
          "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character.",
      };
    }
    if (error.code === "same_password") {
      return { error: "New password must be different from your current password." };
    }
    return { error: error.message };
  }

  // The recovery flow is genuinely done now — clear the marker so this
  // cookie can't be reused to reach /reset-password again later.
  cookieStore.delete(PASSWORD_RECOVERY_COOKIE);
  redirect("/dashboard");
}
