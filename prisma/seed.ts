// ============================================================================
// i3League — Prisma Seed Script
// ============================================================================
// Run with: npx prisma db seed
// (requires the "prisma.seed" entry in package.json — see note at bottom)
//
// What this creates:
// - One active Season (2026-2027) with real deadlines/pricing, nothing hard-coded
// - CurriculumModule + Assessment stub for each of the 6 stages
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
import { STAGE_ORDER } from '../src/lib/stage-progress';
import { STAGE_CONTENT_3_TO_6 } from './stage-content-3-6';

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
      openDate: new Date('2026-10-01'),
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
  // Real title/description + a couple of Lesson/Assignment rows for the two
  // stages Sprint 4 actually builds (INSIGHT, INVESTIGATE) — grounded in the
  // already-approved copy in src/components/curriculum/stages.ts, not
  // invented from scratch. The other 5 stages keep the generic seed
  // placeholder below since their app-side content isn't built yet (they
  // render as a "coming in a later sprint" placeholder page).
  const builtStageContent: Partial<Record<StageName, {
    title: string;
    description: string;
    lessons: { title: string; contentType: string; bodyMarkdown: string }[];
    assignments: { title: string; instructions: string }[];
  }>> = {
    [StageName.INSIGHT]: {
      title: 'Insight',
      description: 'Start with the problem, not the idea.',
      // The full 5-topic INSIGHT curriculum, verbatim from
      // docs/curriculum/01_LEARN/i3league-stage1-insight-notes.md. Each
      // sub-section ("What is it", "Why it matters", ...) is its own
      // blank-line-separated paragraph so LessonList's renderParagraph can
      // bold the label.
      lessons: [
        {
          title: 'Observation Skills',
          contentType: 'reading',
          bodyMarkdown:
            'What is it: Observation means paying attention to what is happening around you and noticing moments where people struggle, waste time, get confused, or create workarounds.\n\n' +
            'Why it matters: Many strong innovations begin with noticing something other people overlook. Before solving a problem, you first have to see it clearly.\n\n' +
            'Example: You notice that students regularly arrive late to class because one hallway becomes extremely crowded between periods.\n\n' +
            'Common mistake: Immediately deciding, "We need an app." That is already jumping to a solution.\n\n' +
            'Try this: For three days, write down five moments where you notice frustration, delay, confusion, waste, or inconvenience.\n\n' +
            'Key takeaway: Great innovators notice before they solve.\n\n' +
            'Think about it: What is something people around you have learned to tolerate that might actually be a problem worth solving?',
        },
        {
          title: 'Empathy Without Assumption',
          contentType: 'reading',
          bodyMarkdown:
            'What is it: Empathy means trying to understand what someone else is actually experiencing, their needs, frustrations, and constraints, without deciding for them what the problem or solution should be.\n\n' +
            'Why it matters: It\'s easy to assume you already know what someone needs. But if you guess wrong, you end up solving a problem nobody actually has.\n\n' +
            'Example: You assume younger students want a faster way to sign up for clubs. But when you actually ask them, they say the real problem is not knowing which clubs exist in the first place.\n\n' +
            'Common mistake: Deciding what a group needs based on your own experience instead of theirs.\n\n' +
            'Try this: Pick one person affected by a problem you\'re curious about. Ask them to describe it in their own words, and write down only what they say, not what you think they mean.\n\n' +
            'Key takeaway: Understand the problem through their eyes, not your assumptions.\n\n' +
            'Think about it: Have you ever assumed you knew what someone needed, and found out later you were wrong?\n\n' +
            'Use this in your project: Record one thing you learned from another person that changed or challenged your assumption.',
        },
        {
          title: 'Problem Scope',
          contentType: 'reading',
          bodyMarkdown:
            'What is it: Problem scope means figuring out how big or small a problem is, broad enough to matter, but narrow enough that you could realistically do something about it.\n\n' +
            'Why it matters: A problem that\'s too broad ("improve education") is impossible to act on. A problem that\'s too narrow ("my locker sticks") may not be worth a full project. Good projects sit in the middle: real, specific, and solvable.\n\n' +
            'Example: "Students are stressed" is too broad. "Students miss the morning bus because the sign-in line at the front office is too slow" is scoped well enough to actually work on.\n\n' +
            'Common mistake: Picking a problem so huge that no single team could meaningfully address it in one program cycle.\n\n' +
            'Try this: Take a broad problem you care about and narrow it down by asking: Who exactly? Where exactly? When exactly?\n\n' +
            'Key takeaway: The right problem is specific enough to solve, but real enough to matter.\n\n' +
            'Think about it: Is the problem you\'re considering something you could realistically make progress on this year?\n\n' +
            'Use this in your project: Rewrite your problem until you can clearly name who, where, and what.',
        },
        {
          title: 'Ethical Interviewing & Consent',
          contentType: 'reading',
          bodyMarkdown:
            'What is it: Ethical interviewing means talking to people about a problem in a way that respects their time, privacy, and right to say no, and always being honest about why you\'re asking.\n\n' +
            'Why it matters: Good research depends on people trusting you enough to be honest. If you pressure people, trick them, or use their words without permission, your research becomes unreliable, and unfair to them.\n\n' +
            'Example: Before interviewing a classmate about a problem, you explain who you are, why you\'re asking, and that they can skip any question or stop at any time.\n\n' +
            'Common mistake: Asking leading questions that push someone toward the answer you already want, or using someone\'s story without asking if that\'s okay.\n\n' +
            'Try this: Write a one-sentence introduction you\'d say before starting any interview, explaining what the interview is for and that participation is optional.\n\n' +
            'Key takeaway: People trust you with their story. Treat it that way.\n\n' +
            'Think about it: How would you feel if someone used something you said without telling you why or asking first?\n\n' +
            'Use this in your project: Use your interview introduction before collecting firsthand evidence.',
        },
        {
          title: 'Team Charter',
          contentType: 'reading',
          bodyMarkdown:
            'What is it: A Team Charter is a short, simple agreement your team makes at the start of a project: who\'s doing what, how you\'ll communicate, and how you\'ll make decisions together.\n\n' +
            'Why it matters: Teams that skip this step often run into avoidable conflict later, confusion over who\'s responsible for what, or disagreements with no clear way to resolve them.\n\n' +
            'Example: A team agrees: "We\'ll check in every Tuesday. If we disagree on a decision, we\'ll vote. If it\'s a tie, our coach breaks it."\n\n' +
            'Common mistake: Assuming everyone already agrees on roles and decision-making without ever actually saying it out loud.\n\n' +
            'Try this: With your team, write down: each person\'s role, how often you\'ll check in, and what happens when you disagree.\n\n' +
            'Key takeaway: A few minutes of agreement now saves hours of conflict later.\n\n' +
            'Think about it: What\'s one disagreement that could come up on your team, and how would you want to handle it?\n\n' +
            'Use this in your project: Save your team agreement as part of your project record.',
        },
      ],
      // The 5 named activities from docs/curriculum/02_DO/i3league-stage1-activities.md,
      // each naming its worksheet and what it feeds into.
      assignments: [
        {
          title: '3-Day Friction Hunt',
          instructions:
            'Over three days, notice and record 5–15 moments of friction, confusion, delay, or workaround using your Friction Log. This produces 5–15 logged observations that feed directly into your Stage 1 Evidence Notes.',
        },
        {
          title: 'Empathy Interview',
          instructions:
            'Talk to one person affected by the problem and record their experience in their own words, without inserting your own interpretation, using your Empathy Interview Guide. This produces one completed interview record for your Stage 1 Evidence Notes.',
        },
        {
          title: 'Scope Narrowing Drill',
          instructions:
            'Take a broad problem and narrow it by naming who, where, and when, until it\'s specific enough to act on, using your Problem Scope Worksheet. This produces one scoped problem statement that becomes part of your Validated Problem Statement.',
        },
        {
          title: 'Consent Script Practice',
          instructions:
            'Write and rehearse a one-sentence introduction explaining the interview\'s purpose and the person\'s right to skip or stop, using your Interview Consent Script. Use this consent intro before every Stage 1 and Stage 2 interview.',
        },
        {
          title: 'Team Agreement Session',
          instructions:
            'As a team, agree on roles, check-in frequency, and how disagreements will be resolved, and record it in your Team Charter. This produces one signed team agreement for your Stage 1 Evidence Notes.',
        },
      ],
    },
    [StageName.INVESTIGATE]: {
      title: 'Investigate',
      description: 'Good research can change your mind.',
      // The seven Stage 2 LEARN topics, verbatim from
      // docs/curriculum/01_LEARN/i3league-stage2-investigate-notes.md (em dashes
      // rewritten), in the curriculum's topic order. The stage page shows them
      // in working order and finds each by its position here (see
      // INVESTIGATE_SECTION_DETAILS[...].lessonIndex in src/lib/stage-copy.ts).
      lessons: [
        {
          title: "Basic Data Literacy",
          contentType: 'reading',
          bodyMarkdown: "What is it: Data literacy means being able to read and understand simple numbers and patterns (like sample size, percentages, averages, and outliers) well enough to know what they actually tell you.\n\nWhy it matters: Numbers can sound convincing even when they don't mean much. If you don't understand what's behind a statistic, you can be fooled by it, or accidentally mislead others with it.\n\nExample: “90% of students said they'd use this” sounds strong, until you learn only 10 students were asked.\n\nCommon mistake: Treating a small or unrepresentative sample as if it proves something about everyone.\n\nTry this: Find a statistic from your own research and ask: How many people was this based on? Who were they?\n\nKey takeaway: A number is only as strong as the evidence behind it.\n\nThink about it: Have you ever believed a statistic that later turned out to be less convincing once you knew the details?\n\nUse this in your project: Note the sample size next to any statistic in your Research Brief.",
        },
        {
          title: "Bias Awareness",
          contentType: 'reading',
          bodyMarkdown: "What is bias?: Bias is when research is shaped, often without meaning to, by what you already believe, how you ask a question, or who you choose to ask.\n\nWhy can it hurt research?: If your research is biased, it can “prove” what you already think instead of showing you what's actually true. That means you might build a solution for a problem that doesn't really exist the way you think it does.\n\nExample of a leading survey question: “Don't you think the cafeteria line is too slow?” This pushes people toward agreeing with you.\n\nBetter version: “How would you describe your experience with the cafeteria line?”\n\nCommon mistake: Only asking people you expect to agree with you, or wording questions so there's really only one “right” answer.\n\nTry this: Take one question from your own survey or interview and rewrite it to remove any hint of the answer you're hoping for.\n\nKey takeaway: Good research should be willing to prove you wrong.\n\nThink about it: Is there a question in your research that might be nudging people toward the answer you want?\n\nUse this in your project: Review your survey or interview questions and flag any that sound leading.",
        },
        {
          title: "Data Privacy Basics",
          contentType: 'reading',
          bodyMarkdown: "What is it: Data privacy means being thoughtful and careful about what personal information you collect from people, and making sure you only use it for the reason you said you would.\n\nWhy it matters: People trust you when they share information with you. If that information is shared carelessly, used for something else, or collected without a good reason, it damages that trust, and could actually harm someone.\n\nExample: You're only researching a lunch-line problem, but your survey also asks for students' full names, grades, and home addresses: information you don't actually need.\n\nCommon mistake: Collecting more personal information than the project actually requires, “just in case.”\n\nTry this: Look at your survey or interview questions and remove anything that isn't necessary to understand the problem.\n\nKey takeaway: Only collect what you actually need, and protect it once you have it.\n\nThink about it: If someone asked why you needed a specific piece of personal information, could you give a clear answer?\n\nUse this in your project: Check your data collection tools for any unnecessary personal questions before using them.",
        },
        {
          title: "Research Integrity",
          contentType: 'reading',
          bodyMarkdown: "What is it: Research integrity means being honest about what your research actually shows, including results that don't support your idea, instead of only reporting the parts that make your idea look good.\n\nWhy it matters: If you quietly ignore evidence that contradicts your idea, you're not really doing research anymore; you're just looking for reasons to agree with yourself. That leads to weaker projects and less trust from reviewers.\n\nExample: Three interviews support your idea, but one person raises a real concern. Leaving that concern out of your notes makes your research look stronger than it actually is.\n\nCommon mistake: Reporting only the evidence that supports your idea and quietly dropping the rest.\n\nTry this: Look back at your research notes. Is there anything you left out because it didn't support your idea? Add it back in.\n\nKey takeaway: Report what you found, not just what you hoped to find.\n\nThink about it: Have you ever noticed evidence that challenged your idea, and been tempted to ignore it?\n\nUse this in your project: Include at least one piece of evidence in your Research Brief that complicates or challenges your idea.",
        },
        {
          title: "Source Triangulation",
          contentType: 'reading',
          bodyMarkdown: "What is it: Source triangulation means checking a claim using more than one type of evidence (for example, an interview, a survey, and an article) instead of relying on just one source.\n\nWhy it matters: One survey, one article, or one interview is rarely enough to be sure something is true. Different sources can confirm each other, or reveal that your first source was incomplete or misleading.\n\nExample: An interview suggests students skip breakfast because they're rushed. A survey confirms this is common. A school schedule shows why: first period starts right after buses arrive, leaving no time.\n\nCommon mistake: Treating a single interview or article as if it settles the question.\n\nTry this: Take one claim from your research and find a second, different type of source that either supports or challenges it.\n\nKey takeaway: One source is a clue. Multiple sources are evidence.\n\nThink about it: Is there a key claim in your project that's currently only backed by one source?\n\nUse this in your project: Confirm your most important research finding using at least two different types of sources.",
        },
        {
          title: "Citation vs. Plagiarism",
          contentType: 'reading',
          bodyMarkdown: "What is it: Citation means giving credit to where information, ideas, or data came from. Plagiarism is using someone else's work or words without giving that credit, whether or not it was on purpose.\n\nWhy it matters: Giving credit isn't just a formatting rule; it's about honesty. It shows reviewers what's actually your thinking versus what you learned from someone else, and it respects the original source's work.\n\nExample: You read a great explanation of a problem in an article. Using that idea is fine, as long as you say where it came from instead of presenting it as your own original thought.\n\nCommon mistake: Copying a sentence or idea closely from a source and presenting it as your own without any credit.\n\nTry this: Go through your Research Brief and make sure every fact, quote, or idea that came from somewhere else has a source attached.\n\nKey takeaway: Credit isn't optional. It's part of being a trustworthy researcher.\n\nThink about it: Would you be comfortable if the original source of your information saw exactly how you used it?\n\nUse this in your project: Add a simple source list to your Research Brief for every fact or idea you didn't come up with yourself.\n\nCredible Sources (quick reference): Usually stronger: government sources, universities, peer-reviewed research, established nonprofits, recognized industry sources, direct expert interviews\nUse carefully: blogs, social media, forums, AI-generated summaries\nAlways ask: Who created this? Why? What evidence do they provide?",
        },
        {
          title: "Problem Ecosystem / System Mapping",
          contentType: 'reading',
          bodyMarkdown: "What is it: System mapping means looking at a problem as part of a bigger picture: identifying the different people, causes, and factors that interact with each other to create it.\n\nWhy it matters: Problems rarely have one single cause. If you only look at the most obvious cause, you might build a solution that misses the real issue, or accidentally makes a different part of the system worse.\n\nExample: Students being late to class isn't just about a crowded hallway. It also involves class schedules, locker locations, and how many students share one narrow path.\n\nCommon mistake: Assuming a problem has one simple cause when multiple factors are actually contributing.\n\nTry this: Draw a simple map of your problem: list every person, place, and factor connected to it, and draw lines showing how they affect each other.\n\nKey takeaway: Most real problems are systems, not single causes.\n\nThink about it: Is there a factor influencing your problem that you haven't considered yet?\n\nUse this in your project: Add your system map to your Research Brief alongside your root cause analysis.",
        },
      ],
      // The seven topic activities and five required supporting activities from
      // docs/curriculum/02_DO/i3league-stage2-activities.md. The stage page
      // shows the structured Do detail from stage-copy.ts; these rows are the
      // record (and the hero's activity count).
      assignments: [
        { title: "Data Reality Check", instructions: "Review one statistic from your research and identify sample size, who was included, and whether it is representative. Worksheet: Evidence Tracker. Output: 1 annotated statistic with sample-size/context notes. Contributes to: Research Brief." },
        { title: "Bias Hunt", instructions: "Review your survey/interview questions and rewrite any that are leading or loaded. Worksheet: Bias Check. Output: Revised unbiased questions. Contributes to: Research Brief / research tools." },
        { title: "Data Minimization Review", instructions: "Remove any personal information you do not actually need to answer your research question. Worksheet: Data Privacy Check. Output: Cleaned survey/interview instrument. Contributes to: Research Brief / research tools." },
        { title: "Contradicting Evidence Challenge", instructions: "Deliberately identify at least one finding that weakens, complicates, or challenges your current thinking. Worksheet: Evidence Tracker. Output: 1 documented piece of challenging evidence + interpretation. Contributes to: Research Brief." },
        { title: "Triangulate a Claim", instructions: "Take one major claim and support/check it using multiple evidence types. Worksheet: Source Triangulation Matrix. Output: 1 key claim checked against 2–3 different evidence types. Contributes to: Research Brief." },
        { title: "Source Audit", instructions: "Identify where every non-original fact, idea, image, statistic, or quote came from and check source credibility. Worksheet: Source Credibility Checklist + Evidence Tracker. Output: Completed source list + credibility review. Contributes to: Research Brief." },
        { title: "Map the System", instructions: "Identify actors, causes, constraints, feedback loops, and relationships around the problem. Worksheet: System Map. Output: 1 completed problem ecosystem map. Contributes to: Research Brief. (HS Core)" },
        { title: "Research Question Planning", instructions: "Required supporting activity. Worksheet: Research Question Planner. Output: 2–4 focused research questions. Why it's needed: Gives the investigation direction before collecting evidence." },
        { title: "Evidence Collection", instructions: "Required supporting activity. Worksheet: Survey Builder and/or Interview Question Builder. Output: Survey/interview instrument + collected responses. Why it's needed: Produces the actual evidence Stage 2 depends on." },
        { title: "Root Cause Analysis", instructions: "Required supporting activity. Worksheet: Five Whys / Root Cause Worksheet. Output: Root cause chain + proposed root cause. Why it's needed: Required by the Stage 2 advancement criteria." },
        { title: "Existing Solutions & Gap Analysis", instructions: "Required supporting activity. Worksheet: Existing Solutions & Gap Analysis. Output: Comparison of 2–4 existing approaches + identified gap. Why it's needed: Required before entering IMAGINE." },
        { title: "Stakeholder Mapping (all students)", instructions: "Required supporting activity. Worksheet: Stakeholder Map. Output: Users, beneficiaries, decision-makers, funders/supporters, influencers. Why it's needed: Strengthens later interviews, impact analysis, and implementation. Not HS-only, unlike System Mapping." },
      ],
    },
    // Stages 3-6: generated from the curriculum docs (see
    // prisma/stage-content-3-6.ts). The one-line descriptions are each
    // stage's guiding principle or question.
    [StageName.IMAGINE]: {
      title: 'Imagine',
      description: 'Create options before choosing one.',
      ...STAGE_CONTENT_3_TO_6.IMAGINE,
    },
    [StageName.ITERATE]: {
      title: 'Iterate',
      description: 'Use failure as evidence.',
      ...STAGE_CONTENT_3_TO_6.ITERATE,
    },
    [StageName.IMPACT]: {
      title: 'Impact',
      description: 'A project does not have to prove success. It has to prove learning with credible evidence.',
      ...STAGE_CONTENT_3_TO_6.IMPACT,
    },
    [StageName.INFLUENCE]: {
      title: 'Influence',
      description: 'The goal is not to sound impressive. The goal is to make a credible case for what should happen next.',
      ...STAGE_CONTENT_3_TO_6.INFLUENCE,
    },
  };

  for (const [i, stageName] of STAGE_ORDER.entries()) {
    const built = builtStageContent[stageName];

    // Not named `module` — Next's lint rules reserve that identifier since
    // this file can be compiled as CommonJS (see the ts-node invocation
    // note at the bottom of this file), where `module` is already special.
    const curriculumModule = await prisma.curriculumModule.upsert({
      where: { seasonId_stageName: { seasonId: season.id, stageName } },
      update: {},
      create: {
        seasonId: season.id,
        stageName,
        title: built?.title ?? stageName.replace('_', ' '),
        description: built?.description ?? `${stageName} stage content (seed placeholder — real copy TBD).`,
        order: i + 1,
      },
    });

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

    // Lesson/Assignment have no unique constraint to upsert on (see the
    // model — order is display-only, not a key), so guard with a count
    // check per module instead of risking duplicates on every re-run.
    if (built) {
      const hasLessons = (await prisma.lesson.count({ where: { moduleId: curriculumModule.id } })) > 0;
      if (!hasLessons) {
        for (const [lessonIndex, lesson] of built.lessons.entries()) {
          await prisma.lesson.create({
            data: { moduleId: curriculumModule.id, order: lessonIndex + 1, ...lesson },
          });
        }
      }
      const hasAssignments = (await prisma.assignment.count({ where: { moduleId: curriculumModule.id } })) > 0;
      if (!hasAssignments) {
        for (const [assignmentIndex, assignment] of built.assignments.entries()) {
          await prisma.assignment.create({
            data: { moduleId: curriculumModule.id, order: assignmentIndex + 1, ...assignment },
          });
        }
      }
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
    for (const stageName of STAGE_ORDER) {
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

  // individualStudentId has no natural key to upsert on, so this checks
  // for an existing row first — same effect as upsert, needed because this
  // script is re-run repeatedly during development, not just once on an
  // empty database.
  const mayaProject =
    (await prisma.project.findUnique({ where: { individualStudentId: maya.id } })) ??
    (await prisma.project.create({
      data: {
        title: 'Smart Irrigation for School Gardens',
        category: 'Environment',
        individualStudentId: maya.id,
        visibility: 'CONFIDENTIAL', // schema default; left explicit here for clarity
      },
    }));
  await prisma.studentProject.upsert({
    where: { studentId_projectId: { studentId: maya.id, projectId: mayaProject.id } },
    update: {},
    create: { studentId: maya.id, projectId: mayaProject.id },
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

  await prisma.safetyReview.upsert({
    where: { projectId: mayaProject.id },
    update: {},
    create: {
      projectId: mayaProject.id,
      answers: { humans: false, animals: false, chemicals: false, electricity: true, other: 'Uses a low-voltage pump' },
      isHighRisk: false,
      status: ReviewStatus.NOT_REQUIRED,
    },
  });

  // Maya's Innovation Journal — including one edited entry, append-only
  // style. JournalEntry has no unique constraint to upsert on (by design —
  // see the model comment in schema.prisma), so guard the whole group with
  // an existence check instead of risking duplicate rows on every re-run.
  const mayaHasJournalEntries = (await prisma.journalEntry.count({ where: { studentId: maya.id } })) > 0;
  if (!mayaHasJournalEntries) {
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
        text: 'Noticed the school garden beds dry out fast on the west side: measured soil moisture at 12% vs 30% on the east side.',
      },
    });
    await prisma.journalEntry.create({
      data: {
        studentId: maya.id,
        entryGroupId: 'maya-entry-2',
        version: 1,
        entryType: 'research',
        text: 'Looked into drip irrigation kits. Most are too expensive for a school budget.',
      },
    });
  }

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
    skipDuplicates: true,
  });

  // teamId has no natural key to upsert on — same find-or-create pattern as
  // mayaProject above.
  const teamProject =
    (await prisma.project.findUnique({ where: { teamId: team.id } })) ??
    (await prisma.project.create({
      data: {
        title: 'Assistive Note-Taking Tool for Dyslexic Students',
        category: 'Education',
        teamId: team.id,
        visibility: 'CONFIDENTIAL',
      },
    }));
  // One StudentProject row per current teammate — this is what lets
  // "all of this student's projects" work without walking Team/TeamMembership
  await prisma.studentProject.createMany({
    data: [
      { studentId: jordan.id, projectId: teamProject.id },
      { studentId: priya.id, projectId: teamProject.id },
    ],
    skipDuplicates: true,
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
