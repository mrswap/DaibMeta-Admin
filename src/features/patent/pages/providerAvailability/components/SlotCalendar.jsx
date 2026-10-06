import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiAlertTriangle } from "react-icons/fi";

const SlotCalendar = ({ dates = [], overlaps = [] }) => {
  const [selectedDate, setSelectedDate] = useState(dates[0]?.date || null);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);

  const datesByMonth = {};
  dates.forEach((d) => {
    const monthKey = d.date.substring(0, 7);
    if (!datesByMonth[monthKey]) datesByMonth[monthKey] = [];
    datesByMonth[monthKey].push(d);
  });

  const months = Object.keys(datesByMonth).sort();
  const currentMonth = months[currentMonthIdx];
  const monthDates = datesByMonth[currentMonth] || [];

  const [year, month] = currentMonth
    ? currentMonth.split("-").map(Number)
    : [0, 0];

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const selectedDateData = dates.find((d) => d.date === selectedDate);

  const calendarCells = [];
  const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    const dateData = monthDates.find((d) => d.date === dateStr);
    calendarCells.push({ day, dateStr, data: dateData });
  }

  const overlapCount = selectedDateData?.overlapCount || 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      {/* Calendar grid */}
      <div className="rounded-lg border border-ink-100 bg-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonthIdx((i) => Math.max(0, i - 1))}
            disabled={currentMonthIdx === 0}
            className="cursor-pointer rounded-lg p-1.5 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-ink-900">
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            onClick={() =>
              setCurrentMonthIdx((i) => Math.min(months.length - 1, i + 1))
            }
            disabled={currentMonthIdx === months.length - 1}
            className="cursor-pointer rounded-lg p-1.5 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-400"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            if (!cell) return <div key={idx} />;

            const isAvailable = !!cell.data;
            const isSelected = cell.dateStr === selectedDate;
            const hasOverlap = cell.data?.overlapCount > 0;

            // Color logic
            let cls;
            if (!isAvailable) {
              cls = "cursor-not-allowed text-ink-300";
            } else if (isSelected) {
              cls = "cursor-pointer bg-brand-600 font-bold text-surface";
            } else if (hasOverlap) {
              // ============ LIGHT RED for overlap ============
              cls =
                "cursor-pointer bg-danger-50 font-medium text-danger-700 ring-1 ring-danger-200 hover:bg-danger-100/70";
            } else {
              cls =
                "cursor-pointer bg-brand-50 font-medium text-brand-700 hover:bg-brand-100";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => isAvailable && setSelectedDate(cell.dateStr)}
                disabled={!isAvailable}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition ${cls}`}
              >
                <span>{cell.day}</span>
                {isAvailable && (
                  <span className="text-[9px]">{cell.data.total_slots}sl</span>
                )}
                {hasOverlap && !isSelected && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-brand-50 ring-1 ring-brand-200" />
            <span className="text-[10px] text-ink-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-danger-50 ring-1 ring-danger-200" />
            <span className="text-[10px] text-ink-600">Has overlap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-ink-100" />
            <span className="text-[10px] text-ink-600">Not in range</span>
          </div>
        </div>
      </div>

      {/* Selected date detail */}
      <div className="rounded-lg border border-ink-100 bg-surface p-4">
        {selectedDateData ? (
          <>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              {selectedDateData.day}
            </p>
            <p className="mb-3 font-jakarta text-base font-bold text-ink-900">
              {selectedDateData.date}
            </p>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-600">
                {selectedDateData.total_slots} slots
              </span>
              {overlapCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2 py-0.5 text-danger-800">
                  <FiAlertTriangle className="h-3 w-3" />
                  {overlapCount} overlap
                </span>
              )}
            </div>

            <div className="max-h-[400px] space-y-1.5 overflow-y-auto">
              {selectedDateData.slots.map((slot, idx) => {
                const isOverlap = slot.isOverlapping;

                // ============ COLOR LOGIC ============
                let cls;
                let label;

                if (!slot.selected) {
                  cls = "border-ink-200 bg-ink-100 text-ink-500";
                  label = "Blocked";
                } else if (isOverlap) {
                  // LIGHT RED
                  cls = "border-danger-200 bg-danger-50/60 text-danger-700";
                  label = "Overlap";
                } else {
                  cls = "border-brand-200 bg-brand-50 text-brand-700";
                  label = "New";
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-xs ${cls}`}
                  >
                    <span className="font-medium">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    <span className="text-[9px] font-semibold uppercase">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center py-12 text-center">
            <p className="text-xs text-ink-500">Select a date to view slots</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotCalendar;
