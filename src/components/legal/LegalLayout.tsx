import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/legal-nav";
import styles from "./LegalLayout.module.css";

type LegalLayoutProps = {
  title: string;
  lastUpdated: string;
  currentHref: string;
  children: ReactNode;
};

// Shared shell for /terms, /privacy, /competition-policies: cross-links
// between the three, a visible draft notice, and consistent prose styling.
//
// The draft notice matters and should stay until a real review happens:
// this is placeholder policy language written to establish the *shape* of
// each document for the MVP (Sprint 2, per CLAUDE.md), not reviewed legal
// copy. i3League deals with minors and parental consent, so publishing
// these as if final — before an actual legal review — would be misleading
// to families. Remove the notice only once a real review has happened.
export function LegalLayout({ title, lastUpdated, currentHref, children }: LegalLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.subnav} aria-label="Legal pages">
          {LEGAL_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className={page.href === currentHref ? styles.subnavLinkActive : styles.subnavLink}
              aria-current={page.href === currentHref ? "page" : undefined}
            >
              {page.label}
            </Link>
          ))}
        </nav>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Last updated: {lastUpdated}</p>

        <div className={styles.notice}>
          <strong>Draft: pending legal review.</strong> This document establishes the shape of
          our {title.toLowerCase()} for the 2026–2027 season launch. It has not yet been reviewed
          by counsel and should not be treated as final. Questions in the meantime can go to{" "}
          <a href="mailto:info@i3league.com">info@i3league.com</a>.
        </div>

        <div className={styles.prose}>{children}</div>
      </div>
    </div>
  );
}
