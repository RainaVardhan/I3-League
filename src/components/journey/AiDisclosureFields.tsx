"use client";

import { useState } from "react";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { TEXT_LIMITS } from "@/lib/stage-field-limits";
import styles from "./AiDisclosureFields.module.css";

const USED_AI_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
] as const;

type AiDisclosureFieldsProps = {
  defaultUsedAi?: boolean;
  defaultToolName?: string;
  defaultPurpose?: string;
  defaultSelfCreatedPortion?: string;
  defaultVerificationMethod?: string;
  /** Notified on every change with whether this section is complete — "No"
   *  is always complete; "Yes" also needs a tool name and purpose. Only
   *  needed by a caller that gates a submit button on full-form readiness. */
  onReadyChange?: (ready: boolean) => void;
};

// CLAUDE.md: "AI-use disclosure is required on every stage's SUBMIT step
// (major submissions), not optional." One shared form section, self
// contained (its own toggle state), reused on every stage's final-submit
// form. Field names are fixed since only one of these ever appears per
// <form>.
export function AiDisclosureFields({
  defaultUsedAi = false,
  defaultToolName = "",
  defaultPurpose = "",
  defaultSelfCreatedPortion = "",
  defaultVerificationMethod = "",
  onReadyChange,
}: AiDisclosureFieldsProps) {
  const [usedAi, setUsedAi] = useState(defaultUsedAi ? "yes" : "no");
  const [toolName, setToolName] = useState(defaultToolName);
  const [purpose, setPurpose] = useState(defaultPurpose);

  function notify(nextUsedAi: string, nextToolName: string, nextPurpose: string) {
    const ready = nextUsedAi === "no" || (nextToolName.trim().length > 0 && nextPurpose.trim().length > 0);
    onReadyChange?.(ready);
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.sectionLabel}>AI-use disclosure (required to submit)</p>
      <RadioGroup
        legend="Did you use AI for this submission?"
        name="usedAi"
        options={USED_AI_OPTIONS}
        defaultValue={defaultUsedAi ? "yes" : "no"}
        onChange={(value) => {
          setUsedAi(value);
          notify(value, toolName, purpose);
        }}
      />
      {usedAi === "yes" && (
        <>
          <Input
            label="Which AI tool?"
            id="aiToolName"
            name="aiToolName"
            maxLength={TEXT_LIMITS.aiToolName}
            value={toolName}
            onChange={(event) => {
              setToolName(event.target.value);
              notify(usedAi, event.target.value, purpose);
            }}
          />
          <Input
            label="What did you use it for?"
            id="aiPurpose"
            name="aiPurpose"
            maxLength={TEXT_LIMITS.aiPurpose}
            value={purpose}
            onChange={(event) => {
              setPurpose(event.target.value);
              notify(usedAi, toolName, event.target.value);
            }}
          />
          <Input
            label="What part was entirely your own work?"
            id="aiSelfCreatedPortion"
            name="aiSelfCreatedPortion"
            maxLength={TEXT_LIMITS.aiSelfCreatedPortion}
            defaultValue={defaultSelfCreatedPortion}
          />
          <Input
            label="How did you check the AI's output was correct?"
            id="aiVerificationMethod"
            name="aiVerificationMethod"
            maxLength={TEXT_LIMITS.aiVerificationMethod}
            defaultValue={defaultVerificationMethod}
          />
        </>
      )}
    </div>
  );
}
