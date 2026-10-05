import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const SlotCalendar = ({ dates = [] }) => {
  const [selectedDate, setSelectedDate] = useState(dates[0]?.date || null);

  // Group dates by month
  const datesByMonth = {};
  dates.forEach((d) => {
    const monthKey = d.date.substring(0, 7); // YYYY-MM
    if (!datesByMonth[monthKey]) datesByMonth[monthKey] = [];
    datesByMonth[monthKey].push(d);
  });

  const months = Object.keys(datesByMonth).sort();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);

  const currentMonth = months[currentMonthIdx];
  const monthDates = datesByMonth[currentMonth] || [];

  // Get first day of month, last day
  const [year, month] = currentMonth
    ? currentMonth.split("-").map(Number)
    : [0, 0];
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month, 0).getDate();

  const selectedDateData = dates.find((d) => d.date === selectedDate);

  // Build calendar grid
  const calendarCells = [];
  const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0

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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      {/* Calendar grid */}
      <div className="rounded-lg border border-ink-100 bg-surface p-4">
        {/* Month nav */}
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

        {/* Day headers */}
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

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            if (!cell) return <div key={idx} />;

            const isAvailable = !!cell.data;
            const isSelected = cell.dateStr === selectedDate;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => isAvailable && setSelectedDate(cell.dateStr)}
                disabled={!isAvailable}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition ${
                  isAvailable
                    ? isSelected
                      ? "cursor-pointer bg-brand-600 font-bold text-surface"
                      : "cursor-pointer bg-brand-50 font-medium text-brand-700 hover:bg-brand-100"
                    : "cursor-not-allowed text-ink-300"
                }`}
              >
                <span>{cell.day}</span>
                {isAvailable && (
                  <span className="text-[9px]">{cell.data.total_slots}sl</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 border-t border-ink-100 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-brand-50" />
            <span className="text-[10px] text-ink-600">Available</span>
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
            <p className="mb-3 text-xs text-ink-500">
              {selectedDateData.total_slots} slots available
            </p>
            <div className="max-h-[400px] space-y-1.5 overflow-y-auto">
              {selectedDateData.slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md border border-ink-100 px-3 py-1.5 text-xs"
                >
                  <span className="font-medium text-ink-700">
                    {slot.start_time} - {slot.end_time}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                      slot.selected
                        ? "bg-brand-50 text-brand-700"
                        : "bg-danger-50 text-danger-700"
                    }`}
                  >
                    {slot.selected ? "Active" : "Blocked"}
                  </span>
                </div>
              ))}
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
