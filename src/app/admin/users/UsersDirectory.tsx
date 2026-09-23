"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Role } from "@prisma/client";
import { matchesQuery, toSearchWords } from "@/lib/text-search";
import hub from "../AdminHub.module.css";
import styles from "./Users.module.css";

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  detail: string;
  createdAt: string;
};

export type DirectoryTeam = {
  id: string;
  name: string;
  coachName: string | null;
  /** "{title} · {category}", or null if the team hasn't started a project yet. */
  projectTitle: string | null;
  members: {
    userId: string;
    name: string;
    email: string;
    roleLabel: string | null;
    grade: string;
    schoolName: string;
    paymentStatus: string;
  }[];
  createdAt: string;
};

/** A student competing solo this season — enrolled, no season team membership. */
export type DirectoryIndividual = {
  userId: string;
  name: string;
  email: string;
  grade: string;
  schoolName: string;
  paymentStatus: string;
  createdAt: string;
};

export type DirectorySchool = {
  id: string;
  name: string;
  place: string;
  studentCount: number;
  coachCount: number;
  createdAt: string;
};

/** Everyone the People tab leaves out, with a plain reference status. */
export type DirectoryUnapproved = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  detail: string;
  createdAt: string;
};

const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  PARENT: "Parent",
  COACH: "Coach",
  JUDGE: "Judge",
  ADMIN: "Admin",
};

const ROLES: Role[] = ["STUDENT", "PARENT", "COACH", "JUDGE", "ADMIN"];

type SortOrder = "newest" | "oldest";
type View = "people" | "participants" | "schools" | "unapproved";
type ParticipantFilter = "all" | "team" | "individual";

// A team and a solo student are shown as one flat, sortable/searchable list
// (the same shape the People tab already uses) rather than two separate
// panels — "team" entries and "individual" entries are just two kinds of
// row in one list, distinguished by `kind`.
type ParticipantEntry =
  | { kind: "team"; id: string; team: DirectoryTeam }
  | { kind: "individual"; id: string; student: DirectoryIndividual };

