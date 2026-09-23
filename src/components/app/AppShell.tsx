"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StageName } from "@prisma/client";
import { Logo } from "@/components/design-system/Logo";
import { STAGE_NUMBERS, type JourneyItem } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";
import { sidebarPagesFor } from "@/lib/stage-sidebar-pages";
import { logoutAction } from "@/app/dashboard/actions";
import { StageNavContext } from "./StageNavContext";
import styles from "./AppShell.module.css";

type AppShellProps = {
  studentName: string;
  /** Small line under the student name, e.g. "Grade 9 · Team Nova". */
  studentMeta: string;
  /** The six-stage journey, used for the sidebar stage list + lock state. */
  journey: JourneyItem[];
  /** Last crumb after "Workspace /" in the topbar, e.g. "Overview" or "Imagine". */
  breadcrumb: string;
  /** Grade-gates a page list (Investigate's System Mapping, the guided
   *  stages' HS CORE pages) the same way the stage pages themselves do. */
  isHighSchool: boolean;
  /** Shows Insight's Team Charter page in its list. */
  isTeamProject: boolean;
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
export function AppShell({
  studentName,
  studentMeta,
  journey,
  breadcrumb,
  isHighSchool,
  isTeamProject,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // The profile bar at the bottom toggles a small "Logout" section instead
  // of a permanently-visible logout button.
  const [profileOpen, setProfileOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, []);

  // DOM slot under the current stage's sidebar row. The stage page's section
  // section links (StageSections) portal themselves into it; see StageNavContext.
  const [stageNavSlot, setStageNavSlot] = useState<HTMLElement | null>(null);
  const stageNav = useMemo(() => ({ slot: stageNavSlot, closeMenu }), [stageNavSlot, closeMenu]);

  // Which stages' page lists are expanded, keyed by StageName. Every
  // unlocked stage can expand (its pages are static config, known whichever
  // stage you're actually viewing), not only the active one. Every stage
  // starts closed, including the active one — the rail should always render
  // at the same compact, stage-numbers-only height regardless of which page
  // you're on (owner preference); clicking a row still expands it in place.
  const [openStages, setOpenStages] = useState<Partial<Record<StageName, boolean>>>({});
  const toggleStage = useCallback((stage: StageName) => {
    setOpenStages((open) => ({ ...open, [stage]: !open[stage] }));
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
    <StageNavContext.Provider value={stageNav}>
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

          <Link
            href="/dashboard/journal"
            className={styles.navItem}
            aria-current={pathname === "/dashboard/journal" ? "page" : undefined}
            title="Innovation Journal"
            onClick={closeMenu}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H17a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6.5A1.5 1.5 0 0 1 5 19.5z" />
                <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
              </svg>
            </span>
            <span className={styles.navText}>Journal</span>
          </Link>

          {isTeamProject && (
            <Link
              href="/dashboard/team"
              className={styles.navItem}
              aria-current={pathname === "/dashboard/team" ? "page" : undefined}
              title="Team & Contributions"
              onClick={closeMenu}
            >
              <span className={styles.navIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="8" r="3" />
                  <circle cx="17" cy="9" r="2.4" />
                  <path d="M4 19c0-2.9 2.2-5 5-5s5 2.1 5 5M14 15.2c2.4.2 4 1.8 4 3.8" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.navText}>Team</span>
            </Link>
          )}

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

              const isOpen = Boolean(openStages[item.stage]);

              return (
                <li key={item.stage}>
                  {item.status === "LOCKED" ? (
                    // Locked: the same clickable-row-toggles-the-list
                    // behavior as any other stage, but nothing in it is a
                    // Link (CLAUDE.md "Sequential stage unlocking") — a span
                    // in place of the row's link, and the preview list below
                    // renders each of its pages as plain text too.
                    <div className={rowClass} title={`${label} (locked)`} onClick={() => toggleStage(item.stage)}>
                      <span className={styles.stageRowLink}>{inner}</span>
                      <button
                        type="button"
                        className={styles.stageChevron}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `Hide ${label} pages` : `Show ${label} pages`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleStage(item.stage);
                        }}
                      >
                        <ChevronIcon />
                      </button>
                    </div>
                  ) : (
                    // Every unlocked stage, active or not: clicking the row
                    // shows its sections in the panel — it never navigates
                    // (the Link's own click is prevented; only a page inside
                    // the expanded list, or the chevron button, is a real
                    // target) — a wrapper (carrying the row's usual look)
                    // around the Link and a separate arrow button, both of
                    // which bubble a click up to the wrapper, so clicking
                    // anywhere on the row toggles it, not only the arrow.
                    <div className={rowClass} title={label} onClick={() => toggleStage(item.stage)}>
                      <Link
                        href={href}
                        className={styles.stageRowLink}
                        aria-current={isActive ? "page" : undefined}
                        onClick={(event) => event.preventDefault()}
                      >
                        {inner}
                      </Link>
                      <button
                        type="button"
                        className={styles.stageChevron}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `Hide ${label} pages` : `Show ${label} pages`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleStage(item.stage);
                        }}
                      >
                        <ChevronIcon />
                      </button>
                    </div>
                  )}
                  {isActive && isOpen && <div ref={setStageNavSlot} className={styles.subNavSlot} />}
                  {!isActive && isOpen && (
                    <StagePreviewPages
                      stage={item.stage}
                      href={href}
                      isHighSchool={isHighSchool}
                      isTeamProject={isTeamProject}
                      onNavigate={closeMenu}
                      locked={item.status === "LOCKED"}
                    />
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
    </StageNavContext.Provider>
  );
}

// A stage's page list, for any stage other than the one on screen — real
// links (each one a full navigation, since there's no live form to portal
// into for a stage you're not on), on the same dot-and-thread row styling
// as the active stage's list (.subList/.subItem), but every dot plain and
// neutral: this app has never tracked which page you left off on within a
// stage you aren't currently viewing, only whether the whole stage is
// locked, current or complete, so there's no "behind/ahead" state to show.
function StagePreviewPages({
  stage,
  href,
  isHighSchool,
  isTeamProject,
  onNavigate,
  locked,
}: {
  stage: StageName;
  href: string;
  isHighSchool: boolean;
  isTeamProject: boolean;
  onNavigate: () => void;
  /** The whole stage is locked (CLAUDE.md "Sequential stage unlocking"): the
   *  list still shows what's coming, but nothing in it is a link — same
   *  reason a locked stage row itself is a span, not a Link. */
  locked?: boolean;
}) {
  const pages = [...sidebarPagesFor(stage, isHighSchool, isTeamProject), { id: "review", label: "Review" }];
  return (
    <div className={styles.subNavSlot}>
      <ol className={styles.subList} aria-label={`${stage} pages`}>
        {pages.map((page, index) => {
          const num = <span className={styles.subNum}>{String(index + 1).padStart(2, "0")}</span>;
          const name = <span className={styles.subLabel}>{page.label}</span>;
          return (
            <li key={page.id}>
              {locked ? (
                <span
                  className={`${styles.subItem} ${styles.subItemLocked}`}
                  title={`${page.label} (locked)`}
                >
                  {num}
                  {name}
                  <span className={styles.subLock} aria-hidden="true">
                    <LockIcon />
                  </span>
                </span>
              ) : (
                <Link
                  href={`${href}?page=${page.id}`}
                  className={styles.subItem}
                  title={page.label}
                  onClick={onNavigate}
                >
                  {num}
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Same mark StageSections uses for a locked Review page, so a locked stage's
// preview list and an in-progress stage's locked Review row read as the
// same "not yet" signal wherever they show up.
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// Right-pointing at rest, rotates to point down when the page list is open
// (driven purely by the button's own [aria-expanded] in CSS).
function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
