import type { JournalEntry } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { JournalGroup } from "@/lib/journal-shared";

export * from "@/lib/journal-shared";

// Fetches every entry a student has ever written, across every version, and
// groups them by entryGroupId — the shape the timeline page actually wants.
// Groups are ordered by their latest version's entryDate (falling back to
// createdAt for entries logged on the same date), newest first.
export async function getJournalTimeline(studentId: string): Promise<JournalGroup[]> {
  const entries = await prisma.journalEntry.findMany({
    where: { studentId },
    orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
  });

  const byGroup = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const list = byGroup.get(entry.entryGroupId);
    if (list) list.push(entry);
    else byGroup.set(entry.entryGroupId, [entry]);
  }

  const groups: JournalGroup[] = [];
  for (const [entryGroupId, versions] of byGroup) {
    // findMany's order already put newer entryDate/createdAt first within
    // the whole result set, but two versions of the same entry don't
    // necessarily keep that relative order once split by group — sort each
    // group explicitly by version, which is the real chronology of edits.
    versions.sort((a, b) => b.version - a.version);
    const [latest, ...history] = versions;
    groups.push({ entryGroupId, latest, history });
  }

  groups.sort((a, b) => {
    const aTime = a.latest.entryDate.getTime();
    const bTime = b.latest.entryDate.getTime();
    if (aTime !== bTime) return bTime - aTime;
    return b.latest.createdAt.getTime() - a.latest.createdAt.getTime();
  });

  return groups;
}
