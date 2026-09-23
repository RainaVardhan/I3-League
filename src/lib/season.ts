import { prisma } from "@/lib/prisma";

export * from "@/lib/season-format";

// Public marketing pages (Pricing, National Finals, etc.) must never hard-code
// dollar amounts, deadlines, or team-size limits — CLAUDE.md "Season-driven
// config". This is the one place those pages read Season data from, so a new
// season rolling over only ever requires a new Season row, not a template edit.
export async function getActiveSeason() {
  let season;
  try {
    season = await prisma.season.findFirst({
      where: { isActive: true },
      orderBy: { openDate: "desc" },
    });
  } catch (err) {
    // TEMPORARY diagnostics: Workers logs hide Prisma's real message. Logs the
    // error's parts and the database host (never the password). Remove once
    // the live site connects.
    const url = process.env.DATABASE_URL;
    let host = "DATABASE_URL is not set";
    try {
      if (url) host = `${new URL(url).username}@${new URL(url).host}`;
    } catch {
      host = "DATABASE_URL is not a valid URL";
    }
    const e = err as { name?: string; message?: string; code?: string; cause?: unknown };
    console.error("DB_DIAG", JSON.stringify({ host, name: e.name, message: e.message, code: e.code, cause: String(e.cause) }));
    throw err;
  }

  // No active Season row is a real misconfiguration (not an empty state a
  // visitor should ever see) — fail loudly instead of rendering a page with
  // silently-wrong pricing/deadlines.
  if (!season) {
    throw new Error("No active Season found. Seed or activate a Season before rendering this page.");
  }

  return season;
}
