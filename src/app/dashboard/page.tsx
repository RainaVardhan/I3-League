import { redirect } from "next/navigation";
import { Button } from "@/components/design-system/Button";
import { GridBackground } from "@/components/design-system/GridBackground";
import { Logo } from "@/components/design-system/Logo";
import { Panel } from "@/components/design-system/Panel";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "./actions";
import styles from "./page.module.css";

export const metadata = {
  title: "Dashboard — I³ League",
};

// This page's only job right now is proving the identity chain resolves
// end to end: Supabase session -> auth.uid() -> public.User.supabaseUid ->
// role. Real per-role dashboard content is later-sprint work (Sprint 4
// for students, Sprint 7 for parents/coaches) — don't add more here.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — src/middleware.ts already redirects unauthenticated
  // requests away from /dashboard, but this page shouldn't assume that.
  if (!user) {
    redirect("/login");
  }

  const appUser = await prisma.user.findUnique({
    where: { supabaseUid: user.id },
    include: { student: true, parent: true, coach: true },
  });

  return (
    <>
      <GridBackground />
      <main className={styles.main}>
        <div className={styles.card}>
          <Logo />
          <Panel variant="standard" prominent>
            {appUser ? (
              <>
                <h1 className={styles.heading}>
                  Logged in as {appUser.email}, role {appUser.role}
                </h1>
                {appUser.role === "STUDENT" && !appUser.student && (
                  <p className={styles.notice}>
                    Registration incomplete — profile details coming in a later step.
                  </p>
                )}
                {appUser.role === "PARENT" && !appUser.parent && (
                  <p className={styles.notice}>
                    Registration incomplete — profile details coming in a later step.
                  </p>
                )}
                {appUser.role === "COACH" && !appUser.coach && (
                  <p className={styles.notice}>
                    Registration incomplete — profile details coming in a later step.
                  </p>
                )}
              </>
            ) : (
              // Would mean the auth.users -> public.User trigger didn't fire
              // — shouldn't happen in normal flow, but a clear message beats
              // a crash while this is still being hand-tested.
              <p className={styles.notice}>
                Something went wrong setting up your account. Please contact support.
              </p>
            )}
            <form action={logoutAction} className={styles.logoutForm}>
              <Button as="button" type="submit" variant="ghost" showArrow={false}>
                Log out
              </Button>
            </form>
          </Panel>
        </div>
      </main>
    </>
  );
}
