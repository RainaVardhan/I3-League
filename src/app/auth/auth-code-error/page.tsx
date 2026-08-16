import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata = {
  title: "Link Expired — I³ League",
};

export default function AuthCodeErrorPage() {
  return (
    <AuthCard
      heading="Link invalid or expired"
      subheading="This confirmation link no longer works. Try logging in, or sign up again to get a new one."
      footer={<Link href="/login">Back to login</Link>}
    >
      {null}
    </AuthCard>
  );
}
