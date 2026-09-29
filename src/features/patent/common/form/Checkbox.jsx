import { Field, ErrorMessage } from "formik";

const Checkbox = ({
  label,
  name,
  className = "",
  isFormik = true,
  ...props
}) => {
  const checkboxClass = `
    w-3.5 h-3.5 sm:w-4 sm:h-4
    rounded
    border-form-border
    text-form-check-accent
    focus:ring-form-ring
    focus:ring-1
    cursor-pointer
    ${className}
  `;

  return (
    <div className="mb-3 sm:mb-4">
      <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
        {isFormik ? (
          <Field type="checkbox" className={checkboxClass} name={name} />
        ) : (
          <input
            type="checkbox"
            className={checkboxClass}
            name={name}
            {...props}
          />
        )}
        <span className="text-xs sm:text-sm text-form-label">{label}</span>
      </label>

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

export default Checkbox;
