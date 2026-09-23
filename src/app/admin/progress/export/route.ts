import { requireAdmin } from "@/lib/admin";
import { getActiveSeason } from "@/lib/season";
import { getStageCopy } from "@/lib/stage-copy";
import { applyRosterFilter, csvCell, isRosterFilter, loadSeasonRoster } from "@/lib/admin-season";
import { logAdminAction } from "@/lib/audit";

// CSV of the same roster /admin/progress shows, honouring the same filter.
// Contains student names and emails, so it is admin-only (requireAdmin
// redirects anyone else) and each download is written to the audit log.
export async function GET(request: Request) {
  const { admin } = await requireAdmin();
  const rawFilter = new URL(request.url).searchParams.get("filter") ?? undefined;
  const filter = isRosterFilter(rawFilter) ? rawFilter : "all";

  const season = await getActiveSeason();
  const rows = applyRosterFilter(await loadSeasonRoster(season.id), filter, new Date());

  const header = [
    "Name",
    "Email",
    "Grade",
    "School",
    "Team",
    "Payment",
    "Consent complete",
    "Current stage",
    "Stages complete",
    "Final submissions",
    "Last activity",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.name,
        row.email,
        row.grade,
        row.school,
        row.teamName ?? "Individual",
        row.paymentStatus ?? "None",
        row.consentComplete ? "Yes" : "No",
        row.currentStage ? getStageCopy(row.currentStage).name : "",
        row.stagesComplete,
        row.finalSubmissions,
        row.lastActivity ? row.lastActivity.toISOString().slice(0, 10) : "",
      ]
        .map(csvCell)
        .join(","),
    );
  }

  await logAdminAction(admin.userId, "ROSTER_EXPORTED", "Season", season.id, { filter, rows: rows.length });

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="i3league-${season.label}-${filter}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
