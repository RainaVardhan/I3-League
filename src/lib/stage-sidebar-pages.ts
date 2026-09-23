import type { StageName } from "@prisma/client";
import { INSIGHT_SECTION_DETAILS, INVESTIGATE_PAGES, investigatePageDetail } from "@/lib/stage-copy";
import { guidedPagesFor } from "@/lib/guided-stage";
import { GUIDED_STAGES } from "@/lib/stages";

export type SidebarPage = { id: string; label: string };

// Insight's `?page=` ids, in page order (INSIGHT_SECTION_DETAILS is in this
// same order — see its own comment). Not exported alongside the details
// themselves, so mirrored here; InsightForm.tsx is the other place these
// exact ids are hand-written.
const INSIGHT_PAGE_IDS = ["observation", "consent", "empathy", "scope"] as const;

// Every stage's page list — its own `?page=` ids and short sidebar labels —
// independent of whether the student is actually viewing that stage right
// now. This is what lets every row in "Your journey" expand, not only the
// active one: the sidebar has always known each stage's real pages (they're
// static config, not database rows), it just wasn't reading them for any
// stage but the current page before.
//
// This intentionally does NOT know which page (if any) is done, current, or
// next within a stage you aren't on — the app has never tracked progress at
// that granularity, only "is the whole stage locked / current / complete" —
// so an inactive stage's expanded list is a plain, neutral list of its
// pages, not a progress trail like the active stage's.
export function sidebarPagesFor(stage: StageName, isHighSchool: boolean, isTeamProject: boolean): SidebarPage[] {
  switch (stage) {
    case "INSIGHT": {
      const pages: SidebarPage[] = INSIGHT_PAGE_IDS.map((id, index) => ({
        id,
        label: INSIGHT_SECTION_DETAILS[index].page,
      }));
      if (isTeamProject) pages.push({ id: "team", label: INSIGHT_SECTION_DETAILS[4].page });
      return pages;
    }
    case "INVESTIGATE":
      return INVESTIGATE_PAGES.map((id) => ({ id, label: investigatePageDetail(id, isHighSchool).label }));
    case "IMAGINE":
    case "ITERATE":
    case "IMPACT":
    case "INFLUENCE":
      return guidedPagesFor(GUIDED_STAGES[stage], isHighSchool).map((page) => ({ id: page.id, label: page.label }));
    default:
      return [];
  }
}
