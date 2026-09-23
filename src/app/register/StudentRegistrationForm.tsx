"use client";

import { useActionState, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/design-system/Button";
import { Checkbox } from "@/components/design-system/Checkbox";
import { Input } from "@/components/design-system/Input";
import { RadioGroup } from "@/components/design-system/RadioGroup";
import { INNOVATION_FIELDS } from "@/lib/innovation-fields";
import {
  COUNTRY_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  GRADE_MAX_LENGTH,
  JOIN_CODE_MAX_LENGTH,
  TEAM_NAME_MAX_LENGTH,
} from "@/lib/account-field-limits";
import { NAME_MAX_LENGTH, PLACE_MAX_LENGTH } from "@/lib/reasonable-text";
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

type TextField =
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "grade"
  | "schoolName"
  | "schoolCity"
  | "schoolState"
  | "homeschoolName"
  | "city"
  | "state"
  | "country"
  | "guardianEmail"
  | "teamName"
  | "joinCode";

const TEXT_FIELD_DEFAULTS: Record<TextField, string> = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  grade: "",
  schoolName: "",
  schoolCity: "",
  schoolState: "",
  homeschoolName: "",
  city: "",
  state: "",
  country: "USA",
  guardianEmail: "",
  teamName: "",
  joinCode: "",
};

