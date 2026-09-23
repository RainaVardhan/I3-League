import Link from "next/link";
import type { Prisma, StageName } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";
import { getStageCopy } from "@/lib/stage-copy";
import { STAGE_ORDER } from "@/lib/stage-progress";
import hub from "../AdminHub.module.css";

export const metadata = {
  title: "Submissions | Admin | I³ League",
};

const PAGE_SIZE = 100;

// Every stage submission (draft or final) for the active season's students.
// Read-only: there is no reviewer scoring model yet (that is the Judge /
// review-rubric work, Phase 2), so this is for oversight, spot checks and
// AI-use audits. A stage that needs redoing is reopened from the student's
// own admin page (Stage progress panel), which keeps one override path.
export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; status?: string }>;
}) {
  const { admin } = await requireAdmin();
  const params = await searchParams;
  const season = await getActiveSeason();

  const stage = STAGE_ORDER.find((name) => name === params.stage) as StageName | undefined;
  const status = params.status === "final" || params.status === "draft" ? params.status : "all";

  const where: Prisma.SubmissionWhereInput = {
    student: { enrollments: { some: { seasonId: season.id } } },
    ...(stage ? { stageName: stage } : {}),
    ...(status === "final" ? { isFinal: true } : status === "draft" ? { isFinal: false } : {}),
  };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      include: { student: true, project: true, aiDisclosure: true },
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.submission.count({ where }),
  ]);

  const href = (nextStage?: string, nextStatus?: string) => {
    const query = new URLSearchParams();
    if (nextStage) query.set("stage", nextStage);
    if (nextStatus && nextStatus !== "all") query.set("status", nextStatus);
    const text = query.toString();
    return text ? `/admin/submissions?${text}` : "/admin/submissions";
  };
  const pill = (active: boolean) => (active ? `${hub.filterPill} ${hub.filterPillActive}` : hub.filterPill);

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Submissions">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Submissions · {season.label}</p>
          <h1 className={hub.heading}>Student work</h1>
          <p className={hub.lead}>
            {total} submission{total === 1 ? "" : "s"}
            {total > PAGE_SIZE && `, showing the ${PAGE_SIZE} most recently updated`}. Confidential by default;
            only admins see this view.
          </p>

          <nav className={hub.statusFilters} aria-label="Stage filter">
            <Link href={href(undefined, status)} className={pill(!stage)}>
              All stages
            </Link>
            {STAGE_ORDER.map((name) => (
              <Link key={name} href={href(name, status)} className={pill(stage === name)}>
                {getStageCopy(name).name}
              </Link>
            ))}
          </nav>
          <nav className={hub.statusFilters} aria-label="Status filter">
            {(["all", "final", "draft"] as const).map((value) => (
              <Link key={value} href={href(stage, value)} className={pill(status === value)}>
                {value === "all" ? "Drafts and submitted" : value === "final" ? "Submitted" : "Drafts"}
              </Link>
            ))}
          </nav>

          <div className={hub.panel}>
            {submissions.length === 0 ? (
              <p className={hub.empty}>No submissions match.</p>
            ) : (
              submissions.map((submission) => (
                <Link key={submission.id} href={`/admin/submissions/${submission.id}`} className={hub.row}>
                  <div className={hub.rowMain}>
                    <p className={hub.rowTitle}>
                      {submission.student.firstName} {submission.student.lastName} ·{" "}
                      {getStageCopy(submission.stageName).name}
                    </p>
                    <p className={hub.rowMeta}>{submission.project.title}</p>
                    <p className={hub.rowMeta}>
                      Updated {formatSeasonDate(submission.updatedAt)}
                      {submission.aiDisclosure &&
                        ` · AI use: ${submission.aiDisclosure.usedAi ? (submission.aiDisclosure.toolName ?? "yes") : "none"}`}
                    </p>
                  </div>
                  <span className={submission.isFinal ? `${hub.tag} ${hub.tagBlue}` : hub.tag}>
                    {submission.isFinal ? "Submitted" : "Draft"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
