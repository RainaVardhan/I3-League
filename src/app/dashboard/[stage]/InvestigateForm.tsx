"use client";

import { Fragment, useActionState, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/design-system/Button";
import { Checkbox } from "@/components/design-system/Checkbox";
import { Input } from "@/components/design-system/Input";
import { Textarea } from "@/components/design-system/Textarea";
import { AiDisclosureFields } from "@/components/journey/AiDisclosureFields";
import { MissingItemsDialog, type MissingItem } from "@/components/journey/MissingItemsDialog";
import { RailHeading, StageBand } from "@/components/journey/StageBand";
import { StageClosingReflection } from "@/components/journey/StageClosingReflection";
import { StageSections, type StageSection, type StageSectionsHandle } from "@/components/journey/StageSections";
import { SubmissionAnswers } from "@/components/journey/SubmissionAnswers";
import { TaskSection, pagerToneAfter } from "@/components/journey/TaskSection";
import { TEXT_LIMITS } from "@/lib/stage-field-limits";
import { INVESTIGATE_PAGES, investigatePageDetail, type InvestigatePageId } from "@/lib/stage-copy";
import type { InvestigatePageParts } from "./investigate-parts";
import {
  EVIDENCE_TYPES,
  investigateRequirementsFor,
  isInvestigateRequirementMet,
  type InvestigateTextKey,
} from "@/lib/investigate-requirements";
import { autosaveInvestigateAction, saveInvestigateAction, saveSafetyScreeningAction, type StageFormState } from "./actions";
import { SafetyScreeningFields, SafetyScreeningReview } from "./SafetyScreeningForm";
import {
  buildInvestigateSections,
  investigateKeepNote,
  readInvestigateAnswers,
  type InvestigateAnswers,
} from "./summary-sections";
import styles from "./StageForm.module.css";

type SafetyState = {
  status: "PENDING_REVIEW" | "CLEARED" | "REJECTED" | "NOT_REQUIRED";
  isHighRisk: boolean;
} | null;

type InvestigateFormProps = {
  isHighSchool: boolean;
  submitted: boolean;
  /** How it's reviewed + the full rubric (StageReviewPage), server-rendered. */
  reviewContent: ReactNode;
  /** Each page's Learn and Do bands' content and headings, server-rendered
   *  (see investigatePageParts in page.tsx). */
  parts: Record<InvestigatePageId, InvestigatePageParts>;
  /** The project's safety screening, or null when it hasn't been done. */
  safety: SafetyState;
  defaults: InvestigateAnswers;
};

const initialState: StageFormState = { error: null };

// The id of the screening's own (empty) <form>, which its fields join through
// the `form` attribute. See SafetyScreeningFields.
const SAFETY_FORM_ID = "safety-screening";

type FieldSpec = { key: InvestigateTextKey; label: string; hint?: string; short?: boolean };

/** One group of Show fields on a page: one per activity, under that
 *  activity's own small heading when a page has more than one. `extra` adds a
 *  non-text control before the fields (the evidence-type boxes, or the safety
 *  screening). */
type FieldGroup = {
  heading?: string;
  extra?: "evidenceTypes" | "safety";
  fields: FieldSpec[];
};

// Each page's Show fields, in order. Every field is one entry in
// src/lib/investigate-requirements.ts and traces to that page's "Must
// include" list or activity output (src/lib/stage-copy.ts).
// Instructions go in the hint above the box; the box itself starts empty.
const GROUPS: Record<InvestigatePageId, FieldGroup[]> = {
  questions: [
    {
      heading: "Research questions",
      fields: [
        {
          key: "researchQuestions",
          label: "Your 2–4 focused research questions",
          hint: "One per line. Each should be a question your research can actually answer.",
        },
      ],
    },
    {
      heading: "Bias check",
      fields: [
        {
          key: "biasRevisions",
          label: "The leading or loaded questions you found, and how you rewrote them",
          hint: "For each one, write the original question, then your better version. If none were leading, say how you checked.",
        },
      ],
    },
  ],
  privacy: [
    {
      heading: "Data minimization",
      fields: [
        {
          key: "dataMinimization",
          label: "What personal information did you remove from your survey or interview, and why didn't you need it?",
          hint: "If you only asked for what you needed from the start, list what you collect and why each piece is necessary.",
        },
      ],
    },
    { heading: "Safety screening", extra: "safety", fields: [] },
  ],
  evidence: [
    {
      heading: "Evidence collection",
      extra: "evidenceTypes",
      fields: [
        { key: "researchInstrument", label: "Your survey or interview questions (the cleaned, unbiased version)" },
        {
          key: "firsthandFindings",
          label: "What did your firsthand research find?",
          hint: "Say who you asked, how many people, and what they told you.",
        },
        {
          key: "secondaryResearch",
          label: "What does relevant secondary research say?",
          hint: "Articles, reports, or published data from credible sources. You list the sources themselves on the Sources page.",
        },
      ],
    },
    {
      heading: "Data reality check",
      fields: [
        { key: "statistic", label: "One statistic from your research" },
        { key: "statisticSampleSize", label: "How many people was it based on?", short: true },
        { key: "statisticWhoIncluded", label: "Who was included?" },
        { key: "statisticRepresentative", label: "Is it representative of the people your problem affects? Why or why not?" },
        {
          key: "researchLimitations",
          label: "What are the limitations of your research?",
          hint: "For example: a small sample, only one school, or only people you expected to agree with you.",
        },
      ],
    },
  ],
  triangulation: [
    {
      heading: "Triangulate a claim",
      fields: [
        { key: "triangulatedClaim", label: "The key claim you checked", short: true },
        {
          key: "triangulationEvidence",
          label: "The 2–3 different types of evidence you checked it against",
          hint: "For each one, name the type of evidence (interview, survey, article, published data) and what it shows.",
        },
        { key: "triangulationResult", label: "Do they support the claim, challenge it, or both?" },
      ],
    },
  ],
  integrity: [
    {
      heading: "Contradicting evidence",
      fields: [
        { key: "challengingEvidence", label: "What evidence weakens, complicates, or challenges your current thinking?" },
        { key: "challengingInterpretation", label: "What does that evidence mean for your thinking?" },
        { key: "understandingChange", label: "How did your research change or strengthen your understanding of the problem?" },
      ],
    },
  ],
  sources: [
    {
      fields: [
        {
          key: "sourceList",
          label: "Your source list",
          hint: "Every fact, idea, image, statistic, or quote you didn't come up with yourself, and where it came from. One source per line.",
        },
        {
          key: "sourceCredibility",
          label: "How credible is each source?",
          hint: "For each one ask: Who created this? Why? What evidence do they provide? Note any you used carefully, like blogs, social media, forums, or AI-generated summaries.",
        },
      ],
    },
  ],
  rootcause: [
    {
      heading: "Root cause analysis",
      fields: [
        {
          key: "rootCauseChain",
          label: "Your root cause chain (Five Whys)",
          hint: "Start with the problem and ask \u201cwhy?\u201d up to five times. One answer per line.",
        },
        {
          key: "proposedRootCause",
          label: "Your proposed root cause",
          hint: "The cause underneath the problem, not only a symptom of it.",
        },
        { key: "rootCauseEvidence", label: "Which evidence supports this root cause?" },
      ],
    },
    {
      heading: "System map",
      fields: [
        { key: "systemActors", label: "Actors: the people and groups involved" },
        { key: "systemCauses", label: "Causes: the factors that contribute to the problem" },
        { key: "systemConstraints", label: "Constraints: the limits that shape it, like time, rules, money, or space" },
        { key: "systemFeedbackLoops", label: "Feedback loops: where one part of the system makes another better or worse" },
        { key: "systemRelationships", label: "Relationships: how the actors and causes affect each other" },
      ],
    },
  ],
  gap: [
    {
      heading: "Stakeholder map",
      fields: [
        { key: "stakeholderUsers", label: "Users: who would use a solution" },
        { key: "stakeholderBeneficiaries", label: "Beneficiaries: who would benefit" },
        { key: "stakeholderDecisionMakers", label: "Decision-makers: who can approve or block a change" },
        { key: "stakeholderFunders", label: "Funders/supporters: who could fund or support it" },
        { key: "stakeholderInfluencers", label: "Influencers: who shapes what others think about it" },
      ],
    },
    {
      heading: "Existing solutions & gap",
      fields: [
        {
          key: "existingSolutions",
          label: "2–4 existing approaches, and how they compare",
          hint: "For each one: what it is, who it helps, and what it misses.",
        },
        { key: "identifiedGap", label: "The gap: what do existing approaches currently miss?" },
      ],
    },
  ],
};

// A middle school student's System Map: the same five fields as high school
// (so answers save to the same keys), asked more simply and marked optional.
const MIDDLE_SCHOOL_SYSTEM_MAP: FieldGroup = {
  heading: "System map (optional)",
  fields: [
    { key: "systemActors", label: "Who is involved in the problem?" },
    { key: "systemCauses", label: "What makes the problem happen?" },
    { key: "systemConstraints", label: "What limits make it hard to fix, like time, rules, money, or space?" },
    { key: "systemFeedbackLoops", label: "Does anything make the problem keep getting worse, or better, over time?" },
    { key: "systemRelationships", label: "How do the people and causes affect each other?" },
  ],
};

// One shared <form> across every page of the stage, organized one page per
// topic (Learn + Do + Show), the same as InsightForm; see CLAUDE.md "Stage page
// standard". Pages follow INVESTIGATE_PAGES (the working order explained in
// src/lib/stage-copy.ts). Review is the last page and holds the answers box,
// how it's reviewed, the rubric, the AI-use disclosure and the Submit button.
//
// The one exception to "one form" is the mandatory safety screening, which has
// its own server action and admin gate: its fields join a separate empty form
// through the `form` attribute (see SafetyScreeningFields), so they are never
// autosaved or submitted with the rest.
export function InvestigateForm(props: InvestigateFormProps) {
  const [state, formAction, pending] = useActionState(saveInvestigateAction, initialState);
  const [safetyState, safetyAction, safetyPending] = useActionState(saveSafetyScreeningAction, initialState);
  const [aiReady, setAiReady] = useState(true);
  const [missingOpen, setMissingOpen] = useState(false);
  const stagesRef = useRef<StageSectionsHandle>(null);

  // The Review page's "Your answers" box, and the Submit button's "what's
  // left" count, both read the form as it is right now.
  const [answers, setAnswers] = useState<InvestigateAnswers>(props.defaults);

  // Autosave, as in InsightForm: a change is sent after a short pause, and at
  // once when a field loses focus, one save at a time.
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const dirtyRef = useRef(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");
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

    try {
      const result = await autosaveInvestigateAction(data);
      setSaveError(result.error);
      setSaveStatus(result.error ? "error" : dirtyRef.current ? "unsaved" : "saved");
    } catch {
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

  // Change events bubble up the DOM, so the safety screening's fields (which
  // sit inside this form's markup but belong to their own form) reach this
  // handler too. They must not mark the stage's answers as unsaved.
  function handleChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (target.form !== formRef.current) return;
    if (formRef.current) setAnswers(readInvestigateAnswers(formRef.current));
    scheduleAutosave();
  }

  const saveNote =
    saveStatus === "unsaved"
      ? "Not saved yet"
      : saveStatus === "saving"
        ? "Saving..."
        : saveStatus === "error"
          ? saveError ?? "Not saved. Check your connection."
          : "Saved";
  const saveNoteTone = saveStatus === "error" ? "error" : saveStatus === "unsaved" || saveStatus === "saving" ? "pending" : "ok";

  // What's left: the same list the dashboard's "Finish Investigate" checklist
  // and the server's final check use. The safety screening is done once the
  // project's SafetyReview is CLEARED (read from props, so it updates when the
  // page refreshes after the screening is saved).
  const safetyCleared = props.safety?.status === "CLEARED";
  const current: Record<string, unknown> = { ...answers, safetyCleared };
  const unmet = investigateRequirementsFor(props.isHighSchool).filter(
    (item) => !item.optional && !isInvestigateRequirementMet(item, current[item.key])
  );
  const canSubmit = unmet.length === 0 && aiReady;

  const missingItems: MissingItem[] = [
    ...unmet.map((item) => {
      // The screening's label says what is actually holding it up.
      const waiting = item.key === "safetyCleared" && props.safety?.status === "PENDING_REVIEW";
      return {
        key: item.key,
        label: waiting ? "Safety screening: waiting for an admin to clear it" : item.label,
        pageId: item.page,
        pageLabel: item.pageLabel,
        // The screening's first box, or the first evidence-type box.
        field: item.key === "safetyCleared" ? "humans" : item.key,
      };
    }),
    ...(aiReady
      ? []
      : [{ key: "ai", label: "AI-use disclosure: name the tool and what you used it for", pageId: "review", pageLabel: "Review", field: "aiToolName" }]),
  ];

  function goToMissing(item: MissingItem) {
    setMissingOpen(false);
    let field = item.field;
    if (item.key === "ai") {
      const tool = document.querySelector<HTMLInputElement>('[name="aiToolName"]');
      field = tool && tool.value.trim() ? "aiPurpose" : "aiToolName";
    }
    stagesRef.current?.goTo(item.pageId, field);
  }

  function renderField(field: FieldSpec) {
    const common = {
      label: field.label,
      id: field.key,
      name: field.key,
      maxLength: TEXT_LIMITS[field.key],
      defaultValue: props.defaults[field.key],
      hint: field.hint,
    };
    return field.short ? <Input key={field.key} {...common} /> : <Textarea key={field.key} {...common} />;
  }

  function renderExtra(extra: FieldGroup["extra"]) {
    if (extra === "safety") {
      // The id is where the hub's checklist row and Next action land, whether
      // the screening is still a form or already a saved notice.
      return (
        <div id="safety-section" className={styles.safetyAnchor}>
          {props.safety ? (
            <SafetyScreeningReview isHighRisk={props.safety.isHighRisk} status={props.safety.status} />
          ) : (
            <SafetyScreeningFields formId={SAFETY_FORM_ID} error={safetyState.error} pending={safetyPending} />
          )}
        </div>
      );
    }
    if (extra === "evidenceTypes") {
      // A group of boxes, one name: FormData.getAll("evidenceTypes"). The
      // fieldset's id is where the hub's checklist link lands.
      return (
        <fieldset id="evidenceTypes" className={styles.fieldset}>
          <legend className={styles.fieldLegend}>Which types of evidence did you use? (choose at least two)</legend>
          <div className={styles.checklistGrid}>
            {EVIDENCE_TYPES.map((type, index) => (
              <Checkbox
                key={type}
                id={`evidenceTypes-${index}`}
                name="evidenceTypes"
                value={type}
                label={type}
                defaultChecked={props.defaults.evidenceTypes.includes(type)}
              />
            ))}
          </div>
        </fieldset>
      );
    }
    return null;
  }

  // A page's Show fields, one group per activity. With more than one group,
  // each opens with a small mono heading (a hairline above every group after
  // the first), the same headings the Review page's answers box uses.
  function showFor(page: InvestigatePageId): ReactNode {
    // The System Map is HS CORE: required in high school, and for a middle
    // school student swapped for a simpler, optional version (same fields).
    const groups = GROUPS[page].map((group) =>
      !props.isHighSchool && group.heading === "System map" ? MIDDLE_SCHOOL_SYSTEM_MAP : group
    );
    return groups.map((group, index) => (
      <Fragment key={group.heading ?? index}>
        {groups.length > 1 && group.heading && (
          <p className={index === 0 ? styles.sectionLabelFirst : styles.sectionLabel}>
            {group.heading}
          </p>
        )}
        {renderExtra(group.extra)}
        {group.fields.map(renderField)}
      </Fragment>
    ));
  }

  const tasks: StageSection[] = INVESTIGATE_PAGES.map((page) => {
    const detail = investigatePageDetail(page, props.isHighSchool);
    const part = props.parts[page];
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
          show={showFor(page)}
        />
      ),
      pagerTone: pagerToneAfter(part.bandCount),
    };
  });

  // Same as Insight: Submit sits in the Review page's Back / Next row, and
  // until everything is finished it opens the "what's left" popup instead of
  // submitting. The server re-validates on a real submit anyway.
  const submitAction = (
    <Button
      type={canSubmit ? "submit" : "button"}
      name={canSubmit ? "intent" : undefined}
      value={canSubmit ? "final" : undefined}
      disabled={pending}
      aria-disabled={canSubmit ? undefined : true}
      onClick={canSubmit ? undefined : () => setMissingOpen(true)}
    >
      {pending ? "Submitting…" : "Submit Investigate"}
    </Button>
  );

  const reviewContent = (
    <>
      <StageBand tone="paper" rail={<RailHeading kicker="Review" title="Your answers" />}>
        <SubmissionAnswers
          sections={buildInvestigateSections(answers, {
            isHighSchool: props.isHighSchool,
            safetyStatus: props.safety?.status ?? null,
          })}
          footnote={investigateKeepNote(props.isHighSchool)}
        />
      </StageBand>

      {props.reviewContent}

      {/* Answers is paper, then the two review bands run canvas, paper, so
          this last one is canvas. */}
      <StageBand tone="canvas" rail={<RailHeading kicker="Submit" title="Submit your answers" />}>
        <AiDisclosureFields onReadyChange={setAiReady} />

        <StageClosingReflection stageName="INVESTIGATE" />

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
    <>
      <form
        ref={formRef}
        className={styles.bands}
        action={formAction}
        onChange={handleChange}
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
      {/* The safety screening's own form. Empty on purpose: its fields live on
          the Safety Screening page and join it through the `form` attribute. */}
      <form id={SAFETY_FORM_ID} action={safetyAction} />
    </>
  );
}
