"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/design-system/Button";
import { Checkbox } from "@/components/design-system/Checkbox";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { INNOVATION_FIELDS } from "@/lib/innovation-fields";
import authFormStyles from "@/components/auth/AuthForm.module.css";
import { studentRegisterAction, type RegisterState } from "./actions";
import styles from "./StudentRegistrationForm.module.css";

const SCHOOLING_OPTIONS = [
  { value: "SCHOOL", label: "I attend a school" },
  { value: "HOMESCHOOL", label: "I'm homeschooled" },
] as const;

const PARTICIPATION_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "TEAM", label: "Team" },
] as const;

const TEAM_MODE_OPTIONS = [
  { value: "CREATE", label: "Create a new team" },
  { value: "JOIN", label: "Join with a code" },
] as const;

const initialState: RegisterState = { error: null };

export function StudentRegistrationForm() {
  const [state, formAction, pending] = useActionState(studentRegisterAction, initialState);
  const [schoolingType, setSchoolingType] = useState<string>("SCHOOL");
  const [participationType, setParticipationType] = useState<string>("INDIVIDUAL");
  const [teamMode, setTeamMode] = useState<string>("CREATE");

  return (
    <form className={authFormStyles.form} action={formAction}>
      <p className={styles.sectionLabelFirst}>About you</p>
      <div className={styles.row}>
        <Input label="First name" id="firstName" name="firstName" autoComplete="given-name" required />
        <Input label="Last name" id="lastName" name="lastName" autoComplete="family-name" required />
      </div>
      <div className={styles.row}>
        <Input label="Date of birth" id="dateOfBirth" name="dateOfBirth" type="date" required />
        <Input label="Grade" id="grade" name="grade" placeholder="e.g. 8" required />
      </div>

      <RadioGroup
        legend="Schooling"
        name="schoolingType"
        options={SCHOOLING_OPTIONS}
        defaultValue="SCHOOL"
        required
        onChange={setSchoolingType}
      />
      {schoolingType === "SCHOOL" ? (
        <div className={styles.subFields}>
          <Input label="School name" id="schoolName" name="schoolName" required />
          <div className={styles.row}>
            <Input label="School city" id="schoolCity" name="schoolCity" required />
            <Input label="School state" id="schoolState" name="schoolState" required />
          </div>
        </div>
      ) : (
        <div className={styles.subFields}>
          <Input label="Homeschool program name" id="homeschoolName" name="homeschoolName" required />
        </div>
      )}

      <div className={styles.row}>
        <Input label="City" id="city" name="city" required />
        <Input label="State" id="state" name="state" required />
      </div>
      <Input label="Country" id="country" name="country" defaultValue="USA" required />

      <Input
        label="Parent / guardian email"
        id="guardianEmail"
        name="guardianEmail"
        type="email"
        required
      />

      <fieldset className={styles.plainFieldset}>
        <legend className={styles.sectionLabel}>Interests</legend>
        <div className={styles.interestsGrid}>
          {INNOVATION_FIELDS.map((field) => (
            <Checkbox key={field} id={`interest-${field}`} name="interests" value={field} label={field} />
          ))}
        </div>
      </fieldset>

      <p className={styles.sectionLabel}>Participation</p>
      <RadioGroup
        legend="How are you participating?"
        name="participationType"
        options={PARTICIPATION_OPTIONS}
        defaultValue="INDIVIDUAL"
        required
        onChange={setParticipationType}
      />

      {participationType === "TEAM" && (
        <div className={styles.subFields}>
          <RadioGroup
            legend="Team"
            name="teamMode"
            options={TEAM_MODE_OPTIONS}
            defaultValue="CREATE"
            onChange={setTeamMode}
          />
          {teamMode === "CREATE" ? (
            <Input label="Team name" id="teamName" name="teamName" required />
          ) : (
            <Input
              label="Join code"
              id="joinCode"
              name="joinCode"
              placeholder="6-character code from your teammate"
              required
            />
          )}
        </div>
      )}

      {state.error && (
        <p className={authFormStyles.formError} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className={authFormStyles.submitButton}>
        {pending ? "Saving…" : "Continue to payment"}
      </Button>
    </form>
  );
}
