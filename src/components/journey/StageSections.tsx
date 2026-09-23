"use client";

import { useEffect, useImperativeHandle, useState } from "react";
import type { ReactNode, Ref } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/design-system/Button";
import { useStageNav } from "@/components/app/StageNavContext";
// The section list lives in the sidebar (portaled into AppShell's slot), so
// its rows are styled by AppShell's own stylesheet, which also owns the
// rail-vs-open-flyout states those rows have to respond to.
import shellStyles from "@/components/app/AppShell.module.css";
import buttonStyles from "@/components/design-system/Button.module.css";
import { StageBand, type BandTone } from "./StageBand";
import styles from "./StageSections.module.css";

export type StageSection = {
  id: string;
  /** Short name, used in the sidebar and the navy bar. */
  label: string;
  content: ReactNode;
  /** Band tone of the Back / Next row under this page. Canvas by default,
   *  which follows a Show band (paper); a page with no Show band ends on a
   *  canvas Do band, so it sets "paper" to keep the bands alternating. */
  pagerTone?: BandTone;
};

// Lets the form around StageSections move to a page (and a field on it) without
// owning the open-page state, e.g. when a "what's left" popup links to a field.
export type StageSectionsHandle = {
  /** Opens the page, then scrolls to and focuses the input with this `name`. */
  goTo: (pageId: string, fieldName?: string) => void;
};

type StageSectionsProps = {
  ref?: Ref<StageSectionsHandle>;
  /** One page per topic (TaskSection: Learn + Do + Show grouped). */
  tasks: StageSection[];
  /** Optional band shown under whichever page is open (e.g. the submission
   *  checklist card). Not listed in the sidebar. */
  footer?: ReactNode;
  reviewLabel?: string;
  reviewContent: ReactNode;
  /** True while Review can't be opened yet. Insight never locks it (Review is
   *  where the AI-use disclosure and Submit button live); Investigate locks
   *  it until a real final Submission exists. */
  reviewLocked: boolean;
  /** A final Submission exists: open on Review instead of the first page. */
  submitted: boolean;
  /** Small status text centered in the pager row (e.g. "Saved"). */
  pagerNote?: ReactNode;
  /** Color of the status text: quiet when saved, stronger while unsaved, coral on an error. */
  pagerNoteTone?: "ok" | "pending" | "error";
  /** Replaces Next on the Review page's Back / Next row (the Submit button),
   *  so it sits in line with Back on the right. */
  reviewAction?: ReactNode;
};

const sectionDomId = (id: string) => `section-${id}`;

// Scrolls a form field into the middle of the screen and puts the cursor in it.
// Shared by both ways of jumping to a field, so they land identically: the
// Submit button's "what's left" popup (through goTo below) and arriving from a
// link that names the field in the URL hash (the dashboard's "Finish Insight"
// checklist). A radio group is reached through its first option, since a
// <fieldset> itself cannot take focus.
//
// The name is escaped because on the link path it comes straight from the URL,
// which anyone can edit: an unescaped `#"]` would make querySelector throw.
function focusField(fieldName: string, behavior: ScrollBehavior) {
  const field = document.querySelector<HTMLElement>(`[name="${CSS.escape(fieldName)}"]`);
  if (field) {
    field.scrollIntoView({ behavior, block: "center" });
    field.focus({ preventScroll: true });
    return;
  }
  // Not a field name: a section's id instead (#safety-section, #stage-bar).
  // Scroll it to the top (each such target sets its own scroll-margin-top to
  // clear the sticky topbar) and focus its first field, if it has one; the
  // safety screening is a form before it is saved and a notice after.
  const section = document.getElementById(fieldName);
  if (!section) return;
  section.scrollIntoView({ behavior, block: "start" });
  section.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true });
}