export function StudentRegistrationForm() {
  const [state, formAction, pending] = useActionState(studentRegisterAction, initialState);

  // Every field is controlled (value + onChange), not just the ones that
  // drive conditional rendering — React 19 resets a <form action={...}> after
  // every call, success or error, which silently wipes an uncontrolled
  // field's typed value the moment the server flags one problem elsewhere on
  // a long form. See the Sep 21 2026 CLAUDE.md status log entry on the same
  // bug in InvestigateForm.
  const [values, setValues] = useState<Record<TextField, string>>(TEXT_FIELD_DEFAULTS);
  const [schoolingType, setSchoolingType] = useState<string>("SCHOOL");
  const [participationType, setParticipationType] = useState<string>("INDIVIDUAL");
  const [teamMode, setTeamMode] = useState<string>("CREATE");
  const [interests, setInterests] = useState<Set<string>>(new Set());

  function handleTextChange(field: TextField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function toggleInterest(field: string, checked: boolean) {
    setInterests((prev) => {
      const next = new Set(prev);
      if (checked) next.add(field);
      else next.delete(field);
      return next;
    });
  }

  const flagged = state.fields ?? [];
  // A single flagged field gets the server's own specific message; several
  // at once (e.g. every required field left blank) each get a short,
  // non-repetitive prompt instead of the same long sentence under every box.
  function fieldError(field: string): string | undefined {
    if (!flagged.includes(field)) return undefined;
    return flagged.length === 1 ? state.error ?? undefined : "Please fill this in.";
  }

  return (
    <form className={authFormStyles.form} action={formAction}>
      <p className={styles.sectionLabelFirst}>About you</p>
      <div className={styles.row}>
        <Input
          label="First name"
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          required
          maxLength={NAME_MAX_LENGTH}
          value={values.firstName}
          onChange={handleTextChange("firstName")}
          error={fieldError("firstName")}
        />
        <Input
          label="Last name"
          id="lastName"
          name="lastName"
          autoComplete="family-name"
          required
          maxLength={NAME_MAX_LENGTH}
          value={values.lastName}
          onChange={handleTextChange("lastName")}
          error={fieldError("lastName")}
        />
      </div>
      <div className={styles.row}>
        <Input
          label="Date of birth"
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          required
          value={values.dateOfBirth}
          onChange={handleTextChange("dateOfBirth")}
          error={fieldError("dateOfBirth")}
        />
        <Input
          label="Grade"
          id="grade"
          name="grade"
          placeholder="e.g. 8"
          required
          maxLength={GRADE_MAX_LENGTH}
          value={values.grade}
          onChange={handleTextChange("grade")}
          error={fieldError("grade")}
        />
      </div>

      <RadioGroup
        legend="Schooling"
        name="schoolingType"
        options={SCHOOLING_OPTIONS}
        value={schoolingType}
        required
        onChange={setSchoolingType}
        error={fieldError("schoolingType")}
      />
      {schoolingType === "SCHOOL" ? (
        <div className={styles.subFields}>
          <Input
            label="School name"
            id="schoolName"
            name="schoolName"
            required
            maxLength={PLACE_MAX_LENGTH}
            value={values.schoolName}
            onChange={handleTextChange("schoolName")}
            error={fieldError("schoolName")}
          />
          <div className={styles.row}>
            <Input
              label="School city"
              id="schoolCity"
              name="schoolCity"
              required
              maxLength={PLACE_MAX_LENGTH}
              value={values.schoolCity}
              onChange={handleTextChange("schoolCity")}
              error={fieldError("schoolCity")}
            />
            <Input
              label="School state"
              id="schoolState"
              name="schoolState"
              required
              maxLength={PLACE_MAX_LENGTH}
              value={values.schoolState}
              onChange={handleTextChange("schoolState")}
              error={fieldError("schoolState")}
            />
          </div>
        </div>
      ) : (
        <div className={styles.subFields}>
          <Input
            label="Homeschool program name (optional)"
            id="homeschoolName"
            name="homeschoolName"
            maxLength={PLACE_MAX_LENGTH}
            value={values.homeschoolName}
            onChange={handleTextChange("homeschoolName")}
            error={fieldError("homeschoolName")}
          />
        </div>
      )}

      <div className={styles.row}>
        <Input
          label="City"
          id="city"
          name="city"
          required
          maxLength={PLACE_MAX_LENGTH}
          value={values.city}
          onChange={handleTextChange("city")}
          error={fieldError("city")}
        />
        <Input
          label="State"
          id="state"
          name="state"
          required
          maxLength={PLACE_MAX_LENGTH}
          value={values.state}
          onChange={handleTextChange("state")}
          error={fieldError("state")}
        />
      </div>
      <Input
        label="Country"
        id="country"
        name="country"
        required
        maxLength={COUNTRY_MAX_LENGTH}
        value={values.country}
        onChange={handleTextChange("country")}
        error={fieldError("country")}
      />

      <Input
        label="Parent / guardian email"
        id="guardianEmail"
        name="guardianEmail"
        type="email"
        required
        maxLength={EMAIL_MAX_LENGTH}
        value={values.guardianEmail}
        onChange={handleTextChange("guardianEmail")}
        error={fieldError("guardianEmail")}
      />

      <fieldset className={styles.plainFieldset}>
        <legend className={styles.sectionLabel}>Interests</legend>
        <div
          className={
            fieldError("interests")
              ? `${styles.interestsGrid} ${styles.interestsGridError}`
              : styles.interestsGrid
          }
        >
          {INNOVATION_FIELDS.map((field) => (
            <Checkbox
              key={field}
              id={`interest-${field}`}
              name="interests"
              value={field}
              label={field}
              checked={interests.has(field)}
              onChange={(event) => toggleInterest(field, event.target.checked)}
            />
          ))}
        </div>
        {fieldError("interests") && <p className={styles.fieldErrorText}>{fieldError("interests")}</p>}
      </fieldset>

      <p className={styles.sectionLabel}>Participation</p>
      <RadioGroup
        legend="How are you participating?"
        name="participationType"
        options={PARTICIPATION_OPTIONS}
        value={participationType}
        required
        onChange={setParticipationType}
        error={fieldError("participationType")}
      />

      {participationType === "TEAM" && (
        <div className={styles.subFields}>
          <RadioGroup
            legend="Team"
            name="teamMode"
            options={TEAM_MODE_OPTIONS}
            value={teamMode}
            onChange={setTeamMode}
            error={fieldError("teamMode")}
          />
          {teamMode === "CREATE" ? (
            <Input
              label="Team name"
              id="teamName"
              name="teamName"
              required
              maxLength={TEAM_NAME_MAX_LENGTH}
              value={values.teamName}
              onChange={handleTextChange("teamName")}
              error={fieldError("teamName")}
            />
          ) : (
            <Input
              label="Join code"
              id="joinCode"
              name="joinCode"
              placeholder="6-character code from your teammate"
              required
              maxLength={JOIN_CODE_MAX_LENGTH}
              value={values.joinCode}
              onChange={handleTextChange("joinCode")}
              error={fieldError("joinCode")}
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
