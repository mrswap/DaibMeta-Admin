import { Field } from "formik";
import { FiCheck, FiX } from "react-icons/fi";

/**
 * ToggleSwitch — Reusable toggle with two modes
 *
 * FORM MODE (default):
 *   <ToggleSwitch name="status" label="Status" />
 *   → iOS-style switch, Formik-integrated
 *
 * NON-FORM MODE (list / table):
 *   <ToggleSwitch
 *     isFormik={false}
 *     variant="pill"
 *     value={item.status}
 *     onChange={() => handleToggle(item)}
 *     loading={mutation.isPending && mutation.variables === item.id}
 *     isDisabled={item.is_system}
 *   />
 *   → Pill-style toggle (Active / Inactive) with icon
 */
const ToggleSwitch = ({
  label,
  name,
  description = "",
  isFormik = true,
  value,
  onChange,
  isDisabled = false,
  loading = false,
  variant = "pill",
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  showLabel = true,
  className = "",
}) => {
  // ============================================================
  // FORM MODE — iOS style, Formik integrated
  // ============================================================
  const FormSwitchUI = ({ checked, onToggle }) => (
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

  // ============================================================
  // NON-FORM MODE
  // ============================================================
  const NonFormUI = ({ checked, onToggle }) => {
    const isClickable = !isDisabled && !loading && onToggle;

    // ---------- PILL VARIANT ----------
    if (variant === "pill") {
      return (
        <button
          type="button"
          onClick={isClickable ? () => onToggle(!checked) : undefined}
          disabled={isDisabled || loading}
          title={
            isDisabled
              ? "Protected"
              : checked
                ? "Click to deactivate"
                : "Click to activate"
          }
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all ${
            loading
              ? "cursor-wait border-ink-200 bg-ink-50 text-ink-500"
              : isDisabled
                ? "cursor-not-allowed border-ink-200 bg-ink-50 text-ink-400 opacity-70"
                : checked
                  ? "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100"
                  : "cursor-pointer border-ink-200 bg-ink-100 text-ink-600 hover:border-ink-300 hover:bg-ink-200"
          }`}
        >
          {loading ? (
            <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-ink-400 border-t-transparent" />
          ) : (
            <span
              className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${
                checked ? "bg-brand-600" : "bg-ink-400"
              }`}
            >
              {checked ? (
                <FiCheck className="h-2 w-2 text-surface" strokeWidth={3} />
              ) : (
                <FiX className="h-2 w-2 text-surface" strokeWidth={3} />
              )}
            </span>
          )}

          {showLabel && (
            <span className="leading-none">
              {loading ? "..." : checked ? activeLabel : inactiveLabel}
            </span>
          )}
        </button>
      );
    }

    // ---------- SWITCH VARIANT ----------
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={isClickable ? () => onToggle(!checked) : undefined}
        disabled={isDisabled || loading}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 sm:h-6 sm:w-11 ${
          loading
            ? "cursor-wait opacity-60"
            : isDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
        } ${checked ? "bg-brand-600" : "bg-ink-300"}`}
      >
        {loading ? (
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 sm:h-5 sm:w-5 ${
              checked ? "translate-x-4 sm:translate-x-5" : "translate-x-0.5"
            }`}
          />
        )}
      </button>
    );
  };

  // ============================================================
  if (!isFormik) {
    return (
      <NonFormUI
        checked={!!value}
        onToggle={(newValue) => onChange?.(newValue)}
      />
    );
  }

  return (
    <Field name={name}>
      {({ field, form, meta }) => (
        <>
          <FormSwitchUI
            checked={!!field.value}
            onToggle={(newValue) => form.setFieldValue(name, newValue)}
          />
          {meta.touched && meta.error && (
            <div className="-mt-2 mb-3 text-xs text-form-error sm:text-sm">
              {meta.error}
            </div>
          )}
        </>
      )}
    </Field>
  );
};

export default ToggleSwitch;
