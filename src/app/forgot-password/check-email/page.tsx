import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata = {
  title: "Check Your Email — I³ League",
};

export default function ForgotPasswordCheckEmailPage() {
  return (
    <AuthCard
      heading="Check your email"
      subheading="If that email has an account, we've sent a link to reset your password."
      footer={<Link href="/login">Back to login</Link>}
    >
      {null}
    </AuthCard>
  );
}
