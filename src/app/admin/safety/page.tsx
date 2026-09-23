import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/design-system/Button";
import { RejectDialog } from "@/components/admin/RejectDialog";
import { HistoryList, type HistoryItem } from "@/components/admin/HistoryList";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatSeasonDate } from "@/lib/season";
import { SAFETY_ITEMS } from "@/lib/safety-screening";
import hub from "../AdminHub.module.css";
import { clearSafetyReviewAction, rejectSafetyReviewAction } from "./actions";

export const metadata = {
  title: "Safety reviews | Admin | I³ League",
};

// CLAUDE.md "Safety screening": any high-risk answer blocks progression
// until an admin clears it. This queue is that gate — previously a direct
// DB write every session in this codebase had to perform by hand.
export default async function AdminSafetyPage() {
  const { admin } = await requireAdmin();

  const [reviews, decided] = await Promise.all([
    prisma.safetyReview.findMany({
      where: { status: "PENDING_REVIEW" },
      include: {
        project: {
          include: {
            individualStudent: true,
            team: { include: { memberships: { include: { student: true } } } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Approved and rejected history, most recent first. Capped at 30 rows —
    // a running log, not a full audit trail (AuditLog already has that).
    prisma.safetyReview.findMany({
      where: { status: { in: ["CLEARED", "REJECTED"] } },
      include: {
        project: {
          include: {
            individualStudent: true,
            team: { include: { memberships: { include: { student: true } } } },
          },
        },
      },
      orderBy: { reviewedAt: "desc" },
      take: 30,
    }),
  ]);

  const historyItems: HistoryItem[] = decided.map((review) => {
    const isApproved = review.status === "CLEARED";
    const students = review.project.team
      ? review.project.team.memberships.map((m) => `${m.student.firstName} ${m.student.lastName}`)
      : review.project.individualStudent
        ? [`${review.project.individualStudent.firstName} ${review.project.individualStudent.lastName}`]
        : [];
    return {
      id: review.id,
      title: review.project.title,
      subtitleLines: [students.join(", ") || "No student linked"],
      decisionLine: isApproved
        ? `Approved ${review.reviewedAt ? formatSeasonDate(review.reviewedAt) : ""}`
        : `Rejected ${review.reviewedAt ? formatSeasonDate(review.reviewedAt) : ""}${
            review.reviewNotes ? ` · ${review.reviewNotes}` : ""
          }`,
      isApproved,
      decidedAtMs: review.reviewedAt?.getTime() ?? 0,
      href: `/admin/safety/${review.id}`,
    };
  });

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Safety reviews">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Safety reviews</p>
          <h1 className={hub.heading}>Pending review</h1>
          <p className={hub.lead}>
            A project lands here the moment a student flags any of the risk categories on the
            Investigate safety screening. Nothing on the project can advance past Investigate until
            it&apos;s cleared or rejected here.
          </p>

          <div className={hub.panel}>
            {reviews.length === 0 ? (
              <p className={hub.empty}>Nothing waiting right now.</p>
            ) : (
              reviews.map((review) => {
                const answers = review.answers as Record<string, unknown>;
                const flagged = SAFETY_ITEMS.filter((item) => answers[item.key] === true);
                const otherDescription =
                  typeof answers.otherDescription === "string" ? answers.otherDescription : "";
                const students = review.project.team
                  ? review.project.team.memberships.map((m) => `${m.student.firstName} ${m.student.lastName}`)
                  : review.project.individualStudent
                    ? [`${review.project.individualStudent.firstName} ${review.project.individualStudent.lastName}`]
                    : [];

                return (
                  <div key={review.id} className={hub.row}>
                    <Link href={`/admin/safety/${review.id}`} className={hub.rowMain}>
                      <p className={hub.rowTitle}>{review.project.title}</p>
                      <p className={hub.rowMeta}>{students.join(", ") || "No student linked"}</p>
                      <p className={hub.rowMeta}>
                        Flagged: {flagged.map((f) => f.label).join("; ") || "none of the listed categories"}
                        {otherDescription && ` · Other: ${otherDescription}`}
                      </p>
                      <p className={hub.rowMeta}>Submitted {formatSeasonDate(review.createdAt)}</p>
                    </Link>
                    <div className={hub.rowActions}>
                      <form action={clearSafetyReviewAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <Button as="button" type="submit" showArrow={false}>
                          Approve
                        </Button>
                      </form>
                      <RejectDialog
                        action={rejectSafetyReviewAction}
                        idField="reviewId"
                        idValue={review.id}
                        reasonField="notes"
                        maxLength={1000}
                        subject={review.project.title}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>History</p>
          <h2 className={hub.heading}>Approved &amp; rejected</h2>
          <p className={hub.lead}>The most recent {decided.length} safety review decisions.</p>

          <HistoryList items={historyItems} subjectPlural="safety reviews" />
        </div>
      </section>
    </AdminShell>
  );
}
