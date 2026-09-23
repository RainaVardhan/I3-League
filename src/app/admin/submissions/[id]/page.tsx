import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatSeasonDate } from "@/lib/season";
import { getStageCopy } from "@/lib/stage-copy";
import hub from "../../AdminHub.module.css";

export const metadata = {
  title: "Submission | Admin | I³ League",
};

// "problemStatement" -> "Problem statement"
function fieldLabel(key: string) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Submission.content is stage-specific JSON typed only in application code,
// so this renders whatever is there generically. Everything is emitted as
// React text (never as HTML), so a student's typed markup shows literally.
function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") return "Not answered";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value) && value.every((item) => typeof item === "string" || typeof item === "number")) {
    return value.length > 0 ? value.join(", ") : "None";
  }
  return JSON.stringify(value);
}

export default async function AdminSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { admin } = await requireAdmin();
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { student: true, project: true, aiDisclosure: true },
  });
  if (!submission) notFound();

  const content =
    submission.content && typeof submission.content === "object" && !Array.isArray(submission.content)
      ? (submission.content as Record<string, unknown>)
      : {};
  const entries = Object.entries(content);
  const stageName = getStageCopy(submission.stageName).name;

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Submissions">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <Link href="/admin/submissions" className={hub.backLink}>
            ← All submissions
          </Link>
          <p className={hub.eyebrow}>{stageName}</p>
          <h1 className={hub.heading}>
            {submission.student.firstName} {submission.student.lastName}
          </h1>
          <p className={hub.lead}>
            {submission.project.title} · {submission.isFinal ? "Submitted" : "Draft"}
            {submission.submittedAt && ` ${formatSeasonDate(submission.submittedAt)}`} · Last updated{" "}
            {formatSeasonDate(submission.updatedAt)}.{" "}
            <Link className={hub.textLink} href={`/admin/users/${submission.student.userId}`}>
              Open student (stage overrides live there)
            </Link>
          </p>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>AI-use disclosure</p>
          <div className={hub.panel}>
            {submission.aiDisclosure ? (
              <>
                <div className={hub.row}>
                  <p className={hub.rowLabel}>Used AI</p>
                  <p className={hub.rowValue}>{submission.aiDisclosure.usedAi ? "Yes" : "No"}</p>
                </div>
                {submission.aiDisclosure.usedAi && (
                  <>
                    <div className={hub.row}>
                      <p className={hub.rowLabel}>Tool</p>
                      <p className={hub.rowValue}>{submission.aiDisclosure.toolName ?? "Not given"}</p>
                    </div>
                    <div className={hub.row}>
                      <p className={hub.rowLabel}>Purpose</p>
                      <p className={hub.rowValue}>{submission.aiDisclosure.purpose ?? "Not given"}</p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className={hub.empty}>
                None recorded. The disclosure is written only at final submit, so a draft has none.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Answers</p>
          <div className={hub.panel}>
            {entries.length === 0 ? (
              <p className={hub.empty}>Nothing saved yet.</p>
            ) : (
              entries.map(([key, value]) => (
                <div key={key} className={hub.rowWrap}>
                  <p className={hub.rowLabel}>{fieldLabel(key)}</p>
                  <p className={hub.rowValueWrap}>{renderValue(value)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