const PARTICIPANT_FILTER_LABEL: Record<Exclude<ParticipantFilter, "all">, string> = {
  team: "Teams",
  individual: "Individuals",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

// Client-side search + role filter + sort, same reasoning as the Journal's
// own list (src/app/dashboard/journal/JournalList.tsx) and the admin
// History lists (src/components/admin/HistoryList.tsx, whose sort-toggle
// classes this reuses from AdminHub.module.css): a season's worth of users
// is a small dataset, so instant filtering/sorting beats a server round trip.
//
// A second "Participants" view lists everyone actually competing this
// season — every team's roster and every student going it alone — as one
// searchable/sortable/filterable list, the natural way to answer "who's
// entered this season" without cross-referencing People by hand.
export function UsersDirectory({
  users,
  teams,
  individuals,
  schools,
  unapproved,
  note,
}: {
  users: DirectoryUser[];
  teams: DirectoryTeam[];
  individuals: DirectoryIndividual[];
  schools: DirectorySchool[];
  unapproved: DirectoryUnapproved[];
  /** Shown as a banner above the tabs when this page's scope leaves something out (e.g. an archived season). */
  note?: string | null;
}) {
  // Tab, filters, search and sort all live in the URL (?tab=&q=&role=&pf=&sort=)
  // so a reload — or a shared link — lands back on the same view instead of
  // resetting to People/All. Same "read once on mount, patch the URL on every
  // change with replaceState" pattern as the stage pages' own ?page= (see
  // StageSections.tsx), so switching tabs never adds a back-button entry.
  // Which season this data belongs to is now a page-level routing concern
  // (see /admin/users, /admin/users/season/[seasonId], /admin/users/all) —
  // this component only owns the four splits within one scope.
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>(() => {
    const requested = searchParams.get("tab");
    return requested === "participants" || requested === "schools" || requested === "unapproved" ? requested : "people";
  });
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [roleFilter, setRoleFilter] = useState<Role | "all">(() => {
    const requested = searchParams.get("role");
    return requested && (ROLES as string[]).includes(requested) ? (requested as Role) : "all";
  });
  const [participantFilter, setParticipantFilter] = useState<ParticipantFilter>(() => {
    const requested = searchParams.get("pf");
    return requested === "team" || requested === "individual" ? requested : "all";
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => (searchParams.get("sort") === "oldest" ? "oldest" : "newest"));

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    if (view !== "people") params.set("tab", view);
    else params.delete("tab");
    if (query) params.set("q", query);
    else params.delete("q");
    if (roleFilter !== "all") params.set("role", roleFilter);
    else params.delete("role");
    if (participantFilter !== "all") params.set("pf", participantFilter);
    else params.delete("pf");
    if (sortOrder === "oldest") params.set("sort", "oldest");
    else params.delete("sort");
    window.history.replaceState(null, "", url);
  }, [view, query, roleFilter, participantFilter, sortOrder]);

  const countByRole = useMemo(() => {
    const counts = new Map<Role, number>();
    for (const user of users) counts.set(user.role, (counts.get(user.role) ?? 0) + 1);
    return counts;
  }, [users]);

  const visible = useMemo(() => {
    const q = query.trim();
    const filtered = users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!q) return true;
      const haystack = [user.name, user.email, ROLE_LABEL[user.role], user.detail].join(" ").toLowerCase();
      return matchesQuery(haystack, toSearchWords(haystack), q);
    });
    return [...filtered].sort((a, b) => {
      const aAt = new Date(a.createdAt).getTime();
      const bAt = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? bAt - aAt : aAt - bAt;
    });
  }, [users, query, roleFilter, sortOrder]);

  const entries = useMemo<ParticipantEntry[]>(
    () => [
      ...teams.map((team): ParticipantEntry => ({ kind: "team", id: team.id, team })),
      ...individuals.map((student): ParticipantEntry => ({ kind: "individual", id: student.userId, student })),
    ],
    [teams, individuals],
  );

  const visibleEntries = useMemo(() => {
    const q = query.trim();
    const filtered = entries.filter((entry) => {
      if (participantFilter !== "all" && entry.kind !== participantFilter) return false;
      if (!q) return true;
      const haystack =
        entry.kind === "team"
          ? [
              entry.team.name,
              entry.team.coachName,
              entry.team.projectTitle,
              ...entry.team.members.flatMap((m) => [m.name, m.email]),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
          : [entry.student.name, entry.student.email, entry.student.schoolName, entry.student.paymentStatus]
              .join(" ")
              .toLowerCase();
      return matchesQuery(haystack, toSearchWords(haystack), q);
    });
    return [...filtered].sort((a, b) => {
      const aAt = new Date(a.kind === "team" ? a.team.createdAt : a.student.createdAt).getTime();
      const bAt = new Date(b.kind === "team" ? b.team.createdAt : b.student.createdAt).getTime();
      return sortOrder === "newest" ? bAt - aAt : aAt - bAt;
    });
  }, [entries, query, participantFilter, sortOrder]);

  const visibleSchools = useMemo(() => {
    const q = query.trim();
    const filtered = schools.filter((school) => {
      if (!q) return true;
      const haystack = [school.name, school.place].join(" ").toLowerCase();
      return matchesQuery(haystack, toSearchWords(haystack), q);
    });
    return [...filtered].sort((a, b) => {
      const aAt = new Date(a.createdAt).getTime();
      const bAt = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? bAt - aAt : aAt - bAt;
    });
  }, [schools, query, sortOrder]);

  const visibleUnapproved = useMemo(() => {
    const q = query.trim();
    const filtered = unapproved.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!q) return true;
      const haystack = [user.name, user.email, ROLE_LABEL[user.role], user.status, user.detail].join(" ").toLowerCase();
      return matchesQuery(haystack, toSearchWords(haystack), q);
    });
    return [...filtered].sort((a, b) => {
      const aAt = new Date(a.createdAt).getTime();
      const bAt = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? bAt - aAt : aAt - bAt;
    });
  }, [unapproved, query, roleFilter, sortOrder]);

  const unapprovedCountByRole = useMemo(() => {
    const counts = new Map<Role, number>();
    for (const user of unapproved) counts.set(user.role, (counts.get(user.role) ?? 0) + 1);
    return counts;
  }, [unapproved]);

  const teamCount = teams.length;
  const individualCount = individuals.length;

  return (
    <>
      {note && <p className={styles.scopeNote}>{note}</p>}
      <div className={styles.viewTabs} role="group" aria-label="Directory view">
        <button
          type="button"
          className={view === "people" ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab}
          onClick={() => setView("people")}
        >
          People ({users.length})
        </button>
        <button
          type="button"
          className={view === "participants" ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab}
          onClick={() => setView("participants")}
        >
          Participants ({teamCount + individualCount})
        </button>
        <button
          type="button"
          className={view === "schools" ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab}
          onClick={() => setView("schools")}
        >
          Schools ({schools.length})
        </button>
        <button
          type="button"
          className={view === "unapproved" ? `${styles.viewTab} ${styles.viewTabActive}` : styles.viewTab}
          onClick={() => setView("unapproved")}
        >
          Unapproved ({unapproved.length})
        </button>
      </div>

      {view === "people" ? (
        <>
          <div className={styles.controls}>
            <div className={styles.searchRow}>
              <input
                type="search"
                className={styles.search}
                placeholder="Search by name, email, or school"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search users"
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
            <div className={styles.pills}>
              <button
                type="button"
                className={roleFilter === "all" ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setRoleFilter("all")}
              >
                All ({users.length})
              </button>
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={roleFilter === role ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                  onClick={() => setRoleFilter(role)}
                >
                  {ROLE_LABEL[role]} ({countByRole.get(role) ?? 0})
                </button>
              ))}
            </div>
          </div>

          <div className={hub.panel}>
            {visible.length === 0 ? (
              <p className={hub.empty}>No users match.</p>
            ) : (
              visible.map((user) => (
                <Link key={user.id} href={`/admin/users/${user.id}`} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>
                      {user.name} <span className={hub.tag}>{ROLE_LABEL[user.role]}</span>
                    </p>
                    <p className={hub.rowMeta}>{user.email}</p>
                    {user.detail && <p className={hub.rowMeta}>{user.detail}</p>}
                  </div>
                  <p className={hub.rowMeta}>Joined {formatDate(user.createdAt)}</p>
                </Link>
              ))
            )}
          </div>
        </>
      ) : view === "participants" ? (
        <>
          <div className={styles.controls}>
            <div className={styles.searchRow}>
              <input
                type="search"
                className={styles.search}
                placeholder="Search by team, student, or school"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search participants"
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
            <div className={styles.pills}>
              <button
                type="button"
                className={participantFilter === "all" ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setParticipantFilter("all")}
              >
                All ({teamCount + individualCount})
              </button>
              <button
                type="button"
                className={participantFilter === "team" ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setParticipantFilter("team")}
              >
                {PARTICIPANT_FILTER_LABEL.team} ({teamCount})
              </button>
              <button
                type="button"
                className={participantFilter === "individual" ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setParticipantFilter("individual")}
              >
                {PARTICIPANT_FILTER_LABEL.individual} ({individualCount})
              </button>
            </div>
          </div>

          <div className={hub.panel}>
            {visibleEntries.length === 0 ? (
              <p className={hub.empty}>No participants match.</p>
            ) : (
              visibleEntries.map((entry) =>
                entry.kind === "team" ? (
                  <TeamRow key={`team-${entry.id}`} team={entry.team} />
                ) : (
                  <Link key={`individual-${entry.id}`} href={`/admin/users/${entry.id}`} className={hub.row}>
                    <div className={hub.rowMain}>
                      <p className={hub.rowTitle}>
                        {entry.student.name} <span className={hub.tag}>Individual</span>
                      </p>
                      <p className={hub.rowMeta}>{entry.student.email}</p>
                      <p className={hub.rowMeta}>
                        Grade {entry.student.grade} · {entry.student.schoolName}
                      </p>
                    </div>
                    <p className={hub.rowMeta}>{entry.student.paymentStatus}</p>
                  </Link>
                ),
              )
            )}
          </div>
        </>
      ) : view === "schools" ? (
        <>
          <div className={styles.controls}>
            <div className={styles.searchRow}>
              <input
                type="search"
                className={styles.search}
                placeholder="Search by name or city"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search schools"
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
          </div>

          <div className={hub.panel}>
            {visibleSchools.length === 0 ? (
              <p className={hub.empty}>No schools match.</p>
            ) : (
              visibleSchools.map((school) => (
                <Link key={school.id} href={`/admin/users/schools/${school.id}`} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>{school.name}</p>
                    <p className={hub.rowMeta}>{school.place || "No city/state on file"}</p>
                  </div>
                  <p className={hub.rowMeta}>
                    {school.studentCount} student{school.studentCount === 1 ? "" : "s"} · {school.coachCount} coach
                    {school.coachCount === 1 ? "" : "es"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className={styles.controls}>
            <div className={styles.searchRow}>
              <input
                type="search"
                className={styles.search}
                placeholder="Search by name, email, or status"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search unapproved accounts"
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
            <div className={styles.pills}>
              <button
                type="button"
                className={roleFilter === "all" ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setRoleFilter("all")}
              >
                All ({unapproved.length})
              </button>
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={roleFilter === role ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                  onClick={() => setRoleFilter(role)}
                >
                  {ROLE_LABEL[role]} ({unapprovedCountByRole.get(role) ?? 0})
                </button>
              ))}
            </div>
          </div>

          <div className={hub.panel}>
            {visibleUnapproved.length === 0 ? (
              <p className={hub.empty}>Nothing unapproved right now.</p>
            ) : (
              visibleUnapproved.map((user) => (
                <div key={user.id} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>
                      {user.name} <span className={hub.tag}>{ROLE_LABEL[user.role]}</span>{" "}
                      <span className={hub.tagCoral}>{user.status}</span>
                    </p>
                    <p className={hub.rowMeta}>{user.email}</p>
                    {user.detail && <p className={hub.rowMeta}>{user.detail}</p>}
                  </div>
                  <p className={hub.rowMeta}>Joined {formatDate(user.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}

// A team's own row is the whole clickable toggle (no separate "Show
// members" link) — clicking anywhere on it expands its roster, which then
// renders directly underneath as its own rows, one per member, styled and
// linked exactly like an Individual participant row (same name+tag/
// grade+school/payment-status shape) rather than a stripped-down name list.
function TeamRow({ team }: { team: DirectoryTeam }) {
  const [open, setOpen] = useState(false);
  const memberCount = team.members.length;

  return (
    <>
      <button
        type="button"
        className={hub.rowButton}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={hub.rowMain}>
          <span className={hub.rowTitle}>
            {team.name} <span className={hub.tag}>Team</span>
          </span>
          <span className={hub.rowMeta}>
            {team.projectTitle ? `Project: ${team.projectTitle}` : "No project started yet"}
            {team.coachName ? ` · Coach: ${team.coachName}` : ""}
          </span>
        </span>
        <span className={hub.rowValueChevron}>
          {memberCount} {memberCount === 1 ? "member" : "members"}
          <svg
            className={open ? `${hub.chevron} ${hub.chevronOpen}` : hub.chevron}
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className={hub.teamRoster}>
          {team.members.map((member) => (
            <Link key={member.userId} href={`/admin/users/${member.userId}`} className={hub.row}>
              <div className={hub.rowMain}>
                <p className={hub.rowTitle}>
                  {member.name} <span className={hub.tag}>{member.roleLabel ?? "Team member"}</span>
                </p>
                <p className={hub.rowMeta}>{member.email}</p>
                <p className={hub.rowMeta}>
                  Grade {member.grade} · {member.schoolName}
                </p>
              </div>
              <p className={hub.rowMeta}>{member.paymentStatus}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
