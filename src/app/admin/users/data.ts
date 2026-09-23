import { prisma } from "@/lib/prisma";
import type {
  DirectoryUser,
  DirectoryTeam,
  DirectoryIndividual,
  DirectorySchool,
  DirectoryUnapproved,
} from "./UsersDirectory";

// One shared query layer behind all three Users pages (current season,
// a past season, and All seasons) — each page just picks a scope and gets
// back the same shape UsersDirectory already renders as four tabs (People,
// Participants, Schools, Unapproved). Keeping this in one file means the
// definition of "approved" can't drift between pages the way it would if
// each route re-implemented its own version of these queries.
export type DirectoryScope =
  | { kind: "current"; seasonId: string; seasonLabel: string }
  | { kind: "past"; seasonId: string; seasonLabel: string }
  | { kind: "all" };

export type DirectoryBundle = {
  directory: DirectoryUser[];
  directoryTeams: DirectoryTeam[];
  individuals: DirectoryIndividual[];
  directorySchools: DirectorySchool[];
  unapproved: DirectoryUnapproved[];
  /** Shown above the People tab when this scope leaves some roles out. */
  peopleNote: string | null;
};

function isVerifiedPayment(status: string | undefined) {
  return status === "VERIFIED";
}

export async function loadDirectory(scope: DirectoryScope): Promise<DirectoryBundle> {
  if (scope.kind === "all") return loadAllTimeDirectory();
  return loadSeasonDirectory(scope);
}

// The status line shown on the Unapproved tab — every branch mirrors the
// exact condition that excludes that user from the People tab's approved
// list, so the two can't drift into disagreeing about why someone isn't
// approved. Shared by both the season-scoped and all-time loaders; the
// caller passes in whichever enrollment/payment is the relevant one to
// explain (the season's own, or the student's most recent).
function unapprovedStatus(user: {
  role: string;
  student: { firstName: string } | null;
  parent: { studentLinks: { verifiedAt: Date | null; rejectedAt: Date | null; rejectionReason: string | null }[] } | null;
  coach: unknown;
  judge: unknown;
  admin: unknown;
}, payment: { status: string; rejectionReason: string | null } | null, hasAnyEnrollment: boolean): { status: string; detail: string } {
  if (user.role === "STUDENT") {
    if (!user.student) return { status: "Registration incomplete", detail: "No student profile filled out yet." };
    if (!hasAnyEnrollment) return { status: "Not enrolled", detail: "No enrollment on file yet." };
    if (!payment) return { status: "Payment not started", detail: "" };
    if (payment.status === "REJECTED") return { status: "Payment rejected", detail: payment.rejectionReason || "No reason on file." };
    if (payment.status === "REFUNDED") return { status: "Payment refunded", detail: "" };
    if (payment.status === "SUBMITTED") return { status: "Awaiting payment verification", detail: "" };
    return { status: "Payment not started", detail: "" }; // PENDING
  }
  if (user.role === "PARENT") {
    if (!user.parent) return { status: "Registration incomplete", detail: "No parent profile filled out yet." };
    const links = user.parent.studentLinks;
    if (links.length === 0) return { status: "No student linked yet", detail: "" };
    const rejected = links.find((link) => link.rejectedAt && !link.verifiedAt);
    if (rejected && links.every((link) => !link.verifiedAt)) {
      return { status: "Parent link rejected", detail: rejected.rejectionReason || "No reason on file." };
    }
    return { status: "Awaiting parent-link review", detail: `${links.length} linked student(s), 0 verified.` };
  }
  if (user.role === "COACH" && !user.coach) return { status: "Registration incomplete", detail: "No coach profile filled out yet." };
  if (user.role === "JUDGE" && !user.judge) return { status: "Registration incomplete", detail: "No judge profile filled out yet." };
  if (user.role === "ADMIN" && !user.admin) return { status: "Registration incomplete", detail: "No admin profile filled out yet." };
  return { status: "Registration incomplete", detail: "" };
}

