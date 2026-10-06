// src/features/patent/common/form/DatePicker.jsx

import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { Field } from "formik";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

// ==================== HELPERS ====================
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Parse "YYYY-MM-DD" → Date object (local time, no timezone shift)
const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// Format Date → "YYYY-MM-DD"
const formatDateStr = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Display format: "15 Oct 2026"
const formatDisplay = (str) => {
  const d = parseDate(str);
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Get ISO day (1=Mon ... 7=Sun)
const getISODay = (date) => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

// Year range for dropdown
const buildYearRange = (minDate, maxDate) => {
  const now = new Date().getFullYear();
  const start = minDate ? minDate.getFullYear() : now - 100;
  const end = maxDate ? maxDate.getFullYear() : now + 10;
  const years = [];
  for (let y = end; y >= start; y--) years.push(y);
  return years;
};

// ==================== CALENDAR POPUP ====================
const CalendarPopup = ({ value, min, max, onSelect, onClose, anchorRef }) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDate = useMemo(() => parseDate(min), [min]);
  const maxDate = useMemo(() => parseDate(max), [max]);
  const selectedDate = useMemo(() => parseDate(value), [value]);

  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate || today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const [position, setPosition] = useState(null);
  const popupRef = useRef(null);

  // Compute position BEFORE first paint (avoids top-left flash)
  useLayoutEffect(() => {
    if (!anchorRef.current) return;

    const computePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const POPUP_WIDTH = 300;
      const POPUP_HEIGHT = 360;
      const GAP = 6;

      let top = rect.bottom + GAP;
      let left = rect.left;

      if (top + POPUP_HEIGHT > window.innerHeight) {
        const above = rect.top - POPUP_HEIGHT - GAP;
        if (above >= 0) top = above;
      }

      if (left + POPUP_WIDTH > window.innerWidth - 8) {
        left = window.innerWidth - POPUP_WIDTH - 8;
      }
      if (left < 8) left = 8;

      setPosition({ top, left });
    };

    computePosition();

    window.addEventListener("resize", computePosition);
    return () => window.removeEventListener("resize", computePosition);
  }, [anchorRef]);

  // Outside click detection (replaces the full-screen overlay)
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose, anchorRef]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const calendarCells = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayISO = getISODay(firstDay);
    const leadingBlanks = firstDayISO - 1;

    const cells = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [viewMonth]);

  const canGoPrev = () => {
    if (!minDate) return true;
    const prev = new Date(viewMonth.year, viewMonth.month - 1, 1);
    return prev >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  };

  const canGoNext = () => {
    if (!maxDate) return true;
    const next = new Date(viewMonth.year, viewMonth.month + 1, 1);
    return next <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  };

  const handlePrevMonth = () => {
    setViewMonth((v) => {
      const newMonth = v.month - 1;
      if (newMonth < 0) return { year: v.year - 1, month: 11 };
      return { year: v.year, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    setViewMonth((v) => {
      const newMonth = v.month + 1;
      if (newMonth > 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: newMonth };
    });
  };

  const handleMonthChange = (e) => {
    const month = Number(e.target.value);
    setViewMonth((v) => ({ ...v, month }));
  };

  const handleYearChange = (e) => {
    const year = Number(e.target.value);
    setViewMonth((v) => ({ ...v, year }));
  };

  // Prevent popup from closing when clicking inside selects
  const stopMouseDown = (e) => {
    e.stopPropagation();
  };

  const yearRange = useMemo(
    () => buildYearRange(minDate, maxDate),
    [minDate, maxDate],
  );

  if (!position) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-[61] w-[300px] rounded-xl border border-ink-200 bg-surface shadow-xl"
      style={{ top: position.top, left: position.left }}
      onMouseDown={stopMouseDown}
    >
      <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/40 px-3 py-2.5">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={!canGoPrev()}
          className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <select
            value={viewMonth.month}
            onChange={handleMonthChange}
            onMouseDown={stopMouseDown}
            className="cursor-pointer rounded-md border border-ink-200 bg-surface px-1.5 py-1 text-xs font-semibold text-ink-700 outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={viewMonth.year}
            onChange={handleYearChange}
            onMouseDown={stopMouseDown}
            className="cursor-pointer rounded-md border border-ink-200 bg-surface px-1.5 py-1 text-xs font-semibold text-ink-700 outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
          >
            {yearRange.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={!canGoNext()}
          className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-ink-100">
        {DAY_SHORT.map((d) => (
          <div
            key={d}
            className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-ink-400"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 p-2">
        {calendarCells.map((date, idx) => {
          if (!date) return <div key={`blank-${idx}`} />;

          const disabled = isDateDisabled(date);
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={formatDateStr(date)}
              type="button"
              onClick={() => !disabled && onSelect(formatDateStr(date))}
              disabled={disabled}
              className={`flex aspect-square items-center justify-center rounded-md text-xs font-medium transition ${
                disabled
                  ? "cursor-not-allowed text-ink-300"
                  : selected
                    ? "cursor-pointer bg-brand-600 font-bold text-surface"
                    : isToday
                      ? "cursor-pointer bg-brand-50 text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100"
                      : "cursor-pointer text-ink-700 hover:bg-ink-100"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/30 px-3 py-2">
        <button
          type="button"
          onClick={() => {
            if (!isDateDisabled(today)) {
              onSelect(formatDateStr(today));
            }
          }}
          disabled={isDateDisabled(today)}
          className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Today
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ==================== INPUT UI ====================
const DatePickerUI = ({
  label,
  required,
  placeholder = "Select date",
  value,
  onChange,
  min,
  max,
  disabled,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleSelect = (dateStr) => {
    onChange(dateStr);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onChange("");
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;
    setOpen((v) => !v);
  };

  const inputClass = `
    h-10 w-full rounded-lg border bg-surface px-3 pr-20 text-sm
    outline-none transition cursor-pointer
    placeholder:text-ink-400
    ${
      error
        ? "border-danger-500 text-ink-800 focus:ring-2 focus:ring-danger-500/15"
        : "border-ink-200 text-ink-800 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
    }
    ${disabled ? "cursor-not-allowed bg-ink-50 text-ink-400" : ""}
  `;

  return (
    <div className="mb-3 sm:mb-4">
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-form-label sm:text-sm">
          {label}
          {required && <span className="text-form-required ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={anchorRef}>
        <input
          type="text"
          readOnly
          value={value ? formatDisplay(value) : ""}
          placeholder={placeholder}
          disabled={disabled}
          onClick={handleToggle}
          onMouseDown={(e) => e.preventDefault()}
          className={inputClass}
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onMouseDown={handleClear}
              className="cursor-pointer rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              title="Clear"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onMouseDown={handleToggle}
            disabled={disabled}
            className="cursor-pointer rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Open calendar"
            aria-label="Open calendar"
          >
            <FiCalendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-1 text-xs text-form-error sm:text-sm">{error}</div>
      )}

      {open && !disabled && (
        <CalendarPopup
          value={value}
          min={min}
          max={max}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
          anchorRef={anchorRef}
        />
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const DatePicker = ({
  name,
  label,
  placeholder = "Select date",
  required = false,
  min = "",
  max = "",
  isDisabled = false,
  isFormik = true,
  value,
  onChange,
  className = "",
}) => {
  if (!isFormik) {
    return (
      <div className={className}>
        <DatePickerUI
          label={label}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={isDisabled}
        />
      </div>
    );
  }

  return (
    <Field name={name}>
      {({ field, form, meta }) => (
        <div className={className}>
          <DatePickerUI
            label={label}
            required={required}
            placeholder={placeholder}
            value={field.value}
            onChange={(date) => form.setFieldValue(name, date)}
            min={min}
            max={max}
            disabled={isDisabled}
            error={meta.touched && meta.error ? meta.error : null}
          />
        </div>
      )}
    </Field>
  );
};

export default DatePicker;
