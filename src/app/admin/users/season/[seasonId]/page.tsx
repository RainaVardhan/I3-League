import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SeasonSwitcher } from "@/components/admin/SeasonSwitcher";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/season";
import { UsersDirectory } from "../../UsersDirectory";
import { loadDirectory } from "../../data";
import hub from "../../../AdminHub.module.css";

export async function generateMetadata({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const season = await prisma.season.findUnique({ where: { id: seasonId }, select: { label: true } });
  return { title: `${season?.label ?? "Season"} | Users | Admin | I³ League` };
}

// A single archived season's roster — everyone who actually took part in
// it, kept exactly as it was (activateSeasonAction never touches past
// Enrollment/Payment rows). The current season has its own canonical URL
// (/admin/users), so landing here on the still-active one redirects there
// instead of rendering a second copy of the same page.
export default async function AdminUsersSeasonPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { admin } = await requireAdmin();
  const { seasonId } = await params;

  const [activeSeason, season, pastSeasonRows] = await Promise.all([
    getActiveSeason(),
    prisma.season.findUnique({ where: { id: seasonId } }),
    prisma.season.findMany({ where: { isActive: false }, orderBy: { openDate: "desc" }, select: { id: true, label: true } }),
  ]);

  if (!season) notFound();
  if (season.isActive) redirect("/admin/users");

  const bundle = await loadDirectory({ kind: "past", seasonId: season.id, seasonLabel: season.label });

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Users">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Users</p>
          <h1 className={hub.heading}>{season.label}</h1>
          <p className={hub.lead}>
            {bundle.directory.length} student{bundle.directory.length === 1 ? "" : "s"} verified this
            archived season. Its roster is permanent; activating a different season never edits it.
          </p>
          <SeasonSwitcher
            currentSeason={{ id: activeSeason.id, label: activeSeason.label }}
            pastSeasons={pastSeasonRows}
            active={season.id}
          />
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
