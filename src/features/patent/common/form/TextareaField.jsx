import { Field } from "formik";

const TextareaField = ({
  label,
  name,
  rows = 4,
  placeholder = "",
  className = "",
  required = false,
  isDisabled = false,
  maxLength,
  ...props
}) => {
  const baseTextareaClass = `
    w-full rounded-md p-3 text-sm transition-all duration-200
    bg-form-bg
    text-form-text
    placeholder:text-form-placeholder
    border
    border-form-border
    hover:border-form-border-hover
    focus:outline-none
    focus:border-form-border-focus
    focus:ring-1
    focus:ring-form-ring
    ${
      isDisabled
        ? "bg-form-bg-disabled text-form-text-disabled cursor-not-allowed border-form-border-disabled"
        : ""
    }
    ${className}
  `;

  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label className="block mb-1 sm:mb-1.5 text-form-label font-medium text-xs sm:text-sm">
          {label}
          {required && <span className="text-form-required ml-1">*</span>}
        </label>
      )}

      <Field name={name}>
        {({ field, meta }) => (
          <>
            <textarea
              {...field}
              rows={rows}
              placeholder={placeholder}
              className={baseTextareaClass}
              disabled={isDisabled}
              maxLength={maxLength}
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

export default TextareaField;
