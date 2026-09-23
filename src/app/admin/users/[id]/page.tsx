import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma, type Consent } from "@prisma/client";
import type { StageName, StageStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/design-system/Button";
import { DeleteAccountDialog } from "@/components/admin/DeleteAccountDialog";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatSeasonDate } from "@/lib/season";
import { ensureStageProgressInitialized, STAGE_NUMBERS, STAGE_ORDER } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";
import { getJournalTimeline, journalEntryTypeLabel, journalStageLabel, type JournalGroup } from "@/lib/journal";
import { getTeamContributions, teamStageLabel, type ContributionRow } from "@/lib/team-contribution";
import hub from "../../AdminHub.module.css";
import styles from "./UserDetail.module.css";
import { deleteUserAction, overrideStageAction } from "./actions";

export const metadata = {
  title: "User | Admin | I³ League",
};

const CONSENT_ITEMS = [
  { field: "participationAccepted", label: "Participation" },
  { field: "privacyAccepted", label: "Privacy Policy" },
  { field: "codeOfConductAccepted", label: "Code of Conduct" },
  { field: "competitionRulesAccepted", label: "Competition Rules" },
  { field: "academicIntegrityAccepted", label: "Academic Integrity" },
  { field: "aiUseAccepted", label: "AI-use disclosure" },
  { field: "safetyAccepted", label: "Safety review" },
  { field: "ipPolicyAccepted", label: "IP / confidentiality policy" },
] as const satisfies readonly { field: keyof Consent; label: string }[];

const userDetailArgs = {
  include: {
    student: {
      include: {
        school: true,
        individualProject: true,
        teamMemberships: { include: { team: { include: { project: true, coach: true } } } },
        enrollments: { include: { season: true, payment: true }, orderBy: { createdAt: "desc" } },
        parentLinks: { include: { parent: { include: { user: true } } } },
        stageProgress: true,
      },
    },
    parent: {
      include: {
        studentLinks: { include: { student: true } },
      },
    },
    coach: { include: { school: true } },
    judge: true,
    admin: true,
  },
} satisfies Prisma.UserDefaultArgs;

type UserDetail = Prisma.UserGetPayload<typeof userDetailArgs>;
type StudentDetailData = NonNullable<UserDetail["student"]>;
type ParentDetailData = NonNullable<UserDetail["parent"]>;

