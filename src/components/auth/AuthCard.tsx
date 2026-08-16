import type { ReactNode } from "react";
import { GridBackground } from "@/components/design-system/GridBackground";
import { Logo } from "@/components/design-system/Logo";
import { Panel } from "@/components/design-system/Panel";
import styles from "./AuthCard.module.css";

type AuthCardProps = {
  heading: string;
  subheading?: string;
  children: ReactNode;
  footer?: ReactNode;
};

// Shared centered-card shell for /login, /signup, /signup/check-email, and
// /auth/auth-code-error — same layout in all four, so it lives here once
// instead of four copies of the same page.module.css.
export function AuthCard({ heading, subheading, children, footer }: AuthCardProps) {
  return (
    <>
      <GridBackground />
      <main className={styles.main}>
        <div className={styles.card}>
          <Logo />
          <Panel variant="standard" prominent>
            <h1 className={styles.heading}>{heading}</h1>
            {subheading && <p className={styles.subheading}>{subheading}</p>}
            {children}
          </Panel>
          {footer && <p className={styles.footerLink}>{footer}</p>}
        </div>
      </main>
    </>
  );
}
