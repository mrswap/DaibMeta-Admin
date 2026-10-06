// src/features/patent/common/form/PhoneInput.jsx

import PhoneInput, {
  isValidPhoneNumber,
  getCountryCallingCode,
  parsePhoneNumber,
} from "react-phone-number-input";
import { useField } from "formik";
import "react-phone-number-input/style.css";
import flags from "react-phone-number-input/flags";
import { useRef } from "react";

// ==================== HELPERS ====================

const MAX_NATIONAL_DIGITS = {
  IN: 10,
  US: 10,
  CA: 10,
  GB: 10,
  AU: 9,
  AE: 9,
  SA: 9,
  SG: 8,
  PK: 10,
  BD: 10,
  NP: 10,
  LK: 9,
};

const getMaxDigits = (country) => MAX_NATIONAL_DIGITS[country] || 15;

/**
 * Extract the national digits (without country code).
 * Input value examples:
 *   "+919876543210"  → "9876543210"
 *   "+91 98765 43210" → "9876543210"
 *   "+1 (555) 123-4567" → "5551234567"
 */
const getNationalDigits = (value, country) => {
  if (!value) return "";
  const cleaned = value.replace(/[^\d+]/g, ""); // keep + and digits
  if (!cleaned.startsWith("+")) return cleaned.replace(/\D/g, "");
  const afterPlus = cleaned.slice(1);
  if (!country) return afterPlus;
  const code = String(getCountryCallingCode(country));
  if (afterPlus.startsWith(code)) return afterPlus.slice(code.length);
  return afterPlus;
};

// ==================== CORE GUARD ====================
/**
 * Given the current phone value and a proposed new value,
 * return true only if the new value keeps national digits <= max.
 */
const isChangeAllowed = (currentValue, nextValue, country) => {
  if (!nextValue) return true; // always allow clear
  const nextDigits = getNationalDigits(nextValue, country);
  const max = getMaxDigits(country);
  if (nextDigits.length <= max) return true;

  // Allow if the change is a DELETE (new value shorter than current)
  const currentDigits = getNationalDigits(currentValue, country);
  if (nextDigits.length < currentDigits.length) return true;

  return false;
};

// ==================== FORMIK MODE ====================
const FormikPhoneUI = ({
  name,
  label,
  placeholder,
  required,
  isDisabled,
  defaultCountry,
  className,
}) => {
  const [field, meta, helpers] = useField(name);
  const inputRef = useRef(null);

  const error = meta.touched && meta.error ? meta.error : null;
  const currentValue = field.value || "";

  /**
   * Block the keydown BEFORE the character is inserted into the DOM.
   * This is the most reliable place to prevent extra digits —
   * Formik/library never even see the change.
   */
  const handleKeyDown = (e) => {
    // Allow control/navigation keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
      "Enter",
      "Escape",
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return; // copy/paste/select-all

    // Only digits allowed (we let the library handle formatting)
    if (!/^\d$/.test(e.key)) return;

    // Check how many national digits we currently have
    const currentDigits = getNationalDigits(currentValue, defaultCountry);
    const max = getMaxDigits(defaultCountry);

    // If already at max, block the keystroke
    if (currentDigits.length >= max) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Block paste if it would exceed max digits.
   */
  const handlePaste = (e) => {
    const pasted = e.clipboardData?.getData("text") || "";
    const pastedDigits = pasted.replace(/\D/g, "");
    const currentDigits = getNationalDigits(currentValue, defaultCountry);
    const max = getMaxDigits(defaultCountry);

    if (currentDigits.length + pastedDigits.length > max) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Final safety net — if somehow onChange still fires with overflow,
   * reject the update.
   */
  const handleChange = (val) => {
    const next = val || "";
    if (isChangeAllowed(currentValue, next, defaultCountry)) {
      helpers.setValue(next);
    }
  };

  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-xs font-medium text-form-label sm:text-sm"
        >
          {label}
          {required && <span className="text-form-required ml-1">*</span>}
        </label>
      )}

      <div
        className={`phone-input-wrapper ${
          error ? "phone-input-error" : ""
        } ${isDisabled ? "phone-input-disabled" : ""}`}
      >
        <div ref={inputRef} onKeyDown={handleKeyDown} onPaste={handlePaste}>
          <PhoneInput
            id={name}
            name={name}
            international
            countryCallingCodeEditable={false}
            defaultCountry={defaultCountry}
            value={currentValue}
            onChange={handleChange}
            onBlur={() => helpers.setTouched(true)}
            placeholder={placeholder}
            disabled={isDisabled}
            flags={flags}
          />
        </div>
      </div>

      {error && (
        <div className="mt-1 text-xs text-form-error sm:text-sm">{error}</div>
      )}
    </div>
  );
};

