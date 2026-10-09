// src/features/patent/pages/bookingCalendar/components/SlotList.jsx

import { useMemo } from "react";
import {
  FiClock,
  FiPlus,
  FiInfo,
  FiCheck,
  FiLock,
  FiUser,
} from "react-icons/fi";
import { useExceptionsForCalendar } from "../../../queries/bookingCalendar";

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

const toShortTime = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 5);
  return "";
};

const toLocalDateString = (val) => {
  if (!val) return "";
  if (typeof val === "string" && val.length === 10 && !val.includes("T")) {
    return val;
  }
  const dt = new Date(val);
  if (isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ==================== SLOT STYLES ====================
const SLOT_STYLES = {
  available:
    "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
  booked:
    "cursor-pointer border-ink-200 bg-ink-100 text-ink-500 hover:border-ink-300",
  blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
};

const SLOT_ICONS = {
  available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
  booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
  blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
};

const SLOT_ICON_BG = {
  available: "bg-brand-500",
  booked: "bg-ink-400",
  blocked: "bg-danger-500",
};

const SLOT_LABELS = {
  available: "Available",
  booked: "Booked",
  blocked: "Blocked",
};

// ==================== COMPONENT ====================
const SlotList = ({
  availability,
  bookedAppointments = [],
  date,
  onSlotClick,
  onBookedSlotClick,
  onAddAvailability,
}) => {
  // ==================== FETCH EXCEPTIONS ====================
  const { data: exceptions = [] } = useExceptionsForCalendar(availability?.id);

  const exceptionsList = Array.isArray(exceptions) ? exceptions : [];

  // ==================== SLOT COMPUTATION ====================
  const slots = useMemo(() => {
    if (!availability) return [];

    const generated = generateSlots(
      availability.start_time,
      availability.end_time,
      availability.slot_duration,
    );

    const bookedStartTimes = new Set(
      bookedAppointments.map((a) => a.start_time?.slice(0, 5)),
    );

    const dateExceptions = exceptionsList.filter(
      (ex) =>
        toLocalDateString(ex.exception_date) === date && ex.status !== false,
    );

    const hasFullDay = dateExceptions.some(
      (ex) => !ex.start_time && !ex.end_time,
    );

    const blockedRanges = dateExceptions
      .filter((ex) => ex.start_time && ex.end_time)
      .map((ex) => ({
        start: timeToMinutes(toShortTime(ex.start_time)),
        end: timeToMinutes(toShortTime(ex.end_time)),
      }));

    return generated.map((slot) => {
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);

      const bookedAppointment = bookedAppointments.find(
        (a) => a.start_time?.slice(0, 5) === slot.start_time,
      );

      const isBooked = !!bookedAppointment;

      const isBlocked =
        !isBooked &&
        (hasFullDay ||
          blockedRanges.some((r) => slotStart < r.end && slotEnd > r.start));

      let status = "available";
      if (isBooked) status = "booked";
      else if (isBlocked) status = "blocked";

      const bookingMeta = bookedAppointment
        ? {
            id: bookedAppointment.id,
            name: bookedAppointment.name || "—",
            mobile: bookedAppointment.mobile || "—",
            status: bookedAppointment.status,
            status_label: bookedAppointment.status_label,
            booking_source: bookedAppointment.booking_source,
          }
        : null;

      return {
        ...slot,
        status,
        isBooked,
        appointment: bookingMeta,
        rawAppointment: bookedAppointment,
      };
    });
  }, [availability, bookedAppointments, exceptionsList, date]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const available = slots.filter((s) => s.status === "available").length;
    const booked = slots.filter((s) => s.status === "booked").length;
    const blocked = slots.filter((s) => s.status === "blocked").length;
    return { available, booked, blocked, total: slots.length };
  }, [slots]);

  // ==================== NO AVAILABILITY ====================
  if (!availability) {
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Slots for {date}
            </p>
          </div>
        </div>

        <div className="px-4 py-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warn-100 text-warn-700">
            <FiInfo className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-ink-700">
            No availability configured
          </p>
          <p className="mt-1 text-xs text-ink-500">
            This provider has no availability for {date}.
          </p>

          <button
            type="button"
            onClick={onAddAvailability}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
          >
            <FiPlus className="h-3.5 w-3.5" />
            Add Availability
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* Header */}
      <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Slots for {date}
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
      </div>

      {/* Slot grid — 3 columns only on xl+ screens (1280px+) */}
      <div className="max-h-[480px] overflow-y-auto p-4">
        {slots.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-ink-500">No slots available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {slots.map((slot, idx) => {
              const status = slot.status;
              const isAvailable = status === "available";
              const isBooked = status === "booked";
              const isBlocked = status === "blocked";

              const handleClick = () => {
                if (isAvailable) onSlotClick(slot);
                else if (isBooked && onBookedSlotClick) onBookedSlotClick(slot);
              };

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isBlocked}
                  onClick={handleClick}
                  title={
                    isBooked
                      ? `Booked — ${slot.appointment?.name || "—"} (click for details)`
                      : isBlocked
                        ? "Blocked by availability exception"
                        : "Click to book"
                  }
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition ${SLOT_STYLES[status]}`}
                >
                  {/* Left: time info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold leading-tight">
                      {formatTime12(slot.start_time)}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] leading-tight opacity-80">
                      to {formatTime12(slot.end_time)}
                    </p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide opacity-60">
                      {SLOT_LABELS[status]}
                    </p>
                  </div>

                  {/* Right: status icon */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SLOT_ICON_BG[status]}`}
                  >
                    {SLOT_ICONS[status]}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-ink-100 bg-ink-50/30 px-3 py-2.5">
        <button
          type="button"
          onClick={onAddAvailability}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Add / Manage Availability
        </button>
      </div>
    </div>
  );
};

export default SlotList;
