import { AdminShell } from "@/components/admin/AdminShell";
import { SeasonSwitcher } from "@/components/admin/SeasonSwitcher";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/season";
import { UsersDirectory } from "./UsersDirectory";
import { loadDirectory } from "./data";
import hub from "../AdminHub.module.css";

export const metadata = {
  title: "Users | Admin | I³ League",
};

// A read-only directory, not a provisioning tool — CLAUDE.md is explicit
// that Judge/Admin accounts are never self-serve and their creation flow is
// still Phase 2 (see status log, Aug 15 2026 Sprint 1 entry), so there is
// deliberately no "create user" or "change role" action here yet.
//
// This is one of three Users pages sharing the same four-tab UsersDirectory
// component and the same query layer (./data.ts) — this one is the
// current season, /admin/users/season/[seasonId] is a single archived
// season, and /admin/users/all rolls every season together. The
// SeasonSwitcher at the top moves between them.
export default async function AdminUsersPage() {
  const { admin } = await requireAdmin();
  const season = await getActiveSeason();

  const [bundle, pastSeasonRows] = await Promise.all([
    loadDirectory({ kind: "current", seasonId: season.id, seasonLabel: season.label }),
    prisma.season.findMany({ where: { isActive: false }, orderBy: { openDate: "desc" }, select: { id: true, label: true } }),
  ]);

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Users">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Users</p>
          <h1 className={hub.heading}>Directory</h1>
          <p className={hub.lead}>
            {bundle.directory.length} approved account{bundle.directory.length === 1 ? "" : "s"} for{" "}
            {season.label}. Still pending or rejected has its own tab here for reference, and its own queue
            (Payments, Parent links) to act on. Read-only for now.
          </p>
          <SeasonSwitcher currentSeason={{ id: season.id, label: season.label }} pastSeasons={pastSeasonRows} active="current" />
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
