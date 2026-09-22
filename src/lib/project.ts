import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// CLAUDE.md "Core business rules": a Project must have exactly one of
// individualStudentId/teamId set, enforced at two layers — this zod
// refinement at the app layer, and a raw SQL CHECK constraint at the DB
// layer (see the migration that creates the Project table). This is the
// first real app-layer Project-creation code path (no flow has created a
// Project outside prisma/seed.ts until now) — Sprint 5's fuller "Project
// Submission Portal" builds on top of the same rows this creates, it
// doesn't replace them.
const projectOwnerSchema = z
  .object({
    individualStudentId: z.string().nullable(),
    teamId: z.string().nullable(),
  })
  .refine((data) => (data.individualStudentId !== null) !== (data.teamId !== null), {
    message: "A project must belong to exactly one of an individual student or a team.",
  });

// Lazily creates (or reuses) the Project a student's INSIGHT/INVESTIGATE
// submission attaches to. Individual students get their own Project.
// Teammates share one: the first teammate to reach INSIGHT creates it,
// anyone after that reuses it and just picks up a StudentProject link if
// they don't already have one — never a second Project (Project.teamId is
// @unique, so a create-race between two teammates is caught below and
// self-heals onto the row that won).
export async function getOrCreateStudentProject(studentId: string) {
  const student = await prisma.student.findUniqueOrThrow({
    where: { id: studentId },
    include: {
      individualProject: true,
      teamMemberships: { include: { team: { include: { project: true } } } },
    },
  });

  if (student.individualProject) {
    return student.individualProject;
  }

  const team = student.teamMemberships[0]?.team;
  if (team?.project) {
    await prisma.studentProject.upsert({
      where: { studentId_projectId: { studentId, projectId: team.project.id } },
      update: {},
      create: { studentId, projectId: team.project.id },
    });
    return team.project;
  }

  const ownerFields = {
    individualStudentId: team ? null : studentId,
    teamId: team ? team.id : null,
  };
  projectOwnerSchema.parse(ownerFields);

  let project;
  try {
    project = await prisma.project.create({
      data: {
        title: "Untitled project",
        category: student.interests[0] ?? "Other",
        ...ownerFields,
      },
    });
  } catch (err) {
    // Two teammates reaching INSIGHT for the first time at the same moment
    // — the loser of the race re-fetches the winner's Project instead of
    // failing the page load.
    if (team && err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const winner = await prisma.team.findUniqueOrThrow({
        where: { id: team.id },
        include: { project: true },
      });
      if (!winner.project) throw err;
      project = winner.project;
    } else {
      throw err;
    }
  }

  await prisma.studentProject.upsert({
    where: { studentId_projectId: { studentId, projectId: project.id } },
    update: {},
    create: { studentId, projectId: project.id },
  });

  return project;
}
