"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/design-system/Logo";
import { logoutAction } from "@/app/dashboard/actions";
import styles from "./AdminShell.module.css";

type AdminShellProps = {
  adminName: string;
  breadcrumb: string;
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  icon: ReactNode;
};

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h6v6H4zM14 4h6v10h-6zM4 14h6v6H4zM14 18h6v2h-6z" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h4" strokeLinecap="round" />
    </svg>
  );
}

function SafetyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5 5 6.2v5.3c0 4.7 3 7.9 7 9 4-1.1 7-4.3 7-9V6.2z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ParentLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M9.5 14.5 14.5 9.5M8.3 11.8l-1.6 1.6a2.8 2.8 0 0 0 4 4l1.6-1.6M15.7 12.2l1.6-1.6a2.8 2.8 0 0 0-4-4l-1.6 1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M4 19c0-2.9 2.2-5 5-5s5 2.1 5 5M14 15.2c2.4.2 4 1.8 4 3.8" strokeLinecap="round" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 3-9 5 9 5 9-5-9-5Z" strokeLinejoin="round" />
      <path d="M6.5 10.7V16c0 1.4 2.7 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-5.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SeasonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubmissionsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3.5h7l4 4V20H7z" strokeLinejoin="round" />
      <path d="M14 3.5V8h4M10 12h5M10 15.5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="6.5" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <circle cx="18" cy="17" r="2.5" />
      <path d="M11 9 7 14.7M13 9l4 5.7M8.5 17h7" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", exact: true, icon: <OverviewIcon /> },
  { href: "/admin/progress", label: "Season progress", icon: <ProgressIcon /> },
  { href: "/admin/payments", label: "Payments", icon: <PaymentsIcon /> },
  { href: "/admin/safety", label: "Safety reviews", icon: <SafetyIcon /> },
  { href: "/admin/parent-links", label: "Parent links", icon: <ParentLinkIcon /> },
  { href: "/admin/submissions", label: "Submissions", icon: <SubmissionsIcon /> },
  { href: "/admin/teams", label: "Teams", icon: <TeamsIcon /> },
  { href: "/admin/users", label: "Users", icon: <UsersIcon /> },
  { href: "/admin/schools", label: "Schools", icon: <SchoolIcon /> },
  { href: "/admin/season", label: "Season", icon: <SeasonIcon /> },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

// Shared chrome for every /admin page, built on the same navy rail/flyout
// mechanics as the Student AppShell (src/components/app/AppShell.tsx) so
// the two read as the same system rather than two different shells — the
// earlier always-on paper sidebar was a real inconsistency, not a
// deliberate simplification worth keeping.
//
// Trimmed relative to AppShell: no journey rail, no per-stage expanding
// section lists, no context portal — just flat nav rows behind the same
// rest-as-rail / open-as-fixed-panel-with-scrim behavior.
export function AdminShell({ adminName, breadcrumb, children }: AdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open);
    setProfileOpen(false);
  }, []);

  const handleProfileClick = useCallback(() => {
    if (menuOpen) {
      setProfileOpen((open) => !open);
    } else {
      setMenuOpen(true);
      setProfileOpen(true);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <div className={`${styles.shell} ${menuOpen ? styles.shellOpen : ""}`}>
      <aside className={styles.sidebar} aria-label="Admin">
        <div className={styles.brandRow}>
          <Logo href="/admin" onDark />
          <button
            type="button"
            className={styles.menuToggle}
            aria-label={menuOpen ? "Collapse menu" : "Expand menu"}
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span className={styles.menuBar} />
            <span className={styles.menuBar} />
            <span className={styles.menuBar} />
          </button>
        </div>
        <div className={styles.workspaceTag}>Admin</div>

        <nav className={styles.nav} aria-label="Admin sections">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                onClick={closeMenu}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={styles.navText}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`${styles.sidebarBottom} ${profileOpen ? styles.sidebarBottomOpen : ""}`}>
          <button
            type="button"
            className={styles.adminChip}
            aria-expanded={profileOpen}
            aria-label={`${adminName} account menu`}
            onClick={handleProfileClick}
          >
            <span className={styles.avatar} aria-hidden="true">
              {initials(adminName)}
            </span>
            <span className={styles.adminText}>
              <b>{adminName}</b>
              <span>Admin</span>
            </span>
            <svg
              className={styles.chipChevron}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {menuOpen && profileOpen && (
            <div className={styles.profileMenu}>
              <Link href="/dashboard" className={styles.exitLink} onClick={closeMenu}>
                Exit to dashboard
              </Link>
              <form action={logoutAction}>
                <button type="submit" className={styles.logoutRow}>
                  <span className={styles.logoutIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path
                        d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M4 12h11"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  Log out
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayShow : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.breadcrumb}>Admin / {breadcrumb}</span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
