"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StageName } from "@prisma/client";
import { Button } from "@/components/design-system/Button";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { Textarea } from "@/components/design-system/Textarea";
import { CONTRIBUTION_RESULT_LIMIT, CONTRIBUTION_TEXT_LIMIT, TEAM_STAGE_OPTIONS } from "@/lib/team-contribution-shared";
import { addTeamContributionAction, type ContributionFormState } from "./actions";
import styles from "./Team.module.css";

const initialState: ContributionFormState = { error: null };

// The six real stage options plus one explicit escape hatch for a
// contribution that isn't about any particular stage — value "" reads back
// as no stage server-side, same convention as the Journal's own stage field.
const STAGE_SELECT_OPTIONS = [...TEAM_STAGE_OPTIONS, { value: "", label: "General (not tied to a stage)" }];

type ContributionComposerProps = {
  /** The student's current stage, if they have one — pre-selects the stage
   *  field so the common case (logging about what they're working on right
   *  now) needs no extra click, while staying fully changeable. */
  defaultStage?: StageName | null;
};

// TeamContribution has three real fields beyond who/when: what a teammate
// did (description), the concrete output or finding it produced (result,
// optional — text only for now; a richer evidence type, like a linked
// worksheet, upload, or submission section, is the same deferred
// platform-evidence-model work already flagged for the six stages, not
// something to improvise here), and (optionally) which stage it was about.
// On its own page (/dashboard/team/new), same split as the Journal's
// composer: a successful save navigates back to the team page, where the
// new contribution now shows at the top of the log.
export function ContributionComposer({ defaultStage = null }: ContributionComposerProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addTeamContributionAction, initialState);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [stage, setStage] = useState<string>(defaultStage ?? "");

  useEffect(() => {
    if (!state.error && state !== initialState) router.push("/dashboard/team");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className={styles.composer}>
      <RadioGroup
        legend="Which stage is this about?"
        name="stage"
        options={STAGE_SELECT_OPTIONS}
        value={stage}
        onChange={setStage}
      />

      <Textarea
        label="What did you work on?"
        id="description"
        name="description"
        hint="A short, specific note your teammates will see: what you did, not just what you plan to do."
        maxLength={CONTRIBUTION_TEXT_LIMIT}
        rows={4}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        required
      />

      <Textarea
        label="Output or evidence (optional)"
        id="result"
        name="result"
        hint='The concrete thing that came out of it, not just that you did it, for example: "3 completed interview records; 2 students reported changing routes because of congestion."'
        maxLength={CONTRIBUTION_RESULT_LIMIT}
        rows={4}
        value={result}
        onChange={(event) => setResult(event.target.value)}
      />

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <Button as="button" type="submit" disabled={pending} showArrow={false} className={styles.submitBtn}>
        {pending ? "Saving..." : "Log contribution"}
      </Button>
    </form>
  );
}
