import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { ParentProfileForm } from "./ParentProfileForm";
import { StudentRegistrationForm } from "./StudentRegistrationForm";

export const metadata = {
  title: "Register | I³ League",
};

// One route, branching server-side on role — Student and Parent each
// complete a different profile step here (see CLAUDE.md: both self-serve
// independently, there's no combined signup). Coach/Judge/Admin have no
// registration form this sprint (Coach dashboard is Sprint 7 per the build
// sequence), so they're sent back to the dashboard.
export default async function RegisterPage() {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    redirect("/login");
  }

  if (appUser.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
    if (student) {
      redirect("/register/payment");
    }
    return (
      <AuthCard heading="Complete your registration" subheading="Tell us about yourself and how you're participating this season." wide>
        <StudentRegistrationForm />
      </AuthCard>
    );
  }

  if (appUser.role === "PARENT") {
    const parent = await prisma.parent.findUnique({ where: { userId: appUser.id } });
    if (parent) {
      redirect("/dashboard");
    }
    return (
      <AuthCard heading="Complete your profile" subheading="A few details so we can connect you to your student's consent forms.">
        <ParentProfileForm />
      </AuthCard>
    );
  }

  redirect("/dashboard");
}
