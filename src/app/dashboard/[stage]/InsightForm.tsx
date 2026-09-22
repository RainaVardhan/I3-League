"use client";

import { useActionState, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { Button } from "@/components/design-system/Button";
import { Checkbox } from "@/components/design-system/Checkbox";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { Textarea } from "@/components/design-system/Textarea";
import { ScreenshotUpload } from "@/app/register/payment/ScreenshotUpload";
import { AiDisclosureFields } from "@/components/journey/AiDisclosureFields";
import { RailHeading, StageBand } from "@/components/journey/StageBand";
import { SubmissionAnswers } from "@/components/journey/SubmissionAnswers";
import { MissingItemsDialog, type MissingItem } from "@/components/journey/MissingItemsDialog";
import { StageClosingReflection } from "@/components/journey/StageClosingReflection";
import { StageSections, type StageSectionsHandle } from "@/components/journey/StageSections";
import { TaskSection } from "@/components/journey/TaskSection";
import { INNOVATION_FIELDS } from "@/lib/innovation-fields";
import { TEXT_LIMITS } from "@/lib/stage-field-limits";
import { INSIGHT_SECTION_DETAILS } from "@/lib/stage-copy";
import { INSIGHT_EVIDENCE_TYPES, insightRequirementsFor, type InsightRequirementKey } from "@/lib/insight-requirements";
import { autosaveInsightAction, saveInsightAction, type StageFormState } from "./actions";
import {
  buildInsightSections,
  insightKeepNote,
  readInsightAnswers,
  type InsightAnswers,
} from "./summary-sections";
import styles from "./StageForm.module.css";

const CATEGORY_OPTIONS = INNOVATION_FIELDS.map((field) => ({ value: field, label: field }));

const EVIDENCE_TYPE_OPTIONS = INSIGHT_EVIDENCE_TYPES.map((type) => ({ value: type, label: type }));

// Words the "Solution detector" (docs/curriculum/05_BUILD/i3league-stage1-
// submission-reviewer.md Part A) checks a problem statement for. A soft,
// non-blocking warning only — it never prevents submission.
const SOLUTION_WORDS = ["app", "platform", "ai system", "website", "tool", "device", "program", "service"];

type InsightFormProps = {
  isTeamProject: boolean;
  submitted: boolean;
  reviewContent: ReactNode;
  /** This topic's Learn (lesson) + Do (activity) content, server-rendered
   *  and passed straight through — see the TaskSection usage below for how
   *  each pairs with its slice of the Show form. */
  observationLearn: ReactNode;
  observationDo: ReactNode;
  empathyLearn: ReactNode;
  empathyDo: ReactNode;
  scopeLearn: ReactNode;
  scopeDo: ReactNode;
  consentLearn: ReactNode;
  consentDo: ReactNode;
  teamLearn: ReactNode;
  teamDo: ReactNode;
  /** The photo already saved with this draft, shown in "Your answers". */
  savedPhotoUrl: string | null;
  defaultTitle: string;
  defaultCategory: string;
  defaultProblemStatement: string;
  defaultWhoIsAffected: string;
  defaultWhereItHappens: string;
  defaultWhenItHappens: string;
  defaultWhyItMatters: string;
  defaultObservations: string;
  defaultParticipantLabel: string;
  defaultParticipantConnection: string;
  defaultWhatLearned: string;
  defaultEvidenceType: string;
  defaultFirsthandEvidence: string;
  defaultConsentGiven: boolean;
  defaultPermissionToUse: boolean;
  defaultPrivacyRemoved: boolean;
  defaultRulesFollowed: boolean;
  defaultBefore: string;
  defaultNow: string;
  defaultWhatCausedChange: string;
  defaultWhyManageable: string;
  defaultTeamCharterComplete: boolean;
  defaultTeamUnderstandsProblem: boolean;
  defaultTeamUnderstandsEvidence: boolean;
  defaultTeamCanExplainLearning: boolean;
  defaultTeamAgreesRepresents: boolean;
};

const initialState: StageFormState = { error: null };

// Every field the server's final-submit validation requires (actions.ts
// saveInsightAction), tracked here too so the Submit button can stay
// disabled until the whole stage is actually finished — not just so the
// server rejects an incomplete attempt after the fact. Team confirmation
// keys only apply on a team project.
// The form tracks one boolean per requirement key; the list itself lives in
// src/lib/insight-requirements.ts so the hub checklist and this form agree.
type RequiredKey = InsightRequirementKey;

// One shared <form> across all five topic sections, organized Learn+Do+Show
// per task — the site owner's preferred organization over one Learn tab /
// one Do tab / one Show tab spanning the whole stage. Mirrors
// docs/curriculum/05_BUILD/i3league-stage1-submission-reviewer.md Part A,
// with each of its 7 sections folded into whichever topic it belongs to:
// Section 2 (observations) under Observation Skills, Sections 3+4
// (firsthand evidence + reflection) and the Responsible Research
// Confirmation under Empathy (the confirmations are about that interview's
// evidence), Sections 1+5 (problem/scope) under Problem Scope, and Section 6
// (team confirmation) under Team Charter. Ethical Interviewing & Consent is
// Learn + Do only and comes before Empathy: students learn the consent script
// before they run the interview. Section 2's "select from saved Friction
// Log entries" and Section 6's "Team Charter status read from the saved
// charter" both stay simplified — see the InsightContent comment in
// actions.ts. Each section is its own page (see StageSections). Review
// (StageReviewNote + StageRubricDetail) is the last page and also holds the
// AI-use disclosure and the Submit button. Project title/category sit on
// the Problem Scope page.
export function InsightForm(props: InsightFormProps) {
  const [state, formAction, pending] = useActionState(saveInsightAction, initialState);
  const [problemStatement, setProblemStatement] = useState(props.defaultProblemStatement);
  const [aiReady, setAiReady] = useState(true);
  const [missingOpen, setMissingOpen] = useState(false);
  const stagesRef = useRef<StageSectionsHandle>(null);

  // The Review page's "Your answers" box mirrors the form as it is right now,
  // not just what was last saved: every change re-reads the whole <form>.
  const [answers, setAnswers] = useState<InsightAnswers>(() => ({
    title: props.defaultTitle,
    category: props.defaultCategory,
    problemStatement: props.defaultProblemStatement,
    whoIsAffected: props.defaultWhoIsAffected,
    whereItHappens: props.defaultWhereItHappens,
    whenItHappens: props.defaultWhenItHappens,
    whyItMatters: props.defaultWhyItMatters,
    observations: props.defaultObservations,
    participantLabel: props.defaultParticipantLabel,
    participantConnection: props.defaultParticipantConnection,
    whatLearned: props.defaultWhatLearned,
    evidenceType: props.defaultEvidenceType,
    firsthandEvidence: props.defaultFirsthandEvidence,
    consentGiven: props.defaultConsentGiven,
    permissionToUse: props.defaultPermissionToUse,
    privacyRemoved: props.defaultPrivacyRemoved,
    rulesFollowed: props.defaultRulesFollowed,
    before: props.defaultBefore,
    now: props.defaultNow,
    whatCausedChange: props.defaultWhatCausedChange,
    whyManageable: props.defaultWhyManageable,
    teamCharterComplete: props.defaultTeamCharterComplete,
    teamUnderstandsProblem: props.defaultTeamUnderstandsProblem,
    teamUnderstandsEvidence: props.defaultTeamUnderstandsEvidence,
    teamCanExplainLearning: props.defaultTeamCanExplainLearning,
    teamAgreesRepresents: props.defaultTeamAgreesRepresents,
  }));

  // Autosave (there is no Save draft button): any change to the form is sent
  // to autosaveInsightAction after a short pause, and immediately when a
  // field loses focus. `dirty`/`saving` refs make sure only one save is in
  // flight at a time and that edits made during a save are sent right after.
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const dirtyRef = useRef(false);
  const lastPhotoRef = useRef<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");
  // The server's own message when a save is refused (e.g. an answer over its
  // length limit, or a photo of the wrong type), so the status line says what
  // is actually wrong instead of blaming the connection.
  const [saveError, setSaveError] = useState<string | null>(null);

  async function runAutosave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const form = formRef.current;
    if (!form || !dirtyRef.current) return;
    if (savingRef.current) return; // the running save re-checks dirtyRef when it ends
    savingRef.current = true;
    dirtyRef.current = false;
    setSaveStatus("saving");

    const data = new FormData(form);
    data.set("intent", "draft");
    // Send a chosen photo once, not on every later autosave.
    const photo = data.get("photo");
    if (photo instanceof File && photo.size > 0) {
      const key = `${photo.name}:${photo.size}:${photo.lastModified}`;
      if (key === lastPhotoRef.current) data.delete("photo");
      else lastPhotoRef.current = key;
    }

    try {
      const result = await autosaveInsightAction(data);
      setSaveError(result.error);
      // If more edits arrived while this save was running, they are still unsaved.
      setSaveStatus(result.error ? "error" : dirtyRef.current ? "unsaved" : "saved");
    } catch {
      // A genuine network/server failure, as opposed to a refused save above.
      setSaveError(null);
      setSaveStatus("error");
      dirtyRef.current = true;
    } finally {
      savingRef.current = false;
      if (dirtyRef.current) void runAutosave();
    }
  }

  function scheduleAutosave() {
    dirtyRef.current = true;
    setSaveStatus("unsaved");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void runAutosave(), 900);
  }

  // Shown in the middle of the pager row: whether this page's answers are
  // saved yet. "idle" is a freshly opened page (nothing has changed, so
  // everything on screen is what is stored).
  const saveNote =
    saveStatus === "unsaved"
      ? "Not saved yet"
      : saveStatus === "saving"
        ? "Saving..."
        : saveStatus === "error"
          ? saveError ?? "Not saved. Check your connection."
          : "Saved";
  const saveNoteTone = saveStatus === "error" ? "error" : saveStatus === "unsaved" || saveStatus === "saving" ? "pending" : "ok";

  const [filled, setFilled] = useState<Partial<Record<RequiredKey, boolean>>>({
    title: props.defaultTitle.trim().length > 0,
    category: props.defaultCategory.trim().length > 0,
    problemStatement: props.defaultProblemStatement.trim().length > 0,
    whoIsAffected: props.defaultWhoIsAffected.trim().length > 0,
    whereItHappens: props.defaultWhereItHappens.trim().length > 0,
    whenItHappens: props.defaultWhenItHappens.trim().length > 0,
    whyItMatters: props.defaultWhyItMatters.trim().length > 0,
    observations: props.defaultObservations.trim().length > 0,
    participantLabel: props.defaultParticipantLabel.trim().length > 0,
    participantConnection: props.defaultParticipantConnection.trim().length > 0,
    whatLearned: props.defaultWhatLearned.trim().length > 0,
    evidenceType: props.defaultEvidenceType.trim().length > 0,
    firsthandEvidence: props.defaultFirsthandEvidence.trim().length > 0,
    before: props.defaultBefore.trim().length > 0,
    now: props.defaultNow.trim().length > 0,
    whatCausedChange: props.defaultWhatCausedChange.trim().length > 0,
    whyManageable: props.defaultWhyManageable.trim().length > 0,
    consentGiven: props.defaultConsentGiven,
    permissionToUse: props.defaultPermissionToUse,
    privacyRemoved: props.defaultPrivacyRemoved,
    rulesFollowed: props.defaultRulesFollowed,
    teamUnderstandsProblem: props.defaultTeamUnderstandsProblem,
    teamUnderstandsEvidence: props.defaultTeamUnderstandsEvidence,
    teamCanExplainLearning: props.defaultTeamCanExplainLearning,
    teamAgreesRepresents: props.defaultTeamAgreesRepresents,
  });

  function markText(key: RequiredKey) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFilled((prev) => ({ ...prev, [key]: event.target.value.trim().length > 0 }));
  }

  function markCheck(key: RequiredKey) {
    return (event: ChangeEvent<HTMLInputElement>) =>
      setFilled((prev) => ({ ...prev, [key]: event.target.checked }));
  }

  // The same list the dashboard's "Finish Insight" checklist shows, filtered to
  // the items that gate Submit and are not done yet. One source of truth, so
  // the popup's count and the hub's count can never drift apart.
  const requirements = insightRequirementsFor(props.isTeamProject).filter((item) => !item.optional);
  const missingCount = requirements.filter((item) => !filled[item.key]).length + (aiReady ? 0 : 1);
  const canSubmit = missingCount === 0;

  const missingItems: MissingItem[] = [
    ...requirements
      .filter((item) => !filled[item.key])
      .map((item) => ({
        key: item.key,
        label: item.label,
        pageId: item.page,
        pageLabel: item.pageLabel,
        field: item.key,
      })),
    ...(aiReady
      ? []
      : [{ key: "ai", label: "AI-use disclosure: name the tool and what you used it for", pageId: "review", pageLabel: "Review", field: "aiToolName" }]),
  ];

  // Moves to the item's page and focuses its field. For the AI disclosure the
  // field is whichever of tool / purpose is still empty.
  function goToMissing(item: MissingItem) {
    setMissingOpen(false);
    let field = item.field;
    if (item.key === "ai") {
      const tool = document.querySelector<HTMLInputElement>('[name="aiToolName"]');
      field = tool && tool.value.trim() ? "aiPurpose" : "aiToolName";
    }
    stagesRef.current?.goTo(item.pageId, field);
  }

  const lowerStatement = problemStatement.toLowerCase();
  const flaggedWord = SOLUTION_WORDS.find((word) => lowerStatement.includes(word));

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
          learn={props.observationLearn}
          doItem={props.observationDo}
          show={
            <>
              <Textarea
                label="Your 3–5 strongest observations"
                hideLabel
                id="observations"
                name="observations"
                maxLength={TEXT_LIMITS.observations}
                defaultValue={props.defaultObservations}
                onChange={markText("observations")}
                hint="List 3–5 observations from your Friction Log, the ones that give the strongest evidence for your problem statement, not just the ones you found most interesting. One per line: what happened, who experienced it, where/when, and why it matters."
              />
              <ScreenshotUpload name="photo" label="Photo of the problem (optional)" />
            </>
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
          learn={props.consentLearn}
          doItem={props.consentDo}
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
          learn={props.empathyLearn}
          doItem={props.empathyDo}
          show={
            <>
              <div className={styles.row}>
                <Input
                  label="Who did you learn from? (a description, not necessarily a name)"
                  id="participantLabel"
                  name="participantLabel"
                  maxLength={TEXT_LIMITS.participantLabel}
                  defaultValue={props.defaultParticipantLabel}
                  onChange={markText("participantLabel")}
                  hint="For example: “9th-grade student,” “cafeteria employee.”"
                />
                <Input
                  label="How is this person connected to the problem?"
                  id="participantConnection"
                  name="participantConnection"
                  maxLength={TEXT_LIMITS.participantConnection}
                  defaultValue={props.defaultParticipantConnection}
                  onChange={markText("participantConnection")}
                />
              </div>
              <Textarea
                label="What was the most important thing this person helped you understand?"
                id="whatLearned"
                name="whatLearned"
                maxLength={TEXT_LIMITS.whatLearned}
                defaultValue={props.defaultWhatLearned}
                onChange={markText("whatLearned")}
              />
              <RadioGroup
                legend="Strongest firsthand evidence (choose one)"
                id="evidenceType"
                name="evidenceType"
                options={EVIDENCE_TYPE_OPTIONS}
                defaultValue={props.defaultEvidenceType}
                onChange={(value) => setFilled((prev) => ({ ...prev, evidenceType: value.trim().length > 0 }))}
              />
              <Textarea
                label="Evidence"
                id="firsthandEvidence"
                name="firsthandEvidence"
                maxLength={TEXT_LIMITS.firsthandEvidence}
                defaultValue={props.defaultFirsthandEvidence}
                onChange={markText("firsthandEvidence")}
              />
              <p className={styles.sectionLabel}>Responsible Research Confirmation</p>
              <div className={styles.checklistGrid}>
                <Checkbox
                  id="consentGiven"
                  name="consentGiven"
                  label="The participant agreed to speak with me"
                  defaultChecked={props.defaultConsentGiven}
                  onChange={markCheck("consentGiven")}
                />
                <Checkbox
                  id="permissionToUse"
                  name="permissionToUse"
                  label="I have permission to use the information shown here"
                  defaultChecked={props.defaultPermissionToUse}
                  onChange={markCheck("permissionToUse")}
                />
                <Checkbox
                  id="privacyRemoved"
                  name="privacyRemoved"
                  label="I removed private or sensitive information"
                  defaultChecked={props.defaultPrivacyRemoved}
                  onChange={markCheck("privacyRemoved")}
                />
                <Checkbox
                  id="rulesFollowed"
                  name="rulesFollowed"
                  label="I followed the applicable i3League research/safety rules"
                  defaultChecked={props.defaultRulesFollowed}
                  onChange={markCheck("rulesFollowed")}
                />
              </div>
              <Textarea
                label="Before observing and speaking with someone, I thought..."
                id="before"
                name="before"
                maxLength={TEXT_LIMITS.before}
                defaultValue={props.defaultBefore}
                onChange={markText("before")}
              />
              <Textarea
                label="After collecting evidence, I now think..."
                id="now"
                name="now"
                maxLength={TEXT_LIMITS.now}
                defaultValue={props.defaultNow}
                onChange={markText("now")}
              />
              <Textarea
                label="What caused that change? What observation, interview evidence, or other experience changed, strengthened, or complicated your thinking?"
                id="whatCausedChange"
                name="whatCausedChange"
                maxLength={TEXT_LIMITS.whatCausedChange}
                defaultValue={props.defaultWhatCausedChange}
                onChange={markText("whatCausedChange")}
              />
              <p className={styles.hint}>
                Your original assumption doesn&apos;t have to change. If the evidence supported it, explain
                what strengthened your confidence and why.
              </p>
            </>
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
          learn={props.scopeLearn}
          doItem={props.scopeDo}
          show={
            <>
              <Input
                label="Project title"
                id="title"
                name="title"
                maxLength={TEXT_LIMITS.title}
                defaultValue={props.defaultTitle}
                onChange={markText("title")}
              />
              <RadioGroup
                legend="Category"
                id="category"
                name="category"
                options={CATEGORY_OPTIONS}
                defaultValue={props.defaultCategory}
                onChange={(value) => setFilled((prev) => ({ ...prev, category: value.trim().length > 0 }))}
              />
              <Textarea
                label="Final problem statement"
                id="problemStatement"
                name="problemStatement"
                maxLength={TEXT_LIMITS.problemStatement}
                defaultValue={props.defaultProblemStatement}
                onChange={(event) => {
                  setProblemStatement(event.target.value);
                  markText("problemStatement")(event);
                }}
                hint="Use this pattern: [Affected group] experiences [specific problem] when/in [context], which results in [meaningful consequence]."
              />
              {flaggedWord && (
                <p className={styles.hint}>
                  Check your wording: you used &ldquo;{flaggedWord}&rdquo;. Are you describing the problem,
                  or have you already placed a solution inside it? (This won&apos;t block your submission.)
                </p>
              )}
              <div className={styles.row}>
                <Input
                  label="Who experiences the problem?"
                  id="whoIsAffected"
                  name="whoIsAffected"
                  maxLength={TEXT_LIMITS.whoIsAffected}
                  defaultValue={props.defaultWhoIsAffected}
                  onChange={markText("whoIsAffected")}
                />
                <Input
                  label="Where does it happen?"
                  id="whereItHappens"
                  name="whereItHappens"
                  maxLength={TEXT_LIMITS.whereItHappens}
                  defaultValue={props.defaultWhereItHappens}
                  onChange={markText("whereItHappens")}
                />
              </div>
              <Input
                label="When does it happen?"
                id="whenItHappens"
                name="whenItHappens"
                maxLength={TEXT_LIMITS.whenItHappens}
                defaultValue={props.defaultWhenItHappens}
                onChange={markText("whenItHappens")}
              />
              <Textarea
                label="Why does it matter? What meaningful consequence does this problem create?"
                id="whyItMatters"
                name="whyItMatters"
                maxLength={TEXT_LIMITS.whyItMatters}
                defaultValue={props.defaultWhyItMatters}
                onChange={markText("whyItMatters")}
              />
              <Textarea
                label="Why is this problem narrow enough for your team to investigate during i3League?"
                id="whyManageable"
                name="whyManageable"
                maxLength={TEXT_LIMITS.whyManageable}
                defaultValue={props.defaultWhyManageable}
                onChange={markText("whyManageable")}
              />
            </>
          }
        />
      ),
    },
    ...(props.isTeamProject
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
                learn={props.teamLearn}
                doItem={props.teamDo}
                show={
                  <div className={styles.checklistGrid}>
                    <Checkbox
                      id="teamCharterComplete"
                      name="teamCharterComplete"
                      label="Our Team Charter is complete"
                      defaultChecked={props.defaultTeamCharterComplete}
                    />
                    <Checkbox
                      id="teamUnderstandsProblem"
                      name="teamUnderstandsProblem"
                      label="I understand the problem we are submitting"
                      defaultChecked={props.defaultTeamUnderstandsProblem}
                      onChange={markCheck("teamUnderstandsProblem")}
                    />
                    <Checkbox
                      id="teamUnderstandsEvidence"
                      name="teamUnderstandsEvidence"
                      label="I understand the main evidence supporting it"
                      defaultChecked={props.defaultTeamUnderstandsEvidence}
                      onChange={markCheck("teamUnderstandsEvidence")}
                    />
                    <Checkbox
                      id="teamCanExplainLearning"
                      name="teamCanExplainLearning"
                      label="I can explain what we learned in Stage 1"
                      defaultChecked={props.defaultTeamCanExplainLearning}
                      onChange={markCheck("teamCanExplainLearning")}
                    />
                    <Checkbox
                      id="teamAgreesRepresents"
                      name="teamAgreesRepresents"
                      label="I agree this submission represents our team's current understanding"
                      defaultChecked={props.defaultTeamAgreesRepresents}
                      onChange={markCheck("teamAgreesRepresents")}
                    />
                  </div>
                }
              />
            ),
          },
        ]
      : []),
  ];

  // The Submit button lives in the Review page's Back / Next row (in line with
  // Back, on the right), not in the Submit band. Until every item is finished
  // it is a button that never submits (type="button", aria-disabled) but still
  // answers a click by opening the "what's left" popup; native `disabled`
  // would swallow that click. The server re-validates on a real submit anyway.
  const submitAction = (
    <Button
      type={canSubmit ? "submit" : "button"}
      name={canSubmit ? "intent" : undefined}
      value={canSubmit ? "final" : undefined}
      disabled={pending}
      aria-disabled={canSubmit ? undefined : true}
      onClick={canSubmit ? undefined : () => setMissingOpen(true)}
    >
      {pending ? "Submitting…" : "Submit Insight"}
    </Button>
  );
  // One <form> wraps every page (all five sections plus Review), so the one
  // Submit button on the Review page sends everything, and autosave reads
  // the whole form. `.bands` is a plain block (not the flex column `.form`
  // used elsewhere) so the full-bleed bands sit flush.
  //
  // Review is never locked here: it holds the AI-use disclosure and the
  // Submit button, the last step of the stage.
  const reviewContent = (
    <>
      {/* Everything typed so far, in one place, before the review bands. */}
      <StageBand tone="paper" rail={<RailHeading kicker="Review" title="Your answers" />}>
        <SubmissionAnswers
          sections={buildInsightSections(answers, props.isTeamProject)}
          photoUrl={props.savedPhotoUrl}
          footnote={insightKeepNote(props.isTeamProject)}
        />
      </StageBand>

      {props.reviewContent}

      {/* Answers is paper, then the two review bands run canvas, paper, so
          this last one is canvas. The closing reflection is the last thing read
          before the Submit button, which sits in the Back / Next row below. */}
      <StageBand tone="canvas" rail={<RailHeading kicker="Submit" title="Submit your answers" />}>
        <AiDisclosureFields onReadyChange={setAiReady} />

        <StageClosingReflection stageName="INSIGHT" />

        {/* Always shown: the reassurance that used to sit under the button. */}
        <p className={styles.hint}>
          Submitting doesn&apos;t mean your work has to be perfect. If the evidence isn&apos;t ready yet, your
          reviewer will tell you exactly what to strengthen before resubmitting.
        </p>

        {state.error && (
          <p className={styles.formError} role="alert">
            {state.error}
          </p>
        )}

        <MissingItemsDialog
          open={missingOpen}
          items={missingItems}
          onClose={() => setMissingOpen(false)}
          onGo={goToMissing}
        />
      </StageBand>
    </>
  );

  return (
    <form
      ref={formRef}
      className={styles.bands}
      action={formAction}
      onChange={() => {
        if (formRef.current) setAnswers(readInsightAnswers(formRef.current));
        scheduleAutosave();
      }}
      onBlur={() => void runAutosave()}
    >
      <StageSections
        ref={stagesRef}
        reviewAction={submitAction}
        tasks={tasks}
        reviewContent={reviewContent}
        reviewLocked={false}
        submitted={props.submitted}
        pagerNote={saveNote}
        pagerNoteTone={saveNoteTone}
      />
    </form>
  );
}
