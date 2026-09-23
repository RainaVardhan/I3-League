"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/design-system/Button";
import buttonStyles from "@/components/design-system/Button.module.css";
import { Checkbox } from "@/components/design-system/Checkbox";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { Textarea } from "@/components/design-system/Textarea";
import { ScreenshotUpload } from "@/app/register/payment/ScreenshotUpload";
import {
  JOURNAL_ENTRY_TYPES,
  JOURNAL_STAGE_OPTIONS,
  JOURNAL_TEXT_LIMIT,
  JOURNAL_TITLE_LIMIT,
  journalEntryTypeLabel,
  journalStageLabel,
  toDateInputValue,
  toJournalAttachments,
} from "@/lib/journal";
import { reviseJournalEntryAction, type JournalFormState } from "./actions";
import styles from "./Journal.module.css";

const initialState: JournalFormState = { error: null };

// Same "General (not tied to a stage)" escape hatch as JournalComposer.
const STAGE_SELECT_OPTIONS = [...JOURNAL_STAGE_OPTIONS, { value: "", label: "General (not tied to a stage)" }];

export type EntrySnapshot = {
  entryType: string;
  title: string | null;
  stage: string | null;
  text: string | null;
  entryDate: Date;
  createdAt: Date;
  version: number;
  attachments: unknown;
};

function formatEntryDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    date,
  );
}

type JournalEntryCardProps = {
  entryGroupId: string;
  latest: EntrySnapshot;
  history: EntrySnapshot[];
  /** yyyy-mm-dd — the active season's start, the earliest date an entry can
   *  be given (matches the server's own floor in actions.ts). */
  minEntryDate: string;
};

// One row in the timeline plane (not its own floating card — see
// JournalList's comment). Collapsed, a row shows only its tags, date, and
// title, so a long timeline scans as a list of titles rather than a wall of
// text; clicking the row (or its arrow) expands it to the full entry: the
// text, any photo, an "Edited" tag when there's history, a toggle to see
// earlier versions (most recent revision first, same order as the timeline
// itself), and an inline "Add an update" form that appends a new version
// rather than editing this one — CLAUDE.md "Innovation Journal is
// append-only: edits create a new version; don't overwrite/delete history."
export function JournalEntryCard({ entryGroupId, latest, history, minEntryDate }: JournalEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revising, setRevising] = useState(false);
  const attachments = toJournalAttachments(latest.attachments);

  return (
    <li className={styles.row}>
      <button
        type="button"
        className={styles.rowSummary}
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <span className={styles.rowSummaryMain}>
          <span className={styles.rowHead}>
            <span className={styles.typeTag}>{journalEntryTypeLabel(latest.entryType)}</span>
            {journalStageLabel(latest.stage) && (
              <span className={styles.stageTag}>{journalStageLabel(latest.stage)}</span>
            )}
            {history.length > 0 && <span className={styles.editedTag}>Edited</span>}
            <span className={styles.dateTag}>{formatEntryDate(latest.entryDate)}</span>
          </span>
          <span className={styles.rowTitle}>{latest.title || "Untitled entry"}</span>
        </span>
        <svg
          className={expanded ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className={styles.rowBody}>
          {latest.text && <p className={styles.rowText}>{latest.text}</p>}

          {attachments.map((attachment) => (
            <a
              key={attachment.url}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              View photo
            </a>
          ))}

          <div className={styles.rowFoot}>
            {history.length > 0 && (
              <Button
                as="button"
                type="button"
                variant="ghost"
                showArrow={false}
                className={buttonStyles.ghostStrong}
                onClick={() => setHistoryOpen((open) => !open)}
              >
                {historyOpen ? "Hide" : "Show"} earlier version{history.length > 1 ? "s" : ""} ({history.length})
              </Button>
            )}
            <Button
              as="button"
              type="button"
              variant="ghost"
              showArrow={false}
              className={buttonStyles.ghostStrong}
              onClick={() => setRevising((open) => !open)}
            >
              {revising ? "Cancel" : "Add an update"}
            </Button>
          </div>

          {historyOpen && (
            <ol className={styles.history}>
              {history.map((version) => (
                <li key={version.version} className={styles.historyRow}>
                  <span className={styles.historyMeta}>
                    v{version.version} · {journalEntryTypeLabel(version.entryType)}
                    {journalStageLabel(version.stage) ? ` · ${journalStageLabel(version.stage)}` : ""} ·{" "}
                    {formatEntryDate(version.entryDate)}
                  </span>
                  {version.title && <p className={styles.historyTitle}>{version.title}</p>}
                  {version.text && <p className={styles.historyText}>{version.text}</p>}
                </li>
              ))}
            </ol>
          )}

          {revising && (
            <ReviseForm
              entryGroupId={entryGroupId}
              minEntryDate={minEntryDate}
              defaults={{
                entryType: latest.entryType,
                title: latest.title ?? "",
                stage: latest.stage ?? "",
                text: latest.text ?? "",
                entryDate: latest.entryDate,
                photoUrl: attachments[0]?.url ?? null,
              }}
              onSaved={() => setRevising(false)}
            />
          )}
        </div>
      )}
    </li>
  );
}

