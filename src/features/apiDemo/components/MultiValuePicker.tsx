import styles from './ApiDemo.module.css';

interface MultiValueOption {
  description?: string;
  value: string;
  label: string;
}

interface MultiValuePickerProps {
  onChange: (nextValue: string[]) => void;
  options: MultiValueOption[];
  value: string[];
}

export function MultiValuePicker({
  onChange,
  options,
  value,
}: MultiValuePickerProps): JSX.Element {
  const selectedValues = new Set(value);

  const handleToggle = (optionValue: string): void => {
    if (selectedValues.has(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

  return (
    <div className={styles.multiValuePicker}>
      {options.map((option) => {
        const checked = selectedValues.has(option.value);

        return (
          <label
            className={checked ? `${styles.multiValueOption} ${styles.multiValueOptionSelected}` : styles.multiValueOption}
            key={option.value}
          >
            <input
              checked={checked}
              className={styles.multiValueCheckbox}
              onChange={() => handleToggle(option.value)}
              type="checkbox"
            />
            <span className={styles.multiValueContent}>
              <span className={styles.multiValueLabel}>{option.label}</span>
              {option.description ? <code className={styles.multiValueDescription}>{option.description}</code> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
