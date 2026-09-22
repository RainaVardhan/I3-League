import type { ReactNode } from "react";
import type { StageName } from "@prisma/client";
import { STAGE_ORDER } from "@/lib/stage-progress";
import { getStageCopy } from "@/lib/stage-copy";
import { RailHeading, StageBand, type BandTone } from "./StageBand";
import { StageClosingReflection } from "./StageClosingReflection";
import { StageReviewNote } from "./StageReviewNote";
import { StageRubricDetail } from "./StageRubricDetail";

// A stage's Review page: one railed band per topic, alternating paper and
// canvas (starting with paper), in this order: the student's own answers
// (read-only), how the stage is reviewed (the advance / revise decision), the
// full rubric behind that decision, then the closing reflection as a last
// self-check (when a Submit band follows, the reflection sits inside it, right
// above the button). Each fact appears once: the artifact, format and guiding
// question live in the stage hero, and "Must include" lives on each Show page.
// Bands for content a stage doesn't have yet are left out. A caller that adds
// its own band after these (the live Insight form's Submit) continues the
// alternation.
export function StageReviewPage({
  stageName,
  lead,
  startTone = "paper",
  submitBelow = false,
}: {
  stageName: StageName;
  lead?: ReactNode;
  /** Tone of the first band. A caller that puts its own paper band above (the
   *  live Insight form's "Your answers") passes "canvas" to keep alternating. */
  startTone?: BandTone;
  /** A Submit band follows. It carries the "revise and resubmit" reassurance
   *  and shows the closing reflection right above its button, so neither is
   *  repeated here. */
  submitBelow?: boolean;
}) {
  const copy = getStageCopy(stageName);
  const n = STAGE_ORDER.indexOf(stageName) + 1;

  const bands: { kicker: string; title: string; body: ReactNode }[] = [];
  if (lead) bands.push({ kicker: "Review", title: "Your answers", body: lead });
  bands.push({ kicker: "Review", title: "How it's reviewed", body: <StageReviewNote stageName={stageName} showRevisionNote={!submitBelow} /> });
  if (copy.detailedRubric) {
    bands.push({ kicker: "Rubric", title: "Full rubric", body: <StageRubricDetail stageName={stageName} /> });
  }
  if (copy.finalSubmission && !submitBelow) {
    bands.push({
      kicker: "Reflection",
      title: `Closing reflection for Stage ${n}`,
      body: <StageClosingReflection stageName={stageName} />,
    });
  }

  return (
    <>
      {bands.map((band, index) => (
        <StageBand
          key={band.title}
          tone={(index % 2 === 0) === (startTone === "paper") ? "paper" : "canvas"}
          rail={<RailHeading kicker={band.kicker} title={band.title} />}
        >
          {band.body}
        </StageBand>
      ))}
    </>
  );
}
