import Select from "react-select";
import { Field } from "formik";

/**
 * MultiSelectField — Formik-integrated multi-select using react-select
 *
 * Usage:
 *   <MultiSelectField
 *     label="Specializations"
 *     name="specializations"
 *     options={[{ value: 1, label: "Internal Medicine" }, ...]}
 *     placeholder="Select specializations..."
 *   />
 *
 * Value format: Array of { value, label } objects
 */
const MultiSelectField = ({
  name,
  label,
  options,
  placeholder = "Select...",
  required = false,
  disabled = false,
  ...props
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      backgroundColor: disabled
        ? "var(--color-form-bg-disabled)"
        : "var(--color-form-bg)",
      borderColor: state.isFocused
        ? "var(--color-form-border-focus)"
        : "var(--color-form-border)",
      boxShadow: state.isFocused ? "0 0 0 1px var(--color-form-ring)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      "&:hover": {
        borderColor: disabled
          ? "var(--color-form-border-disabled)"
          : "var(--color-form-border-focus)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "4px 8px",
    }),
    input: (base) => ({
      ...base,
      margin: "0px",
      fontSize: "14px",
      color: "var(--color-form-text)",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
      color: "var(--color-form-placeholder)",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "14px",
      color: "var(--color-form-text)",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--color-brand-50)",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--color-brand-700)",
      fontSize: "12px",
      fontWeight: "500",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--color-brand-700)",
      cursor: "pointer",
      borderRadius: "0 6px 6px 0",
      "&:hover": {
        backgroundColor: "var(--color-brand-100)",
        color: "var(--color-brand-800)",
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "4px",
      color: "var(--color-form-placeholder)",
      cursor: "pointer",
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "4px",
      color: "var(--color-form-placeholder)",
      cursor: "pointer",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: "var(--color-form-bg)",
      border: "1px solid var(--color-form-border)",
      borderRadius: "8px",
      overflow: "hidden",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "13px",
      cursor: "pointer",
      backgroundColor: state.isFocused
        ? "var(--color-form-ring)"
        : state.isSelected
          ? "var(--color-form-border-focus)"
          : "var(--color-form-bg)",
      color:
        state.isFocused || state.isSelected
          ? "var(--color-btn-primary-text)"
          : "var(--color-form-text)",
    }),
    ...props.styles,
  };

  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-form-label sm:text-sm">
          {label}
          {required && <span className="text-form-required ml-1">*</span>}
        </label>
      )}

      <Field name={name}>
        {({ field, form, meta }) => (
          <>
            <Select
              isMulti
              options={options}
              value={field.value}
              onChange={(val) => form.setFieldValue(name, val || [])}
              onBlur={() => form.setFieldTouched(name, true)}
              placeholder={placeholder}
              isDisabled={disabled}
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              {...props}
            />
            {meta.touched && meta.error && (
              <div className="mt-1 text-xs text-form-error sm:text-sm">
                {meta.error}
              </div>
            )}
          </>
        )}
      </Field>
    </div>
  );
};

export default MultiSelectField;