// A read-only "everything about this account" page — the natural drill-down
// from the directory list. Read-only for the same reason the directory
// itself is (CLAUDE.md: Judge/Admin provisioning and any edit tooling here
// are still Phase 2) — this only ever reads, never writes.
export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { admin } = await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id }, ...userDetailArgs });
  if (!user) notFound();

  const consents = user.student
    ? await prisma.consent.findMany({ where: { studentId: user.student.id }, orderBy: { acceptedAt: "desc" } })
    : [];
  const mediaConsent = user.student
    ? await prisma.mediaConsent.findFirst({ where: { studentId: user.student.id }, orderBy: { id: "desc" } })
    : null;

  // Backfill + fetch fresh, rather than trusting the include above: a
  // student who's never opened /dashboard can have zero StageProgress rows,
  // and the override panel needs all six to exist (the update it calls
  // targets studentId_stageName, which only resolves for a row that's
  // actually there).
  let stageProgress: { stageName: StageName; status: StageStatus; unlockedAt: Date | null; completedAt: Date | null }[] = [];
  let journal: JournalGroup[] = [];
  if (user.student) {
    await ensureStageProgressInitialized(user.student.id);
    [stageProgress, journal] = await Promise.all([
      prisma.stageProgress.findMany({ where: { studentId: user.student.id } }),
      getJournalTimeline(user.student.id),
    ]);
  }

  const team = user.student?.teamMemberships[0]?.team ?? null;
  const project = user.student?.individualProject ?? team?.project ?? null;
  const teamContributions = team && project ? await getTeamContributions(project.id) : [];

  let name = user.email;
  if (user.role === "STUDENT" && user.student) name = `${user.student.firstName} ${user.student.lastName}`;
  else if (user.role === "PARENT" && user.parent) name = user.parent.fullName;
  else if (user.role === "COACH" && user.coach) name = user.coach.fullName;
  else if (user.role === "JUDGE" && user.judge) name = user.judge.fullName;
  else if (user.role === "ADMIN" && user.admin) name = user.admin.fullName;

  // One DetailSection per stacked panel (Registration, Team & project, ...),
  // rendered below in its own full-bleed band, alternating paper/blue down
  // the page — this is what "sections" means for all four of the role
  // branches below, not just Student.
  let sections: DetailSection[];
  if (user.role === "STUDENT" && user.student) {
    sections = buildStudentSections({
      userId: user.id,
      student: user.student,
      consents,
      mediaConsentGranted: mediaConsent?.granted ?? false,
      stageProgress,
      journal,
      teamContributions,
    });
  } else if (user.role === "PARENT" && user.parent) {
    sections = buildParentSections(user.parent);
  } else if (user.role === "COACH" && user.coach) {
    sections = [
      {
        key: "coach",
        body: (
          <div className={hub.panel}>
            <Row label="School" value={user.coach.school?.name ?? "No school on file"} />
          </div>
        ),
      },
    ];
  } else if (user.role === "JUDGE" || user.role === "ADMIN") {
    sections = [
      {
        key: "phase-2",
        body: (
          <p className={hub.formNote}>
            {user.role === "JUDGE" ? "Judge" : "Admin"} accounts don&apos;t carry any further registration
            info. Provisioning and role-specific tooling for this role are still Phase 2.
          </p>
        ),
      },
    ];
  } else {
    sections = [
      {
        key: "incomplete",
        body: <p className={hub.formNote}>Registration incomplete. This account has no profile yet.</p>,
      },
    ];
  }

  sections.push({
    key: "danger",
    body: (
      <div className={styles.dangerZone}>
        {user.id === admin.userId ? (
          <p className={styles.dangerNote}>You can&apos;t delete your own account from here.</p>
        ) : (
          <>
            <p className={styles.dangerNote}>
              Delete this account. Permanent, not a status change; use the Payments or Parent links
              queue instead for a correction.
            </p>
            <DeleteAccountDialog
              action={deleteUserAction}
              userId={user.id}
              email={user.email}
              name={name}
              consequences={roleConsequences(user.role)}
            />
          </>
        )}
      </div>
    ),
  });

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Users">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <Link href="/admin/users" className={hub.backLink}>
            ← All users
          </Link>
          <p className={hub.eyebrow}>{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</p>
          <h1 className={hub.heading}>{name}</h1>
          <p className={hub.lead}>
            {user.email} · Joined {formatSeasonDate(user.createdAt)}
          </p>
        </div>
      </section>

      {sections.map((section, index) => (
        <section key={section.key} className={index % 2 === 0 ? hub.sectionBlue : hub.sectionPaper}>
          <div className={hub.inner}>
            {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
            {section.body}
          </div>
        </section>
      ))}
    </AdminShell>
  );
}

// One stacked panel's worth of content, rendered as its own full-bleed band
// (see the map above) rather than sharing a background with its neighbors —
// this is what lets the page alternate paper/blue per section instead of
// reading as one long undifferentiated column.
type DetailSection = { key: string; heading?: string; body: ReactNode };

// What deleteUserAccount (src/lib/delete-account.ts) actually removes for
// this role, in plain language for the confirm dialog — kept in sync with
// that function by hand since the dialog is a summary, not generated from
// the real table list.
function roleConsequences(role: UserDetail["role"]): string[] {
  if (role === "STUDENT") {
    return [
      "Their registration, enrollment, and payment records",
      "Every stage submission, journal entry, and piece of project work",
      "Their consent and media-consent records",
      "Their individual project, if they have one (a team project stays; teammates keep it)",
    ];
  }
  if (role === "PARENT") {
    return ["Their consent and media-consent records", "Their links to any students"];
  }
  if (role === "COACH") {
    return ["Nothing about their team: it just loses its coach, the roster and project stay"];
  }
  if (role === "JUDGE") {
    return ["Their judging assignments and scores"];
  }
  return ["Nothing else on file for this role"];
}

