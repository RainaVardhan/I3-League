import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { readUploadedFile, UPLOAD_SUBDIRS } from "@/lib/storage";

// Serves uploaded files (payment screenshots, Insight photos, journal photos)
// only to people allowed to see them. Files live outside public/ (see
// src/lib/storage.ts), so this is the only way to reach them. Anything that
// is not allowed, or does not exist, gets the same plain 404 so the response
// never confirms that a given file exists.
//
// Who can see what:
//   admin              every file
//   the owning student their own payment screenshot, journal photos, and Insight
//                      photos; teammates on the same project can also see
//                      that project's Insight photo (the project is shared)
//   everyone else      nothing (parents and coaches have no page that shows
//                      these files, so no access is granted)

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

const NOT_FOUND = () => new Response("Not found", { status: 404 });

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;

  // Exactly /uploads/<subdir>/<filename>, with a filename we generated
  // ourselves (see saveUploadedFile). The strict pattern also rules out
  // "..", slashes, and anything else that could escape the upload folder.
  if (segments.length !== 2) return NOT_FOUND();
  const [subdir, filename] = segments;
  if (!(UPLOAD_SUBDIRS as readonly string[]).includes(subdir)) return NOT_FOUND();
  const match = /^[a-z0-9-]+\.(png|jpg|webp)$/.exec(filename);
  if (!match) return NOT_FOUND();

  const appUser = await getCurrentAppUser();
  if (!appUser) return NOT_FOUND();

  if (appUser.role !== "ADMIN") {
    if (appUser.role !== "STUDENT") return NOT_FOUND();
    const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
    if (!student) return NOT_FOUND();
    if (!(await studentOwnsFile(student.id, subdir, `/uploads/${subdir}/${filename}`))) {
      return NOT_FOUND();
    }
  }

  const bytes = await readUploadedFile(subdir, filename);
  if (!bytes) return NOT_FOUND();
  return new Response(bytes as BodyInit, {
    headers: {
      "Content-Type": CONTENT_TYPES[match[1]],
      // Never cached by a shared cache or kept after logout.
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// `url` is built from the validated subdir and filename above, so it is safe
// to use inside the LIKE pattern (no quotes, percent signs, or backslashes).
async function studentOwnsFile(studentId: string, subdir: string, url: string): Promise<boolean> {
  if (subdir === "payment-screenshots") {
    const payment = await prisma.payment.findFirst({
      where: { screenshotUrl: url, enrollment: { studentId } },
      select: { id: true },
    });
    return payment !== null;
  }

  const pattern = `%${url}%`;
  if (subdir === "journal") {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "JournalEntry"
      WHERE "studentId" = ${studentId} AND "attachments"::text LIKE ${pattern}
      LIMIT 1`;
    return rows.length > 0;
  }

  // insight-photos: stored inside Submission.content. A submission belongs to
  // one student but its project can be shared, so allow any student who is a
  // member of the same project.
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT s."id" FROM "Submission" s
    WHERE s."content"::text LIKE ${pattern}
      AND (s."studentId" = ${studentId}
        OR EXISTS (SELECT 1 FROM "StudentProject" sp
                   WHERE sp."projectId" = s."projectId" AND sp."studentId" = ${studentId}))
    LIMIT 1`;
  return rows.length > 0;
}
