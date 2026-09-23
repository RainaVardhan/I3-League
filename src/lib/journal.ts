import type { JournalEntry, StageName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STAGE_ORDER } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";

// The fixed set of entry types on JournalEntry.entryType (schema.prisma has
// no native enum for this column — it's a plain String — so this list is
// the one place that set is defined; the server actions validate against it
// and the composer form reads it for its RadioGroup options).
export const JOURNAL_ENTRY_TYPES = [
  { value: "thought", label: "Thought or idea" },
  { value: "observation", label: "Observation" },
  { value: "research", label: "Research finding" },
  { value: "sketch", label: "Sketch or early design" },
  { value: "experiment", label: "Experiment or test" },
  { value: "failure", label: "Something that didn't work" },
  { value: "result", label: "Result or outcome" },
  { value: "feedback", label: "Feedback you received" },
  { value: "decision", label: "Decision, and why" },
  { value: "improvement", label: "Improvement or revision" },
  { value: "mentor_feedback", label: "Feedback from a mentor or coach" },
  { value: "ai_use", label: "How you used AI" },
] as const;

export type JournalEntryType = (typeof JOURNAL_ENTRY_TYPES)[number]["value"];

const ENTRY_TYPE_SET = new Set<string>(JOURNAL_ENTRY_TYPES.map((t) => t.value));

export function isJournalEntryType(value: unknown): value is JournalEntryType {
  return typeof value === "string" && ENTRY_TYPE_SET.has(value);
}

const ENTRY_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  JOURNAL_ENTRY_TYPES.map((t) => [t.value, t.label]),
);

export function journalEntryTypeLabel(entryType: string): string {
  return ENTRY_TYPE_LABEL[entryType] ?? entryType;
}

// Which of the six stages an entry is about — the same STAGE_ORDER every
// other part of the app uses, labeled with each stage's real display name
// (stage-copy.ts's getStageCopy(...).name, e.g. "Insight") rather than a
// second, separately-maintained list of stage names.
export const JOURNAL_STAGE_OPTIONS = STAGE_ORDER.map((stage) => ({
  value: stage,
  label: getStageCopy(stage).name,
}));

const STAGE_SET = new Set<string>(STAGE_ORDER);

export function isJournalStage(value: unknown): value is StageName {
  return typeof value === "string" && STAGE_SET.has(value);
}

const STAGE_LABEL: Record<string, string> = Object.fromEntries(
  JOURNAL_STAGE_OPTIONS.map((s) => [s.value, s.label]),
);

export function journalStageLabel(stage: string | null): string | null {
  return stage ? (STAGE_LABEL[stage] ?? stage) : null;
}

// Server-enforced cap on JournalEntry.text — same "the real limit lives on
// the server, the form just matches it" convention as TEXT_LIMITS
// (src/lib/stage-field-limits.ts). Kept separate from that file since it's
// a single field on an unrelated model, not a per-stage-field map.
export const JOURNAL_TEXT_LIMIT = 5000;

// The optional entry title. Short by design — it's a label for the entry,
// not a second place to write the entry itself.
export const JOURNAL_TITLE_LIMIT = 120;

// yyyy-mm-dd, the format a native <input type="date"> reads/writes — shared
// by the composer, the revise form, and the server-side date bounds below so
// there's one definition of "how a Date becomes this field's value/min/max".
export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export type JournalAttachment = { type: "image"; url: string };

// Normalizes the untyped `attachments` Json column into the shape the app
// actually uses. Shared by the server (actions.ts, to carry an existing
// photo forward across a revision) and the client (JournalEntryCard, to
// render one) so there's exactly one place that decides what counts as a
// valid attachment.
export function toJournalAttachments(value: unknown): JournalAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is JournalAttachment =>
      typeof item === "object" && item !== null && "url" in item && typeof (item as JournalAttachment).url === "string",
  );
}

// One "entry" as a student thinks of it: its current (highest-version) text,
// plus every older version underneath it. CLAUDE.md "Innovation Journal is
// append-only: edits create a new version; don't overwrite/delete history" —
// this is the read-side of that rule: nothing is ever fetched by "the row
// with this id," only "every version sharing this entryGroupId," latest first.
export type JournalGroup = {
  entryGroupId: string;
  latest: JournalEntry;
  /** Earlier versions of the same entry, most recent first. Empty for an
   *  entry that has never been revised. */
  history: JournalEntry[];
};

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
