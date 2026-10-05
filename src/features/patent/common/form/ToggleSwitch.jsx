import { Field, ErrorMessage } from "formik";

/**
 * ToggleSwitch — reusable toggle for Formik forms
 *
 * Usage:
 *   <ToggleSwitch
 *     name="status"
 *     label="Active"
 *     description="Toggle to activate or deactivate"
 *   />
 *
 * With Formik: automatically connected via <Field name="...">
 * Without Formik: pass isFormik={false}, value, onChange
 */
const ToggleSwitch = ({
  label,
  name,
  description = "",
  isFormik = true,
  value,
  onChange,
  isDisabled = false,
  className = "",
}) => {
  // ---------- Shared switch UI ----------
  const SwitchUI = ({ checked, onToggle }) => (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-form-bg px-3.5 py-2.5 sm:px-4 sm:py-3">
        {(label || description) && (
          <div>
            {label && (
              <p className="text-xs font-medium text-form-label sm:text-sm">
                {label}
              </p>
            )}
            {description && (
              <p className="text-[11px] text-ink-500 sm:text-xs">
                {description}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={isDisabled}
          onClick={() => onToggle(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 sm:h-6 sm:w-11 ${
            isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${checked ? "bg-form-check-accent" : "bg-ink-300"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 sm:h-5 sm:w-5 ${
              checked ? "translate-x-4 sm:translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );

  // ---------- Non-Formik mode ----------
  if (!isFormik) {
    return (
      <SwitchUI
        checked={!!value}
        onToggle={(newValue) => onChange?.(newValue)}
      />
    );
  }

  // ---------- Formik mode ----------
  return (
    <Field name={name}>
      {({ field, form, meta }) => (
        <>
          <SwitchUI
            checked={!!field.value}
            onToggle={(newValue) => form.setFieldValue(name, newValue)}
          />
          {meta.touched && meta.error && (
            <div className="text-form-error -mt-2 mb-3 text-xs sm:text-sm">
              {meta.error}
            </div>
          )}
        </>
      )}
    </Field>
  );
};

export default ToggleSwitch;