function schoolNameOf(entity: { school: { name: string } | null; homeschoolName: string | null }) {
  return entity.school?.name ?? entity.homeschoolName ?? "No school on file";
}

// The current-season page and a single past season's page share this: same
// shape of query, scoped to one Season row, differing only in whether
// non-season roles (Parent/Coach/Judge/Admin — none of them are season-
// scoped rows in this schema) and never-enrolled students belong on the
// page at all. A past season is a closed record of who actually took part
// in it, not a live "who still needs approval" queue, so it only shows
// students who had a real enrollment attempt that season.
async function loadSeasonDirectory(scope: { kind: "current" | "past"; seasonId: string; seasonLabel: string }): Promise<DirectoryBundle> {
  const isCurrent = scope.kind === "current";
  const seasonId = scope.seasonId;

  const users = await prisma.user.findMany({
    include: {
      student: {
        include: {
          school: true,
          enrollments: { where: { seasonId }, include: { payment: true } },
          teamMemberships: { include: { team: true } },
        },
      },
      parent: { include: { studentLinks: true } },
      coach: { include: { school: true } },
      judge: true,
      admin: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const directory: DirectoryUser[] = users
    .filter((user) => {
      if (user.role === "STUDENT") {
        return Boolean(user.student) && isVerifiedPayment(user.student!.enrollments[0]?.payment?.status);
      }
      if (!isCurrent) return false; // a past season's page is students/teams only
      if (user.role === "PARENT") return Boolean(user.parent) && user.parent!.studentLinks.some((link) => link.verifiedAt);
      if (user.role === "COACH") return Boolean(user.coach);
      if (user.role === "JUDGE") return Boolean(user.judge);
      if (user.role === "ADMIN") return Boolean(user.admin);
      return false;
    })
    .map((user) => {
      let name = user.email;
      let detail = "";
      if (user.role === "STUDENT" && user.student) {
        name = `${user.student.firstName} ${user.student.lastName}`;
        const enrollment = user.student.enrollments[0];
        const team = user.student.teamMemberships.find((m) => m.team.seasonId === seasonId)?.team;
        const schoolName = schoolNameOf(user.student);
        detail = `Grade ${user.student.grade} · ${schoolName} · ${team ? `Team ${team.name}` : "Individual"} · Payment: ${enrollment?.payment?.status ?? "Not enrolled"}`;
      } else if (user.role === "PARENT" && user.parent) {
        name = user.parent.fullName;
        const verified = user.parent.studentLinks.filter((l) => l.verifiedAt).length;
        detail = `${user.parent.studentLinks.length} linked student(s), ${verified} verified`;
      } else if (user.role === "COACH" && user.coach) {
        name = user.coach.fullName;
        detail = user.coach.school?.name ?? "No school on file";
      } else if (user.role === "JUDGE" && user.judge) {
        name = user.judge.fullName;
        detail = "Judge";
      } else if (user.role === "ADMIN" && user.admin) {
        name = user.admin.fullName;
        detail = "Admin";
      }
      return { id: user.id, name, email: user.email, role: user.role, detail, createdAt: user.createdAt.toISOString() };
    });

  const approvedIds = new Set(directory.map((entry) => entry.id));
  const unapproved: DirectoryUnapproved[] = users
    .filter((user) => {
      if (approvedIds.has(user.id)) return false;
      if (user.role === "STUDENT") {
        if (isCurrent) return true; // include not-yet-enrolled too — this is the live "still needs approval" queue
        return Boolean(user.student) && user.student!.enrollments.length > 0; // past: only real attempts that season
      }
      return isCurrent; // non-season roles only ever appear on the current page
    })
    .map((user) => {
      let name = user.email;
      if (user.role === "STUDENT" && user.student) name = `${user.student.firstName} ${user.student.lastName}`;
      else if (user.role === "PARENT" && user.parent) name = user.parent.fullName;
      else if (user.role === "COACH" && user.coach) name = user.coach.fullName;
      else if (user.role === "JUDGE" && user.judge) name = user.judge.fullName;
      else if (user.role === "ADMIN" && user.admin) name = user.admin.fullName;

      const payment = user.student?.enrollments[0]?.payment ?? null;
      const hasAnyEnrollment = (user.student?.enrollments.length ?? 0) > 0;
      const { status, detail } = unapprovedStatus(user, payment, hasAnyEnrollment);
      return { id: user.id, name, email: user.email, role: user.role, status, detail, createdAt: user.createdAt.toISOString() };
    });

  const teams = await prisma.team.findMany({
    where: { seasonId },
    include: {
      project: true,
      coach: true,
      memberships: {
        include: {
          student: {
            include: { user: true, school: true, enrollments: { where: { seasonId }, include: { payment: true } } },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const directoryTeams: DirectoryTeam[] = teams
    .map((team) => ({
      id: team.id,
      name: team.name,
      coachName: team.coach?.fullName ?? null,
      projectTitle: team.project ? `${team.project.title} · ${team.project.category}` : null,
      members: team.memberships
        .filter((membership) => isVerifiedPayment(membership.student.enrollments[0]?.payment?.status))
        .map((membership) => {
          const student = membership.student;
          const enrollment = student.enrollments[0];
          return {
            userId: student.userId,
            name: `${student.firstName} ${student.lastName}`,
            email: student.user.email,
            roleLabel: membership.roleLabel,
            grade: student.grade,
            schoolName: schoolNameOf(student),
            paymentStatus: enrollment?.payment?.status ?? "Not enrolled",
          };
        }),
      createdAt: team.createdAt.toISOString(),
    }))
    .filter((team) => team.members.length > 0);

  const individuals: DirectoryIndividual[] = users
    .filter((user) => {
      if (user.role !== "STUDENT" || !user.student) return false;
      if (!isVerifiedPayment(user.student.enrollments[0]?.payment?.status)) return false;
      const onSeasonTeam = user.student.teamMemberships.some((membership) => membership.team.seasonId === seasonId);
      return !onSeasonTeam;
    })
    .map((user) => {
      const student = user.student!;
      const enrollment = student.enrollments[0];
      return {
        userId: user.id,
        name: `${student.firstName} ${student.lastName}`,
        email: user.email,
        grade: student.grade,
        schoolName: schoolNameOf(student),
        paymentStatus: enrollment?.payment?.status ?? "Not enrolled",
        createdAt: student.createdAt.toISOString(),
      };
    });

  // Schools, scoped to who actually had a verified seat this particular
  // season — a school with zero participants this season is noise on a
  // season-specific page (unlike the All-time page, where every school
  // ever picked at registration belongs).
  const enrolledSchoolRows = await prisma.enrollment.findMany({
    where: { seasonId, payment: { status: "VERIFIED" } },
    select: { student: { select: { schoolId: true } } },
  });
  const schoolCounts = new Map<string, number>();
  for (const row of enrolledSchoolRows) {
    if (!row.student.schoolId) continue;
    schoolCounts.set(row.student.schoolId, (schoolCounts.get(row.student.schoolId) ?? 0) + 1);
  }
  const schoolsOnFile = await prisma.school.findMany({
    where: { id: { in: [...schoolCounts.keys()] } },
    include: { _count: { select: { coaches: true } } },
    orderBy: { name: "asc" },
  });
  const directorySchools: DirectorySchool[] = schoolsOnFile.map((school) => ({
    id: school.id,
    name: school.name,
    place: [school.city, school.state, school.country].filter(Boolean).join(", "),
    studentCount: schoolCounts.get(school.id) ?? 0,
    coachCount: school._count.coaches,
    createdAt: school.createdAt.toISOString(),
  }));

  return {
    directory,
    directoryTeams,
    individuals,
    directorySchools,
    unapproved,
    peopleNote: isCurrent
      ? null
      : "This season is archived. Only students with a real enrollment that season are shown. Parents, Coaches, Judges and Admins aren't tied to any one season, so they only ever appear on the current-season and All-seasons pages.",
  };
}

// The All-seasons page: one row per person, summarizing their standing
// across every season they've ever touched rather than duplicating a row
// per season. A student counts as approved here if they were ever VERIFIED
// in any season (their "representative" enrollment is the most recent
// VERIFIED one, or — if they've never been verified — their most recent
// enrollment of any status, so the Unapproved tab can still explain where
// things stand). Parent/Coach/Judge/Admin approval was never season-scoped
// to begin with, so their logic here is identical to the current-season
// page.
async function loadAllTimeDirectory(): Promise<DirectoryBundle> {
  const users = await prisma.user.findMany({
    include: {
      student: {
        include: {
          school: true,
          enrollments: { include: { payment: true, season: true, team: true }, orderBy: { createdAt: "desc" } },
        },
      },
      parent: { include: { studentLinks: true } },
      coach: { include: { school: true } },
      judge: true,
      admin: true,
    },
    orderBy: { createdAt: "desc" },
  });

  type EnrollmentRow = NonNullable<(typeof users)[number]["student"]>["enrollments"][number];
  function representativeEnrollment(enrollments: EnrollmentRow[]): EnrollmentRow | null {
    const verified = enrollments.filter((e) => e.payment?.status === "VERIFIED");
    const pool = verified.length > 0 ? verified : enrollments;
    return pool[0] ?? null; // already ordered newest-first by the query above
  }

  const directory: DirectoryUser[] = users
    .filter((user) => {
      if (user.role === "STUDENT") return Boolean(user.student) && user.student!.enrollments.some((e) => e.payment?.status === "VERIFIED");
      if (user.role === "PARENT") return Boolean(user.parent) && user.parent!.studentLinks.some((link) => link.verifiedAt);
      if (user.role === "COACH") return Boolean(user.coach);
      if (user.role === "JUDGE") return Boolean(user.judge);
      if (user.role === "ADMIN") return Boolean(user.admin);
      return false;
    })
    .map((user) => {
      let name = user.email;
      let detail = "";
      if (user.role === "STUDENT" && user.student) {
        name = `${user.student.firstName} ${user.student.lastName}`;
        const rep = representativeEnrollment(user.student.enrollments)!;
        const seasonCount = user.student.enrollments.length;
        const teamLabel = rep.team ? `Team ${rep.team.name}` : "Individual";
        detail = `Grade ${user.student.grade} · ${schoolNameOf(user.student)} · ${teamLabel} · Verified for ${rep.season.label}${
          seasonCount > 1 ? ` (${seasonCount} seasons total)` : ""
        }`;
      } else if (user.role === "PARENT" && user.parent) {
        name = user.parent.fullName;
        const verified = user.parent.studentLinks.filter((l) => l.verifiedAt).length;
        detail = `${user.parent.studentLinks.length} linked student(s), ${verified} verified`;
      } else if (user.role === "COACH" && user.coach) {
        name = user.coach.fullName;
        detail = user.coach.school?.name ?? "No school on file";
      } else if (user.role === "JUDGE" && user.judge) {
        name = user.judge.fullName;
        detail = "Judge";
      } else if (user.role === "ADMIN" && user.admin) {
        name = user.admin.fullName;
        detail = "Admin";
      }
      return { id: user.id, name, email: user.email, role: user.role, detail, createdAt: user.createdAt.toISOString() };
    });

  const approvedIds = new Set(directory.map((entry) => entry.id));
  const unapproved: DirectoryUnapproved[] = users
    .filter((user) => !approvedIds.has(user.id))
    .map((user) => {
      let name = user.email;
      if (user.role === "STUDENT" && user.student) name = `${user.student.firstName} ${user.student.lastName}`;
      else if (user.role === "PARENT" && user.parent) name = user.parent.fullName;
      else if (user.role === "COACH" && user.coach) name = user.coach.fullName;
      else if (user.role === "JUDGE" && user.judge) name = user.judge.fullName;
      else if (user.role === "ADMIN" && user.admin) name = user.admin.fullName;

      const rep = user.student ? representativeEnrollment(user.student.enrollments) : null;
      const hasAnyEnrollment = (user.student?.enrollments.length ?? 0) > 0;
      const { status, detail } = unapprovedStatus(user, rep?.payment ?? null, hasAnyEnrollment);
      const seasonedDetail = rep && detail ? `${detail} (${rep.season.label})` : rep ? rep.season.label : detail;
      return { id: user.id, name, email: user.email, role: user.role, status, detail: seasonedDetail, createdAt: user.createdAt.toISOString() };
    });

  // Every team the program has ever run, regardless of season — each
  // member's payment status is read from their enrollment for that
  // specific team's own season (a team belongs to exactly one season), not
  // from their all-time representative enrollment, since a teammate's
  // standing on an old team shouldn't be overwritten by something newer.
  const teams = await prisma.team.findMany({
    include: {
      project: true,
      coach: true,
      season: true,
      memberships: {
        include: {
          student: {
            include: { user: true, school: true, enrollments: { include: { payment: true } } },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const directoryTeams: DirectoryTeam[] = teams
    .map((team) => ({
      id: team.id,
      name: `${team.name} (${team.season.label})`,
      coachName: team.coach?.fullName ?? null,
      projectTitle: team.project ? `${team.project.title} · ${team.project.category}` : null,
      members: team.memberships
        .filter((membership) => membership.student.enrollments.some((e) => e.seasonId === team.seasonId && e.payment?.status === "VERIFIED"))
        .map((membership) => {
          const student = membership.student;
          const enrollment = student.enrollments.find((e) => e.seasonId === team.seasonId);
          return {
            userId: student.userId,
            name: `${student.firstName} ${student.lastName}`,
            email: student.user.email,
            roleLabel: membership.roleLabel,
            grade: student.grade,
            schoolName: schoolNameOf(student),
            paymentStatus: enrollment?.payment?.status ?? "Not enrolled",
          };
        }),
      createdAt: team.createdAt.toISOString(),
    }))
    .filter((team) => team.members.length > 0);

  const individuals: DirectoryIndividual[] = users
    .filter((user) => {
      if (user.role !== "STUDENT" || !user.student) return false;
      const rep = representativeEnrollment(user.student.enrollments);
      return Boolean(rep) && rep!.payment?.status === "VERIFIED" && !rep!.team;
    })
    .map((user) => {
      const student = user.student!;
      const rep = representativeEnrollment(student.enrollments)!;
      return {
        userId: user.id,
        name: `${student.firstName} ${student.lastName}`,
        email: user.email,
        grade: student.grade,
        schoolName: schoolNameOf(student),
        paymentStatus: `${rep.payment?.status ?? "Not enrolled"} (${rep.season.label})`,
        createdAt: student.createdAt.toISOString(),
      };
    });

  // Schools: every school ever picked at registration, all-time — School
  // rows aren't season-scoped at all (a student's schoolId is set once,
  // independent of which seasons they enrolled in), so this is the one
  // tab that already meant "all time" before this page split even existed.
  const schoolsOnFile = await prisma.school.findMany({
    include: { _count: { select: { students: true, coaches: true } } },
    orderBy: { name: "asc" },
  });
  const directorySchools: DirectorySchool[] = schoolsOnFile.map((school) => ({
    id: school.id,
    name: school.name,
    place: [school.city, school.state, school.country].filter(Boolean).join(", "),
    studentCount: school._count.students,
    coachCount: school._count.coaches,
    createdAt: school.createdAt.toISOString(),
  }));

  return { directory, directoryTeams, individuals, directorySchools, unapproved, peopleNote: null };
}
