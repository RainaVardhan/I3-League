import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/auth";
import { getActiveSeason } from "@/lib/season";
import { getOrCreateStudentProject } from "@/lib/project";
import { getJourney, stageForSlug, STAGE_NUMBERS } from "@/lib/stage-progress";
import {
  INSIGHT_SECTION_DETAILS,
  INVESTIGATE_PAGES,
  investigatePageDetail,
  getStageCopy,
} from "@/lib/stage-copy";
import { isHighSchoolGrade } from "@/lib/investigate-requirements";
import { ActivityPanel } from "@/components/journey/ActivityPanel";
import { LessonPanel } from "@/components/journey/LessonPanel";
import { StageHero } from "@/components/journey/StageHero";
import { StageLayout } from "@/components/journey/StageLayout";
import { StagePlaceholder } from "@/components/journey/StagePlaceholder";
import { StageBand } from "@/components/journey/StageBand";
import { StageSections } from "@/components/journey/StageSections";
import sectionStyles from "@/components/journey/StageSections.module.css";
import { StageReviewPage } from "@/components/journey/StageReviewPage";
import { SubmissionSummary } from "@/components/journey/SubmissionSummary";
import { SubmissionAnswers } from "@/components/journey/SubmissionAnswers";
import { TaskSection, pagerToneAfter } from "@/components/journey/TaskSection";
import { InsightForm } from "./InsightForm";
import { InvestigateForm } from "./InvestigateForm";
import { investigatePageParts } from "./investigate-parts";
import { GuidedStageForm } from "./GuidedStageForm";
import { guidedPageParts, hasShow } from "./guided-parts";
import { GUIDED_STAGES, isGuidedStage } from "@/lib/stages";
import { buildGuidedSections, guidedAnswersFromSaved, guidedPagesFor } from "@/lib/guided-stage";
import type { InsightContent, InvestigateContent } from "./actions";
import {
  buildInsightSections,
  buildInvestigateSections,
  insightAnswersFromSaved,
  insightKeepNote,
  investigateAnswersFromSaved,
  investigateKeepNote,
} from "./summary-sections";
import type { SectionDetail } from "@/lib/stage-copy";
import type { Lesson, Assignment } from "@prisma/client";

export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  const stageName = stageForSlug(stage);
  return { title: stageName ? `${stageName.replace("_", " ")} | I³ League` : "I³ League" };
}

// Renders one topic's lesson, or a small "not written yet" placeholder —
// lessons/assignments have no topic tag in the schema, so which lesson
// belongs to which task is positional (seed order), same simplification as
// everywhere else this session that doesn't yet have the full
// platform-evidence-model. See prisma/seed.ts's INSIGHT/INVESTIGATE content.
function lessonAt(lessons: Lesson[], index: number) {
  const lesson = lessons[index];
  return lesson ? (
    <LessonPanel lesson={lesson} />
  ) : (
    <p className={sectionStyles.emptyNote}>No teaching notes for this topic yet.</p>
  );
}

// `details` is a topic's structured Do content (INSIGHT); without it the
// database assignment's own instructions are shown.
// INSIGHT_SECTION_DETAILS is in PAGE order (Observation, Consent, Empathy, Scope,
// Team) but the database lessons/assignments are in the company's original
// order (Observation, Empathy, Scope, Consent, Team), so the assignment index
// and the details index differ for Consent, Empathy and Scope.
function activityAt(assignments: Assignment[], index: number, details?: SectionDetail["do"]) {
  const assignment = assignments[index];
  if (details) return <ActivityPanel assignment={assignment} details={details} />;
  return assignment ? <ActivityPanel assignment={assignment} /> : null;
}

