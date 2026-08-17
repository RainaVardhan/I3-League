import { prisma } from "@/lib/prisma";

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
    throw new Error("No active Season found — seed or activate a Season before rendering this page.");
  }

  return season;
}

export function formatSeasonDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Month + year only, no day — for the homepage FinalCta's eyebrow
// ("ENROLLMENT OPENS SEPTEMBER 2026"), which never needed day-level
// precision even before it read from Season.
export function formatSeasonMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