type StageProgressRow = { stageName: StageName; status: StageStatus; unlockedAt: Date | null; completedAt: Date | null };

function buildStudentSections({
  userId,
  student,
  consents,
  mediaConsentGranted,
  stageProgress,
  journal,
  teamContributions,
}: {
  userId: string;
  student: StudentDetailData;
  consents: Consent[];
  mediaConsentGranted: boolean;
  stageProgress: StageProgressRow[];
  journal: JournalGroup[];
  teamContributions: ContributionRow[];
}): DetailSection[] {
  const schoolLabel =
    student.schoolingType === "HOMESCHOOL"
      ? (student.homeschoolName ?? "Homeschool")
      : (student.school?.name ?? "No school on file");

  const team = student.teamMemberships[0]?.team ?? null;
  const project = student.individualProject ?? team?.project ?? null;

  // Ordered by STAGE_ORDER (not fetch order), and always all six rows —
  // ensureStageProgressInitialized already ran on the page above, so this
  // is the up-to-date list the override panel writes against.
  const progressByStage = new Map(stageProgress.map((row) => [row.stageName, row]));
  const stageOrder = STAGE_ORDER.map(
    (stageName) => progressByStage.get(stageName) ?? { stageName, status: "LOCKED" as StageStatus, unlockedAt: null, completedAt: null },
  );
  const currentStage = stageOrder.find((row) => row.status === "CURRENT");
  const completedCount = stageOrder.filter((row) => row.status === "COMPLETE").length;
  let journeyLine: string;
  if (currentStage) {
    journeyLine = `${STAGE_NUMBERS[currentStage.stageName]} · ${getStageCopy(currentStage.stageName).name} (in progress) · ${completedCount} of 6 stages complete`;
  } else if (completedCount === 6) {
    journeyLine = "All six stages complete";
  } else {
    journeyLine = "Not started yet";
  }

  const consent = consents[0];

  const result: DetailSection[] = [
    {
      key: "registration",
      heading: "Registration",
      body: (
        <div className={hub.panel}>
          <Row label="Date of birth" value={formatSeasonDate(student.dateOfBirth)} />
          <Row label="Grade" value={student.grade} />
          <Row label="School" value={schoolLabel} />
          <Row label="Location" value={`${student.city}, ${student.state}, ${student.country}`} />
          <Row
            label="Innovation interests"
            value={student.interests.length > 0 ? student.interests.join(", ") : "None listed"}
          />
          <Row label="Guardian email" value={student.guardianEmail} />
        </div>
      ),
    },
    {
      key: "team",
      heading: "Team & project",
      body: (
        <div className={hub.panel}>
          <Row label="Team" value={team ? team.name : "Individual (no team)"} />
          {team?.coach && <Row label="Team coach" value={team.coach.fullName} />}
          <Row
            label="Project"
            value={project ? `${project.title} · ${project.category}` : "No project started yet"}
          />
          <Row label="Journey" value={journeyLine} />
        </div>
      ),
    },
    {
      key: "stage-progress",
      heading: "Stage progress",
      body: (
        <div className={hub.panel}>
          {stageOrder.map((row) => (
            <div key={row.stageName} className={hub.row}>
              <div className={hub.rowMain}>
                <p className={hub.rowTitle}>
                  {STAGE_NUMBERS[row.stageName]} · {getStageCopy(row.stageName).name}
                </p>
                <p className={hub.rowMeta}>
                  <span className={`${hub.tag} ${row.status === "LOCKED" ? "" : hub.tagBlue}`}>{row.status}</span>
                  {row.status === "COMPLETE" &&
                    row.completedAt &&
                    ` · Completed ${formatSeasonDate(row.completedAt)}`}
                  {row.status === "CURRENT" && row.unlockedAt && ` · Unlocked ${formatSeasonDate(row.unlockedAt)}`}
                </p>
              </div>
              <div className={hub.rowActions}>
                {row.status === "LOCKED" && (
                  <StageOverrideForm
                    userId={userId}
                    studentId={student.id}
                    stageName={row.stageName}
                    overrideAction="unlock"
                    label="Unlock"
                  />
                )}
                {row.status === "CURRENT" && (
                  <StageOverrideForm
                    userId={userId}
                    studentId={student.id}
                    stageName={row.stageName}
                    overrideAction="complete"
                    label="Mark complete"
                  />
                )}
                {row.status === "COMPLETE" && (
                  <StageOverrideForm
                    userId={userId}
                    studentId={student.id}
                    stageName={row.stageName}
                    overrideAction="reopen"
                    label="Reopen"
                    ghost
                  />
                )}
              </div>
            </div>
          ))}
          <p className={styles.panelNote}>
            For exceptions only. A student normally unlocks the next stage by completing this one; these
            buttons skip that, so use them for a real correction, not routine progression.
          </p>
        </div>
      ),
    },
    {
      key: "enrollment",
      heading: "Enrollment & payment",
      body: (
        <div className={hub.panel}>
          {student.enrollments.length === 0 ? (
            <p className={hub.empty}>No enrollment on file.</p>
          ) : (
            student.enrollments.map((enrollment) => (
              <div key={enrollment.id} className={hub.row}>
                <p className={hub.rowLabel}>{enrollment.season.label}</p>
                <p className={hub.rowValue}>
                  {enrollment.participationType === "TEAM" ? "Team" : "Individual"} ·{" "}
                  {enrollment.payment
                    ? `${enrollment.payment.status}${
                        enrollment.payment.status === "REJECTED" && enrollment.payment.rejectionReason
                          ? ` (${enrollment.payment.rejectionReason})`
                          : ""
                      }`
                    : "No payment submitted"}
                </p>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      key: "parent-links",
      heading: "Parent links & consent",
      body: (
        <div className={hub.panel}>
          {student.parentLinks.length === 0 ? (
            <p className={hub.empty}>No parent linked yet.</p>
          ) : (
            student.parentLinks.map((link) => (
              <div key={link.parentId} className={hub.row}>
                <p className={hub.rowLabel}>
                  {link.parent.fullName} ({link.relationship})
                </p>
                <p className={hub.rowValue}>
                  {link.rejectedAt
                    ? "Link not approved"
                    : link.verifiedAt
                      ? `Verified ${formatSeasonDate(link.verifiedAt)}`
                      : "Pending admin review"}
                </p>
              </div>
            ))
          )}
          <div className={hub.row}>
            <p className={hub.rowLabel}>Required consent</p>
            <p className={hub.rowValue}>
              {consent ? `Submitted ${formatSeasonDate(consent.acceptedAt)}` : "Not submitted"}
            </p>
          </div>
          {consent && (
            <div className={hub.rowWrap}>
              <p className={hub.rowLabel}>Consent items</p>
              <p className={hub.rowValueWrap}>
                {CONSENT_ITEMS.filter((item) => consent[item.field]).map((item) => item.label).join(", ") ||
                  "None accepted"}
              </p>
            </div>
          )}
          <div className={hub.row}>
            <p className={hub.rowLabel}>Photo/video consent</p>
            <p className={hub.rowValue}>{mediaConsentGranted ? "Granted" : "Not granted"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "journal",
      heading: "Innovation Journal",
      body: (
        <div className={hub.panel}>
          {journal.length === 0 ? (
            <p className={hub.empty}>No journal entries yet.</p>
          ) : (
            journal.slice(0, JOURNAL_PREVIEW_LIMIT).map((group) => (
              <div key={group.entryGroupId} className={hub.row}>
                <div className={hub.rowMain}>
                  <p className={hub.rowTitle}>{group.latest.title || "Untitled entry"}</p>
                  <p className={hub.rowMeta}>
                    {journalEntryTypeLabel(group.latest.entryType)}
                    {group.latest.stage && ` · ${journalStageLabel(group.latest.stage)}`} ·{" "}
                    {formatSeasonDate(group.latest.entryDate)}
                    {group.history.length > 0 && ` · Edited (${group.history.length + 1} versions)`}
                  </p>
                  {group.latest.text && <p className={hub.rowMeta}>{truncate(group.latest.text, 180)}</p>}
                </div>
              </div>
            ))
          )}
          {journal.length > JOURNAL_PREVIEW_LIMIT && (
            <p className={styles.panelNote}>
              Showing the {JOURNAL_PREVIEW_LIMIT} most recent of {journal.length} entries.
            </p>
          )}
        </div>
      ),
    },
  ];

  if (team && project) {
    result.push({
      key: "team-contributions",
      heading: "Team contributions",
      body: (
        <div className={hub.panel}>
          {teamContributions.length === 0 ? (
            <p className={hub.empty}>No contributions logged yet.</p>
          ) : (
            teamContributions.slice(0, JOURNAL_PREVIEW_LIMIT).map((row) => (
              <div key={row.id} className={hub.row}>
                <div className={hub.rowMain}>
                  <p className={hub.rowTitle}>{row.studentName}</p>
                  <p className={hub.rowMeta}>
                    {row.stage && `${teamStageLabel(row.stage)} · `}
                    {formatSeasonDate(row.createdAt)}
                  </p>
                  <p className={hub.rowMeta}>{truncate(row.description, 180)}</p>
                </div>
              </div>
            ))
          )}
          {teamContributions.length > JOURNAL_PREVIEW_LIMIT && (
            <p className={styles.panelNote}>
              Showing the {JOURNAL_PREVIEW_LIMIT} most recent of {teamContributions.length} contributions,
              across the whole team.
            </p>
          )}
        </div>
      ),
    });
  }

  return result;
}

const JOURNAL_PREVIEW_LIMIT = 6;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trim()}...` : trimmed;
}

function StageOverrideForm({
  userId,
  studentId,
  stageName,
  overrideAction,
  label,
  ghost,
}: {
  userId: string;
  studentId: string;
  stageName: StageName;
  overrideAction: "unlock" | "complete" | "reopen";
  label: string;
  ghost?: boolean;
}) {
  return (
    <form action={overrideStageAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="stageName" value={stageName} />
      <input type="hidden" name="overrideAction" value={overrideAction} />
      <Button as="button" type="submit" variant={ghost ? "ghost" : "primary"} showArrow={false}>
        {label}
      </Button>
    </form>
  );
}

function buildParentSections(parent: ParentDetailData): DetailSection[] {
  return [
    {
      key: "registration",
      heading: "Registration",
      body: (
        <div className={hub.panel}>
          <Row label="Phone" value={parent.phone} />
        </div>
      ),
    },
    {
      key: "linked-students",
      heading: "Linked students",
      body: (
        <div className={hub.panel}>
          {parent.studentLinks.length === 0 ? (
            <p className={hub.empty}>No students linked yet.</p>
          ) : (
            parent.studentLinks.map((link) => (
              <Link key={link.studentId} href={`/admin/users/${link.student.userId}`} className={hub.row}>
                <p className={hub.rowLabel}>
                  {link.student.firstName} {link.student.lastName} ({link.relationship})
                </p>
                <p className={hub.rowValue}>
                  {link.rejectedAt
                    ? "Link not approved"
                    : link.verifiedAt
                      ? `Verified ${formatSeasonDate(link.verifiedAt)}`
                      : "Pending admin review"}
                </p>
              </Link>
            ))
          )}
        </div>
      ),
    },
  ];
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <p className={hub.sectionLabel}>{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={hub.row}>
      <p className={hub.rowLabel}>{label}</p>
      <p className={hub.rowValue}>{value}</p>
    </div>
  );
}
