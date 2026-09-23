import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/design-system/Button";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { getJourney } from "@/lib/stage-progress";
import { isHighSchoolGrade } from "@/lib/investigate-requirements";
import { getJournalTimeline, toDateInputValue } from "@/lib/journal";
import { AppShell } from "@/components/app/AppShell";
import { JournalHero } from "./JournalHero";
import { JournalList } from "./JournalList";
import styles from "./Journal.module.css";

export const metadata = {
  title: "Innovation Journal | I³ League",
};

function daysAgoLabel(date: Date, now: Date) {
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

// The Innovation Journal: a running, dated, append-only record a student
// keeps across every stage of their project — CLAUDE.md "Each student gets
// their own ... Innovation Journal" and "Innovation Journal is append-only:
// edits create a new version; don't overwrite/delete history." It lives on
// its own page, not folded into the hub (see the "Nothing else goes here"
// comment on dashboard/page.tsx's StudentHub), and follows the same
// SplitHero + connected-plane vocabulary as every other page on the site
// (docs/design-system.md Sections 21.2 and 21.5), not a one-off look.
//
// Structure: the hero states the count at a glance (a stat box, same
// family as Pricing's), then one paper band holds the "Add entry" action
// up top — the first thing a student can act on — followed by the
// searchable, filterable, sortable timeline as one connected plane
// (Pattern C) rather than a stack of separate floating cards.
export default async function JournalPage() {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
  if (!student) {
    redirect("/register");
  }

  // Same VERIFIED-payment gate as every other curriculum-facing page —
  // the Journal is one of the things a student's own paid enrollment
  // unlocks, per student, never per team.
  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
    include: { payment: true },
  });
  if (enrollment?.payment?.status !== "VERIFIED") {
    redirect("/dashboard");
  }

  const [journey, teamMembership, groups] = await Promise.all([
    getJourney(student.id),
    prisma.teamMembership.findFirst({ where: { studentId: student.id }, include: { team: true } }),
    getJournalTimeline(student.id),
  ]);

  const studentMeta = `Grade ${student.grade} · ${teamMembership?.team.name ?? "Individual"}`;

  const now = new Date();
  const totalEntries = groups.length;
  const weekMs = 7 * 86_400_000;
  const entriesThisWeek = groups.filter((g) => now.getTime() - g.latest.entryDate.getTime() <= weekMs).length;
  const lastEntry = groups[0]?.latest.entryDate ?? null;
  const lastEntryLabel = lastEntry ? daysAgoLabel(lastEntry, now) : null;

  return (
    <AppShell
      studentName={student.displayName ?? student.firstName}
      studentMeta={studentMeta}
      journey={journey}
      breadcrumb="Journal"
      isHighSchool={isHighSchoolGrade(student.grade)}
      isTeamProject={Boolean(teamMembership)}
    >
      <JournalHero totalEntries={totalEntries} entriesThisWeek={entriesThisWeek} lastEntryLabel={lastEntryLabel} />

      <section className={styles.band}>
        <div className={styles.inner}>
          <div className={styles.headRow}>
            <div>
              <p className={styles.eyebrow}>Timeline</p>
              <h2 className={styles.headingSm}>
                {totalEntries === 0 ? "No entries yet" : `${totalEntries} ${totalEntries === 1 ? "entry" : "entries"}`}
              </h2>
            </div>
            {/* The empty state (inside JournalList) already carries its own
                "Add your first entry" CTA — showing this one too would be a
                second, equally loud button doing the exact same thing on
                the same screen (docs/design-system.md Section 9: "Prefer
                one dominant primary action per section"). */}
            {totalEntries > 0 && (
              <Button as={Link} href="/dashboard/journal/new" className={styles.addEntryBtn}>
                Add entry
              </Button>
            )}
          </div>

          <JournalList groups={groups} minEntryDate={toDateInputValue(season.openDate)} />
        </div>
      </section>
    </AppShell>
  );
}
