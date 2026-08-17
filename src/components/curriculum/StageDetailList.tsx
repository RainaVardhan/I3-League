"use client";

import { useRef, useState } from "react";
import { Eyebrow } from "@/components/design-system/Eyebrow";
import { CURRICULUM_TIMELINE } from "./stages";
import styles from "./StageDetailList.module.css";

// Tab-and-panel, not an accordion: a compact list of stage names on the
// left (same number+name idiom as FrameworkCard's hero list, just made
// clickable) drives a single content pane on the right that swaps in
// place. Only one stage's full text is ever on screen at a time, so the
// page never turns into a wall of open paragraphs the way a full-page
// accordion would.
export function StageDetailList() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = CURRICULUM_TIMELINE[activeIndex];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Standard ARIA tabs keyboard pattern: only the active tab sits in the
  // Tab order (tabIndex 0 below), so arrow/Home/End keys are how a keyboard
  // user reaches the other tabs at all — without this, everything past the
  // active one is unreachable without a mouse.
  function focusTab(index: number) {
    const wrapped = (index + CURRICULUM_TIMELINE.length) % CURRICULUM_TIMELINE.length;
    setActiveIndex(wrapped);
    tabRefs.current[wrapped]?.focus();
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(CURRICULUM_TIMELINE.length - 1);
        break;
    }
  }

  return (
    <section className={styles.section} aria-labelledby="stages-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Eyebrow>THE SIX STAGES</Eyebrow>
          {/* Visually hidden: keeps a real heading in the outline for
              screen-reader heading navigation now that the visible copy
              underneath the eyebrow was trimmed away. */}
          <h2 id="stages-title" className="sr-only">
            The six stages
          </h2>
        </div>

        <div className={styles.layout}>
          <div role="tablist" aria-label="Curriculum stages" className={styles.tabs}>
            {CURRICULUM_TIMELINE.map((entry, index) => {
              const isActive = index === activeIndex;
              const tabClass = [
                styles.tab,
                isActive ? styles.tabActive : "",
                isActive && entry.isGate ? styles.tabActiveGate : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={entry.name}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`stage-tab-${entry.number}`}
                  aria-selected={isActive}
                  aria-controls="stage-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={tabClass}
                >
                  <span className={entry.isGate ? styles.tabNumberGate : styles.tabNumber}>
                    {entry.number}
                  </span>
                  <span className={entry.isGate ? styles.tabNameGate : styles.tabName}>
                    {entry.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            key={active.number}
            id="stage-panel"
            role="tabpanel"
            aria-labelledby={`stage-tab-${active.number}`}
            className={styles.panel}
          >
            <div className={active.isGate ? `${styles.panelHeader} ${styles.panelHeaderGate}` : styles.panelHeader}>
              <span className={styles.panelWatermark} aria-hidden="true">
                {active.number}
              </span>
              <h3 className={styles.panelName}>
                {active.isGate ? "Information Protection Checkpoint" : active.name}
              </h3>
            </div>
            <div className={styles.panelBody}>
              <p className={styles.panelHeadline}>{active.headline}</p>
              {active.description.map((paragraph) => (
                <p key={paragraph} className={styles.panelDescription}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
