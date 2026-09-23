import { prisma } from "@/lib/prisma";

export * from "@/lib/season-format";

// Public marketing pages (Pricing, National Finals, etc.) must never hard-code
// dollar amounts, deadlines, or team-size limits — CLAUDE.md "Season-driven
// config". This is the one place those pages read Season data from, so a new
// season rolling over only ever requires a new Season row, not a template edit.
export async function getActiveSeason() {
  const season = await prisma.season.findFirst({
    where: { isActive: true },
    orderBy: { openDate: "desc" },
  });

  // No active Season row is a real misconfiguration (not an empty state a
  // visitor should ever see) — fail loudly instead of rendering a page with
  // silently-wrong pricing/deadlines.
  if (!season) {
    throw new Error("No active Season found. Seed or activate a Season before rendering this page.");
  }

  return season;
}
