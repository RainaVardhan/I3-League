"use server";

import { redirect } from "next/navigation";
import type { SchoolingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { generateJoinCode } from "@/lib/join-code";
import { INNOVATION_FIELDS } from "@/lib/innovation-fields";

export type RegisterState = { error: string | null };

export async function studentRegisterAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }

  // Defense in depth — the page itself already redirects a student who has
  // already registered to /register/payment, but a direct POST shouldn't
  // be able to create a second Student row for the same account.
  const existingStudent = await prisma.student.findUnique({ where: { userId: appUser.id } });
  if (existingStudent) {
    redirect("/register/payment");
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const dateOfBirthRaw = String(formData.get("dateOfBirth") ?? "");
  const grade = String(formData.get("grade") ?? "").trim();
  const schoolingType = String(formData.get("schoolingType") ?? "");
  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const schoolCity = String(formData.get("schoolCity") ?? "").trim();
  const schoolState = String(formData.get("schoolState") ?? "").trim();
  const homeschoolName = String(formData.get("homeschoolName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim().toLowerCase();
  const interests = formData
    .getAll("interests")
    .map(String)
    .filter((value) => (INNOVATION_FIELDS as readonly string[]).includes(value));
  const participationType = String(formData.get("participationType") ?? "");
  const teamMode = String(formData.get("teamMode") ?? "");
  const teamName = String(formData.get("teamName") ?? "").trim();
  const joinCodeInput = String(formData.get("joinCode") ?? "").trim().toUpperCase();

  if (!firstName || !lastName || !grade || !city || !state || !country) {
    return { error: "Please fill in all required fields." };
  }
  if (!dateOfBirthRaw) {
    return { error: "Date of birth is required." };
  }
  const dateOfBirth = new Date(dateOfBirthRaw);
  if (Number.isNaN(dateOfBirth.getTime())) {
    return { error: "Please enter a valid date of birth." };
  }
  const ageYears = (Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 8 || ageYears > 20) {
    return { error: "Please double-check the date of birth. This program is for middle and high school students." };
  }
  if (schoolingType !== "SCHOOL" && schoolingType !== "HOMESCHOOL") {
    return { error: "Please choose a schooling type." };
  }
  if (schoolingType === "SCHOOL" && (!schoolName || !schoolCity || !schoolState)) {
    return { error: "Please enter your school's name, city, and state." };
  }
  if (schoolingType === "HOMESCHOOL" && !homeschoolName) {
    return { error: "Please enter your homeschool program's name." };
  }
  if (!guardianEmail || !guardianEmail.includes("@")) {
    return { error: "A parent or guardian email is required." };
  }
  if (interests.length === 0) {
    return { error: "Please select at least one interest." };
  }
  if (participationType !== "INDIVIDUAL" && participationType !== "TEAM") {
    return { error: "Please choose how you're participating." };
  }
  if (participationType === "TEAM") {
    if (teamMode !== "CREATE" && teamMode !== "JOIN") {
      return { error: "Please choose to create a new team or join an existing one." };
    }
    if (teamMode === "CREATE" && !teamName) {
      return { error: "Please enter a team name." };
    }
    if (teamMode === "JOIN" && !joinCodeInput) {
      return { error: "Please enter your team's join code." };
    }
  }

  const season = await getActiveSeason();

  let result: { teamJoinCode: string | null };
  try {
    result = await prisma.$transaction(async (tx) => {
      let schoolId: string | undefined;
      if (schoolingType === "SCHOOL") {
        const school = await tx.school.upsert({
          where: { name_city_state: { name: schoolName, city: schoolCity, state: schoolState } },
          update: {},
          create: { name: schoolName, city: schoolCity, state: schoolState, country },
        });
        schoolId = school.id;
      }

      const student = await tx.student.create({
        data: {
          userId: appUser.id,
          firstName,
          lastName,
          displayName: firstName,
          dateOfBirth,
          grade,
          schoolingType: schoolingType as SchoolingType,
          schoolId,
          homeschoolName: schoolingType === "HOMESCHOOL" ? homeschoolName : null,
          city,
          state,
          country,
          interests,
          guardianEmail,
        },
      });

      let teamJoinCode: string | null = null;

      if (participationType === "TEAM") {
        if (teamMode === "CREATE") {
          let code = generateJoinCode();
          for (let attempt = 0; attempt < 5; attempt++) {
            const clash = await tx.team.findUnique({ where: { joinCode: code } });
            if (!clash) break;
            code = generateJoinCode();
          }
          const team = await tx.team.create({
            data: { name: teamName, joinCode: code, seasonId: season.id },
          });
          await tx.teamMembership.create({ data: { teamId: team.id, studentId: student.id } });
          teamJoinCode = team.joinCode;
        } else {
          const team = await tx.team.findUnique({
            where: { joinCode: joinCodeInput },
            include: { _count: { select: { memberships: true } } },
          });
          if (!team) {
            throw new Error("JOIN_CODE_NOT_FOUND");
          }
          if (team._count.memberships >= season.maxTeamSize) {
            throw new Error("TEAM_FULL");
          }
          await tx.teamMembership.create({ data: { teamId: team.id, studentId: student.id } });
        }
      }

      // Both roles register independently (see CLAUDE.md) — this is the
      // only point where either side can create the link between them, so
      // check whether a matching Parent profile already exists.
      //
      // SECURITY: this match is just a self-reported email string — it
      // does not prove the matched Parent account belongs to this
      // student's actual guardian (see the StudentParent model comment in
      // schema.prisma for the threat model). Deliberately NOT setting
      // verifiedAt here — the row lands pending, and the consent flow
      // (src/app/consent/[studentId]/) refuses to treat it as
      // consent-eligible until an admin verifies it.
      const parentUser = await tx.user.findFirst({
        where: { role: "PARENT", email: { equals: guardianEmail, mode: "insensitive" } },
        include: { parent: true },
      });
      if (parentUser?.parent) {
        await tx.studentParent.create({
          data: {
            studentId: student.id,
            parentId: parentUser.parent.id,
            relationship: "Parent/Guardian",
          },
        });
      }

      return { teamJoinCode };
    });
  } catch (err) {
    if (err instanceof Error && err.message === "JOIN_CODE_NOT_FOUND") {
      return { error: "That join code doesn't match any team this season. Double-check it with your teammate." };
    }
    if (err instanceof Error && err.message === "TEAM_FULL") {
      return { error: "That team is already full for this season." };
    }
    throw err;
  }

  redirect(
    result.teamJoinCode ? `/register/payment?joinCode=${result.teamJoinCode}` : "/register/payment"
  );
}

export async function parentRegisterAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "PARENT") {
    redirect("/login");
  }

  const existingParent = await prisma.parent.findUnique({ where: { userId: appUser.id } });
  if (existingParent) {
    redirect("/dashboard");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName || !phone) {
    return { error: "Please fill in all required fields." };
  }

  await prisma.$transaction(async (tx) => {
    const parent = await tx.parent.create({
      data: { userId: appUser.id, fullName, phone },
    });

    // Auto-link to any Student who already listed this parent's email as
    // their guardian email before this Parent profile existed. Same
    // pending-until-admin-verified rule as the mirror case in
    // studentRegisterAction above — verifiedAt is deliberately left unset.
    const students = await tx.student.findMany({
      where: {
        guardianEmail: { equals: appUser.email, mode: "insensitive" },
        parentLinks: { none: { parentId: parent.id } },
      },
    });
    if (students.length > 0) {
      await tx.studentParent.createMany({
        data: students.map((student) => ({
          studentId: student.id,
          parentId: parent.id,
          relationship: "Parent/Guardian",
        })),
      });
    }
  });

  redirect("/dashboard");
}
