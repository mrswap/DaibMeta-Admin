import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ISO day (1=Mon, 7=Sun)
const getISODay = (date) => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

// "2026-10-05" → Date object at local midnight
const parseDateStr = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Date → "YYYY-MM-DD"
const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const AvailableDatesCalendar = ({
  dateFrom,
  dateTo,
  daysOfWeek = [],
  selectedDate,
  onSelect,
  disabled = false,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Determine initial visible month
  const [visibleMonth, setVisibleMonth] = useState(() => {
    if (selectedDate) {
      const d = parseDateStr(selectedDate);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    if (dateFrom) {
      const d = parseDateStr(dateFrom);
      const start = d < today ? today : d;
      return new Date(start.getFullYear(), start.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const startDate = parseDateStr(dateFrom);
  const endDate = parseDateStr(dateTo);

  // Check if date is within range AND matches days_of_week AND not past
  const isDateAvailable = (date) => {
    if (!startDate || !endDate) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (d < startDate) return false;
    if (d > endDate) return false;
    if (d < today) return false;

    const isoDay = getISODay(d);
    if (!daysOfWeek.includes(isoDay)) return false;

    return true;
  };

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayISO = getISODay(firstDay);
  const leadingBlanks = firstDayISO - 1; // Monday=0

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({
      date,
      day: d,
      dateStr: formatDateStr(date),
      available: isDateAvailable(date),
    });
  }

  const canGoPrev = () => {
    const prev = new Date(year, month - 1, 1);
    if (endDate && prev > endDate) return false;
    // allow going back but not before dateFrom month - 1
    if (startDate) {
      const minMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1,
      );
      if (prev < minMonth) return false;
    }
    return true;
  };

  const canGoNext = () => {
    const next = new Date(year, month + 1, 1);
    if (endDate) {
      const maxMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      if (next > maxMonth) return false;
    }
    return true;
  };

  const monthLabel = visibleMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-ink-200 bg-surface">
      {/* Month nav */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <button
          type="button"
          disabled={!canGoPrev() || disabled}
          onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
          className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-ink-900">{monthLabel}</p>
        <button
          type="button"
          disabled={!canGoNext() || disabled}
          onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
          className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-ink-100">
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-ink-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 p-3">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`blank-${idx}`} />;
          }

          const isSelected = selectedDate === cell.dateStr;
          const isAvailable = cell.available;

          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={!isAvailable || disabled}
              onClick={() => isAvailable && onSelect(cell.dateStr)}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition ${
                isSelected
                  ? "cursor-pointer bg-brand-600 font-bold text-surface shadow-sm"
                  : isAvailable
                    ? "cursor-pointer bg-brand-50 text-brand-700 hover:bg-brand-100"
                    : "cursor-not-allowed text-ink-300"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/30 px-4 py-2.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-brand-50 ring-1 ring-brand-200" />
          <span className="text-ink-600">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-ink-100" />
          <span className="text-ink-600">Not available</span>
        </div>
        {selectedDate && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded bg-brand-600" />
            <span className="font-semibold text-ink-700">{selectedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableDatesCalendar;
