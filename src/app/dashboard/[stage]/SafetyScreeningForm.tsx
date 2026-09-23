"use client";

import { useState } from "react";
import { Button } from "@/components/design-system/Button";
import { Checkbox } from "@/components/design-system/Checkbox";
import { Input } from "@/components/design-system/Input";
import { Textarea } from "@/components/design-system/Textarea";
import { TEXT_LIMITS } from "@/lib/stage-field-limits";
import { Panel } from "@/components/design-system/Panel";
import { SAFETY_ITEMS, safetyDetailKey, type SafetyItemKey } from "@/lib/safety-screening";
import styles from "./StageForm.module.css";

// The screening's fields and button. They sit inside the Investigate page's
// one shared <form> (every page of the stage is part of it, see
// InvestigateForm), but HTML forms can't nest, and the screening has its own
// server action and its own admin gate. So each field names its real form
// with the `form` attribute: InvestigateForm renders an empty
// <form id={formId}> outside the shared form, and the browser submits these
// fields to that one only. They are also left out of the shared form's
// FormData, so autosave never sends them.
export function SafetyScreeningFields({
  formId,
  error,
  pending,
}: {
  formId: string;
  error: string | null;
  pending: boolean;
}) {
  // Which categories are currently checked, so a checked one can reveal its
  // own required detail box right underneath it. The screening is only ever
  // submitted once (see saveSafetyScreeningAction's existingReview check), so
  // this never needs to hydrate from a saved answer.
  const [checked, setChecked] = useState<Partial<Record<SafetyItemKey, boolean>>>({});

  return (
    <div className={styles.form}>
      <p className={styles.intro}>
        Check anything that applies to your project, and describe what it actually involves for each
        one you check. This isn&apos;t about whether your project is allowed; it&apos;s about giving an
        admin enough detail to review it if it needs one.
      </p>
      <div className={styles.checklistGrid}>
        {SAFETY_ITEMS.map((item) => (
          <div key={item.key} className={styles.safetyItem}>
            <Checkbox
              id={item.key}
              name={item.key}
              label={item.label}
              form={formId}
              onChange={(event) => setChecked((prev) => ({ ...prev, [item.key]: event.target.checked }))}
            />
            {checked[item.key] && (
              <Textarea
                label="What does this involve in your project?"
                id={safetyDetailKey(item.key)}
                name={safetyDetailKey(item.key)}
                form={formId}
                required
                maxLength={TEXT_LIMITS[safetyDetailKey(item.key)]}
                className={styles.safetyDetail}
              />
            )}
          </div>
        ))}
      </div>
      <Input
        label="Anything else worth flagging? (optional)"
        id="otherDescription"
        name="otherDescription"
        form={formId}
        maxLength={TEXT_LIMITS.otherDescription}
      />

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.buttonRow}>
        <Button type="submit" form={formId} variant="ghost" disabled={pending} showArrow={false}>
          {pending ? "Saving…" : "Save safety screening"}
        </Button>
      </div>
      <p className={styles.hint}>
        Once saved, the screening can&apos;t be changed. If anything is checked, an admin reviews the project
        before you can submit Investigate.
      </p>
    </div>
  );
}

export function SafetyScreeningReview({
  isHighRisk,
  status,
}: {
  isHighRisk: boolean;
  status: "PENDING_REVIEW" | "CLEARED" | "REJECTED" | "NOT_REQUIRED";
}) {
  if (status === "PENDING_REVIEW") {
    return (
      <p className={styles.highRiskNotice}>
        Safety screening submitted. This project needs an admin to review it before Investigate can
        be completed. This usually happens within a day or two.
      </p>
    );
  }
  if (status === "REJECTED") {
    return (
      <p className={styles.highRiskNotice}>
        This project&apos;s safety review wasn&apos;t cleared. Please contact an admin.
      </p>
    );
  }
  return (
    <Panel variant="standard">
      <p className={styles.clearedNotice}>
        {isHighRisk
          ? "Safety screening cleared by an admin. You're good to continue."
          : "Safety screening complete. No risk factors flagged."}
      </p>
    </Panel>
  );
}
