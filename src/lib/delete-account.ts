import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

// Nothing in this schema has an `onDelete: Cascade` set (checked — zero
// occurrences), so a plain `prisma.user.delete()` would fail on the first
// foreign key it hits. This walks every table that references Student /
// Parent / Coach / Judge / Admin / User, children before parents, inside
// one transaction — either the whole account goes, or (on any error)
// nothing does. Called only from the admin "Delete account" action
// (src/app/admin/users/[id]/actions.ts), which is what enforces who's
// allowed to call this and requires typed-email confirmation first; this
// function itself does no authorization or confirmation checks.
export async function deleteUserAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true, parent: true, coach: true, judge: true, admin: true },
  });
  if (!user) return;

  await prisma.$transaction(async (tx) => {
    if (user.student) {
      const studentId = user.student.id;

      const submissions = await tx.submission.findMany({ where: { studentId }, select: { id: true } });
      const submissionIds = submissions.map((s) => s.id);
      if (submissionIds.length > 0) {
        await tx.aIDisclosure.deleteMany({ where: { submissionId: { in: submissionIds } } });
        await tx.speakingSubmission.deleteMany({ where: { submissionId: { in: submissionIds } } });
        await tx.characterChallenge.deleteMany({ where: { submissionId: { in: submissionIds } } });
        await tx.ethicsChallenge.deleteMany({ where: { submissionId: { in: submissionIds } } });
        await tx.submission.deleteMany({ where: { id: { in: submissionIds } } });
      }

      const enrollments = await tx.enrollment.findMany({ where: { studentId }, select: { id: true } });
      const enrollmentIds = enrollments.map((e) => e.id);
      if (enrollmentIds.length > 0) {
        await tx.payment.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
        await tx.enrollment.deleteMany({ where: { id: { in: enrollmentIds } } });
      }

      await tx.studentParent.deleteMany({ where: { studentId } });
      await tx.teamMembership.deleteMany({ where: { studentId } });
      await tx.stageProgress.deleteMany({ where: { studentId } });
      await tx.attempt.deleteMany({ where: { studentId } });
      await tx.journalEntry.deleteMany({ where: { studentId } });
      await tx.qualificationRecord.deleteMany({ where: { studentId } });
      await tx.certificate.deleteMany({ where: { studentId } });
      await tx.competencyRating.deleteMany({ where: { studentId } });
      await tx.consent.deleteMany({ where: { studentId } });
      await tx.mediaConsent.deleteMany({ where: { studentId } });
      await tx.teamContribution.deleteMany({ where: { studentId } });
      await tx.studentProject.deleteMany({ where: { studentId } });

      // An individual Project belongs to exactly this student — never a
      // team, per the exactly-one-owner CHECK constraint — so it goes with
      // them; a team project is left alone, teammates still use it (their
      // own Submission/StudentProject rows are untouched, only this
      // student's own were removed above).
      const individualProject = await tx.project.findUnique({ where: { individualStudentId: studentId } });
      if (individualProject) {
        await tx.safetyReview.deleteMany({ where: { projectId: individualProject.id } });
        await tx.qualificationPackage.deleteMany({ where: { projectId: individualProject.id } });
        await tx.project.delete({ where: { id: individualProject.id } });
      }

      await tx.student.delete({ where: { id: studentId } });
    }

    if (user.parent) {
      const parentId = user.parent.id;
      await tx.studentParent.deleteMany({ where: { parentId } });
      await tx.consent.deleteMany({ where: { parentId } });
      await tx.mediaConsent.deleteMany({ where: { parentId } });
      await tx.parent.delete({ where: { id: parentId } });
    }

    if (user.coach) {
      const coachId = user.coach.id;
      // Coach is an optional FK on Team — unassign rather than delete the
      // team itself, which still has its own roster/season/project.
      await tx.team.updateMany({ where: { coachId }, data: { coachId: null } });
      await tx.coach.delete({ where: { id: coachId } });
    }

    if (user.judge) {
      const judgeId = user.judge.id;
      await tx.judgeAssignment.deleteMany({ where: { judgeId } });
      await tx.judgeScore.deleteMany({ where: { judgeId } });
      await tx.judge.delete({ where: { id: judgeId } });
    }

    if (user.admin) {
      await tx.admin.delete({ where: { id: user.admin.id } });
    }

    await tx.notification.deleteMany({ where: { userId } });
    // Their own admin-action history goes with them — the same "account
    // deletion means gone" reasoning as everything else here, not an
    // oversight of the FK (AuditLog.actorUserId is required/non-nullable).
    await tx.auditLog.deleteMany({ where: { actorUserId: userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  // The Postgres side is now atomically gone (the transaction above either
  // fully committed or fully rolled back). The Supabase Auth account is a
  // separate system this app has no transaction over, so it's deleted
  // last, never first — if this step throws, the DB side is still cleanly
  // gone (never the reverse), and the error is surfaced to the caller
  // rather than swallowed, so an admin knows this account needs a manual
  // auth cleanup instead of silently leaving an orphaned auth.users row
  // (see CLAUDE.md status log, Aug 19 2026: an orphaned auth row is exactly
  // what breaks a future signup attempting to reuse that email).
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.supabaseUid);
  if (error) {
    throw new Error(`Account data deleted, but the Supabase Auth account could not be removed: ${error.message}`);
  }
}
