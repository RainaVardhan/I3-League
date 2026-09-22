import type { ReactNode } from "react";
import type { SectionDetail } from "@/lib/stage-copy";
import { RailHeading, StageBand, type BandTone } from "./StageBand";
import styles from "./TaskSection.module.css";

/** One lesson or one activity, shown as its own band with its own heading. */
export type BandPart = {
  key: string;
  /** The band heading: the lesson or activity name. */
  title: string;
  /** Overrides the band's kicker, e.g. "Learn · HS Core" or
   *  "Do · Required supporting activity". */
  kicker?: string;
  content: ReactNode;
  /** Do only: the worksheet that stays with the student, for the band's
   *  "Not submitted" footer, and whether it names more than one. */
  keep?: string;
  keepPlural?: boolean;
};

type TaskSectionProps = {
  title: string;
  /** Omit for a required supporting activity that has no LEARN note of its
   *  own (Investigate's Research Questions, Root Cause Analysis, ...): the
   *  page then opens on its Do band, marked as a supporting activity. */
  learn?: ReactNode;
  /** A depth tag shown beside the Learn kicker, e.g. "HS Core". */
  learnTag?: string;
  /** Omit when a topic has no separate activity. */
  doItem?: ReactNode;
  /** The activity's name, shown in the Do band's rail. When omitted the
   *  activity content carries its own title. */
  doTitle?: string;
  /** Omit when a topic has no Show step of its own (Consent: its script is
   *  used before the interview, and the confirmations are on Empathy). */
  show?: ReactNode;
  /** This section's own "Must include" list, kept in the Show band's rail so
   *  it stays beside the fields as the student fills them in. */
  mustInclude?: string[];
  /** This section's "The reviewer checks" list, when the curriculum gives one. */
  reviewerChecks?: string[];
  /** Short notes under the Show heading's lists (e.g. the minimum evidence
   *  standard, or who a section is required for). */
  showNotes?: { label?: string; text: string }[];
  /** Overrides the Do band's kicker (e.g. when every activity on the page is a
   *  required supporting activity). */
  doKicker?: string;
  /** What is and is not submitted for this topic. The Do band ends with a
   *  one-line italic footer saying which worksheet stays with the student.
   *  (Each Show page's "Must include" list and fields are the submitted list,
   *  so it is not repeated.) */
  submission?: SectionDetail["submission"] & { plural?: boolean };
  /** A page with more than one lesson or activity (Investigate): each one is
   *  its own Learn or Do band, exactly like a one-topic page's, so every
   *  heading on the page is a band heading. Given, these replace
   *  learn/doItem. */
  learnParts?: BandPart[];
  doParts?: BandPart[];
};

/** The tone of the Back / Next row under a page made of `bandCount` bands:
 *  the opposite of the last band, so the tones keep alternating. Bands start
 *  on paper, so an odd count ends on paper (row: canvas, StageSections'
 *  default) and an even count ends on canvas (row: paper). */
export function pagerToneAfter(bandCount: number): BandTone {
  return bandCount % 2 === 0 ? "paper" : "canvas";
}

// One topic's Learn + Do + Show, grouped on one page (the site owner's
// preferred organization: everything about a single task in one place).
// Each layer is its own full-bleed band, alternating paper and light-blue
// canvas starting with paper, whichever layers the topic has. Each band has
// its heading stacked above the content. Review stays separate, its own page
// (see StageSections).
export function TaskSection({
  title,
  learn,
  learnTag,
  doItem,
  doTitle,
  show,
  mustInclude,
  reviewerChecks,
  showNotes,
  doKicker,
  submission,
  learnParts,
  doParts,
}: TaskSectionProps) {
  let bandIndex = 0;
  const nextTone = (): BandTone => (bandIndex++ % 2 === 0 ? "paper" : "canvas");

  const hasMustInclude = Boolean(mustInclude && mustInclude.length > 0);
  const hasChecks = Boolean(reviewerChecks && reviewerChecks.length > 0);

  const footer = (keep: string, plural = false, note?: string) => (
    <p className={styles.doFooter}>
      Not submitted: keep your {keep} yourself. {plural ? "They are" : "It is"} not uploaded.
      {note ? ` ${note}` : ""}
    </p>
  );

  return (
    <>
      {learnParts?.map((part) => (
        <StageBand key={part.key} tone={nextTone()} rail={<RailHeading kicker={part.kicker ?? "Learn"} title={part.title} />}>
          {part.content}
        </StageBand>
      ))}

      {doParts?.map((part) => (
        <StageBand key={part.key} tone={nextTone()} rail={<RailHeading kicker={part.kicker ?? "Do"} title={part.title} />}>
          {part.content}
          {part.keep && footer(part.keep, part.keepPlural)}
        </StageBand>
      ))}

      {!learnParts && learn && (
        <StageBand
          tone={nextTone()}
          rail={<RailHeading kicker={learnTag ? `Learn · ${learnTag}` : "Learn"} title={title} />}
        >
          {learn}
        </StageBand>
      )}

      {!doParts && doItem && (
        <StageBand
          tone={nextTone()}
          rail={<RailHeading kicker={doKicker ?? (learn ? "Do" : "Do · Required supporting activity")} title={doTitle} />}
        >
          {doItem}
          {submission && footer(submission.keep, submission.plural, submission.note)}
        </StageBand>
      )}

      {show && (
        <StageBand
          tone={nextTone()}
          rail={
            <div className={styles.showRail}>
              <RailHeading
                kicker="Show"
                title={hasMustInclude ? "Must include" : hasChecks ? "The reviewer checks" : undefined}
              />
              {hasMustInclude && (
                <ul className={styles.mustIncludeList}>
                  {mustInclude!.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {hasChecks && (
                <div className={styles.railGroup}>
                  {/* With a Must include list above, the checks get their own
                      small label; on their own they are the heading. */}
                  {hasMustInclude && <p className={styles.railLabel}>The reviewer checks</p>}
                  <ul className={styles.checksList}>
                    {reviewerChecks!.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {showNotes?.map((note) => (
                <div key={note.text} className={styles.railGroup}>
                  {note.label && <p className={styles.railLabel}>{note.label}</p>}
                  <p className={styles.railNote}>{note.text}</p>
                </div>
              ))}
            </div>
          }
        >
          {show}
        </StageBand>
      )}
    </>
  );
}
