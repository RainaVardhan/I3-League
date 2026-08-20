"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/design-system/Button";
import { Checkbox } from "@/components/design-system/Checkbox";
import authFormStyles from "@/components/auth/AuthForm.module.css";
import { submitConsentAction, type ConsentState } from "./actions";
import styles from "./ConsentForm.module.css";

// Maps 1:1 onto the Consent model's required boolean fields — see
// CLAUDE.md/schema.prisma. All eight are required; this is an
// informed-consent gate, not a partial-accept form.
const CONSENT_ITEMS = [
  {
    field: "participationAccepted",
    label: "I consent to my student's participation in the I³ League program this season.",
  },
  {
    field: "privacyAccepted",
    label: (
      <>
        I have read and agree to the <Link className={styles.link} href="/privacy">Privacy Policy</Link>.
      </>
    ),
  },
  {
    field: "codeOfConductAccepted",
    label: (
      <>
        My student agrees to follow the <Link className={styles.link} href="/terms">Code of Conduct</Link>.
      </>
    ),
  },
  {
    field: "competitionRulesAccepted",
    label: (
      <>
        I have read and agree to the <Link className={styles.link} href="/competition-policies">Competition Rules</Link>.
      </>
    ),
  },
  {
    field: "academicIntegrityAccepted",
    label: "My student agrees to submit original work and give appropriate credit for outside help.",
  },
  {
    field: "aiUseAccepted",
    label: "I understand any AI use must be disclosed at every stage submission.",
  },
  {
    field: "safetyAccepted",
    label: "I understand projects involving people, animals, chemicals, or other higher-risk activities go through a safety review before my student can continue.",
  },
  {
    field: "ipPolicyAccepted",
    label: "I understand my student's project is confidential by default, and only becomes public if my student explicitly requests it.",
  },
] as const;

const initialState: ConsentState = { error: null };

export function ConsentForm({ studentId }: { studentId: string }) {
  const boundAction = submitConsentAction.bind(null, studentId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form className={authFormStyles.form} action={formAction}>
      <div className={styles.list}>
        {CONSENT_ITEMS.map((item) => (
          <Checkbox key={item.field} id={item.field} name={item.field} label={item.label} required />
        ))}
      </div>

      <div className={styles.mediaSection}>
        <Checkbox
          id="mediaConsent"
          name="mediaConsent"
          label="I also grant permission for my student's photo/video to be used in program materials (optional)."
        />
        <p className={styles.mediaHint}>Not required. You can leave this unchecked.</p>
      </div>

      {state.error && (
        <p className={authFormStyles.formError} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className={authFormStyles.submitButton}>
        {pending ? "Submitting…" : "Submit consent"}
      </Button>
    </form>
  );
}
