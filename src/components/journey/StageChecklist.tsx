"use client";

import { useEffect, useMemo, useState } from "react";
import type { StageName } from "@prisma/client";
import styles from "./StageChecklist.module.css";

type StageChecklistProps = {
  stageName: StageName;
  items: string[];
  /** "dark" renders light-on-ink, for the Show tab's artifact card. */
  variant?: "light" | "dark";
};

// Interactive "what this submission needs" checklist: every item the stage
// requires, each tickable as the student finishes it, with a running
// done / left count.
//
// There is no per-checklist-item field in the data model yet (that's the
// Phase 2 platform-evidence-model), so ticks are saved per browser in
// localStorage — a personal planning aid, not a graded or reviewer-visible
// record. Keyed by stage so each stage keeps its own progress.
const STORAGE_PREFIX = "i3league.checklist.";

export function StageChecklist({ stageName, items, variant = "light" }: StageChecklistProps) {
  const storageKey = STORAGE_PREFIX + stageName;

  // Start empty so the server render and the first client render match;
  // saved ticks are pulled in from localStorage just after mount.
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deferred into a rAF callback rather than called straight from the
    // effect body, so the first client render still matches the server's
    // empty render (react-hooks/set-state-in-effect).
    const id = requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
      } catch {
        // Unreadable or blocked storage — the checklist just stays blank.
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, [storageKey]);

  useEffect(() => {
    // Don't write until the initial load has run, or the empty default
    // would clobber previously saved ticks.
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // Nothing else depends on the write succeeding.
    }
  }, [checked, hydrated, storageKey]);

  const doneCount = useMemo(() => items.filter((item) => checked[item]).length, [items, checked]);
  const leftCount = items.length - doneCount;
  const pct = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);

  const darkCls = variant === "dark" ? styles.dark : "";

  return (
    <div className={`${styles.wrap} ${darkCls}`}>
      <div className={styles.tally}>
        <span className={styles.tallyCount}>{`${doneCount} of ${items.length} done`}</span>
        <span className={styles.tallyLeft}>
          {leftCount === 0 ? "Everything checked off" : `${leftCount} left`}
        </span>
      </div>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>
            <label className={styles.item}>
              <input
                type="checkbox"
                checked={Boolean(checked[item])}
                onChange={(event) =>
                  setChecked((prev) => ({ ...prev, [item]: event.target.checked }))
                }
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
