"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StageName } from "@prisma/client";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { Textarea } from "@/components/design-system/Textarea";
import { ScreenshotUpload } from "@/app/register/payment/ScreenshotUpload";
import {
  JOURNAL_ENTRY_TYPES,
  JOURNAL_STAGE_OPTIONS,
  JOURNAL_TEXT_LIMIT,
  JOURNAL_TITLE_LIMIT,
  toDateInputValue,
} from "@/lib/journal-shared";
import { createJournalEntryAction, type JournalFormState } from "./actions";
import styles from "./Journal.module.css";

const initialState: JournalFormState = { error: null };

// The six real stage options plus one explicit escape hatch for a note
// that isn't about any particular stage (e.g. a team-logistics thought) —
// value "" reads back as no stage server-side, matching the nullable
// JournalEntry.stage column, rather than forcing every entry onto one of
// the six even when it doesn't belong there.
const STAGE_SELECT_OPTIONS = [...JOURNAL_STAGE_OPTIONS, { value: "", label: "General (not tied to a stage)" }];

type JournalComposerProps = {
  /** The student's current stage, if they have one — pre-selects the
   *  stage field so the common case (logging about what they're working
   *  on right now) needs no extra click, while staying changeable. */
  defaultStage?: StageName | null;
  /** yyyy-mm-dd — the active season's start, the earliest date an entry can
   *  be given (matches the server's own floor in actions.ts). */
  minEntryDate: string;
};

// The "log a new entry" form, on its own page (/dashboard/journal/new).
// Every field is controlled rather than left to defaultValue/defaultChecked
// — React 19 resets a <form action={...}> after the action runs whether it
// succeeds or returns an error (see the Investigate fix in the Sep 21 2026
// CLAUDE.md status log), which would otherwise silently wipe a student's
// answer on a validation error. A successful save navigates back to the
// journal list, where the new entry now shows at the top.
export function JournalComposer({ defaultStage = null, minEntryDate }: JournalComposerProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createJournalEntryAction, initialState);
  const [entryType, setEntryType] = useState("");
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<string>(defaultStage ?? "");
  const [text, setText] = useState("");
  const [entryDate, setEntryDate] = useState(toDateInputValue(new Date()));

  useEffect(() => {
    if (!state.error && state !== initialState) router.push("/dashboard/journal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className={styles.composer}>
      <div className={styles.dateTitleRow}>
        <Input
          label="Title"
          id="title"
          name="title"
          maxLength={JOURNAL_TITLE_LIMIT}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <Input
          label="Date"
          id="entryDate"
          name="entryDate"
          type="date"
          min={minEntryDate}
          max={toDateInputValue(new Date())}
          value={entryDate}
          onChange={(event) => setEntryDate(event.target.value)}
          required
        />
      </div>

      <RadioGroup
        legend="Which stage is this about?"
        name="stage"
        options={STAGE_SELECT_OPTIONS}
        value={stage}
        onChange={setStage}
      />

      <RadioGroup
        legend="What kind of entry is this?"
        name="entryType"
        options={JOURNAL_ENTRY_TYPES}
        value={entryType}
        onChange={setEntryType}
        required
      />

      <Textarea
        label="What happened?"
        id="text"
        name="text"
        hint="A dated note in your own words: what you tried, saw, learned, or decided."
        maxLength={JOURNAL_TEXT_LIMIT}
        rows={6}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      <ScreenshotUpload name="photo" label="Photo (optional)" />

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <Button
        as="button"
        type="submit"
        disabled={pending}
        showArrow={false}
        className={`${styles.submitBtn} ${styles.submitRight}`}
      >
        {pending ? "Saving..." : "Add entry"}
      </Button>
    </form>
  );
}
