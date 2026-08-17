import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata = {
  title: "Check Your Email | I³ League",
};

export default function CheckEmailPage() {
  return (
    <AuthCard
      heading="Check your email"
      subheading="If that email isn't already registered, we've sent a confirmation link. Click it to activate your account, then log in."
      footer={<Link href="/login">Back to login</Link>}
    >
      {null}
    </AuthCard>
  );
}
