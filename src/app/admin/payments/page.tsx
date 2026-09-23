import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/design-system/Button";
import { RejectDialog } from "@/components/admin/RejectDialog";
import { HistoryList, type HistoryItem } from "@/components/admin/HistoryList";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatSeasonDate } from "@/lib/season";
import hub from "../AdminHub.module.css";
import { verifyPaymentAction, rejectPaymentAction, refundPaymentAction } from "./actions";

export const metadata = {
  title: "Payments | Admin | I³ League",
};

const METHOD_LABEL: Record<string, string> = {
  PAYPAL: "PayPal",
  VENMO: "Venmo",
  ZELLE: "Zelle",
};

// The manual-payment verification queue CLAUDE.md's payment flow describes:
// a student submits method + reference + optional screenshot, and this is
// the "admin manually reviews and sets paymentStatus = VERIFIED per student"
// step — previously a direct DB write every session in this codebase had to
// do by hand. Per-student, never per-team: a teammate's row here is
// entirely independent of any other teammate's.
export default async function AdminPaymentsPage() {
  const { admin } = await requireAdmin();

  const [payments, decided, refundable] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "SUBMITTED" },
      include: {
        enrollment: {
          include: { student: { include: { user: true } }, season: true },
        },
      },
      orderBy: { submittedAt: "asc" },
    }),
    // Approved and rejected history, most recent first. Capped at 30 rows —
    // a running log, not a full audit trail (AuditLog already has that).
    prisma.payment.findMany({
      where: { status: { in: ["VERIFIED", "REJECTED", "REFUNDED"] } },
      include: {
        enrollment: {
          include: { student: { include: { user: true } }, season: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    // Verified payments in the live season, so one can be refunded.
    prisma.payment.findMany({
      where: { status: "VERIFIED", enrollment: { season: { isActive: true } } },
      include: { enrollment: { include: { student: { include: { user: true } }, season: true } } },
      orderBy: { verifiedAt: "desc" },
    }),
  ]);

  const historyItems: HistoryItem[] = decided.map((payment) => {
    const student = payment.enrollment.student;
    const isApproved = payment.status === "VERIFIED";
    const decidedAt = isApproved ? payment.verifiedAt : payment.updatedAt;
    return {
      id: payment.id,
      title: `${student.firstName} ${student.lastName}`,
      subtitleLines: [
        student.user.email,
        `$${payment.amountUsd.toString()} · ${METHOD_LABEL[payment.method] ?? payment.method} · ${payment.enrollment.season.label}`,
      ],
      decisionLine: isApproved
        ? `Approved ${decidedAt ? formatSeasonDate(decidedAt) : ""}`
        : `${payment.status === "REFUNDED" ? "Refunded" : "Rejected"} ${decidedAt ? formatSeasonDate(decidedAt) : ""}${
            payment.rejectionReason ? ` · ${payment.rejectionReason}` : ""
          }`,
      isApproved,
      decidedAtMs: decidedAt?.getTime() ?? 0,
    };
  });

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Payments">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Payments</p>
          <h1 className={hub.heading}>Awaiting verification</h1>
          <p className={hub.lead}>
            {payments.length} payment{payments.length === 1 ? "" : "s"} submitted, waiting on a match
            against the real transaction before a student&apos;s dashboard unlocks.
          </p>

          <div className={hub.panel}>
            {payments.length === 0 ? (
              <p className={hub.empty}>Nothing waiting right now.</p>
            ) : (
              payments.map((payment) => {
                const student = payment.enrollment.student;
                return (
                  <div key={payment.id} className={hub.row}>
                    <div className={hub.rowMain}>
                      <p className={hub.rowTitle}>
                        {student.firstName} {student.lastName}
                      </p>
                      <p className={hub.rowMeta}>{student.user.email}</p>
                      <p className={hub.rowMeta}>
                        ${payment.amountUsd.toString()} · {METHOD_LABEL[payment.method] ?? payment.method}
                        {payment.paymentReference ? ` · Ref: ${payment.paymentReference}` : ""}
                        {" · "}
                        {payment.enrollment.season.label}
                      </p>
                      <p className={hub.rowMeta}>
                        Submitted {payment.submittedAt ? formatSeasonDate(payment.submittedAt) : "unknown date"}
                        {payment.screenshotUrl && (
                          <>
                            {" · "}
                            <a href={payment.screenshotUrl} target="_blank" rel="noreferrer">
                              View screenshot
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                    <div className={hub.rowActions}>
                      <form action={verifyPaymentAction}>
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <Button as="button" type="submit" showArrow={false}>
                          Approve
                        </Button>
                      </form>
                      <RejectDialog
                        action={rejectPaymentAction}
                        idField="paymentId"
                        idValue={payment.id}
                        reasonField="reason"
                        maxLength={500}
                        subject={`${student.firstName} ${student.lastName}'s payment`}
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
          <h2 className={hub.heading}>Approved, rejected &amp; refunded</h2>
          <p className={hub.lead}>The most recent {decided.length} payment decisions.</p>

          <HistoryList items={historyItems} subjectPlural="payments" />
        </div>
      </section>

      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Refunds</p>
          <h2 className={hub.heading}>Verified this season</h2>
          <p className={hub.lead}>
            Refunding one student locks only that student out. Record the refund with PayPal, Venmo or Zelle
            first; this only updates the platform.
          </p>
          <div className={hub.panel}>
            {refundable.length === 0 ? (
              <p className={hub.empty}>No verified payments yet.</p>
            ) : (
              refundable.map((payment) => {
                const student = payment.enrollment.student;
                return (
                  <div key={payment.id} className={hub.row}>
                    <div className={hub.rowMain}>
                      <p className={hub.rowTitle}>
                        {student.firstName} {student.lastName}
                      </p>
                      <p className={hub.rowMeta}>
                        {student.user.email} · ${payment.amountUsd.toString()} ·{" "}
                        {METHOD_LABEL[payment.method] ?? payment.method}
                      </p>
                    </div>
                    <div className={hub.rowActions}>
                      <RejectDialog
                        action={refundPaymentAction}
                        idField="paymentId"
                        idValue={payment.id}
                        reasonField="reason"
                        maxLength={500}
                        subject={`${student.firstName} ${student.lastName}'s payment`}
                        verb="Refund"
                        lead="Their dashboard locks immediately. Teammates are not affected."
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