// The stage's pages: one page per topic plus Review, shown one at a time.
// The list is in the LEFT SIDEBAR under the current stage, and Back / Next
// buttons at the bottom of each page move through it. Each page is a
// full-bleed band under the stage hero.
//
// Every page stays mounted and is only hidden via the `hidden` attribute
// rather than conditionally rendered: the pages hold live, uncontrolled form
// inputs that are all part of one shared <form>, and unmounting a page when
// the student moves on would reset those inputs to their defaultValue and
// silently discard what they had just typed (and drop them from the submit).
export function StageSections({
  ref,
  tasks,
  footer,
  reviewLabel = "Review",
  reviewContent,
  reviewLocked,
  submitted,
  pagerNote,
  pagerNoteTone = "ok",
  reviewAction,
}: StageSectionsProps) {
  // Review always ends on a canvas band (the Submit band, or the closing
  // reflection on a submitted stage), so its Back row is paper to keep the
  // bands alternating.
  const allTabs = [...tasks, { id: "review", label: reviewLabel, content: reviewContent, pagerTone: "paper" as const }];
  const isLocked = (id: string) => id === "review" && reviewLocked;

  // The open page lives in the URL (?page=empathy) so a reload, or a shared
  // link, stays on the same page. useSearchParams is read on the server too
  // (this route is dynamic), so the right page renders first with no flash of
  // page 1. An unknown or locked page falls back to the default.
  const searchParams = useSearchParams();
  const [active, setActive] = useState(() => {
    const requested = searchParams.get("page");
    if (requested && allTabs.some((tab) => tab.id === requested) && !isLocked(requested)) return requested;
    return submitted ? "review" : tasks[0]?.id ?? "review";
  });
  const { slot, closeMenu } = useStageNav();
  const activeIndex = allTabs.findIndex((tab) => tab.id === active);

  useImperativeHandle(ref, () => ({ goTo: (pageId, fieldName) => select(pageId, fieldName) }));

  // Arriving from a link like /dashboard/insight?page=empathy#firsthandEvidence:
  // ?page= has already opened the right page on the server, so all that is left
  // is the field. Runs once, just after the router's own scroll to the hash, so
  // this one wins; a hash that is not a field name (#stage-work) does nothing.
  useEffect(() => {
    let fieldName = "";
    try {
      fieldName = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return; // a malformed %-escape in a hand-edited URL
    }
    if (!fieldName) return;
    const timer = window.setTimeout(() => focusField(fieldName, "auto"), 100);
    return () => window.clearTimeout(timer);
  }, []);

  function select(id: string, fieldName?: string) {
    if (isLocked(id)) return;
    setActive(id);
    // Keep the URL in step without adding a history entry or re-fetching.
    const url = new URL(window.location.href);
    url.searchParams.set("page", id);
    window.history.replaceState(null, "", url);
    closeMenu();
    if (fieldName) {
      // Wait for the page to un-hide (and for a closing dialog to hand focus
      // back to its opener) before moving focus, or the focus is lost.
      window.setTimeout(() => focusField(fieldName, "smooth"), 80);
      return;
    }
    // Scroll to the navy page bar, so the bar and the top of the new page
    // are both in view once the page has been un-hidden.
    requestAnimationFrame(() =>
      document.getElementById("stage-bar")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <>
      {slot &&
        createPortal(
          <ol className={shellStyles.subList} aria-label="Stage sections">
            {allTabs.map((tab, index) => {
              const locked = isLocked(tab.id);
              const isActive = active === tab.id;
              // In the rail, the pages already behind you are drawn brighter
              // than the ones ahead, so the stack of lines reads top-down as
              // how far into the stage you are.
              const behind = index < activeIndex;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    disabled={locked}
                    aria-current={isActive ? "step" : undefined}
                    title={locked ? `${tab.label} (unlocks after you submit)` : tab.label}
                    onClick={() => select(tab.id)}
                    className={`${shellStyles.subItem} ${isActive ? shellStyles.subItemActive : ""} ${
                      behind ? shellStyles.subItemBehind : ""
                    } ${locked ? shellStyles.subItemLocked : ""}`}
                  >
                    {/* Zero-padded, like the navy page bar, so the numbers are
                        all one width. Shown in the open flyout; in the rail the
                        row is drawn as a rule instead. */}
                    <span className={shellStyles.subNum}>{String(index + 1).padStart(2, "0")}</span>
                    {/* In the rail this is the button's accessible name, read
                        out and shown in the native tooltip, though not drawn. */}
                    <span className={shellStyles.subLabel}>{tab.label}</span>
                    {locked && (
                      <span className={shellStyles.subLock} aria-hidden="true">
                        <LockIcon />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>,
          slot,
        )}

      {/* Navy bar between the hero and the page: every page of the stage,
          numbered and clickable, with the open one highlighted. */}
      <nav id="stage-bar" className={styles.bar} aria-label="Stage pages">
        <ol className={styles.barList}>
          {allTabs.map((tab, index) => {
            const locked = isLocked(tab.id);
            const isActive = active === tab.id;
            return (
              <li key={tab.id}>
                {/* A quiet nav tab, not a button: label on the navy with a
                    mono number, marked when open by a light cobalt underline.
                    Boxed white buttons made this row read as nine competing
                    calls to action and crowded the longer stages. */}
                <button
                  type="button"
                  disabled={locked}
                  aria-current={isActive ? "page" : undefined}
                  title={locked ? `${tab.label} (unlocks after you submit)` : undefined}
                  onClick={() => select(tab.id)}
                  className={`${styles.barButton} ${isActive ? styles.barButtonActive : ""}`}
                >
                  <span className={styles.barNum}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.barLabel}>{tab.label}</span>
                  {locked && (
                    <span className={styles.barLock} aria-hidden="true">
                      <LockIcon />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {allTabs.map((tab, index) => {
        const prev = allTabs[index - 1];
        const next = allTabs[index + 1];
        // Next is offered only when that page is actually open.
        const nextOpen = next && !isLocked(next.id);
        const hasPager = prev || nextOpen || pagerNote;
        return (
          <div key={tab.id} id={sectionDomId(tab.id)} hidden={active !== tab.id} className={styles.panel}>
            {/* Both a topic (TaskSection) and Review (StageReviewPage) build
                their own bands. */}
            {tab.content}
            {hasPager && (
              <StageBand tone={tab.pagerTone ?? "canvas"} wide>
                <div className={styles.pager}>
                  {prev ? (
                    // Strong ghost: the same white button as the home hero's
                    // "See How It Works" (docs/design-system.md Section 9), so
                    // Back weighs the same as the primary Next beside it.
                    <Button
                      type="button"
                      variant="ghost"
                      showArrow={false}
                      className={`${buttonStyles.ghostStrong} ${styles.backButton}`}
                      onClick={() => select(prev.id)}
                    >
                      <BackIcon />
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  {/* Always rendered (even empty) so the row stays a 3-column
                      grid and the status is centered on the row. */}
                  <span
                    className={`${styles.pagerNote} ${
                      pagerNoteTone === "error"
                        ? styles.pagerNoteError
                        : pagerNoteTone === "pending"
                          ? styles.pagerNotePending
                          : ""
                    }`}
                    role="status"
                  >
                    {pagerNote}
                  </span>
                  {nextOpen ? (
                    <Button type="button" onClick={() => select(next.id)}>
                      Next: {next.label}
                    </Button>
                  ) : tab.id === "review" && reviewAction ? (
                    <div className={styles.pagerAction}>{reviewAction}</div>
                  ) : (
                    <span />
                  )}

                </div>
              </StageBand>
            )}
          </div>
        );
      })}

      {footer && <StageBand tone="canvas">{footer}</StageBand>}
    </>
  );
}

// Leading chevron for Back (Button only draws a trailing one).
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
