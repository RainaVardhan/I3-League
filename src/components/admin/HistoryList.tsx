"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { matchesQuery, toSearchWords } from "@/lib/text-search";
import hub from "@/app/admin/AdminHub.module.css";

export type HistoryItem = {
  id: string;
  title: string;
  /** Extra lines under the title — email, amount/method, relationship, etc. */
  subtitleLines: string[];
  /** The already-formatted "Approved {date}" / "Rejected {date} · reason" line. */
  decisionLine: string;
  isApproved: boolean;
  decidedAtMs: number;
  /** Present only for rows that link out (the safety queue links to its
   *  own detail page); the other two queues render a plain row. */
  href?: string;
};

type StatusFilter = "all" | "approved" | "rejected";
type SortOrder = "newest" | "oldest";

// Shared search/filter/sort list for the three admin decision-history
// sections (payments, safety reviews, parent links) — one component instead
// of three copies of the same client-side filtering logic, same reasoning
// as src/lib/text-search.ts itself (pulled out once a second list needed
// it). Client-side against the page's own already-fetched rows: the same
// "most recent N decisions" cap those pages already apply, not a paginated
// or shared dataset, so there's no reason for a server round trip on every
// keystroke.
export function HistoryList({ items, subjectPlural }: { items: HistoryItem[]; subjectPlural: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const approvedCount = useMemo(() => items.filter((item) => item.isApproved).length, [items]);
  const rejectedCount = items.length - approvedCount;

  const visible = useMemo(() => {
    const q = query.trim();
    const filtered = items.filter((item) => {
      if (status === "approved" && !item.isApproved) return false;
      if (status === "rejected" && item.isApproved) return false;
      if (!q) return true;
      const haystack = [item.title, ...item.subtitleLines, item.decisionLine].join(" ").toLowerCase();
      return matchesQuery(haystack, toSearchWords(haystack), q);
    });
    return [...filtered].sort((a, b) =>
      sortOrder === "newest" ? b.decidedAtMs - a.decidedAtMs : a.decidedAtMs - b.decidedAtMs,
    );
  }, [items, query, status, sortOrder]);

  const filtersActive = query.trim() !== "" || status !== "all";

  if (items.length === 0) {
    return <p className={hub.empty}>No decisions yet.</p>;
  }

  return (
    <>
      <div className={hub.historyToolbar}>
        <input
          type="search"
          className={hub.historySearch}
          placeholder={`Search ${subjectPlural}...`}
          aria-label={`Search ${subjectPlural}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={hub.sortToggle} role="group" aria-label="Sort order">
          <button
            type="button"
            className={sortOrder === "newest" ? `${hub.sortBtn} ${hub.sortBtnActive}` : hub.sortBtn}
            onClick={() => setSortOrder("newest")}
          >
            Newest first
          </button>
          <button
            type="button"
            className={sortOrder === "oldest" ? `${hub.sortBtn} ${hub.sortBtnActive}` : hub.sortBtn}
            onClick={() => setSortOrder("oldest")}
          >
            Oldest first
          </button>
        </div>
      </div>

      <div className={hub.statusFilters} role="group" aria-label="Filter by decision">
        <button
          type="button"
          className={status === "all" ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill}
          onClick={() => setStatus("all")}
        >
          All ({items.length})
        </button>
        <button
          type="button"
          className={status === "approved" ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill}
          onClick={() => setStatus("approved")}
        >
          Approved ({approvedCount})
        </button>
        <button
          type="button"
          className={status === "rejected" ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill}
          onClick={() => setStatus("rejected")}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {visible.length === 0 ? (
        <div className={hub.panel}>
          <p className={hub.empty}>
            No decisions match.
            {filtersActive && (
              <>
                {" "}
                <button
                  type="button"
                  className={hub.textLink}
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                >
                  Clear search and filters
                </button>
              </>
            )}
          </p>
        </div>
      ) : (
        <div className={hub.panel}>
          {visible.map((item) => {
            const content = (
              <>
                <div className={hub.rowMain}>
                  <p className={hub.rowTitle}>{item.title}</p>
                  {item.subtitleLines.map((line, index) => (
                    <p key={index} className={hub.rowMeta}>
                      {line}
                    </p>
                  ))}
                  <p className={hub.rowMeta}>{item.decisionLine}</p>
                </div>
                <span className={`${hub.tag} ${item.isApproved ? hub.tagBlue : hub.tagCoral}`}>
                  {item.isApproved ? "Approved" : "Rejected"}
                </span>
              </>
            );
            return item.href ? (
              <Link key={item.id} href={item.href} className={hub.row}>
                {content}
              </Link>
            ) : (
              <div key={item.id} className={hub.row}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
