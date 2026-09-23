import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import hub from "../../../AdminHub.module.css";

export const metadata = {
  title: "School | Admin | I³ League",
};

// The roster behind a school's own row on both /admin/schools and the Users
// directory's "Schools" tab — every coach and student on file for this
// school (all-time, not scoped to one season, matching those two list
// pages' own "N students on file / N coaches" counts), coaches listed
// first since they're the smaller, more load-bearing group per school.
export default async function AdminSchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { admin } = await requireAdmin();
  const { schoolId } = await params;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      coaches: { include: { user: true }, orderBy: { fullName: "asc" } },
      students: { include: { user: true }, orderBy: { firstName: "asc" } },
    },
  });
  if (!school) notFound();

  const place = [school.city, school.state, school.country].filter(Boolean).join(", ");

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Users">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <Link href="/admin/users?tab=schools" className={hub.backLink}>
            ← All schools
          </Link>
          <p className={hub.eyebrow}>School</p>
          <h1 className={hub.heading}>{school.name}</h1>
          <p className={hub.lead}>
            {place || "No city/state on file"} · {school.students.length} student
            {school.students.length === 1 ? "" : "s"} · {school.coaches.length} coach
            {school.coaches.length === 1 ? "" : "es"}
          </p>

          <div className={hub.panel}>
            {school.coaches.length === 0 && school.students.length === 0 ? (
              <p className={hub.empty}>No one on file from this school yet.</p>
            ) : (
              <>
                {school.coaches.map((coach) => (
                  <Link key={coach.userId} href={`/admin/users/${coach.userId}`} className={hub.row}>
                    <div className={hub.rowMain}>
                      <p className={hub.rowTitle}>
                        {coach.fullName} <span className={hub.tag}>Coach</span>
                      </p>
                      <p className={hub.rowMeta}>{coach.user.email}</p>
                    </div>
                  </Link>
                ))}
                {school.students.map((student) => (
                  <Link key={student.userId} href={`/admin/users/${student.userId}`} className={hub.row}>
                    <div className={hub.rowMain}>
                      <p className={hub.rowTitle}>
                        {student.firstName} {student.lastName} <span className={hub.tag}>Student</span>
                      </p>
                      <p className={hub.rowMeta}>{student.user.email}</p>
                      <p className={hub.rowMeta}>Grade {student.grade}</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
