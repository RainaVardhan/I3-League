// ============================================================================
// i3League — Prisma Seed Script
// ============================================================================
// Run with: npx prisma db seed
// (requires the "prisma.seed" entry in package.json — see note at bottom)
//
// What this creates:
// - One active Season (2026-2027) with real deadlines/pricing, nothing hard-coded
// - CurriculumModule + Assessment stub for each of the 7 stages
// - One Admin, one Coach, one Judge (Judge/scoring is Phase 2 but the row exists)
// - One School
// - Three demo students at different points in the journey, per CLAUDE.md
//   Day 14 "seed a few realistic test students at different stages":
//     1. Maya   — individual, mid-journey (INSIGHT + INVESTIGATE complete, IMAGINE current)
//     2. A team of 2 (Jordan + Priya) — early journey (INSIGHT current)
//     3. Sam    — individual, first-login / fresh enrollment, nothing started
// - Parents + consents for all students
// - Enrollments + Payments (mix of VERIFIED / SUBMITTED status)
// - Projects + StudentProject links (including the team case, to exercise the
//   "exactly one owner" constraint and the permanent student<->project link)
// - A couple of JournalEntry rows for Maya, including one edited entry
//   (to demonstrate the append-only version pattern, not an UPDATE)
// ============================================================================

import { PrismaClient, Role, SchoolingType, ParticipationType,
  PaymentMethod, PaymentStatus, StageName, StageStatus,
  ReviewStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding i3League demo data...');

  // --------------------------------------------------------------------
  // Season
  // --------------------------------------------------------------------
  const season = await prisma.season.upsert({
    where: { label: '2026-2027' },
    update: {},
    create: {
      label: '2026-2027',
      openDate: new Date('2026-09-01'),
      springQualifyDeadline: new Date('2027-04-30'),
      summerQualifyDeadline: new Date('2027-07-30'),
      nationalFinalsDate: new Date('2027-08-15'),
      perParticipantPriceUsd: 111.00,
      maxTeamSize: 4,
      curriculumVersion: 'v1',
      isActive: true,
      paypalLink: 'https://paypal.me/i3league',
      venmoHandle: '@i3League',
      zelleInfo: 'payments@i3league.org',
    },
  });

  // --------------------------------------------------------------------
  // Curriculum: one module + one assessment stub per stage
  // --------------------------------------------------------------------
  const stageOrder: StageName[] = [
    StageName.INSIGHT, StageName.INVESTIGATE, StageName.IMAGINE,
    StageName.IP_CHECKPOINT, StageName.ITERATE, StageName.IMPACT,
    StageName.INFLUENCE,
  ];

  for (const [i, stageName] of stageOrder.entries()) {
    // Not named `module` — Next's lint rules reserve that identifier since
    // this file can be compiled as CommonJS (see the ts-node invocation
    // note at the bottom of this file), where `module` is already special.
    const curriculumModule = await prisma.curriculumModule.upsert({
      where: { seasonId_stageName: { seasonId: season.id, stageName } },
      update: {},
      create: {
        seasonId: season.id,
        stageName,
        title: stageName.replace('_', ' '),
        description: `${stageName} stage content (seed placeholder — real copy TBD).`,
        order: i + 1,
      },
    });

    // IP_CHECKPOINT is a gate, not a learn/test stage — skip assessment for it
    if (stageName !== StageName.IP_CHECKPOINT) {
      await prisma.assessment.upsert({
        where: { moduleId: curriculumModule.id },
        update: {},
        create: {
          moduleId: curriculumModule.id,
          title: `${stageName} Test`,
          passScorePct: 70,
          maxAttempts: 2,
          isPublished: true,
        },
      });
    }
  }

  // --------------------------------------------------------------------
  // School
  // --------------------------------------------------------------------
  const school = await prisma.school.upsert({
    where: { name_city_state: { name: 'Lincoln Middle School', city: 'Herndon', state: 'VA' } },
    update: {},
    create: { name: 'Lincoln Middle School', city: 'Herndon', state: 'VA', country: 'USA' },
  });

  // --------------------------------------------------------------------
  // Staff: Admin, Coach, Judge
  // --------------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: 'admin@i3league.org' },
    update: {},
    create: {
      supabaseUid: 'seed-admin-uid',
      email: 'admin@i3league.org',
      role: Role.ADMIN,
      admin: { create: { fullName: 'Alex Rivera' } },
    },
  });

  const coachUser = await prisma.user.upsert({
    where: { email: 'coach@lincolnms.edu' },
    update: {},
    create: {
      supabaseUid: 'seed-coach-uid',
      email: 'coach@lincolnms.edu',
      role: Role.COACH,
      coach: { create: { fullName: 'Mr. Dana Osei', schoolId: school.id } },
    },
    include: { coach: true },
  });
  const coach = await prisma.coach.findUniqueOrThrow({ where: { userId: coachUser.id } });

  await prisma.user.upsert({
    where: { email: 'judge@i3league.org' },
    update: {},
    create: {
      supabaseUid: 'seed-judge-uid',
      email: 'judge@i3league.org',
      role: Role.JUDGE,
      judge: { create: { fullName: 'Dr. Priya Nair' } }, // Phase 2 role, seeded for later
    },
  });

  // --------------------------------------------------------------------
  // Helper: create a Student + Parent + Consent + Enrollment + Payment
  // --------------------------------------------------------------------
  async function createStudentWithParent(opts: {
    email: string;
    firstName: string;
    lastName: string;
    dob: string;
    grade: string;
    interests: string[];
    parentEmail: string;
    parentName: string;
    paymentStatus: PaymentStatus;
    participationType: ParticipationType;
    teamId?: string;
  }) {
    const studentUser = await prisma.user.upsert({
      where: { email: opts.email },
      update: {
        student: { update: { guardianEmail: opts.parentEmail } },
      },
      create: {
        supabaseUid: `seed-${opts.email}`,
        email: opts.email,
        role: Role.STUDENT,
        student: {
          create: {
            firstName: opts.firstName,
            lastName: opts.lastName,
            displayName: opts.firstName,
            dateOfBirth: new Date(opts.dob),
            grade: opts.grade,
            schoolingType: SchoolingType.SCHOOL,
            schoolId: school.id,
            city: 'Herndon',
            state: 'VA',
            country: 'USA',
            interests: opts.interests,
            guardianEmail: opts.parentEmail,
          },
        },
      },
    });
    const student = await prisma.student.findUniqueOrThrow({ where: { userId: studentUser.id } });

    const parentUser = await prisma.user.upsert({
      where: { email: opts.parentEmail },
      update: {},
      create: {
        supabaseUid: `seed-${opts.parentEmail}`,
        email: opts.parentEmail,
        role: Role.PARENT,
        parent: { create: { fullName: opts.parentName, phone: '555-0100' } },
      },
    });
    const parent = await prisma.parent.findUniqueOrThrow({ where: { userId: parentUser.id } });

    await prisma.studentParent.upsert({
      where: { studentId_parentId: { studentId: student.id, parentId: parent.id } },
      update: {},
      // Seed data represents already-established, legitimate relationships
      // (not the self-reported-email-match flow real registration goes
      // through), and this seed already gives each of these pairs real
      // Consent rows below — so mark them pre-verified rather than landing
      // in the same "pending admin review" state a real new signup would.
      create: { studentId: student.id, parentId: parent.id, relationship: 'Parent', verifiedAt: new Date() },
    });

    await prisma.consent.create({
      data: {
        parentId: parent.id,
        studentId: student.id,
        participationAccepted: true,
        privacyAccepted: true,
        codeOfConductAccepted: true,
        competitionRulesAccepted: true,
        academicIntegrityAccepted: true,
        aiUseAccepted: true,
        safetyAccepted: true,
        ipPolicyAccepted: true,
      },
    });

    await prisma.mediaConsent.create({
      data: { parentId: parent.id, studentId: student.id, granted: false }, // default unchecked, per spec
    });

    const enrollment = await prisma.enrollment.upsert({
      where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
      update: {},
      create: {
        studentId: student.id,
        seasonId: season.id,
        participationType: opts.participationType,
        teamId: opts.teamId,
      },
    });

    await prisma.payment.upsert({
      where: { enrollmentId: enrollment.id },
      update: {},
      create: {
        enrollmentId: enrollment.id,
        amountUsd: 111.00,
        method: PaymentMethod.VENMO,
        paymentReference: `SEED-${opts.email}`,
        status: opts.paymentStatus,
        submittedAt: new Date(),
        verifiedAt: opts.paymentStatus === PaymentStatus.VERIFIED ? new Date() : null,
      },
    });

    // Seed StageProgress rows LOCKED for every stage; caller overrides as needed
    for (const stageName of stageOrder) {
      await prisma.stageProgress.upsert({
        where: { studentId_stageName: { studentId: student.id, stageName } },
        update: {},
        create: { studentId: student.id, stageName, status: StageStatus.LOCKED },
      });
    }

    return student;
  }

  // --------------------------------------------------------------------
  // Student 1: Maya — individual, mid-journey
  // --------------------------------------------------------------------
  const maya = await createStudentWithParent({
    email: 'maya@example.com',
    firstName: 'Maya',
    lastName: 'Chen',
    dob: '2012-03-14',
    grade: '8',
    interests: ['Technology', 'Environment'],
    parentEmail: 'maya.parent@example.com',
    parentName: 'Linda Chen',
    paymentStatus: PaymentStatus.VERIFIED,
    participationType: ParticipationType.INDIVIDUAL,
  });

  const mayaProject = await prisma.project.create({
    data: {
      title: 'Smart Irrigation for School Gardens',
      category: 'Environment',
      individualStudentId: maya.id,
      visibility: 'CONFIDENTIAL', // schema default; left explicit here for clarity
    },
  });
  await prisma.studentProject.create({
    data: { studentId: maya.id, projectId: mayaProject.id },
  });

  // Maya: INSIGHT + INVESTIGATE complete, IMAGINE current, rest locked
  await prisma.stageProgress.update({
    where: { studentId_stageName: { studentId: maya.id, stageName: StageName.INSIGHT } },
    data: { status: StageStatus.COMPLETE, unlockedAt: new Date('2026-09-05'), completedAt: new Date('2026-09-20') },
  });
  await prisma.stageProgress.update({
    where: { studentId_stageName: { studentId: maya.id, stageName: StageName.INVESTIGATE } },
    data: { status: StageStatus.COMPLETE, unlockedAt: new Date('2026-09-20'), completedAt: new Date('2026-10-10') },
  });
  await prisma.stageProgress.update({
    where: { studentId_stageName: { studentId: maya.id, stageName: StageName.IMAGINE } },
    data: { status: StageStatus.CURRENT, unlockedAt: new Date('2026-10-10') },
  });

  await prisma.safetyReview.create({
    data: {
      projectId: mayaProject.id,
      answers: { humans: false, animals: false, chemicals: false, electricity: true, other: 'Uses a low-voltage pump' },
      isHighRisk: false,
      status: ReviewStatus.NOT_REQUIRED,
    },
  });

  // Maya's Innovation Journal — including one edited entry, append-only style
  await prisma.journalEntry.create({
    data: {
      studentId: maya.id,
      entryGroupId: 'maya-entry-1',
      version: 1,
      entryType: 'observation',
      text: 'Noticed the school garden beds dry out fast on the west side.',
    },
  });
  await prisma.journalEntry.create({
    data: {
      studentId: maya.id,
      entryGroupId: 'maya-entry-1',
      version: 2, // "edit" = new row, same entryGroupId, incremented version
      entryType: 'observation',
      text: 'Noticed the school garden beds dry out fast on the west side — measured soil moisture at 12% vs 30% on the east side.',
    },
  });
  await prisma.journalEntry.create({
    data: {
      studentId: maya.id,
      entryGroupId: 'maya-entry-2',
      version: 1,
      entryType: 'research',
      text: 'Looked into drip irrigation kits — most are too expensive for a school budget.',
    },
  });

  // --------------------------------------------------------------------
  // Students 2 & 3: Jordan + Priya — team, early journey
  // --------------------------------------------------------------------
  const team = await prisma.team.upsert({
    where: { joinCode: 'CIRCBR' },
    update: {},
    create: { name: 'Team Circuit Breakers', joinCode: 'CIRCBR', seasonId: season.id, coachId: coach.id },
  });

  const jordan = await createStudentWithParent({
    email: 'jordan@example.com',
    firstName: 'Jordan',
    lastName: 'Ellis',
    dob: '2011-07-22',
    grade: '9',
    interests: ['Technology', 'Business'],
    parentEmail: 'jordan.parent@example.com',
    parentName: 'Kim Ellis',
    paymentStatus: PaymentStatus.VERIFIED,
    participationType: ParticipationType.TEAM,
    teamId: team.id,
  });

  const priya = await createStudentWithParent({
    email: 'priya@example.com',
    firstName: 'Priya',
    lastName: 'Patel',
    dob: '2011-11-02',
    grade: '9',
    interests: ['Technology', 'Education'],
    parentEmail: 'priya.parent@example.com',
    parentName: 'Raj Patel',
    paymentStatus: PaymentStatus.SUBMITTED, // deliberately not yet VERIFIED — exercises the
    participationType: ParticipationType.TEAM, // "one teammate's unverified payment never
    teamId: team.id,                            // blocks the other" rule from CLAUDE.md
  });

  await prisma.teamMembership.createMany({
    data: [
      { teamId: team.id, studentId: jordan.id, roleLabel: 'Lead Builder' },
      { teamId: team.id, studentId: priya.id, roleLabel: 'Researcher' },
    ],
  });

  const teamProject = await prisma.project.create({
    data: {
      title: 'Assistive Note-Taking Tool for Dyslexic Students',
      category: 'Education',
      teamId: team.id,
      visibility: 'CONFIDENTIAL',
    },
  });
  // One StudentProject row per current teammate — this is what lets
  // "all of this student's projects" work without walking Team/TeamMembership
  await prisma.studentProject.createMany({
    data: [
      { studentId: jordan.id, projectId: teamProject.id },
      { studentId: priya.id, projectId: teamProject.id },
    ],
  });

  // Both teammates: INSIGHT current (Jordan's payment is verified so his
  // dashboard is fully unlocked; Priya's stage progress still tracks
  // independently per the "billing/access independence" rule)
  for (const s of [jordan, priya]) {
    await prisma.stageProgress.update({
      where: { studentId_stageName: { studentId: s.id, stageName: StageName.INSIGHT } },
      data: { status: StageStatus.CURRENT, unlockedAt: new Date('2026-09-05') },
    });
  }

  // --------------------------------------------------------------------
  // Student 4: Sam — fresh enrollment, nothing started (first-login state)
  // --------------------------------------------------------------------
  const sam = await createStudentWithParent({
    email: 'sam@example.com',
    firstName: 'Sam',
    lastName: 'Okafor',
    dob: '2013-01-30',
    grade: '7',
    interests: ['Healthcare'],
    parentEmail: 'sam.parent@example.com',
    parentName: 'Grace Okafor',
    paymentStatus: PaymentStatus.VERIFIED,
    participationType: ParticipationType.INDIVIDUAL,
  });
  // Sam: only INSIGHT unlocked, nothing started yet — the "empty state" case
  await prisma.stageProgress.update({
    where: { studentId_stageName: { studentId: sam.id, stageName: StageName.INSIGHT } },
    data: { status: StageStatus.CURRENT, unlockedAt: new Date() },
  });

  console.log('Seed complete:');
  console.log(`  Season: ${season.label}`);
  console.log(`  Students: Maya (mid-journey, individual), Jordan + Priya (team, early journey), Sam (fresh)`);
  console.log(`  Admin login: admin@i3league.org / Coach login: coach@lincolnms.edu`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// ============================================================================
// Setup note: add this to package.json so `npx prisma db seed` finds it
// (adjust the ts-node invocation if your project doesn't already use it):
//
// "prisma": {
//   "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
// }
//
// Place this file at prisma/seed.ts in the repo.
// ============================================================================
