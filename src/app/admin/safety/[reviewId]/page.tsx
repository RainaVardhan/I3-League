import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/design-system/Button";
import { RejectDialog } from "@/components/admin/RejectDialog";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatSeasonDate } from "@/lib/season";
import { SAFETY_ITEMS, safetyDetailKey } from "@/lib/safety-screening";
import hub from "../../AdminHub.module.css";
import { clearSafetyReviewAction, rejectSafetyReviewAction } from "../actions";

export const metadata = {
  title: "Safety review | Admin | I³ League",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: "Pending review",
  CLEARED: "Approved",
  REJECTED: "Rejected",
  NOT_REQUIRED: "Not required",
};

// The list queue only shows which categories a project flagged; this shows
// the student's own detailed account of what each flagged category actually
// involves (required per category — see SafetyScreeningForm.tsx and
// saveSafetyScreeningAction), which is what an admin actually needs to
// decide Clear vs. Reject.
export default async function AdminSafetyReviewPage({ params }: { params: Promise<{ reviewId: string }> }) {
  const { admin } = await requireAdmin();
  const { reviewId } = await params;

  const review = await prisma.safetyReview.findUnique({
    where: { id: reviewId },
    include: {
      project: {
        include: {
          individualStudent: true,
          team: { include: { memberships: { include: { student: true } } } },
        },
      },
    },
  });

  if (!review) notFound();

  const { project } = review;
  const isTeamProject = Boolean(project.team);
  const members = project.team
    ? project.team.memberships.map((m) => m.student)
    : project.individualStudent
      ? [project.individualStudent]
      : [];

  const answers = review.answers as Record<string, unknown>;
  const otherDescription = typeof answers.otherDescription === "string" ? answers.otherDescription : "";

  const flaggedItems: { label: string; detail: string }[] = SAFETY_ITEMS.filter(
    (item) => answers[item.key] === true,
  ).map((item) => ({
    label: item.label,
    detail: typeof answers[safetyDetailKey(item.key)] === "string" ? (answers[safetyDetailKey(item.key)] as string) : "",
  }));
  if (otherDescription) {
    flaggedItems.push({ label: "Something else", detail: otherDescription });
  }

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Safety reviews">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <Link href="/admin/safety" className={hub.backLink}>
            ← All safety reviews
          </Link>
          <p className={hub.eyebrow}>Safety review</p>
          <h1 className={hub.heading}>{project.title}</h1>
          <p className={hub.lead}>
            {project.category} · {isTeamProject ? "Team project" : "Individual project"} ·{" "}
            {members.map((m) => `${m.firstName} ${m.lastName}`).join(", ") || "No student linked"} · Flagged{" "}
            {formatSeasonDate(review.createdAt)} · {STATUS_LABEL[review.status] ?? review.status}
          </p>

          <div className={hub.panel}>
            {flaggedItems.length === 0 ? (
              <p className={hub.empty}>No categories were flagged on this screening.</p>
            ) : (
              flaggedItems.map((item) => (
                <div key={item.label} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>{item.label}</p>
                    <p className={hub.rowMeta}>{item.detail || "No detail given."}</p>
                  </div>
                  <span className={`${hub.tag} ${hub.tagCoral}`}>Flagged</span>
                </div>
              ))
            )}
          </div>

          {review.reviewNotes && <p className={hub.formNote}>Previous reviewer note: {review.reviewNotes}</p>}

          {review.status === "PENDING_REVIEW" && (
            <div className={hub.detailActions}>
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
                subject={project.title}
              />
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
