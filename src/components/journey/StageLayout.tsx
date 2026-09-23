import type { ReactNode } from "react";
import type { StageName } from "@prisma/client";
import { GridBackground } from "@/components/design-system/GridBackground";
import { AppShell } from "@/components/app/AppShell";
import type { JourneyItem } from "@/lib/stage-progress";

type StageLayoutProps = {
  studentName: string;
  /** Small line under the student name in the sidebar, e.g. "Grade 9 · Team Nova". */
  studentMeta: string;
  journey: JourneyItem[];
  activeStage: StageName;
  /** Topbar breadcrumb text, e.g. "Insight". The page's own visible title
   *  now lives in StageHero, rendered as the first child. */
  title: string;
  /** The full-bleed opening band (StageHero), rendered above the content. */
  hero: ReactNode;
  /** Full-bleed StageBand sections, alternating paper and canvas. */
  children: ReactNode;
  /** Passed straight through to AppShell, so every stage's sidebar page list
   *  (not only the one on screen) can grade-gate its own pages. */
  isHighSchool: boolean;
  isTeamProject: boolean;
};

// Shell for every /dashboard/[stage] page. Chrome (sidebar journey nav +
// topbar) is the shared AppShell — the same one the /dashboard hub uses —
// so there's no separate journey rail to keep in sync. `activeStage` is
// unused here now that the sidebar derives the active item from the URL,
// but kept in the props so callers don't have to change and a future
// in-page use (e.g. a secondary stepper) still has it.
export function StageLayout({
  studentName,
  studentMeta,
  journey,
  title,
  hero,
  isHighSchool,
  isTeamProject,
  children,
}: StageLayoutProps) {
  return (
    <>
      <GridBackground />
      <AppShell
        studentName={studentName}
        studentMeta={studentMeta}
        journey={journey}
        breadcrumb={title}
        isHighSchool={isHighSchool}
        isTeamProject={isTeamProject}
      >
        {hero}
        {children}
      </AppShell>
    </>
  );
}
