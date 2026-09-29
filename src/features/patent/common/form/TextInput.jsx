import { Field, ErrorMessage } from "formik";

const TextInput = ({
  label,
  name,
  type = "text",
  placeholder = "",
  className = "",
  isFormik = true,
  value,
  onChange,
  required = false,
  isDisabled = false,
  maxLength,
}) => {
  const baseInputClass = `
    ${className}
    w-full px-2 sm:px-3 py-1.5 sm:py-2
    rounded-md text-xs sm:text-sm
    border transition-all duration-200
    bg-form-bg
    text-form-text
    placeholder:text-form-placeholder
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
  `;

  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label className="block mb-1 sm:mb-1.5 text-form-label font-medium text-xs sm:text-sm">
          {label}
          {required && <span className="text-form-required ml-1">*</span>}
        </label>
      )}

      {isFormik ? (
        <>
          <Field
            name={name}
            type={type}
            placeholder={placeholder}
            className={baseInputClass}
            disabled={isDisabled}
            maxLength={maxLength}
          />
          <ErrorMessage
            name={name}
            component="div"
            className="text-form-error text-xs sm:text-sm mt-0.5 sm:mt-1"
          />
        </>
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={baseInputClass}
          disabled={isDisabled}
          maxLength={maxLength}
        />
      )}
    </div>
  );
};

export default TextInput;
