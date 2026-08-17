import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/passwordRecoveryCookie";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Set New Password | I³ League",
};

// Requires BOTH a valid session AND the recovery-flow cookie /auth/callback
// sets. The session check alone isn't enough — any currently-authenticated
// browser would pass it, not just one that actually came through the
// emailed reset link. See src/lib/passwordRecoveryCookie.ts for why that
// distinction matters here.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  const hasRecoveryCookie = (await cookies()).has(PASSWORD_RECOVERY_COOKIE);
  if (!hasRecoveryCookie) {
    redirect("/forgot-password");
  }

  return (
    <AuthCard heading="Set a new password">
      <ResetPasswordForm />
    </AuthCard>
  );
}
