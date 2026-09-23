"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import buttonStyles from "@/components/design-system/Button.module.css";
import { TEAM_STAGE_OPTIONS, teamStageLabel, type ContributionRow } from "@/lib/team-contribution";
import { matchesQuery, toSearchWords } from "@/lib/text-search";
import styles from "./Team.module.css";

type ContributionListProps = {
  contributions: ContributionRow[];
  teammateNames: string[];
};

type SortOrder = "newest" | "oldest";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatSearchDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

// The shared, whole-team log — search, both filters, and sort are all
// client-side (a team's contribution log is a small, personal-to-the-team
// dataset, same reasoning as JournalList's own search/filter/sort), so
// results update instantly as a student types or clicks. Filters start on
// "Everyone" / "All stages" so the default view is the honest, un-narrowed
// record.
export function ContributionList({ contributions, teammateNames }: ContributionListProps) {
  const [query, setQuery] = useState("");
  const [nameFilter, setNameFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const nameCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of contributions) map.set(row.studentName, (map.get(row.studentName) ?? 0) + 1);
    return map;
  }, [contributions]);

  const stageCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of contributions) {
      if (row.stage) map.set(row.stage, (map.get(row.stage) ?? 0) + 1);
    }
    return map;
  }, [contributions]);

  const visible = useMemo(() => {
    const q = query.trim();
    let result = contributions.filter((row) => {
      if (nameFilter !== "all" && row.studentName !== nameFilter) return false;
      if (stageFilter !== "all" && row.stage !== stageFilter) return false;
      if (!q) return true;
      const haystack = [
        row.studentName,
        row.description,
        row.result,
        teamStageLabel(row.stage),
        formatSearchDate(row.createdAt),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesQuery(haystack, toSearchWords(haystack), q);
    });
    if (sortOrder === "oldest") result = [...result].reverse();
    return result;
  }, [contributions, query, nameFilter, stageFilter, sortOrder]);

  const filtersActive = query.trim() !== "" || nameFilter !== "all" || stageFilter !== "all";

  function clearFilters() {
    setQuery("");
    setNameFilter("all");
    setStageFilter("all");
  }

  if (contributions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.lead}>
          No contributions logged yet. Once you or a teammate logs one, it will show up here for the whole team to
          see.
        </p>
        {/* Same ghost + hard-shadow "equally prominent" treatment as
            Journal's own empty-state CTA (Button.module.css .ghostStrong),
            since this is the one thing to do on an empty page. */}
        <Button
          as={Link}
          href="/dashboard/team/new"
          variant="ghost"
          className={`${buttonStyles.ghostStrong} ${styles.emptyStateBtn}`}
        >
          Log your first contribution
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
          placeholder="Search the contribution log..."
          aria-label="Search the contribution log"
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

      <div className={styles.filters} role="group" aria-label="Filter by teammate">
        <button
          type="button"
          className={`${styles.filterPill} ${nameFilter === "all" ? styles.filterPillActive : ""}`}
          onClick={() => setNameFilter("all")}
        >
          Everyone ({contributions.length})
        </button>
        {teammateNames.map((name) => (
          <button
            key={name}
            type="button"
            className={`${styles.filterPill} ${nameFilter === name ? styles.filterPillActive : ""}`}
            onClick={() => setNameFilter(name)}
          >
            {name} ({nameCounts.get(name) ?? 0})
          </button>
        ))}
      </div>

      <div className={styles.filters} role="group" aria-label="Filter by stage">
        <button
          type="button"
          className={`${styles.filterPill} ${stageFilter === "all" ? styles.filterPillActive : ""}`}
          onClick={() => setStageFilter("all")}
        >
          All stages ({contributions.length})
        </button>
        {TEAM_STAGE_OPTIONS.filter((stage) => stageCounts.has(stage.value)).map((stage) => (
          <button
            key={stage.value}
            type="button"
            className={`${styles.filterPill} ${stageFilter === stage.value ? styles.filterPillActive : ""}`}
            onClick={() => setStageFilter(stage.value)}
          >
            {stage.label} ({stageCounts.get(stage.value) ?? 0})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={styles.noResults}>
          <p className={styles.lead}>No contributions match your search.</p>
          {filtersActive && (
            <button type="button" className={styles.textLink} onClick={clearFilters}>
              Clear search and filters
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.rows}>
          {visible.map((row) => (
            <li key={row.id} className={styles.row}>
              <div className={styles.rowHead}>
                <span className={styles.rowName}>{row.studentName}</span>
                {row.stage && <span className={styles.stageTag}>{teamStageLabel(row.stage)}</span>}
                <span className={styles.dateTag}>{formatDate(row.createdAt)}</span>
              </div>
              <p className={styles.rowText}>{row.description}</p>
              {row.result && (
                <div className={styles.rowResult}>
                  <span className={styles.rowResultLabel}>Output / Evidence</span>
                  <p className={styles.rowText}>{row.result}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
