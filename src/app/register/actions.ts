"use server";

import { isAccountLocked } from "@/lib/launch";
import { redirect } from "next/navigation";
import { Prisma, type SchoolingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { generateJoinCode } from "@/lib/join-code";
import { INNOVATION_FIELDS } from "@/lib/innovation-fields";
import { isReasonableName, isReasonablePlace } from "@/lib/reasonable-text";
import { isKnownCountry, isUnitedStates } from "@/lib/countries";
import { isKnownUsState } from "@/lib/us-states";
import { toTitleCase } from "@/lib/text-format";
import { parseGradeNumber } from "@/lib/grade";
import { sendEmail } from "@/lib/email";
import {
  COUNTRY_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  GRADE_MAX_LENGTH,
  JOIN_CODE_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  TEAM_NAME_MAX_LENGTH,
} from "@/lib/account-field-limits";

export type RegisterState = { error: string | null; fields?: string[] };

export async function studentRegisterAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }
  // Pre-launch: only approved accounts get in (launch.ts).
  if (isAccountLocked(appUser)) redirect("/dashboard");

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
  // Title-cased at the point they're read — every downstream check
  // (isReasonablePlace, isKnownCountry, isKnownUsState) is already
  // case-insensitive, and this way the value that actually gets saved is
  // Title Case regardless of how the student typed it.
  const schoolName = toTitleCase(String(formData.get("schoolName") ?? "").trim());
  const schoolCity = toTitleCase(String(formData.get("schoolCity") ?? "").trim());
  const schoolState = toTitleCase(String(formData.get("schoolState") ?? "").trim());
  const homeschoolName = toTitleCase(String(formData.get("homeschoolName") ?? "").trim());
  const city = toTitleCase(String(formData.get("city") ?? "").trim());
  const state = toTitleCase(String(formData.get("state") ?? "").trim());
  const country = toTitleCase(String(formData.get("country") ?? "").trim());
  const guardianEmail = String(formData.get("guardianEmail") ?? "").trim().toLowerCase();
  const interests = formData
    .getAll("interests")
    .map(String)
    .filter((value) => (INNOVATION_FIELDS as readonly string[]).includes(value));
  const participationType = String(formData.get("participationType") ?? "");
  const teamMode = String(formData.get("teamMode") ?? "");
  const teamName = String(formData.get("teamName") ?? "").trim();
  const joinCodeInput = String(formData.get("joinCode") ?? "").trim().toUpperCase();

  const missingRequired = [
    !firstName && "firstName",
    !lastName && "lastName",
    !grade && "grade",
    !city && "city",
    !state && "state",
    !country && "country",
  ].filter((field): field is string => Boolean(field));
  if (missingRequired.length > 0) {
    return { error: "Please fill in all required fields.", fields: missingRequired };
  }

  // Length caps checked before any format/plausibility check below — a
  // very long input (pasted, or sent by a direct POST past the form's own
  // maxLength) should be rejected outright, not run through a regex/lookup
  // first. See src/lib/account-field-limits.ts.
  const tooLong = [
    grade.length > GRADE_MAX_LENGTH && "grade",
    country.length > COUNTRY_MAX_LENGTH && "country",
    guardianEmail.length > EMAIL_MAX_LENGTH && "guardianEmail",
    participationType === "TEAM" && teamMode === "CREATE" && teamName.length > TEAM_NAME_MAX_LENGTH && "teamName",
    participationType === "TEAM" && teamMode === "JOIN" && joinCodeInput.length > JOIN_CODE_MAX_LENGTH && "joinCode",
  ].filter((field): field is string => Boolean(field));
  if (tooLong.length > 0) {
    return { error: "One of your answers is too long. Please shorten it.", fields: tooLong };
  }

  // Format/plausibility checks below don't attempt a real address or
  // school-directory lookup (no such API is wired into this project — see
  // CLAUDE.md tech stack) — they catch obvious junk (a single character, a
  // repeated key, digits where a name goes), not a confident fake.
  const badNames = [
    !isReasonableName(firstName) && "firstName",
    !isReasonableName(lastName, 1) && "lastName",
  ].filter((field): field is string => Boolean(field));
  if (badNames.length > 0) {
    return { error: "Please enter a real first and last name.", fields: badNames };
  }
  if (!isReasonablePlace(city) || !isReasonablePlace(state)) {
    return {
      error: "Please enter a real city and state.",
      fields: [!isReasonablePlace(city) && "city", !isReasonablePlace(state) && "state"].filter(
        (field): field is string => Boolean(field)
      ),
    };
  }
  if (!isKnownCountry(country)) {
    return { error: "Please enter a real country.", fields: ["country"] };
  }
  if (isUnitedStates(country) && !isKnownUsState(state)) {
    return { error: "Please enter a real US state.", fields: ["state"] };
  }

  if (!dateOfBirthRaw) {
    return { error: "Date of birth is required.", fields: ["dateOfBirth"] };
  }
  const dateOfBirth = new Date(dateOfBirthRaw);
  if (Number.isNaN(dateOfBirth.getTime())) {
    return { error: "Please enter a valid date of birth.", fields: ["dateOfBirth"] };
  }
  const ageYears = (Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 8 || ageYears > 20) {
    return {
      error: "Please double-check the date of birth. This program is for middle and high school students.",
      fields: ["dateOfBirth"],
    };
  }

  // Only the plain 6-12 range is enforced here, deliberately not checked
  // against date of birth — a student can legitimately be well ahead of
  // (or behind) the typical grade for their age.
  const gradeNumber = parseGradeNumber(grade);
  if (gradeNumber === null) {
    return { error: "Please enter a grade between 6 and 12.", fields: ["grade"] };
  }

  if (schoolingType !== "SCHOOL" && schoolingType !== "HOMESCHOOL") {
    return { error: "Please choose a schooling type.", fields: ["schoolingType"] };
  }
  if (schoolingType === "SCHOOL") {
    const badSchoolFields = [
      !isReasonablePlace(schoolName, 3) && "schoolName",
      !isReasonablePlace(schoolCity) && "schoolCity",
      !isReasonablePlace(schoolState) && "schoolState",
    ].filter((field): field is string => Boolean(field));
    if (badSchoolFields.length > 0) {
      return {
        error: "Please enter your school's real name, city, and state.",
        fields: badSchoolFields,
      };
    }
    if (isUnitedStates(country) && !isKnownUsState(schoolState)) {
      return { error: "Please enter a real US state for your school.", fields: ["schoolState"] };
    }
  }
  // Optional — not every homeschool arrangement has a named program. Only
  // check the format when something was actually entered.
  if (schoolingType === "HOMESCHOOL" && homeschoolName && !isReasonablePlace(homeschoolName, 3)) {
    return { error: "Please enter your homeschool program's real name.", fields: ["homeschoolName"] };
  }
  if (!guardianEmail || !guardianEmail.includes("@")) {
    return { error: "A parent or guardian email is required.", fields: ["guardianEmail"] };
  }
  if (interests.length === 0) {
    return { error: "Please select at least one interest.", fields: ["interests"] };
  }
  if (participationType !== "INDIVIDUAL" && participationType !== "TEAM") {
    return { error: "Please choose how you're participating.", fields: ["participationType"] };
  }
  if (participationType === "TEAM") {
    if (teamMode !== "CREATE" && teamMode !== "JOIN") {
      return { error: "Please choose to create a new team or join an existing one.", fields: ["teamMode"] };
    }
    if (teamMode === "CREATE" && !teamName) {
      return { error: "Please enter a team name.", fields: ["teamName"] };
    }
    if (teamMode === "JOIN" && !joinCodeInput) {
      return { error: "Please enter your team's join code.", fields: ["joinCode"] };
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
          // Primary check — case-insensitive, scoped to this season, so
          // "Team Rocket" and "team rocket" can't both register this
          // season, but the same name is free again next season. The raw
          // SQL unique index in migration 20260923000000_team_name_unique_per_season
          // is the fail-safe against a race between two concurrent
          // creates — see the Team model comment in schema.prisma.
          const nameClash = await tx.team.findFirst({
            where: { seasonId: season.id, name: { equals: teamName, mode: "insensitive" } },
          });
          if (nameClash) {
            throw new Error("TEAM_NAME_TAKEN");
          }

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
      return {
        error: "That join code doesn't match any team this season. Double-check it with your teammate.",
        fields: ["joinCode"],
      };
    }
    if (err instanceof Error && err.message === "TEAM_FULL") {
      return {
        error: `That team already has ${season.maxTeamSize} members, the max for a team this season.`,
        fields: ["joinCode"],
      };
    }
    if (err instanceof Error && err.message === "TEAM_NAME_TAKEN") {
      return {
        error: "That team name is already registered this season. Please choose a different one.",
        fields: ["teamName"],
      };
    }
    // Fail-safe for two students creating the same team name at the same
    // instant, racing past the check above — the raw SQL unique index
    // (see the Team model comment in schema.prisma) is what actually
    // stops it; this just turns that DB-level rejection into the same
    // field-flagged message as the primary check. Prisma reports a raw
    // functional index's violation by its expression, not a declared
    // field name — confirmed live: meta.target is ["lower(name)", "seasonId"].
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" &&
      Array.isArray(err.meta?.target) &&
      (err.meta.target as unknown[]).includes("lower(name)")
    ) {
      return {
        error: "That team name is already registered this season. Please choose a different one.",
        fields: ["teamName"],
      };
    }
    throw err;
  }

  // Registration itself (not payment) is what creates the team and its
  // code — see CLAUDE.md-driven design: the code only exists once this
  // transaction has actually committed, so there's no path where it's
  // visible before registration finishes. Email it to the student who just
  // created the team so they have it even if they close the payment page
  // before copying it down; it also still shows there, unchanged.
  if (result.teamJoinCode) {
    try {
      await sendEmail({
        to: appUser.email,
        subject: "Your I³ League team code",
        text: `You're registered! Share this code with your teammates so they can join your team:\n\n${result.teamJoinCode}\n\nEach teammate registers and pays separately using this code.`,
      });
    } catch {
      // Never block registration on a notification failure — the code is
      // also shown on the payment page right after this redirect.
    }
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
  if (isAccountLocked(appUser)) redirect("/dashboard");

  const existingParent = await prisma.parent.findUnique({ where: { userId: appUser.id } });
  if (existingParent) {
    redirect("/dashboard");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const missingParentFields = [!fullName && "fullName", !phone && "phone"].filter(
    (field): field is string => Boolean(field)
  );
  if (missingParentFields.length > 0) {
    return { error: "Please fill in all required fields.", fields: missingParentFields };
  }
  if (!isReasonableName(fullName)) {
    return { error: "Please enter a real full name.", fields: ["fullName"] };
  }
  // Bounded on both ends — no real phone number is anywhere near
  // PHONE_MAX_LENGTH characters, and the old pattern's unbounded `{7,}`
  // would otherwise accept a phone field of any length.
  if (!new RegExp(`^[\\d+()\\-.\\s]{7,${PHONE_MAX_LENGTH}}$`).test(phone)) {
    return { error: "Please enter a real phone number.", fields: ["phone"] };
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
