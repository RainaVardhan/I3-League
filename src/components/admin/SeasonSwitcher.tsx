import Link from "next/link";
import hub from "../../app/admin/AdminHub.module.css";
import styles from "./SeasonSwitcher.module.css";

export type SeasonSwitcherSeason = {
  id: string;
  label: string;
};

// Shown at the top of all three Users pages (current season, a past
// season, and All seasons) so moving between them is one click, not a
// remembered URL. Highlights whichever one the page currently is —
// `active` is "current" | "all" | a past season's id — via plain <Link>s
// (real navigation between three distinct routes, not client-side tab
// state), reusing the same pill look admin queues already use for a
// toggle-filter group (AdminHub.module.css's .filterPill).
export function SeasonSwitcher({
  currentSeason,
  pastSeasons,
  active,
}: {
  currentSeason: SeasonSwitcherSeason;
  pastSeasons: SeasonSwitcherSeason[];
  active: "current" | "all" | string;
}) {
  return (
    <nav className={styles.switcher} aria-label="Season">
      <Link
        href="/admin/users"
        className={active === "current" ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill}
        aria-current={active === "current" ? "page" : undefined}
      >
        {currentSeason.label} · Current
      </Link>
      {pastSeasons.map((season) => (
        <Link
          key={season.id}
          href={`/admin/users/season/${season.id}`}
          className={active === season.id ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill}
          aria-current={active === season.id ? "page" : undefined}
        >
          {season.label}
        </Link>
      ))}
      <Link
        href="/admin/users/all"
        className={active === "all" ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill}
        aria-current={active === "all" ? "page" : undefined}
      >
        All seasons
      </Link>
    </nav>
  );
}
