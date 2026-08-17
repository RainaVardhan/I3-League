import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | I³ League",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      heading="Reset your password"
      subheading="Enter your email and we'll send you a link to set a new one."
      footer={<Link href="/login">Back to login</Link>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
