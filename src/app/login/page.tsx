import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Log In — I³ League",
};

export default function LoginPage() {
  return (
    <AuthCard
      heading="Log in"
      subheading="Welcome back."
      footer={
        <>
          New here? <Link href="/signup">Create an account</Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
