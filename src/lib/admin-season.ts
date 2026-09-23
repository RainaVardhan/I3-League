import type { PaymentStatus, StageName, StageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STAGE_ORDER } from "@/lib/stage-progress";

// One row per student enrolled in a season, with everything an admin needs
// to answer "who is where?" in one place: payment, consent, team, and stage
// progress. Read-only. Used by /admin/progress, its CSV export, and the
// Overview funnel, so all three always agree on the same definitions.
export type RosterRow = {
  studentId: string;
  userId: string;
  name: string;
  email: string;
  grade: string;
  school: string;
  teamName: string | null;
  paymentStatus: PaymentStatus | null;
  // True only when a guardian has submitted a Consent row with all 8
  // required boxes ticked (media consent is separate and optional).
  consentComplete: boolean;
  currentStage: StageName | null;
  stagesComplete: number;
  finalSubmissions: number;
  // Most recent write across the student's submissions and stage progress.
  lastActivity: Date | null;
};

const CONSENT_FIELDS = [
  "participationAccepted",
  "privacyAccepted",
  "codeOfConductAccepted",
  "competitionRulesAccepted",
  "academicIntegrityAccepted",
  "aiUseAccepted",
  "safetyAccepted",
  "ipPolicyAccepted",
] as const;

export async function loadSeasonRoster(seasonId: string): Promise<RosterRow[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { seasonId },
    include: {
      payment: true,
      team: true,
      student: {
        include: {
          user: true,
          school: true,
          stageProgress: true,
          submissions: { select: { isFinal: true, updatedAt: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const studentIds = enrollments.map((enrollment) => enrollment.studentId);
  const consents = await prisma.consent.findMany({ where: { studentId: { in: studentIds } } });
  const consentComplete = new Set(
    consents.filter((consent) => CONSENT_FIELDS.every((field) => consent[field])).map((consent) => consent.studentId),
  );

  return enrollments.map((enrollment) => {
    const student = enrollment.student;
    const stageByName = new Map<StageName, StageStatus>(student.stageProgress.map((row) => [row.stageName, row.status]));
    const current = STAGE_ORDER.find((stage) => stageByName.get(stage) === "CURRENT") ?? null;
    const stagesComplete = STAGE_ORDER.filter((stage) => stageByName.get(stage) === "COMPLETE").length;
    const times = [
      ...student.submissions.map((submission) => submission.updatedAt.getTime()),
      ...student.stageProgress.map((row) => row.updatedAt.getTime()),
    ];

    return {
      studentId: student.id,
      userId: student.userId,
      name: `${student.firstName} ${student.lastName}`,
      email: student.user.email,
      grade: student.grade,
      school:
        student.schoolingType === "HOMESCHOOL" ? (student.homeschoolName ?? "Homeschool") : (student.school?.name ?? ""),
      teamName: enrollment.team?.name ?? null,
      paymentStatus: enrollment.payment?.status ?? null,
      consentComplete: consentComplete.has(student.id),
      currentStage: current,
      stagesComplete,
      finalSubmissions: student.submissions.filter((submission) => submission.isFinal).length,
      lastActivity: times.length > 0 ? new Date(Math.max(...times)) : null,
    };
  });
}

// The filters /admin/progress offers. Each one is a plain question an admin
// asks during a season, so the definitions live here beside the roster.
export const ROSTER_FILTERS = [
  { key: "all", label: "Everyone" },
  { key: "unpaid", label: "Payment not verified" },
  { key: "noconsent", label: "Consent missing" },
  { key: "inactive", label: "No activity in 14 days" },
  { key: "finished", label: "All six stages complete" },
] as const;

export type RosterFilter = (typeof ROSTER_FILTERS)[number]["key"];

export function isRosterFilter(value: string | undefined): value is RosterFilter {
  return ROSTER_FILTERS.some((filter) => filter.key === value);
}

export function applyRosterFilter(rows: RosterRow[], filter: RosterFilter, now: Date): RosterRow[] {
  const cutoff = now.getTime() - 14 * 24 * 60 * 60 * 1000;
  switch (filter) {
    case "unpaid":
      return rows.filter((row) => row.paymentStatus !== "VERIFIED");
    case "noconsent":
      return rows.filter((row) => !row.consentComplete);
    case "inactive":
      // Only students who can actually be working: verified payment and not
      // already finished. Someone unpaid is not "inactive", they are blocked.
      return rows.filter(
        (row) =>
          row.paymentStatus === "VERIFIED" &&
          row.stagesComplete < STAGE_ORDER.length &&
          (row.lastActivity?.getTime() ?? 0) < cutoff,
      );
    case "finished":
      return rows.filter((row) => row.stagesComplete === STAGE_ORDER.length);
    default:
      return rows;
  }
}

// CSV cells beginning with = + - @ are treated as formulas by Excel/Sheets,
// and these values (names, team names) are typed by students, so they are
// neutralised with a leading apostrophe.
export function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
