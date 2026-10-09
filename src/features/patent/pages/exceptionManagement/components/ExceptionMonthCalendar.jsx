// src/features/patent/pages/exceptionManagement/components/ExceptionMonthCalendar.jsx

import { useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiLock,
} from "react-icons/fi";

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

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MAX_DOTS = 4;

// ==================== HELPERS ====================
const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getISODay = (date) => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

const ExceptionMonthCalendar = ({
  selectedDate,
  onSelectDate,
  dateExceptionMap = {},
  activeProviderId,
  allProviders = [],
  viewMonth,
  setViewMonth,
  onMonthChange,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // ==================== MONTH NAVIGATION ====================
  const handlePrevMonth = () => {
    setViewMonth((v) => {
      const next =
        v.month === 0
          ? { year: v.year - 1, month: 11 }
          : { year: v.year, month: v.month - 1 };
      if (onMonthChange) onMonthChange(next);
      return next;
    });
  };

  const handleNextMonth = () => {
    setViewMonth((v) => {
      const next =
        v.month === 11
          ? { year: v.year + 1, month: 0 }
          : { year: v.year, month: v.month + 1 };
      if (onMonthChange) onMonthChange(next);
      return next;
    });
  };

  const handleToday = () => {
    const next = {
      year: today.getFullYear(),
      month: today.getMonth(),
    };
    setViewMonth(next);
    if (onMonthChange) onMonthChange(next);
    onSelectDate(formatDateStr(today));
  };

  // ==================== CALENDAR CELLS ====================
  const cells = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayISO = getISODay(firstDay);
    const leadingBlanks = firstDayISO - 1;

    const arr = [];
    for (let i = 0; i < leadingBlanks; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(year, month, d));
    }
    return arr;
  }, [viewMonth]);

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const selectedDateObj = parseDate(selectedDate);

  // ==================== PROVIDER LOOKUP ====================
  const providerMap = useMemo(() => {
    const map = new Map();
    allProviders.forEach((p) => map.set(p.id, p));
    return map;
  }, [allProviders]);

  // ==================== RENDER ====================
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100"
          title="Previous month"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-ink-900">
            {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
          </p>
          <button
            type="button"
            onClick={handleToday}
            className="cursor-pointer rounded-md border border-ink-200 bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-600 hover:bg-ink-50"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100"
          title="Next month"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ==================== DAY LABELS ==================== */}
      <div className="grid grid-cols-7 border-b border-ink-100">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-ink-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ==================== CALENDAR GRID ==================== */}
      <div className="grid grid-cols-7 gap-1 p-3">
        {cells.map((date, idx) => {
          if (!date) return <div key={`blank-${idx}`} />;

          const dateStr = formatDateStr(date);
          const isSelected = isSameDay(date, selectedDateObj);
          const isToday = isSameDay(date, today);
          const isPast = date < today;

          const dateExceptions = dateExceptionMap[dateStr] || [];

          const filteredExceptions = activeProviderId
            ? dateExceptions.filter(
                (ex) => ex.provider?.id === activeProviderId,
              )
            : dateExceptions;

          const hasExceptions = dateExceptions.length > 0;
          const hasFilteredExceptions = filteredExceptions.length > 0;

          const uniqueProviders = [];
          const seen = new Set();
          filteredExceptions.forEach((ex) => {
            if (ex.provider?.id && !seen.has(ex.provider.id)) {
              seen.add(ex.provider.id);
              const p = providerMap.get(ex.provider.id);
              if (p) uniqueProviders.push(p);
            }
          });

          const sortedProviders = [...uniqueProviders].sort((a, b) => {
            if (a.id === activeProviderId) return -1;
            if (b.id === activeProviderId) return 1;
            return 0;
          });

          const visibleDots = sortedProviders.slice(0, MAX_DOTS);
          const extraCount = sortedProviders.length - MAX_DOTS;

          // ==================== CELL STYLING ====================
          let cellCls;

          if (isSelected) {
            cellCls =
              "cursor-pointer bg-brand-600 font-bold text-surface shadow-sm";
          } else if (isToday) {
            cellCls =
              "cursor-pointer bg-brand-50 text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100";
          } else if (hasFilteredExceptions && activeProviderId && !isPast) {
            cellCls =
              "cursor-pointer bg-danger-50/60 text-danger-700 hover:bg-danger-100/70";
          } else if (hasExceptions && !activeProviderId && !isPast) {
            cellCls =
              "cursor-pointer bg-danger-50/60 text-danger-700 hover:bg-danger-100/70";
          } else if (isPast) {
            cellCls = "cursor-pointer text-ink-400 hover:bg-ink-50";
          } else {
            cellCls = "cursor-pointer text-ink-600 hover:bg-ink-50";
          }

          const tooltipText = hasExceptions
            ? `${dateExceptions.length} blocked slot${
                dateExceptions.length > 1 ? "s" : ""
              }`
            : undefined;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              title={tooltipText}
              className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition ${cellCls}`}
            >
              <span className="leading-none">{date.getDate()}</span>

              {hasFilteredExceptions && activeProviderId && (
                <span
                  className={`inline-flex items-center gap-0.5 leading-none ${
                    isSelected ? "text-surface" : "text-danger-600"
                  }`}
                >
                  <FiLock className="h-2 w-2" />
                  <span className="text-[8px] font-bold">
                    {filteredExceptions.length}
                  </span>
                </span>
              )}

              {!activeProviderId && hasExceptions && !isSelected && (
                <div className="flex items-center justify-center gap-0.5">
                  {visibleDots.map((p) => (
                    <span
                      key={p.id}
                      className="inline-block h-1 w-1 rounded-full"
                      style={{
                        backgroundColor: p.color?.hex || "#9ca3af",
                      }}
                      title={p.name}
                    />
                  ))}
                  {extraCount > 0 && (
                    <span className="text-[7px] font-bold leading-none text-ink-500">
                      +{extraCount}
                    </span>
                  )}
                </div>
              )}

              {activeProviderId && hasFilteredExceptions && !isSelected && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger-500"
                  title="Has blocked slots"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== LEGEND ==================== */}
      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/30 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <FiCalendar className="h-3 w-3 text-ink-500" />
          <p className="text-[10px] text-ink-500">Selected:</p>
          <p className="text-[10px] font-semibold text-ink-800">
            {selectedDate}
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-danger-50 ring-1 ring-danger-200" />
            <span className="text-[10px] text-ink-600">Has blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-brand-50 ring-1 ring-brand-200" />
            <span className="text-[10px] text-ink-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExceptionMonthCalendar;
