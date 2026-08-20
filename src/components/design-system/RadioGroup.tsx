import styles from "./RadioGroup.module.css";

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  legend: string;
  name: string;
  options: readonly RadioOption[];
  defaultValue?: string;
  required?: boolean;
  /** Called on every change — only needed when a page conditionally renders
   * fields based on the selection (e.g. team create-vs-join sub-fields). */
  onChange?: (value: string) => void;
};

// The fieldset/legend/bordered-option radio pattern, extracted from what was
// previously duplicated inline in SignupForm.tsx — this sprint's forms
// (schooling type, participation type, team create/join, payment method)
// need the same pattern several more times.
export function RadioGroup({ legend, name, options, defaultValue, required, onChange }: RadioGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              required={required}
              onChange={onChange ? () => onChange(option.value) : undefined}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
