import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/design-system/Button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getActiveSeason } from "@/lib/season";
import hub from "../AdminHub.module.css";
import { assignTeamCoachAction } from "./actions";

export const metadata = {
  title: "Teams | Admin | I³ League",
};

// Teams for the active season: who is on each, their join code (so an admin
// can help a family who lost it), each member's own payment status (billing
// is per student, never per team), and the coach assignment. Coaches are
// read-only on a roster (CLAUDE.md), so assigning one here is what gives
// them that view.
export default async function AdminTeamsPage() {
  const { admin } = await requireAdmin();
  const season = await getActiveSeason();

  const [teams, coaches] = await Promise.all([
    prisma.team.findMany({
      where: { seasonId: season.id },
      include: {
        coach: true,
        project: true,
        memberships: {
          include: { student: { include: { user: true, enrollments: { where: { seasonId: season.id }, include: { payment: true } } } } },
          orderBy: { joinedAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.coach.findMany({ orderBy: { fullName: "asc" } }),
  ]);

  const noCoach = teams.filter((team) => !team.coachId).length;

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Teams">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Teams · {season.label}</p>
          <h1 className={hub.heading}>Rosters and coaches</h1>
          <p className={hub.lead}>
            {teams.length} team{teams.length === 1 ? "" : "s"}, {noCoach} without a coach. Each member pays and
            unlocks on their own, so a teammate&apos;s status here never affects another&apos;s.
          </p>

          <div className={hub.panel}>
            {teams.length === 0 ? (
              <p className={hub.empty}>No teams this season yet.</p>
            ) : (
              teams.map((team) => (
                <div key={team.id} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>{team.name}</p>
                    <p className={hub.rowMeta}>
                      {team.memberships.length} of {season.maxTeamSize} members · Join code {team.joinCode}
                    </p>
                    <p className={hub.rowMeta}>
                      Project: {team.project ? `${team.project.title} · ${team.project.category}` : "not started yet"}
                    </p>
                    {team.memberships.map((membership) => {
                      const student = membership.student;
                      const payment = student.enrollments[0]?.payment;
                      return (
                        <p key={student.id} className={hub.rowMeta}>
                          {student.firstName} {student.lastName}
                          {membership.roleLabel && ` (${membership.roleLabel})`} · {student.user.email} ·{" "}
                          {payment ? `payment ${payment.status.toLowerCase()}` : "no payment"}
                        </p>
                      );
                    })}
                  </div>
                  <form action={assignTeamCoachAction} className={hub.rowActions}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <label>
                      <span className={hub.rowMeta}>Coach</span>{" "}
                      <select name="coachId" defaultValue={team.coachId ?? ""} aria-label={`Coach for ${team.name}`}>
                        <option value="">No coach</option>
                        {coaches.map((coach) => (
                          <option key={coach.id} value={coach.id}>
                            {coach.fullName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button as="button" type="submit" variant="ghost" showArrow={false}>
                      Save
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