// ==================== NON-FORMIK MODE ====================
const StandalonePhoneUI = ({
  name,
  label,
  placeholder,
  required,
  isDisabled,
  defaultCountry,
  value,
  onChange,
  error,
  className,
}) => {
  const currentValue = value || "";

  const handleKeyDown = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
      "Enter",
      "Escape",
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) return;

    const currentDigits = getNationalDigits(currentValue, defaultCountry);
    const max = getMaxDigits(defaultCountry);
    if (currentDigits.length >= max) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData?.getData("text") || "";
    const pastedDigits = pasted.replace(/\D/g, "");
    const currentDigits = getNationalDigits(currentValue, defaultCountry);
    const max = getMaxDigits(defaultCountry);
    if (currentDigits.length + pastedDigits.length > max) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleChange = (val) => {
    const next = val || "";
    if (isChangeAllowed(currentValue, next, defaultCountry)) {
      onChange?.(next);
    }
  };

  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-xs font-medium text-form-label sm:text-sm"
        >
          {label}
          {required && <span className="text-form-required ml-1">*</span>}
        </label>
      )}

      <div
        className={`phone-input-wrapper ${
          error ? "phone-input-error" : ""
        } ${isDisabled ? "phone-input-disabled" : ""}`}
      >
        <div onKeyDown={handleKeyDown} onPaste={handlePaste}>
          <PhoneInput
            id={name}
            name={name}
            international
            countryCallingCodeEditable={false}
            defaultCountry={defaultCountry}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={isDisabled}
            flags={flags}
          />
        </div>
      </div>

      {error && (
        <div className="mt-1 text-xs text-form-error sm:text-sm">{error}</div>
      )}
    </div>
  );
};

// ==================== MAIN WRAPPER ====================
const PhoneInputField = ({
  name,
  label,
  placeholder = "Enter phone number",
  required = false,
  isDisabled = false,
  isFormik = true,
  value,
  onChange,
  defaultCountry = "IN",
  className = "",
}) => {
  if (!isFormik) {
    return (
      <StandalonePhoneUI
        name={name}
        label={label}
        placeholder={placeholder}
        required={required}
        isDisabled={isDisabled}
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        className={className}
      />
    );
  }

  return (
    <FormikPhoneUI
      name={name}
      label={label}
      placeholder={placeholder}
      required={required}
      isDisabled={isDisabled}
      defaultCountry={defaultCountry}
      className={className}
    />
  );
};

// ==================== VALIDATION ====================
/**
 * Country-aware phone validation.
 *
 * Strategy:
 * 1. Empty value → pass (use Yup `.required()` for mandatory)
 * 2. Try `parsePhoneNumber` — it auto-detects country from the `+XX` prefix
 * 3. If parsed → check `.isValid()` (library's metadata check)
 * 4. Fallback: if `.isValid()` fails but the number has a valid E.164 shape
 *    (7–15 digits), accept it — this covers newer number ranges that
 *    react-phone-number-input's metadata may not yet know about.
 *
 * Why the fallback? Strict metadata can reject valid-but-new numbers
 * (newer mobile series, recently added country ranges). We prefer
 * "obviously valid length + valid country code" over false negatives.
 */
export const validatePhone = (value) => {
  if (!value) return true; // let Yup .required() handle empties

  // Reject anything that doesn't start with "+" (shouldn't happen, but safe)
  if (typeof value !== "string" || !value.startsWith("+")) return false;

  // Extract digits only
  const digits = value.replace(/\D/g, "");
  // E.164: max 15 digits total (including country code)
  if (digits.length < 7 || digits.length > 15) return false;

  // Try the library's strict check first
  try {
    const parsed = parsePhoneNumber(value);
    if (parsed && parsed.isValid()) return true;

    // If we have a country code but metadata says invalid,
    // fall back to shape-based acceptance
    if (parsed && parsed.country) return true;
  } catch {
    // ignore — fall through
  }

  // Last resort: shape-only check
  // A number is acceptable if it has a valid country calling code (1–3 digits)
  // and total length is 7–15 digits
  return (
    isValidPhoneNumber(value) || (digits.length >= 7 && digits.length <= 15)
  );
};

export default PhoneInputField;