export default async function StagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage: slug } = await params;
  const stageName = stageForSlug(slug);
  if (!stageName) {
    notFound();
  }

  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({ where: { userId: appUser.id } });
  if (!student) {
    redirect("/register");
  }

  const season = await getActiveSeason();
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_seasonId: { studentId: student.id, seasonId: season.id } },
    include: { payment: true },
  });
  if (enrollment?.payment?.status !== "VERIFIED") {
    redirect("/dashboard");
  }

  const [journey, teamMembership] = await Promise.all([
    getJourney(student.id),
    prisma.teamMembership.findFirst({
      where: { studentId: student.id },
      include: { team: true },
    }),
  ]);
  const journeyItem = journey.find((item) => item.stage === stageName)!;
  const studentMeta = `Grade ${student.grade} · ${teamMembership?.team.name ?? "Individual"}`;
  const isTeamProject = Boolean(teamMembership);
  // Decides whether Investigate's HS CORE System Map is required.
  const isHighSchool = isHighSchoolGrade(student.grade);
  // Insight's fifth lesson and activity (Team Charter) only exist for team
  // projects, so an individual's hero counts one fewer of each.
  const visibleCount = (total: number) => (stageName === "INSIGHT" && !isTeamProject ? Math.max(total - 1, 0) : total);
  // A guided stage's hero counts the lessons and activities on the pages this
  // student actually sees (HS CORE pages are high school only).
  const guidedPages = isGuidedStage(stageName) ? guidedPagesFor(GUIDED_STAGES[stageName], isHighSchool) : null;

  // CLAUDE.md "Sequential stage unlocking": no direct URL to a locked stage.
  if (journeyItem.status === "LOCKED") {
    redirect("/dashboard");
  }

  const curriculumModule = await prisma.curriculumModule.findUnique({
    where: { seasonId_stageName: { seasonId: season.id, stageName } },
    include: {
      lessons: { orderBy: { order: "asc" } },
      assignments: { orderBy: { order: "asc" } },
    },
  });

  const isComplete = journeyItem.status === "COMPLETE";

  let body: React.ReactNode;

  if (stageName === "INSIGHT") {
    const project = await getOrCreateStudentProject(student.id);
    const submission = await prisma.submission.findUnique({
      where: {
        studentId_projectId_stageName: { studentId: student.id, projectId: project.id, stageName: "INSIGHT" },
      },
      include: { aiDisclosure: true },
    });
    const content = submission?.content as InsightContent | undefined;
    const lessons = curriculumModule?.lessons ?? [];
    const assignments = curriculumModule?.assignments ?? [];

    // The live form's Review page: how it's reviewed and the rubric, each its
    // own band (see StageReviewPage). InsightForm puts its own "Your answers"
    // band above these (so they start on canvas) and its Submit band below,
    // which carries the closing reflection and the revise-and-resubmit
    // reassurance.
    const reviewContent = <StageReviewPage stageName="INSIGHT" startTone="canvas" submitBelow />;

    if (isComplete && submission) {
      // Read-only: each topic recaps its own slice of the submitted
      // answers (SubmissionSummary with a filtered field list), instead of
      // the live editable fields — same task grouping as the live form.
      const tasks = [
        {
          id: "observation",
          label: "Observation Skills",
          content: (
            <TaskSection
              mustInclude={INSIGHT_SECTION_DETAILS[0].mustInclude}
              submission={INSIGHT_SECTION_DETAILS[0].submission}
              doTitle={INSIGHT_SECTION_DETAILS[0].do.activity}
              title="Observation Skills"
              learn={lessonAt(lessons, 0)}
              doItem={activityAt(assignments, 0, INSIGHT_SECTION_DETAILS[0].do)}
              show={
                <SubmissionSummary
                  fields={[{ label: "Observations", value: content?.observations ?? "" }]}
                  photoUrl={content?.photoUrl}
                  aiDisclosure={null}
                  submittedAt={null}
                />
              }
            />
          ),
        },
        {
          id: "consent",
          label: "Consent",
              content: (
            <TaskSection
              mustInclude={INSIGHT_SECTION_DETAILS[1].mustInclude}
              submission={INSIGHT_SECTION_DETAILS[1].submission}
              doTitle={INSIGHT_SECTION_DETAILS[1].do.activity}
              title="Ethical Interviewing & Consent"
              learn={lessonAt(lessons, 3)}
              doItem={activityAt(assignments, 3, INSIGHT_SECTION_DETAILS[1].do)}
            />
          ),
          // No Show band on this page, so its Back / Next row is paper to keep the bands alternating.
          pagerTone: "paper" as const,
        },
        {
          id: "empathy",
          label: "Empathy",
              content: (
            <TaskSection
              mustInclude={INSIGHT_SECTION_DETAILS[2].mustInclude}
              submission={INSIGHT_SECTION_DETAILS[2].submission}
              doTitle={INSIGHT_SECTION_DETAILS[2].do.activity}
              title="Empathy Without Assumption"
              learn={lessonAt(lessons, 1)}
              doItem={activityAt(assignments, 1, INSIGHT_SECTION_DETAILS[2].do)}
              show={
                <SubmissionSummary
                  fields={[
                    { label: "Who you learned from", value: content?.participantLabel ?? "" },
                    { label: "Their connection to the problem", value: content?.participantConnection ?? "" },
                    { label: "What you learned", value: content?.whatLearned ?? "" },
                    { label: "Strongest firsthand evidence", value: content?.evidenceType ?? "" },
                    { label: "Evidence", value: content?.firsthandEvidence ?? "" },
                    { label: "The participant agreed to speak with me", value: content?.consentGiven ? "Confirmed" : "Not confirmed" },
                    { label: "Permission to use the information", value: content?.permissionToUse ? "Confirmed" : "Not confirmed" },
                    { label: "Private/sensitive information removed", value: content?.privacyRemoved ? "Confirmed" : "Not confirmed" },
                    { label: "Research/safety rules followed", value: content?.rulesFollowed ? "Confirmed" : "Not confirmed" },
                    { label: "Before", value: content?.before ?? "" },
                    { label: "Now", value: content?.now ?? "" },
                    { label: "What caused the change", value: content?.whatCausedChange ?? "" },
                  ]}
                  aiDisclosure={null}
                  submittedAt={null}
                />
              }
            />
          ),
        },
        {
          id: "scope",
          label: "Problem Scope",
          content: (
            <TaskSection
              mustInclude={INSIGHT_SECTION_DETAILS[3].mustInclude}
              submission={INSIGHT_SECTION_DETAILS[3].submission}
              doTitle={INSIGHT_SECTION_DETAILS[3].do.activity}
              title="Problem Scope"
              learn={lessonAt(lessons, 2)}
              doItem={activityAt(assignments, 2, INSIGHT_SECTION_DETAILS[3].do)}
              show={
                <SubmissionSummary
                  fields={[
                    { label: "Project title", value: project.title },
                    { label: "Problem statement", value: content?.problemStatement ?? "" },
                    { label: "Who is affected", value: content?.whoIsAffected ?? "" },
                    { label: "Where it happens", value: content?.whereItHappens ?? "" },
                    { label: "When it happens", value: content?.whenItHappens ?? "" },
                    { label: "Why it matters", value: content?.whyItMatters ?? "" },
                    { label: "Why the scope is manageable", value: content?.whyManageable ?? "" },
                  ]}
                  aiDisclosure={null}
                  submittedAt={null}
                />
              }
            />
          ),
        },
        ...(isTeamProject
          ? [
              {
                id: "team",
                label: "Team Charter",
                content: (
                  <TaskSection
                    mustInclude={INSIGHT_SECTION_DETAILS[4].mustInclude}
              submission={INSIGHT_SECTION_DETAILS[4].submission}
                    doTitle={INSIGHT_SECTION_DETAILS[4].do.activity}
                    title="Team Charter"
                    learn={lessonAt(lessons, 4)}
                    doItem={activityAt(assignments, 4, INSIGHT_SECTION_DETAILS[4].do)}
                    show={
                      <SubmissionSummary
                        fields={[
                          { label: "Team Charter complete", value: content?.teamCharterComplete ? "Confirmed" : "Not confirmed" },
                          { label: "Understands the problem", value: content?.teamUnderstandsProblem ? "Confirmed" : "Not confirmed" },
                          { label: "Understands the evidence", value: content?.teamUnderstandsEvidence ? "Confirmed" : "Not confirmed" },
                          { label: "Can explain what was learned", value: content?.teamCanExplainLearning ? "Confirmed" : "Not confirmed" },
                          { label: "Agrees this represents the team", value: content?.teamAgreesRepresents ? "Confirmed" : "Not confirmed" },
                        ]}
                        aiDisclosure={null}
                        submittedAt={null}
                      />
                    }
                  />
                ),
              },
            ]
          : []),
      ];

      body = (
        <StageSections
          tasks={tasks}
          reviewContent={
            <StageReviewPage
              stageName="INSIGHT"
              lead={
                <SubmissionAnswers
                  sections={buildInsightSections(insightAnswersFromSaved(content, project), isTeamProject)}
                  photoUrl={content?.photoUrl}
                  aiDisclosure={submission.aiDisclosure}
                  submittedAt={submission.submittedAt}
                  footnote={insightKeepNote(isTeamProject)}
                />
              }
            />
          }
          reviewLocked={false}
          submitted
        />
      );
    } else {
      body = (
        <InsightForm
          isTeamProject={isTeamProject}
          submitted={Boolean(submission?.isFinal)}
          reviewContent={reviewContent}
          observationLearn={lessonAt(lessons, 0)}
          observationDo={activityAt(assignments, 0, INSIGHT_SECTION_DETAILS[0].do)}
          empathyLearn={lessonAt(lessons, 1)}
          empathyDo={activityAt(assignments, 1, INSIGHT_SECTION_DETAILS[2].do)}
          scopeLearn={lessonAt(lessons, 2)}
          scopeDo={activityAt(assignments, 2, INSIGHT_SECTION_DETAILS[3].do)}
          consentLearn={lessonAt(lessons, 3)}
          consentDo={activityAt(assignments, 3, INSIGHT_SECTION_DETAILS[1].do)}
          teamLearn={lessonAt(lessons, 4)}
          teamDo={activityAt(assignments, 4, INSIGHT_SECTION_DETAILS[4].do)}
          savedPhotoUrl={content?.photoUrl ?? null}
          defaultTitle={project.title === "Untitled project" ? "" : project.title}
          defaultCategory={project.category === "Other" ? "" : project.category}
          defaultProblemStatement={content?.problemStatement ?? ""}
          defaultWhoIsAffected={content?.whoIsAffected ?? ""}
          defaultWhereItHappens={content?.whereItHappens ?? ""}
          defaultWhenItHappens={content?.whenItHappens ?? ""}
          defaultWhyItMatters={content?.whyItMatters ?? ""}
          defaultObservations={content?.observations ?? ""}
          defaultParticipantLabel={content?.participantLabel ?? ""}
          defaultParticipantConnection={content?.participantConnection ?? ""}
          defaultWhatLearned={content?.whatLearned ?? ""}
          defaultEvidenceType={content?.evidenceType ?? ""}
          defaultFirsthandEvidence={content?.firsthandEvidence ?? ""}
          defaultConsentGiven={content?.consentGiven ?? false}
          defaultPermissionToUse={content?.permissionToUse ?? false}
          defaultPrivacyRemoved={content?.privacyRemoved ?? false}
          defaultRulesFollowed={content?.rulesFollowed ?? false}
          defaultBefore={content?.before ?? ""}
          defaultNow={content?.now ?? ""}
          defaultWhatCausedChange={content?.whatCausedChange ?? ""}
          defaultWhyManageable={content?.whyManageable ?? ""}
          defaultTeamCharterComplete={content?.teamCharterComplete ?? false}
          defaultTeamUnderstandsProblem={content?.teamUnderstandsProblem ?? false}
          defaultTeamUnderstandsEvidence={content?.teamUnderstandsEvidence ?? false}
          defaultTeamCanExplainLearning={content?.teamCanExplainLearning ?? false}
          defaultTeamAgreesRepresents={content?.teamAgreesRepresents ?? false}
        />
      );
    }
  } else if (stageName === "INVESTIGATE") {
    const project = await getOrCreateStudentProject(student.id);
    const [submission, safetyReview] = await Promise.all([
      prisma.submission.findUnique({
        where: {
          studentId_projectId_stageName: {
            studentId: student.id,
            projectId: project.id,
            stageName: "INVESTIGATE",
          },
        },
        include: { aiDisclosure: true },
      }),
      prisma.safetyReview.findUnique({ where: { projectId: project.id } }),
    ]);
    const content = submission?.content as Partial<InvestigateContent> | undefined;
    const lessons = curriculumModule?.lessons ?? [];
    const answers = investigateAnswersFromSaved(content);
    const safety = safetyReview ? { status: safetyReview.status, isHighRisk: safetyReview.isHighRisk } : null;

    // Each page's Learn and Do content, shared by the live form and the
    // read-only view (see investigate-parts.tsx).
    const parts = investigatePageParts(lessons, isHighSchool);

    if (isComplete && submission) {
      // Read-only: each page recaps its own slice of the submitted answers.
      const sections = buildInvestigateSections(answers, { isHighSchool, safetyStatus: safety?.status ?? null });
      const tasks = INVESTIGATE_PAGES.map((page) => {
        const detail = investigatePageDetail(page, isHighSchool);
        const part = parts[page];
        const section = sections.find((item) => item.title === detail.label);
        const fields = (section?.items ?? []).flatMap((item) =>
          item.value !== undefined ? [{ label: item.label, value: item.value }] : []
        );
        return {
          id: page,
          label: detail.label,
          content: (
            <TaskSection
              title={detail.title}
              learnParts={part.learnParts}
              doParts={part.doParts}
              mustInclude={detail.mustInclude}
              reviewerChecks={detail.reviewerChecks}
              showNotes={detail.showNotes}
                  show={<SubmissionSummary fields={fields} aiDisclosure={null} submittedAt={null} />}
            />
          ),
          pagerTone: pagerToneAfter(part.bandCount),
        };
      });

      body = (
        <StageSections
          tasks={tasks}
          reviewContent={
            <StageReviewPage
              stageName="INVESTIGATE"
              lead={
                <SubmissionAnswers
                  sections={sections}
                  aiDisclosure={submission.aiDisclosure}
                  submittedAt={submission.submittedAt}
                  footnote={investigateKeepNote(isHighSchool)}
                />
              }
            />
          }
          reviewLocked={false}
          submitted
        />
      );
    } else {
      body = (
        <InvestigateForm
          isHighSchool={isHighSchool}
          submitted={Boolean(submission?.isFinal)}
          reviewContent={<StageReviewPage stageName="INVESTIGATE" startTone="canvas" submitBelow />}
          parts={parts}
          safety={safety}
          defaults={answers}
        />
      );
    }
  } else if (isGuidedStage(stageName)) {
    // Imagine, Iterate, Impact, Influence: the guided-stage engine (see
    // src/lib/guided-stage.ts), with the same page → Learn / Do / Show
    // structure as Investigate, all driven by the stage's config.
    const stage = GUIDED_STAGES[stageName];
    const project = await getOrCreateStudentProject(student.id);
    const submission = await prisma.submission.findUnique({
      where: {
        studentId_projectId_stageName: { studentId: student.id, projectId: project.id, stageName },
      },
      include: { aiDisclosure: true },
    });
    const lessons = curriculumModule?.lessons ?? [];
    const answers = guidedAnswersFromSaved(stage, submission?.content);
    const parts = guidedPageParts(stage, lessons, isHighSchool);

    if (isComplete && submission) {
      // Read-only: each page recaps its own slice of the submitted answers.
      const sections = buildGuidedSections(stage, answers, isHighSchool);
      const tasks = guidedPagesFor(stage, isHighSchool).map((page) => {
        const part = parts[page.id];
        const section = sections.find((item) => item.title === page.label);
        const fields = (section?.items ?? []).flatMap((item) =>
          "value" in item ? [{ label: item.label, value: item.value }] : []
        );
        return {
          id: page.id,
          label: page.label,
          title: page.title,
          content: (
            <TaskSection
              title={page.title}
              learnParts={part.learnParts}
              doParts={part.doParts}
              mustInclude={page.mustInclude}
              reviewerChecks={page.reviewerChecks}
              showNotes={page.showNotes}
              show={hasShow(page) ? <SubmissionSummary fields={fields} aiDisclosure={null} submittedAt={null} /> : undefined}
            />
          ),
          pagerTone: part.pagerTone,
        };
      });

      body = (
        <StageSections
          tasks={tasks}
          reviewContent={
            <StageReviewPage
              stageName={stageName}
              lead={
                <SubmissionAnswers
                  sections={sections}
                  aiDisclosure={submission.aiDisclosure}
                  submittedAt={submission.submittedAt}
                  footnote={stage.keepNote}
                />
              }
            />
          }
          reviewLocked={false}
          submitted
        />
      );
    } else {
      body = (
        <GuidedStageForm
          stageName={stageName}
          isHighSchool={isHighSchool}
          submitted={Boolean(submission?.isFinal)}
          reviewContent={<StageReviewPage stageName={stageName} startTone="canvas" submitBelow />}
          parts={parts}
          defaults={answers}
        />
      );
    }
  } else {
    body = (
      <StageBand tone="paper">
        <StagePlaceholder stageName={stageName} isComplete={isComplete} />
      </StageBand>
    );
  }

  return (
    <StageLayout
      studentName={student.displayName ?? student.firstName}
      studentMeta={studentMeta}
      journey={journey}
      activeStage={stageName}
      isHighSchool={isHighSchool}
      isTeamProject={isTeamProject}
      title={getStageCopy(stageName).name}
      hero={
        <StageHero
          stageName={stageName}
          stageNumber={STAGE_NUMBERS[stageName]}
          status={journeyItem.status}
          lessonsCount={guidedPages ? guidedPages.filter((page) => page.lessonIndex !== undefined).length : visibleCount(curriculumModule?.lessons.length ?? 0)}
          assignmentsCount={guidedPages ? guidedPages.length : visibleCount(curriculumModule?.assignments.length ?? 0)}
        />
      }
    >
      {/* #stage-work is the deep-link target for the hub's "What's left"
          checklist items — the form for a built stage, the placeholder
          brief otherwise. */}
      <div id="stage-work">{body}</div>
    </StageLayout>
  );
}
