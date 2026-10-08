// src/features/patent/pages/visits/components/SlotSelector.jsx

import { useMemo } from "react";
import {
  FiClock,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import {
  useProviderAvailabilitiesForCalendar,
  useExceptionsForCalendar,
  useBookedSlotsByDate,
} from "../../../queries/visits";
import Loader from "../../../common/Loader";

// ==================== HELPERS ====================
const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const getISODay = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const jsDay = dt.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

const isDateInRange = (date, from, to) => {
  if (!date || !from || !to) return false;
  return date >= from && date <= to;
};

const generateSlots = (startTime, endTime, duration) => {
  if (!startTime || !endTime || !duration) return [];
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const slots = [];
  for (let t = startMin; t + duration <= endMin; t += duration) {
    slots.push({
      start_time: minutesToTime(t),
      end_time: minutesToTime(t + duration),
    });
  }
  return slots;
};

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDateDisplay = (d) => {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

// ==================== SLOT STYLES (from SlotGrid) ====================
const SLOT_STYLES = {
  available:
    "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
  booked: "cursor-not-allowed border-ink-200 bg-ink-100 text-ink-500",
  blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
  selected:
    "cursor-pointer border-brand-600 bg-brand-600 text-surface ring-2 ring-brand-500/30",
};

const SLOT_LABELS = {
  available: "Available",
  booked: "Booked",
  blocked: "Blocked",
  selected: "Selected",
};

// ==================== COMPONENT ====================
const SlotSelector = ({
  providerId,
  date,
  onDateChange,
  selectedSlot,
  onSlotSelect,
  disabled = false,
}) => {
  // Load provider availabilities
  const { data: availabilitiesData = [], isLoading: loadingAvail } =
    useProviderAvailabilitiesForCalendar(providerId);

  const availabilities = Array.isArray(availabilitiesData)
    ? availabilitiesData
    : [];

  // Active availability for selected date
  const activeAvailability = useMemo(() => {
    if (!providerId || !date) return null;
    const isoDay = getISODay(date);
    return (
      availabilities.find((av) => {
        if (!av.status) return false;
        if (!isDateInRange(date, av.date_from, av.date_to)) return false;
        const days = av.days_of_week || [];
        return days.includes(isoDay);
      }) || null
    );
  }, [availabilities, providerId, date]);

  // Load exceptions
  const { data: exceptionsData = [] } = useExceptionsForCalendar(
    activeAvailability?.id,
  );

  const exceptions = Array.isArray(exceptionsData) ? exceptionsData : [];

  // Load booked appointments for this date
  const { data: bookedData = [], isLoading: loadingBooked } =
    useBookedSlotsByDate(date);

  const allBookedAppointments = Array.isArray(bookedData) ? bookedData : [];

  // Filter booked appointments for active provider
  const providerBookedAppointments = useMemo(
    () =>
      allBookedAppointments.filter(
        (a) => (a.provider_id || a.provider?.id) === providerId,
      ),
    [allBookedAppointments, providerId],
  );

  // ==================== SLOT COMPUTATION ====================
  const slots = useMemo(() => {
    if (!activeAvailability) return [];

    const generated = generateSlots(
      activeAvailability.start_time,
      activeAvailability.end_time,
      activeAvailability.slot_duration,
    );

    const dateExceptions = exceptions.filter(
      (ex) => ex.exception_date?.slice(0, 10) === date && ex.status,
    );

    const hasFullDay = dateExceptions.some(
      (ex) => !ex.start_time && !ex.end_time,
    );

    const bookedStartTimes = new Set(
      providerBookedAppointments.map((a) => a.start_time?.slice(0, 5)),
    );

    return generated.map((slot) => {
      const isBooked = bookedStartTimes.has(slot.start_time);

      const isBlocked =
        hasFullDay ||
        dateExceptions.some((ex) => {
          if (!ex.start_time || !ex.end_time) return false;
          const exStart = ex.start_time.slice(0, 5);
          const exEnd = ex.end_time.slice(0, 5);
          return slot.start_time >= exStart && slot.end_time <= exEnd;
        });

      const isSelected =
        selectedSlot?.start_time === slot.start_time &&
        selectedSlot?.end_time === slot.end_time;

      let status = "available";
      if (isSelected) status = "selected";
      else if (isBooked) status = "booked";
      else if (isBlocked) status = "blocked";

      return {
        ...slot,
        status,
        appointment: providerBookedAppointments.find(
          (a) => a.start_time?.slice(0, 5) === slot.start_time,
        ),
      };
    });
  }, [
    activeAvailability,
    exceptions,
    providerBookedAppointments,
    date,
    selectedSlot,
  ]);

  const stats = useMemo(() => {
    const available = slots.filter(
      (s) => s.status === "available" || s.status === "selected",
    ).length;
    const booked = slots.filter((s) => s.status === "booked").length;
    const blocked = slots.filter((s) => s.status === "blocked").length;
    return { available, booked, blocked, total: slots.length };
  }, [slots]);

  // ==================== NO PROVIDER ====================
  if (!providerId) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
          <FiUser className="h-5 w-5 text-ink-500" />
        </div>
        <p className="text-sm font-medium text-ink-700">
          Select a provider first
        </p>
        <p className="mt-1 text-xs text-ink-500">
          Choose a provider to view their available slots.
        </p>
      </div>
    );
  }

  // ==================== LOADING ====================
  if (loadingAvail) {
    return <Loader text="Loading slots..." />;
  }

  // ==================== NO AVAILABILITY ====================
  if (!activeAvailability) {
    return (
      <div className="space-y-3">
        <DateSelector date={date} onDateChange={onDateChange} />

        <div className="rounded-xl border border-dashed border-warn-200 bg-warn-50/40 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warn-100">
            <FiInfo className="h-5 w-5 text-warn-700" />
          </div>
          <p className="text-sm font-medium text-warn-900">
            No availability on {formatDateDisplay(date)}
          </p>
          <p className="mt-1 text-xs text-warn-800">
            Provider has no availability for this date. Try another date.
          </p>
        </div>
      </div>
    );
  }

  // ==================== SLOTS ====================
  return (
    <div className="space-y-3">
      <DateSelector date={date} onDateChange={onDateChange} />

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Available Slots
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
              {stats.available} available
            </span>
            {stats.booked > 0 && (
              <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                {stats.booked} booked
              </span>
            )}
            {stats.blocked > 0 && (
              <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
                {stats.blocked} blocked
              </span>
            )}
          </div>
        </div>

        {/* Slots */}
        <div className="p-4">
          {loadingBooked ? (
            <div className="py-8 text-center">
              <p className="text-xs text-ink-500">Loading slots...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-ink-500">No slots available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {slots.map((slot, idx) => {
                const isSelectable = slot.status === "available";
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => isSelectable && onSlotSelect(slot)}
                    disabled={!isSelectable || disabled}
                    title={
                      slot.appointment
                        ? `Booked — ${slot.appointment.name || "—"}`
                        : SLOT_LABELS[slot.status]
                    }
                    className={`flex flex-col gap-1 rounded-lg border p-2.5 text-left transition sm:p-3 ${SLOT_STYLES[slot.status]} ${
                      disabled ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold">
                        {formatTime12(slot.start_time)}
                      </span>
                    </div>
                    <p className="truncate text-[10px] opacity-80">
                      to {formatTime12(slot.end_time)}
                    </p>
                    <p className="text-[9px] font-semibold uppercase opacity-70">
                      {SLOT_LABELS[slot.status]}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/30 px-4 py-2.5 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded bg-brand-500" />
            <span className="text-ink-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded bg-ink-400" />
            <span className="text-ink-600">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded bg-danger-500" />
            <span className="text-ink-600">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== DATE SELECTOR ====================
const DateSelector = ({ date, onDateChange }) => {
  const handlePrev = () => {
    if (!date) return;
    const [y, m, d] = date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - 1);
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, "0");
    const nd = String(dt.getDate()).padStart(2, "0");
    onDateChange(`${ny}-${nm}-${nd}`);
  };

  const handleNext = () => {
    if (!date) return;
    const [y, m, d] = date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + 1);
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, "0");
    const nd = String(dt.getDate()).padStart(2, "0");
    onDateChange(`${ny}-${nm}-${nd}`);
  };

  const handleToday = () => onDateChange(todayStr());

  const isToday = date === todayStr();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2.5">
      <button
        type="button"
        onClick={handlePrev}
        className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100"
        title="Previous day"
      >
        <FiChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center justify-center gap-3">
        <p className="text-sm font-semibold text-ink-900">
          {formatDateDisplay(date) || "Select date"}
        </p>
        {!isToday && (
          <button
            type="button"
            onClick={handleToday}
            className="cursor-pointer rounded-md border border-ink-200 bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-600 hover:bg-ink-50"
          >
            Today
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="cursor-pointer rounded-md p-1.5 text-ink-600 transition hover:bg-ink-100"
        title="Next day"
      >
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SlotSelector;
