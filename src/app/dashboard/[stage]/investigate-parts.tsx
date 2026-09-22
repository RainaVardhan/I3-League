import type { Lesson } from "@prisma/client";
import { ActivityPanel } from "@/components/journey/ActivityPanel";
import { LessonPanel } from "@/components/journey/LessonPanel";
import type { BandPart } from "@/components/journey/TaskSection";
import sectionStyles from "@/components/journey/StageSections.module.css";
import { INVESTIGATE_PAGES, investigatePageDetail, type InvestigatePageId } from "@/lib/stage-copy";

// The Learn and Do bands of each Investigate page. Built on the server
// (lessons come from the database) and used by both the live form and the
// read-only view of a submitted stage, so the two can't differ.
//
// Formatted exactly like Insight: one Learn band headed by the lesson's name,
// one Do band headed by the activity's name with its "Not submitted" footer,
// and one Show band. Every page has at most one lesson and one (possibly
// combined) activity, so each layer is a single box.
export type InvestigatePageParts = {
  learnParts: BandPart[];
  doParts: BandPart[];
  /** How many bands the page has, Show included, for the Back / Next row's tone. */
  bandCount: number;
};

export function investigatePageParts(lessons: Lesson[], isHighSchool: boolean): Record<InvestigatePageId, InvestigatePageParts> {
  const parts = {} as Record<InvestigatePageId, InvestigatePageParts>;

  for (const page of INVESTIGATE_PAGES) {
    const detail = investigatePageDetail(page, isHighSchool);

    // Lessons are found by their position in the seeded rows (curriculum
    // topic order); the pages run in working order.
    const learnParts: BandPart[] = detail.lessons.map((ref) => {
      const lesson = lessons[ref.index];
      return {
        key: `lesson-${ref.index}`,
        title: lesson?.title ?? detail.title,
        kicker: ref.tag ? `Learn · ${ref.tag}` : undefined,
        content: lesson ? (
          <LessonPanel lesson={lesson} />
        ) : (
          <p className={sectionStyles.emptyNote}>No teaching notes for this topic yet.</p>
        ),
      };
    });

    const doParts: BandPart[] = detail.activities.map((activity) => ({
      key: activity.activity,
      title: activity.activity,
      kicker: activity.supporting ? "Do · Required supporting activity" : undefined,
      content: <ActivityPanel details={activity} />,
      // "A + B" worksheets read as "A and B" in the footer sentence.
      keep: activity.worksheet.replace(/ \+ /g, " and "),
      keepPlural: / \+ | and\/or /.test(activity.worksheet),
    }));

    parts[page] = { learnParts, doParts, bandCount: learnParts.length + doParts.length + 1 };
  }

  return parts;
}
