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
  /** Sprint 3's registration/payment/consent forms carry far more fields
   * than a login card — widen the card instead of cramming them into the
   * 440px auth-card width. */
  wide?: boolean;
};

// Shared centered-card shell for /login, /signup, /signup/check-email,
// /auth/auth-code-error, /register, /register/payment, and /consent — same
// layout everywhere, so it lives here once instead of many copies of the
// same page.module.css.
export function AuthCard({ heading, subheading, children, footer, wide = false }: AuthCardProps) {
  return (
    <>
      <GridBackground />
      <main className={styles.main}>
        <div className={wide ? `${styles.card} ${styles.wide}` : styles.card}>
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
