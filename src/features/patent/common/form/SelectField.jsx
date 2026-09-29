import Select from "react-select";
import { Field } from "formik";

const SelectField = ({
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
      minHeight: "32px",
      "@media (min-width: 640px)": {
        minHeight: "38px",
      },
      backgroundColor: disabled
        ? "var(--color-form-bg-disabled)"
        : "var(--color-form-bg)",
      borderColor: state.isFocused
        ? "var(--color-form-border-focus)"
        : "var(--color-form-border)",
      boxShadow: state.isFocused ? "0 0 0 1px var(--color-form-ring)" : "none",
      "&:hover": {
        borderColor: disabled
          ? "var(--color-form-border-disabled)"
          : "var(--color-form-border-focus)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0px 8px",
    }),
    input: (base) => ({
      ...base,
      margin: "0px",
      fontSize: "12px",
      color: "var(--color-form-text)",
      "@media (min-width: 640px)": {
        fontSize: "14px",
      },
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "12px",
      color: "var(--color-form-placeholder)",
      "@media (min-width: 640px)": {
        fontSize: "14px",
      },
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
      color: "var(--color-form-text)",
      "@media (min-width: 640px)": {
        fontSize: "14px",
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "4px",
      color: "var(--color-form-placeholder)",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: "var(--color-form-bg)",
      border: "1px solid var(--color-form-border)",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "13px",
      backgroundColor: state.isFocused
        ? "var(--color-form-ring)"
        : state.isSelected
          ? "var(--color-form-border-focus)"
          : "var(--color-form-bg)",
      color:
        state.isFocused || state.isSelected
          ? "var(--color-btn-primary-text)"
          : "var(--color-form-text)",
      cursor: "pointer",
    }),
    ...props.styles,
  };

  return (
    <div className="mb-3 sm:mb-4" style={{ position: "relative", zIndex: 10 }}>
      {label && (
        <label className="block mb-1 sm:mb-1.5 text-form-label font-medium text-xs sm:text-sm">
          {label}
          {required && <span className="text-form-required ml-1">*</span>}
        </label>
      )}

      <Field name={name}>
        {({ field, form, meta }) => (
          <>
            <Select
              options={options}
              value={field.value}
              onChange={(option) => form.setFieldValue(name, option)}
              onBlur={() => form.setFieldTouched(name, true)}
              placeholder={placeholder}
              isDisabled={disabled}
              styles={customStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              {...props}
            />
            {meta.touched && meta.error && (
              <div className="text-form-error text-xs sm:text-sm mt-1">
                {meta.error}
              </div>
            )}
          </>
        )}
      </Field>
    </div>
  );
};

export default SelectField;
