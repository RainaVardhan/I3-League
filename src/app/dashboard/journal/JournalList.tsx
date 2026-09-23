"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import buttonStyles from "@/components/design-system/Button.module.css";
import { JOURNAL_ENTRY_TYPES, journalEntryTypeLabel, journalStageLabel } from "@/lib/journal";
import { matchesQuery, toSearchWords } from "@/lib/text-search";
import { JournalEntryCard, type EntrySnapshot } from "./JournalEntryCard";
import styles from "./Journal.module.css";

export type JournalGroupData = {
  entryGroupId: string;
  latest: EntrySnapshot;
  history: EntrySnapshot[];
};

type SortOrder = "newest" | "oldest";

function formatSearchDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    date,
  );
}

// The Journal's own timeline is naturally short-lived and personal (one
// student's own entries, not a shared or paginated dataset), so search,
// type filtering, and sorting all happen client-side against the full list
// the server already fetched — no extra round trip, and results update
// instantly as a student types, which matters more for a middle/high
// schooler skimming their own work than a "correct" server round trip
// would. The whole list renders as one connected plane (docs/design-system
// .md Section 21.5, Pattern C — the same "shared surface, hairline-divided
// rows" recipe the dashboard hub's own checklist uses) rather than a stack
// of separate floating cards, per Section 18 rule 7.
export function JournalList({ groups, minEntryDate }: { groups: JournalGroupData[]; minEntryDate: string }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // How many entries currently sit under each type — shown as a count next
  // to each filter pill so a student can see at a glance what they have (and
  // haven't) logged yet, without opening anything.
  const countByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const group of groups) {
      counts.set(group.latest.entryType, (counts.get(group.latest.entryType) ?? 0) + 1);
    }
    return counts;
  }, [groups]);

  const visible = useMemo(() => {
    const q = query.trim();
    let result = groups.filter((group) => {
      if (typeFilter !== "all" && group.latest.entryType !== typeFilter) return false;
      if (!q) return true;
      // Searches everything the row itself shows for the current version —
      // title, body text, entry-type label, stage label, and the date —
      // not older versions' text, since a student thinking "did I write
      // about X" is almost always thinking of what the entry says now.
      const haystack = [
        group.latest.title,
        group.latest.text,
        journalEntryTypeLabel(group.latest.entryType),
        journalStageLabel(group.latest.stage),
        formatSearchDate(group.latest.entryDate),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesQuery(haystack, toSearchWords(haystack), q);
    });
    if (sortOrder === "oldest") result = [...result].reverse();
    return result;
  }, [groups, query, typeFilter, sortOrder]);

  const filtersActive = query.trim() !== "" || typeFilter !== "all";

  function clearFilters() {
    setQuery("");
    setTypeFilter("all");
  }

  if (groups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.lead}>Log your first entry whenever something worth remembering happens.</p>
        {/* Same ghost + hard-shadow "equally prominent" treatment as
            "See How It Works" on the homepage (Button.module.css
            .ghostStrong), since this is the one thing to do on an empty
            page. */}
        <Button
          as={Link}
          href="/dashboard/journal/new"
          variant="ghost"
          className={`${buttonStyles.ghostStrong} ${styles.emptyStateBtn}`}
        >
          Add your first entry
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.plane}>
      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search your entries..."
          aria-label="Search your journal entries"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles.sortToggle} role="group" aria-label="Sort order">
          <button
            type="button"
            className={sortOrder === "newest" ? `${styles.sortBtn} ${styles.sortBtnActive}` : styles.sortBtn}
            onClick={() => setSortOrder("newest")}
          >
            Newest first
          </button>
          <button
            type="button"
            className={sortOrder === "oldest" ? `${styles.sortBtn} ${styles.sortBtnActive}` : styles.sortBtn}
            onClick={() => setSortOrder("oldest")}
          >
            Oldest first
          </button>
        </div>
      </div>

      <div className={styles.typeFilters} role="group" aria-label="Filter by entry type">
        <button
          type="button"
          className={typeFilter === "all" ? `${styles.filterPill} ${styles.filterPillActive}` : styles.filterPill}
          onClick={() => setTypeFilter("all")}
        >
          All ({groups.length})
        </button>
        {JOURNAL_ENTRY_TYPES.filter((type) => countByType.has(type.value)).map((type) => (
          <button
            key={type.value}
            type="button"
            className={
              typeFilter === type.value ? `${styles.filterPill} ${styles.filterPillActive}` : styles.filterPill
            }
            onClick={() => setTypeFilter(type.value)}
          >
            {type.label} ({countByType.get(type.value)})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={styles.noResults}>
          <p className={styles.lead}>No entries match your search.</p>
          {filtersActive && (
            <button type="button" className={styles.textLink} onClick={clearFilters}>
              Clear search and filters
            </button>
          )}
        </div>
      ) : (
        <ol className={styles.rows}>
          {visible.map((group) => (
            <JournalEntryCard
              key={group.entryGroupId}
              entryGroupId={group.entryGroupId}
              latest={group.latest}
              history={group.history}
              minEntryDate={minEntryDate}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
