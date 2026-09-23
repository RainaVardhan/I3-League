import type { Lesson } from "@prisma/client";
import { ActivityPanel } from "@/components/journey/ActivityPanel";
import { LessonPanel } from "@/components/journey/LessonPanel";
import type { BandPart } from "@/components/journey/TaskSection";
import { pagerToneAfter } from "@/components/journey/TaskSection";
import sectionStyles from "@/components/journey/StageSections.module.css";
import { guidedPagesFor, type GuidedPage, type GuidedStage } from "@/lib/guided-stage";

// The Learn and Do bands of each page of a guided stage (Imagine, Iterate,
// Impact, Influence). Built on the server (lessons come from the database)
// and used by both the live form and the read-only view of a submitted
// stage, so the two can't differ. Same shape as investigate-parts.tsx.
//
// One Learn band headed by the lesson's name, one Do band headed by the
// activity's name with its "Not submitted" footer, and (when the page has
// fields) one Show band, so each layer is a single box.
export type GuidedPageParts = {
  learnParts: BandPart[];
  doParts: BandPart[];
  /** How many bands the page has, Show included, for the Back / Next row's tone. */
  bandCount: number;
  pagerTone: ReturnType<typeof pagerToneAfter>;
};

export function guidedPageParts(
  stage: GuidedStage,
  lessons: Lesson[],
  isHighSchool: boolean
): Record<string, GuidedPageParts> {
  const parts: Record<string, GuidedPageParts> = {};

  for (const page of guidedPagesFor(stage, isHighSchool)) {
    // An optional page says so in its kickers (the curriculum's own tag:
    // "When relevant", "Where applicable", "Stretch"); a required page has
    // plain "Learn" / "Do".
    const tag = page.optionalTag;

    // Lessons are found by their position in the seeded rows (curriculum
    // topic order); the pages run in working order.
    const learnParts: BandPart[] =
      page.lessonIndex === undefined
        ? []
        : [
            {
              key: `lesson-${page.lessonIndex}`,
              title: lessons[page.lessonIndex]?.title ?? page.title,
              kicker: tag ? `Learn · ${tag}` : undefined,
              content: lessons[page.lessonIndex] ? (
                <LessonPanel lesson={lessons[page.lessonIndex]} />
              ) : (
                <p className={sectionStyles.emptyNote}>No teaching notes for this topic yet.</p>
              ),
            },
          ];

    const doParts: BandPart[] = [
      {
        key: page.activity.activity,
        title: page.activity.activity,
        kicker: tag
          ? `Do · ${tag}`
          : page.activity.supporting && learnParts.length === 0
            ? "Do · Required supporting activity"
            : undefined,
        content: <ActivityPanel details={page.activity} />,
        // "A + B" worksheets read as "A and B" in the footer sentence.
        keep: page.activity.worksheet.replace(/ \+ /g, " and "),
        keepPlural: / \+ | and\/or /.test(page.activity.worksheet),
      },
    ];

    const bandCount = learnParts.length + doParts.length + (hasShow(page) ? 1 : 0);
    parts[page.id] = { learnParts, doParts, bandCount, pagerTone: pagerToneAfter(bandCount) };
  }

  return parts;
}

/** A page with no fields (Iterate's Usability Basics, Team Execution) is
 *  Learn + Do only and has no Show band. */
export function hasShow(page: GuidedPage): boolean {
  return page.groups.some((group) => group.fields.length > 0);
}
