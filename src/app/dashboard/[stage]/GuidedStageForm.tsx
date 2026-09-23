"use client";

import { Fragment, useActionState, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { Textarea } from "@/components/design-system/Textarea";
import { AiDisclosureFields } from "@/components/journey/AiDisclosureFields";
import { MissingItemsDialog, type MissingItem } from "@/components/journey/MissingItemsDialog";
import { RailHeading, StageBand } from "@/components/journey/StageBand";
import { StageClosingReflection } from "@/components/journey/StageClosingReflection";
import { StageSections, type StageSection, type StageSectionsHandle } from "@/components/journey/StageSections";
import { SubmissionAnswers } from "@/components/journey/SubmissionAnswers";
import { TaskSection } from "@/components/journey/TaskSection";
import {
  buildGuidedSections,
  guidedAnswersFromFormData,
  guidedLimit,
  guidedPagesFor,
  guidedRequirementsFor,
  isGuidedRequirementMet,
  type GuidedAnswers,
  type GuidedField,
  type GuidedPage,
} from "@/lib/guided-stage";
import { GUIDED_STAGES, type GuidedStageName } from "@/lib/stages";
import { autosaveGuidedStageAction, saveGuidedStageAction, type StageFormState } from "./actions";
import type { GuidedPageParts } from "./guided-parts";
import { hasShow } from "./guided-parts";
import styles from "./StageForm.module.css";

type GuidedStageFormProps = {
  stageName: GuidedStageName;
  isHighSchool: boolean;
  submitted: boolean;
  /** How it's reviewed + the full rubric (StageReviewPage), server-rendered. */
  reviewContent: ReactNode;
  /** Each page's Learn and Do bands' content and headings, server-rendered
   *  (see guidedPageParts in page.tsx). */
  parts: Record<string, GuidedPageParts>;
  defaults: GuidedAnswers;
};

const initialState: StageFormState = { error: null };

// One shared <form> across every page of a guided stage (Imagine, Iterate,
// Impact, Influence), organized one page per topic (Learn + Do + Show), the
// same as InsightForm and InvestigateForm; see CLAUDE.md "Stage page
// standard". Everything about the pages and fields comes from the stage's
// config in src/lib/stages/, so this component is the same for all four.
// Review is the last page and holds the answers box, how it's reviewed, the
// rubric, the AI-use disclosure and the Submit button.
export function GuidedStageForm(props: GuidedStageFormProps) {
  const stage = GUIDED_STAGES[props.stageName];
  // The server actions are shared by all four stages; the stage name is bound
  // in here and re-checked on the server.
  const saveAction = useMemo(() => saveGuidedStageAction.bind(null, props.stageName), [props.stageName]);
  const [state, formAction, pending] = useActionState(saveAction, initialState);
  const [aiReady, setAiReady] = useState(true);
  const [missingOpen, setMissingOpen] = useState(false);
  const stagesRef = useRef<StageSectionsHandle>(null);

  // The Review page's "Your answers" box, and the Submit button's "what's
  // left" count, both read the form as it is right now.
  const [answers, setAnswers] = useState<GuidedAnswers>(props.defaults);

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
      const result = await autosaveGuidedStageAction(props.stageName, data);
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

  function handleChange() {
    if (formRef.current) setAnswers(guidedAnswersFromFormData(stage, new FormData(formRef.current)));
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

  // What's left: the same list the dashboard's "Finish {stage}" checklist and
  // the server's final check use (guidedRequirementsFor).
  const unmet = guidedRequirementsFor(stage, props.isHighSchool).filter(
    (item) => !item.optional && !isGuidedRequirementMet(answers[item.key])
  );
  const canSubmit = unmet.length === 0 && aiReady;

  const missingItems: MissingItem[] = [
    ...unmet.map((item) => ({
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

  function goToMissing(item: MissingItem) {
    setMissingOpen(false);
    let field = item.field;
    if (item.key === "ai") {
      const tool = document.querySelector<HTMLInputElement>('[name="aiToolName"]');
      field = tool && tool.value.trim() ? "aiPurpose" : "aiToolName";
    }
    stagesRef.current?.goTo(item.pageId, field);
  }

  function renderField(field: GuidedField) {
    if (field.options) {
      // A fixed choice. The fieldset's id is where a checklist link lands;
      // the change handler on the form picks up the radio's change event.
      return (
        <RadioGroup
          key={field.key}
          id={field.key}
          name={field.key}
          legend={field.label}
          options={field.options.map((value) => ({ value, label: value }))}
          defaultValue={props.defaults[field.key] || undefined}
        />
      );
    }
    const common = {
      label: field.label,
      id: field.key,
      name: field.key,
      maxLength: guidedLimit(field),
      defaultValue: props.defaults[field.key],
      hint: field.hint,
    };
    return field.short ? <Input key={field.key} {...common} /> : <Textarea key={field.key} {...common} />;
  }

  // A page's Show fields, one group per activity. With more than one group,
  // each opens with a small mono heading (a hairline above every group after
  // the first), the same headings the Review page's answers box uses.
  function showFor(page: GuidedPage): ReactNode {
    if (!hasShow(page)) return undefined;
    return page.groups.map((group, index) => (
      <Fragment key={group.heading ?? index}>
        {page.groups.length > 1 && group.heading && (
          <p className={index === 0 ? styles.sectionLabelFirst : styles.sectionLabel}>{group.heading}</p>
        )}
        {group.fields.map(renderField)}
      </Fragment>
    ));
  }

  const tasks: StageSection[] = guidedPagesFor(stage, props.isHighSchool).map((page) => {
    const part = props.parts[page.id];
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
          show={showFor(page)}
        />
      ),
      pagerTone: part.pagerTone,
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
      {pending ? "Submitting…" : stage.submitLabel}
    </Button>
  );

  const reviewContent = (
    <>
      <StageBand tone="paper" rail={<RailHeading kicker="Review" title="Your answers" />}>
        <SubmissionAnswers sections={buildGuidedSections(stage, answers, props.isHighSchool)} footnote={stage.keepNote} />
      </StageBand>

      {props.reviewContent}

      {/* Answers is paper, then the two review bands run canvas, paper, so
          this last one is canvas. */}
      <StageBand tone="canvas" rail={<RailHeading kicker="Submit" title="Submit your answers" />}>
        <AiDisclosureFields onReadyChange={setAiReady} />

        <StageClosingReflection stageName={props.stageName} />

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
  );
}
