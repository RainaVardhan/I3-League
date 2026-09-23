import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/design-system/Input";
import { Button } from "@/components/design-system/Button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import hub from "../AdminHub.module.css";
import { addSchoolAction } from "./actions";

export const metadata = {
  title: "Schools | Admin | I³ League",
};

// School Management (CLAUDE.md Sprint 6). Schools are otherwise only ever
// created implicitly by a student's own registration form (free-typed, no
// lookup against this table) — this is the first place an admin can see the
// full list and add one directly. Editing or merging an existing school
// isn't built yet (noted on the page, not silently missing).
//
// A plain list, not a dropdown — each row's own roster (students + coaches)
// lives one click away at /admin/users/schools/[id] instead, the same
// detail-page pattern as a person's own /admin/users/[id] page, and the
// same page the Users directory's own "Schools" tab links into.
export default async function AdminSchoolsPage() {
  const { admin } = await requireAdmin();

  const schools = await prisma.school.findMany({
    include: { _count: { select: { students: true, coaches: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Schools">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Schools</p>
          <h1 className={hub.heading}>On file</h1>
          <p className={hub.lead}>
            {schools.length} school{schools.length === 1 ? "" : "s"}, each with the students and coaches
            who selected it at registration.
          </p>

          <div className={hub.panel}>
            {schools.length === 0 ? (
              <p className={hub.empty}>No schools on file yet.</p>
            ) : (
              schools.map((school) => {
                const place = [school.city, school.state, school.country].filter(Boolean).join(", ");
                return (
                  <Link key={school.id} href={`/admin/users/schools/${school.id}`} className={hub.row}>
                    <div className={hub.rowMain}>
                      <p className={hub.rowTitle}>{school.name}</p>
                      <p className={hub.rowMeta}>{place || "No city/state on file"}</p>
                      <p className={hub.rowMeta}>
                        {school._count.students} student{school._count.students === 1 ? "" : "s"} ·{" "}
                        {school._count.coaches} coach{school._count.coaches === 1 ? "" : "es"}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Add a school</p>
          <h2 className={hub.heading}>New school record</h2>
          <p className={hub.lead}>
            For a school students will pick at registration but hasn&apos;t come up yet. Adding one that
            already matches an existing name, city, and state reuses that row instead of duplicating it.
          </p>

          <form action={addSchoolAction} className={hub.formGrid}>
            <Input label="School name" id="school-name" name="name" required maxLength={160} />
            <Input label="City" id="school-city" name="city" maxLength={80} />
            <Input label="State" id="school-state" name="state" maxLength={80} />
            <Input label="Country" id="school-country" name="country" maxLength={80} placeholder="USA" />
            <div className={hub.formSubmitRow}>
              <Button as="button" type="submit" showArrow={false}>
                Add school
              </Button>
            </div>
          </form>
        </div>
      </section>
    </AdminShell>
  );
}