function ReviseForm({
  entryGroupId,
  minEntryDate,
  defaults,
  onSaved,
}: {
  entryGroupId: string;
  minEntryDate: string;
  defaults: { entryType: string; title: string; stage: string; text: string; entryDate: Date; photoUrl: string | null };
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState(reviseJournalEntryAction, initialState);
  const [entryType, setEntryType] = useState(defaults.entryType);
  const [title, setTitle] = useState(defaults.title);
  const [stage, setStage] = useState(defaults.stage);
  const [text, setText] = useState(defaults.text);
  const [entryDate, setEntryDate] = useState(toDateInputValue(defaults.entryDate));
  // Leaving the photo field blank on a revision used to silently drop
  // whatever photo the entry already had (persistInsight-style carry-forward
  // was missing server-side — see actions.ts's readEntryFields). The server
  // now keeps the existing photo by default; this checkbox is the only way
  // to actually remove it, and only appears when there is one to remove.
  const [removePhoto, setRemovePhoto] = useState(false);

  // Telling the PARENT to close this form is a side effect on another
  // component, not a derivation of this component's own render output — so
  // unlike JournalComposer's own reset (which only touches its own state
  // and is safe to do directly during render), this has to run in an
  // effect. Calling onSaved() straight from render, as an earlier version
  // of this file did, triggers React's "Cannot update a component while
  // rendering a different component" warning, since it setStates the
  // parent (JournalEntryCard) mid-render of this child.
  useEffect(() => {
    if (!state.error && state !== initialState) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className={styles.reviseForm}>
      <input type="hidden" name="entryGroupId" value={entryGroupId} />
      <Input
        label="Date"
        id={`entryDate-${entryGroupId}`}
        name="entryDate"
        type="date"
        min={minEntryDate}
        max={toDateInputValue(new Date())}
        value={entryDate}
        onChange={(event) => setEntryDate(event.target.value)}
        required
      />
      <Input
        label="Title"
        id={`title-${entryGroupId}`}
        name="title"
        maxLength={JOURNAL_TITLE_LIMIT}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
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
        label="Updated text"
        id={`text-${entryGroupId}`}
        name="text"
        maxLength={JOURNAL_TEXT_LIMIT}
        rows={4}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {defaults.photoUrl && !removePhoto && (
        <p className={styles.currentPhoto}>
          <a href={defaults.photoUrl} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
            View current photo
          </a>
        </p>
      )}
      <ScreenshotUpload name="photo" label={defaults.photoUrl ? "Replace photo (optional)" : "Add a photo (optional)"} />
      {defaults.photoUrl && (
        <Checkbox
          id={`removePhoto-${entryGroupId}`}
          name="removePhoto"
          checked={removePhoto}
          onChange={(event) => setRemovePhoto(event.target.checked)}
          label="Remove the current photo"
        />
      )}
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
        variant="ghost"
        className={`${styles.submitBtn} ${buttonStyles.ghostStrong}`}
      >
        {pending ? "Saving..." : "Save as new version"}
      </Button>
    </form>
  );
}
