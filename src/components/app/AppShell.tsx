"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/design-system/Logo";
import { STAGE_NUMBERS, type JourneyItem } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";
import { logoutAction } from "@/app/dashboard/actions";
import styles from "./AppShell.module.css";

type AppShellProps = {
  studentName: string;
  /** Small line under the student name, e.g. "Grade 9 · Team Nova". */
  studentMeta: string;
  /** The six-stage journey, used for the sidebar stage list + lock state. */
  journey: JourneyItem[];
  /** Last crumb after "Workspace /" in the topbar, e.g. "Overview" or "Imagine". */
  breadcrumb: string;
  children: ReactNode;
};

const STATE_LABEL: Record<JourneyItem["status"], string> = {
  LOCKED: "Locked",
  CURRENT: "Current",
  COMPLETE: "Done",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

// Shared chrome for every authenticated Student page (the /dashboard hub and
// every /dashboard/[stage] page). The dark navy sidebar (an owner-approved
// departure from design-system Section 18 rule 1) doubles as the six-stage
// journey rail, so the two can't drift apart.
//
// It rests as a thin icon rail that is always on screen. The rail shows a
// menu button where a logo would go; pressing it EXPANDS the sidebar as an
// overlay that floats on top of the page (with a dimming scrim) and reveals
// the logo + full labels. Expanding never reflows the page: the grid's
// first column stays the rail width and the widened sidebar is
// position:fixed on top. The flyout closes on a nav click, the scrim, or
// Escape. Locked stages render as plain rows, not links (CLAUDE.md
// "Sequential stage unlocking").
export function AppShell({ studentName, studentMeta, journey, breadcrumb, children }: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // The profile bar at the bottom toggles a small "Logout" section instead
  // of a permanently-visible logout button.
  const [profileOpen, setProfileOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, []);

  // Toggling the rail open/closed always collapses the Logout section too,
  // so a collapsed rail never shows the logout control (it only exists
  // inside the open flyout, revealed by clicking the profile bar).
  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open);
    setProfileOpen(false);
  }, []);

  // Clicking the profile bar: in the rail there is no room for a menu, so
  // open the flyout and reveal the logout section at once; in the open
  // flyout, just toggle the section.
  const handleProfileClick = useCallback(() => {
    if (menuOpen) {
      setProfileOpen((p) => !p);
    } else {
      setMenuOpen(true);
      setProfileOpen(true);
    }
  }, [menuOpen]);

  // Close the flyout (and the profile section) on Escape while open. Route
  // changes close it via the nav links' own onClick (closeMenu) rather than
  // a pathname effect, which would setState synchronously on every render.
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
      <aside className={styles.sidebar} aria-label="Student workspace">
        <div className={styles.brandRow}>
          <Logo href="/dashboard" onDark />
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
        <div className={styles.workspaceTag}>Student workspace</div>

        <nav className={styles.nav} aria-label="Workspace">
          <Link
            href="/dashboard"
            className={styles.navItem}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            title="Dashboard"
            onClick={closeMenu}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h6v6H4zM14 4h6v10h-6zM4 14h6v6H4zM14 18h6v2h-6z" />
              </svg>
            </span>
            <span className={styles.navText}>Dashboard</span>
          </Link>

          <p className={styles.navLabel}>Your journey</p>
          <ol className={styles.stageList}>
            {journey.map((item) => {
              const label = getStageCopy(item.stage).name;
              const href = `/dashboard/${item.slug}`;
              const isActive = pathname === href;
              const rowClass = [
                styles.stageRow,
                item.status === "COMPLETE" ? styles.stageRowDone : "",
                item.status === "CURRENT" ? styles.stageRowCurrent : "",
                item.status === "LOCKED" ? styles.stageRowLocked : "",
                isActive ? styles.stageRowActive : "",
              ]
                .filter(Boolean)
                .join(" ");

              const inner = (
                <>
                  <span className={styles.stageNum}>{STAGE_NUMBERS[item.stage]}</span>
                  <span className={styles.stageName}>{label}</span>
                  <span className={styles.stageState}>{STATE_LABEL[item.status]}</span>
                </>
              );

              return (
                <li key={item.stage}>
                  {item.status === "LOCKED" ? (
                    <span className={rowClass} title={`${label} (locked)`}>
                      {inner}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className={rowClass}
                      aria-current={isActive ? "page" : undefined}
                      title={label}
                      onClick={closeMenu}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={`${styles.sidebarBottom} ${profileOpen ? styles.sidebarBottomOpen : ""}`}>
          <button
            type="button"
            className={styles.studentChip}
            aria-expanded={profileOpen}
            aria-label={`${studentName} account menu`}
            onClick={handleProfileClick}
          >
            <span className={styles.avatar} aria-hidden="true">
              {initials(studentName)}
            </span>
            <span className={styles.studentText}>
              <b>{studentName}</b>
              <span>{studentMeta}</span>
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
          {/* Logout sits BELOW the profile bar, and only inside the open
              flyout — a collapsed rail never shows it. */}
          {menuOpen && profileOpen && (
            <form action={logoutAction} className={styles.profileMenu}>
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
                Logout
              </button>
            </form>
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
          <span className={styles.breadcrumb}>Workspace / {breadcrumb}</span>
          <Link href="/contact" className={styles.helpLink}>
            Help
          </Link>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
