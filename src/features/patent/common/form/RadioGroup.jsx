import { Field, ErrorMessage } from "formik";

const RadioGroup = ({
  label,
  name,
  options = [],
  isFormik = true,
  className = "",
}) => {
  const radioClass = `
    w-3.5 h-3.5 sm:w-4 sm:h-4
    border-form-border
    text-form-check-accent
    focus:ring-form-ring
    focus:ring-1
    cursor-pointer
  `;

  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      {label && (
        <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-form-label">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-3 sm:gap-4">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            {isFormik ? (
              <Field
                type="radio"
                name={name}
                value={opt.value}
                className={radioClass}
              />
            ) : (
              <input
                type="radio"
                name={name}
                value={opt.value}
                className={radioClass}
              />
            )}
            <span className="text-xs sm:text-sm text-form-label">
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      {isFormik && (
        <ErrorMessage
          name={name}
          component="div"
          className="text-form-error text-xs sm:text-sm mt-1"
        />
      )}
    </div>
  );
};

export default RadioGroup;
