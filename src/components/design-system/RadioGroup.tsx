import styles from "./RadioGroup.module.css";

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  legend: string;
  /** Put on the <fieldset>, so a "jump to this field" link can target it. */
  id?: string;
  name: string;
  options: readonly RadioOption[];
  defaultValue?: string;
  /** Controlled selection — pass together with onChange. Use instead of
   *  defaultValue when a parent needs to reset the field on its own terms
   *  rather than trust the browser's native form reset (e.g. a
   *  useActionState form should keep what the student picked if the action
   *  returns an error — see the Sep 21 2026 CLAUDE.md status log entry on
   *  React 19 resetting <form action={...}> after every call, success or
   *  not, which silently drops answers in an uncontrolled field). */
  value?: string;
  required?: boolean;
  /** Called on every change — only needed when a page conditionally renders
   * fields based on the selection (e.g. team create-vs-join sub-fields), or
   * when the group is controlled via `value`. */
  onChange?: (value: string) => void;
  /** Server-flagged error message — coral border on every option, same
   *  recipe as Input's error state, plus the message itself below. */
  error?: string;
};

// The fieldset/legend/bordered-option radio pattern, extracted from what was
// previously duplicated inline in SignupForm.tsx — this sprint's forms
// (schooling type, participation type, team create/join, payment method)
// need the same pattern several more times.
export function RadioGroup({
  legend,
  id,
  name,
  options,
  defaultValue,
  value,
  required,
  onChange,
  error,
}: RadioGroupProps) {
  const controlled = value !== undefined;
  const optionsClassName = error ? `${styles.options} ${styles.optionsError}` : styles.options;
  return (
    <fieldset id={id} className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={optionsClassName} aria-invalid={error ? true : undefined}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={controlled ? option.value === value : undefined}
              defaultChecked={controlled ? undefined : option.value === defaultValue}
              required={required}
              onChange={onChange ? () => onChange(option.value) : undefined}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </fieldset>
  );
}
