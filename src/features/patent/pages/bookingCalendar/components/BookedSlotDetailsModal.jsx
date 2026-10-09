// src/features/patent/pages/bookingCalendar/components/BookedSlotDetailsModal.jsx

import {
  FiX,
  FiUser,
  FiPhone,
  FiCalendar,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDateFull = (d) => {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const BookedSlotDetailsModal = ({ open, onClose, slot, provider, date }) => {
  if (!open || !slot || !provider) return null;

  const appointment = slot.appointment || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FiCheckCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-jakarta text-base font-bold text-ink-900">
                Booked Slot
              </h2>
              <p className="text-[11px] text-ink-500">
                This slot is already booked
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Status banner */}
        <div className="border-b border-ink-100 bg-brand-50/40 px-5 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-800">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-600" />
              {appointment.status_label || appointment.status || "Booked"}
            </span>
            {appointment.id && (
              <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
                #{appointment.id}
              </code>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-5">
          {/* Patient */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Patient
            </p>
            <div className="mt-1.5 flex items-start gap-2.5 rounded-lg border border-ink-100 bg-ink-50/40 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
                {(appointment.name || "?")
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {appointment.name || "—"}
                </p>
                {appointment.mobile && (
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500">
                    <FiPhone className="h-3 w-3" />
                    <span className="tabular-nums">{appointment.mobile}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Provider & Time */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
              <div className="flex items-center gap-1.5">
                <FiUser className="h-3 w-3 text-ink-400" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  Provider
                </p>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-ink-900">
                {provider.name || "—"}
              </p>
            </div>

            <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
              <div className="flex items-center gap-1.5">
                <FiClock className="h-3 w-3 text-ink-400" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  Time
                </p>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-900">
                {formatTime12(slot.start_time)} – {formatTime12(slot.end_time)}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="h-3 w-3 text-ink-400" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Date
              </p>
            </div>
            <p className="mt-1 text-sm font-semibold text-ink-900">
              {formatDateFull(date)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-ink-100 bg-ink-50/30 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookedSlotDetailsModal;
