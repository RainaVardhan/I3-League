import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/design-system/Button";
import { RejectDialog } from "@/components/admin/RejectDialog";
import { HistoryList, type HistoryItem } from "@/components/admin/HistoryList";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatSeasonDate } from "@/lib/season";
import hub from "../AdminHub.module.css";
import { verifyParentLinkAction, rejectParentLinkAction } from "./actions";

export const metadata = {
  title: "Parent links | Admin | I³ League",
};

// A student and a parent self-link by matching guardianEmail against a
// Parent account's own email — real, but not verified that the matched
// account is actually this student's guardian (see CLAUDE.md status log,
// Aug 19 2026 "self-consent bypass via the guardian-email auto-link"). The
// row is created either way, but stays consent-ineligible until an admin
// confirms it here.
export default async function AdminParentLinksPage() {
  const { admin } = await requireAdmin();

  const [links, decided] = await Promise.all([
    prisma.studentParent.findMany({
      where: { verifiedAt: null, rejectedAt: null },
      include: { student: true, parent: { include: { user: true } } },
      orderBy: { createdAt: "asc" },
    }),
    // Approved and rejected history, most recent first. Capped at 30 rows —
    // a running log, not a full audit trail (AuditLog already has that).
    prisma.studentParent.findMany({
      where: { OR: [{ verifiedAt: { not: null } }, { rejectedAt: { not: null } }] },
      include: { student: true, parent: { include: { user: true } } },
    }),
  ]);
  // No single timestamp column covers both outcomes, so sort in JS by
  // whichever decision actually happened.
  decided.sort((a, b) => {
    const aAt = (a.verifiedAt ?? a.rejectedAt)?.getTime() ?? 0;
    const bAt = (b.verifiedAt ?? b.rejectedAt)?.getTime() ?? 0;
    return bAt - aAt;
  });
  const decidedRecent = decided.slice(0, 30);

  const historyItems: HistoryItem[] = decidedRecent.map((link) => {
    const isApproved = Boolean(link.verifiedAt);
    const decidedAt = link.verifiedAt ?? link.rejectedAt;
    return {
      id: `${link.studentId}:${link.parentId}`,
      title: `${link.student.firstName} ${link.student.lastName} ↔ ${link.parent.fullName}`,
      subtitleLines: [link.parent.user.email],
      decisionLine: isApproved
        ? `Approved ${link.verifiedAt ? formatSeasonDate(link.verifiedAt) : ""}`
        : `Rejected ${link.rejectedAt ? formatSeasonDate(link.rejectedAt) : ""}${
            link.rejectionReason ? ` · ${link.rejectionReason}` : ""
          }`,
      isApproved,
      decidedAtMs: decidedAt?.getTime() ?? 0,
    };
  });

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Parent links">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Parent links</p>
          <h1 className={hub.heading}>Pending verification</h1>
          <p className={hub.lead}>
            Confirm the parent account is actually this student&apos;s real guardian before they can
            give consent. Rejecting records a reason and keeps the link out of this queue; it doesn&apos;t
            delete either account.
          </p>

          <div className={hub.panel}>
            {links.length === 0 ? (
              <p className={hub.empty}>Nothing waiting right now.</p>
            ) : (
              links.map((link) => (
                <div key={`${link.studentId}:${link.parentId}`} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>
                      {link.student.firstName} {link.student.lastName} ↔ {link.parent.fullName}
                    </p>
                    <p className={hub.rowMeta}>
                      Parent email: {link.parent.user.email} · Student&apos;s guardian email:{" "}
                      {link.student.guardianEmail}
                    </p>
                    <p className={hub.rowMeta}>
                      Relationship: {link.relationship} · Linked {formatSeasonDate(link.createdAt)}
                    </p>
                  </div>
                  <div className={hub.rowActions}>
                    <form action={verifyParentLinkAction}>
                      <input type="hidden" name="studentId" value={link.studentId} />
                      <input type="hidden" name="parentId" value={link.parentId} />
                      <Button as="button" type="submit" showArrow={false}>
                        Approve
                      </Button>
                    </form>
                    <RejectDialog
                      action={rejectParentLinkAction}
                      idField="studentId"
                      idValue={link.studentId}
                      extraFields={[{ name: "parentId", value: link.parentId }]}
                      reasonField="reason"
                      maxLength={500}
                      subject={`${link.student.firstName} ${link.student.lastName} ↔ ${link.parent.fullName}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>History</p>
          <h2 className={hub.heading}>Approved &amp; rejected</h2>
          <p className={hub.lead}>The most recent {decidedRecent.length} parent-link decisions.</p>

          <HistoryList items={historyItems} subjectPlural="parent links" />
        </div>
      </section>
    </AdminShell>
  );
}
