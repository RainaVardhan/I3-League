import type { StageName } from "@prisma/client";

/**
 * The guided-stage engine: one set of types and helpers behind the Imagine,
 * Iterate, Impact and Influence pages.
 *
 * Insight and Investigate each have a hand-built form (InsightForm,
 * InvestigateForm). By the time Investigate was done its form was almost all
 * data (a page list, a field list per page, one requirements list), so the
 * remaining four stages are built as data only: each stage is one config
 * file under src/lib/stages/, and GuidedStageForm, guided-parts.tsx, the
 * server actions, the hub checklist and the Review answers box all read that
 * config. A new page or field is one entry in one file, and the form, the
 * Submit popup, the hub's "what's left" list and the server's final check can
 * never disagree, because they are all derived from the same entry.
 *
 * Grade rules (CLAUDE.md, owner decision Sep 21 2026: no shared page with a
 * "required for high school" note): an HS CORE page is shown to high school
 * students only. A "when relevant" / "where applicable" / STRETCH page is
 * shown but optional: its fields never gate Submit.
 */

export type GuidedField = {
  /** The form field's `name`, and its key in Submission.content. */
  key: string;
  label: string;
  /** Instructions shown between the label and the box (the box starts empty). */
  hint?: string;
  /** A one-line Input instead of a Textarea. */
  short?: boolean;
  /** Fixed choices, shown as radios; the server only stores one of them. */
  options?: readonly string[];
  /** Does not gate Submit even on a required page. */
  optional?: boolean;
  /** Maximum length; defaults to 300 for a short field and 2000 otherwise. */
  limit?: number;
};

export type GuidedGroup = {
  /** Shown as a small mono heading when a page has more than one group. */
  heading?: string;
  fields: GuidedField[];
};

export type GuidedActivity = {
  activity: string;
  description?: string;
  /** The curriculum's "Why it's needed" line, for a supporting activity. */
  why?: string;
  supporting?: boolean;
  worksheet: string;
  output: string;
};

export type GuidedPage = {
  /** The `?page=` id. */
  id: string;
  /** Short name for the sidebar and the navy page bar. */
  label: string;
  /** Full page name. */
  title: string;
  /** Position of this page's lesson in the seeded Lesson rows (curriculum
   *  order). Omit for a page with no LEARN note of its own. */
  lessonIndex?: number;
  activity: GuidedActivity;
  mustInclude: string[];
  reviewerChecks: string[];
  showNotes: { label?: string; text: string }[];
  groups: GuidedGroup[];
  /** HS CORE: shown to high school students only. */
  hsOnly?: boolean;
  /** "when relevant", "where applicable" or STRETCH: shown, but nothing on
   *  it gates Submit. The value is the curriculum's own tag, shown as the
   *  page's kicker. */
  optionalTag?: "When relevant" | "Where applicable" | "Stretch";
};

export type GuidedStage = {
  stageName: StageName;
  /** The Submit button's label. */
  submitLabel: string;
  pages: GuidedPage[];
  /** Footnote under the Review page's answers box: what the answers add up
   *  to, and that worksheets stay with the student. */
  keepNote: string;
};

/** Two activities joined into one Do box (owner rule: one Learn, one Do and
 *  one Show box per page), the same way Investigate's pages do it. A
 *  supporting activity has no description, so its "Why it's needed" line
 *  follows the first activity's description as a second sentence. */
export function joinActivities(a: GuidedActivity, b: GuidedActivity): GuidedActivity {
  // "Then the Critical Assumption Selection, which creates the direct handoff into Iterate."
  const second = b.description ?? (b.why ? `Then the ${b.activity}, which ${b.why.charAt(0).toLowerCase()}${b.why.slice(1)}` : "");
  return {
    activity: `${a.activity} + ${b.activity}`,
    description: [a.description, second].filter(Boolean).join(" "),
    worksheet: `${a.worksheet} + ${b.worksheet}`,
    output: `${a.output} + ${b.output}`,
  };
}

/** The pages one student sees, in order. */
export function guidedPagesFor(stage: GuidedStage, isHighSchool: boolean): GuidedPage[] {
  return stage.pages.filter((page) => isHighSchool || !page.hsOnly);
}

/** Every field key in the stage, whichever grade, so a saved answer is never
 *  dropped when reading old content. */
export function guidedTextKeys(stage: GuidedStage): string[] {
  return stage.pages.flatMap((page) => page.groups.flatMap((group) => group.fields.map((field) => field.key)));
}

export function guidedFieldByKey(stage: GuidedStage, key: string): GuidedField | undefined {
  for (const page of stage.pages) {
    for (const group of page.groups) {
      const field = group.fields.find((item) => item.key === key);
      if (field) return field;
    }
  }
  return undefined;
}

export function guidedLimit(field: GuidedField): number {
  return field.limit ?? (field.short || field.options ? 300 : 2000);
}

export type GuidedRequirement = {
  key: string;
  label: string;
  page: string;
  pageLabel: string;
  /** Does not gate Submit (an optional page, or an optional field). */
  optional: boolean;
};

/** The single list of what this stage's submission requires for this
 *  student: one entry per field on every page they see, in page order. Read
 *  by the hub checklist, the Submit popup and the server's final check. */
export function guidedRequirementsFor(stage: GuidedStage, isHighSchool: boolean): GuidedRequirement[] {
  return guidedPagesFor(stage, isHighSchool).flatMap((page) =>
    page.groups.flatMap((group) =>
      group.fields.map((field) => ({
        key: field.key,
        label: field.label,
        page: page.id,
        pageLabel: page.label,
        optional: Boolean(page.optionalTag) || Boolean(field.optional),
      }))
    )
  );
}

export function isGuidedRequirementMet(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export type GuidedAnswers = Record<string, string>;

/** Answers from a saved Submission.content: every known key, blank when
 *  missing. Unknown keys in old drafts are ignored. */
export function guidedAnswersFromSaved(stage: GuidedStage, content: unknown): GuidedAnswers {
  const source = (content ?? {}) as Record<string, unknown>;
  const answers: GuidedAnswers = {};
  for (const key of guidedTextKeys(stage)) {
    const value = source[key];
    answers[key] = typeof value === "string" ? value : "";
  }
  return answers;
}

/** Answers read straight off the live form (or a submitted FormData). */
export function guidedAnswersFromFormData(stage: GuidedStage, data: FormData): GuidedAnswers {
  const answers: GuidedAnswers = {};
  for (const key of guidedTextKeys(stage)) answers[key] = String(data.get(key) ?? "");
  return answers;
}

export type GuidedAnswerItem = { heading: string } | { label: string; value: string };
export type GuidedAnswerSection = { title: string; items: GuidedAnswerItem[] };

/** The Review page's "Your answers" box: one section per page the student
 *  sees, with the same group headings the Show band uses. An optional page
 *  that was left entirely blank is left out rather than shown empty. */
export function buildGuidedSections(stage: GuidedStage, answers: GuidedAnswers, isHighSchool: boolean): GuidedAnswerSection[] {
  const sections: GuidedAnswerSection[] = [];
  for (const page of guidedPagesFor(stage, isHighSchool)) {
    const items: GuidedAnswerItem[] = [];
    let answered = false;
    for (const group of page.groups) {
      if (page.groups.length > 1 && group.heading) items.push({ heading: group.heading });
      for (const field of group.fields) {
        const value = answers[field.key] ?? "";
        if (value.trim()) answered = true;
        items.push({ label: field.label, value });
      }
    }
    if (items.length === 0) continue;
    if (page.optionalTag && !answered) continue;
    sections.push({ title: page.label, items });
  }
  return sections;
}
