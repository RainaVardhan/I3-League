import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Create Account — I³ League",
};

export default function SignupPage() {
  return (
    <AuthCard
      heading="Create your account"
      footer={
        <>
          Already have an account? <Link href="/login">Log in</Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
