"use client";

import { createContext, useContext } from "react";

// Lets a stage page's section list (StageSections, rendered deep inside the
// page content) appear in the sidebar (AppShell, which wraps the page).
// AppShell exposes a DOM slot under the current stage's row; StageSections
// portals its section links into it. A portal, rather than lifting the list
// into AppShell state, keeps the scroll-spy state next to the sections it
// tracks and avoids an effect-driven registration step.
type StageNavContextValue = {
  /** Element under the current stage's sidebar row, or null before mount /
   *  on pages that have no active stage (the /dashboard hub). */
  slot: HTMLElement | null;
  /** Collapses the sidebar flyout (used after picking a section). */
  closeMenu: () => void;
};

export const StageNavContext = createContext<StageNavContextValue>({
  slot: null,
  closeMenu: () => {},
});

export function useStageNav() {
  return useContext(StageNavContext);
}
