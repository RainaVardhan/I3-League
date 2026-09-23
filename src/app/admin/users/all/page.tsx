import { AdminShell } from "@/components/admin/AdminShell";
import { SeasonSwitcher } from "@/components/admin/SeasonSwitcher";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/season";
import { UsersDirectory } from "../UsersDirectory";
import { loadDirectory } from "../data";
import hub from "../../AdminHub.module.css";

export const metadata = {
  title: "All seasons | Users | Admin | I³ League",
};

// Everyone the program has ever had, across every season, rolled into one
// row per person — see ../data.ts's loadAllTimeDirectory for exactly how a
// student's "representative" season is picked when they've done more than
// one. Same four tabs as the other two Users pages, same component.
export default async function AdminUsersAllPage() {
  const { admin } = await requireAdmin();
  const [season, pastSeasonRows, bundle] = await Promise.all([
    getActiveSeason(),
    prisma.season.findMany({ where: { isActive: false }, orderBy: { openDate: "desc" }, select: { id: true, label: true } }),
    loadDirectory({ kind: "all" }),
  ]);

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Users">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Users</p>
          <h1 className={hub.heading}>All seasons</h1>
          <p className={hub.lead}>
            {bundle.directory.length} approved account{bundle.directory.length === 1 ? "" : "s"} across every
            season the program has run. A student who&apos;s done more than one season shows their most
            recent verified one.
          </p>
          <SeasonSwitcher currentSeason={{ id: season.id, label: season.label }} pastSeasons={pastSeasonRows} active="all" />
          <UsersDirectory
            users={bundle.directory}
            teams={bundle.directoryTeams}
            individuals={bundle.individuals}
            schools={bundle.directorySchools}
            unapproved={bundle.unapproved}
            note={bundle.peopleNote}
          />
        </div>
      </section>
    </AdminShell>
  );
}
