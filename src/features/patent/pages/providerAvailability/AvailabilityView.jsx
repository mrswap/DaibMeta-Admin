import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiEdit2,
  FiCalendar,
  FiClock,
  FiUsers,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useProviderAvailability } from "../../queries/providerAvailabilities";
import Loader from "../../common/Loader";

// ==================== TIME HELPERS ====================
const timeToMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const formatTime12 = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

const generateSlots = (startTime, endTime, duration) => {
  if (!startTime || !endTime || !duration) return [];
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const slots = [];
  for (let t = startMin; t + duration <= endMin; t += duration) {
    slots.push({
      start: minutesToTime(t),
      end: minutesToTime(t + duration),
    });
  }
  return slots;
};

// ==================== DATE HELPERS ====================
const DAY_NAMES = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

// Convert JS getDay() (0=Sun, 1=Mon) to ISO (1=Mon, 7=Sun)
const getISODay = (date) => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

// Generate all dates between date_from and date_to that match days_of_week
const generateDates = (dateFrom, dateTo, daysOfWeek) => {
  if (!dateFrom || !dateTo || !daysOfWeek?.length) return [];

  const dates = [];
  const start = new Date(dateFrom + "T00:00:00");
  const end = new Date(dateTo + "T00:00:00");

  const current = new Date(start);
  while (current <= end) {
    const isoDay = getISODay(current);
    if (daysOfWeek.includes(isoDay)) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      dates.push({
        dateStr: `${y}-${m}-${d}`,
        dayOfWeek: isoDay,
        dayName: DAY_NAMES[isoDay],
        jsDate: new Date(current),
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const formatDateFull = (d) =>
  d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ==================== COMPONENT ====================
const AvailabilityView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProviderAvailability(id);

  const [expandedDates, setExpandedDates] = useState({});
  const [showAll, setShowAll] = useState(false);

  // Compute all slots (per-day template)
  const dailySlots = useMemo(() => {
    if (!data) return [];
    return generateSlots(data.start_time, data.end_time, data.slot_duration);
  }, [data]);

  // Compute all applicable dates
  const allDates = useMemo(() => {
    if (!data) return [];
    return generateDates(data.date_from, data.date_to, data.days_of_week);
  }, [data]);

  if (isLoading) return <Loader text="Loading availability..." />;

  if (!data) {
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm text-ink-500">Availability not found.</p>
      </div>
    );
  }

  const days = data.days || [];

  // Which dates to display
  const visibleDates = showAll ? allDates : allDates.slice(0, 7);
  const hiddenCount = allDates.length - visibleDates.length;

  const toggleExpand = (dateStr) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  const expandAll = () => {
    const next = {};
    allDates.forEach((d) => (next[d.dateStr] = true));
    setExpandedDates(next);
  };

  const collapseAll = () => setExpandedDates({});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/provider-availabilities")}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to List
        </button>
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate(`/provider-availabilities/${id}/exceptions`)
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-warn-200 bg-warn-50 px-4 py-2 text-sm font-semibold text-warn-800 hover:bg-warn-100"
          >
            <FiAlertCircle className="h-4 w-4" />
            Manage Exceptions
          </button>
          <button
            onClick={() => navigate(`/provider-availabilities/${id}/edit`)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiEdit2 className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Hero card — schedule + slot config */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-jakarta text-lg font-bold text-ink-900 sm:text-xl">
                {data.provider?.name}
              </h1>
              <p className="mt-0.5 text-sm text-ink-500">
                {data.provider?.role_label}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                data.status
                  ? "bg-brand-50 text-brand-700"
                  : "bg-ink-100 text-ink-600"
              }`}
            >
              {data.status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-ink-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {/* Left — Schedule */}
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <FiCalendar className="h-4 w-4 text-ink-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Schedule
              </h2>
            </div>

            <div className="space-y-4">
              <Row
                label="Appointment Type"
                value={data.appointment_type?.name || "—"}
              />

              <div className="grid grid-cols-2 gap-4">
                <Row label="Available From" value={data.date_from || "—"} />
                <Row label="Available Until" value={data.date_to || "—"} />
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-ink-500">
                  Available Days
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {days.length > 0 ? (
                    days.map((d) => (
                      <span
                        key={d}
                        className="inline-flex rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                      >
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-ink-500">—</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Row label="Start Time" value={data.start_time || "—"} />
                <Row label="End Time" value={data.end_time || "—"} />
              </div>
            </div>
          </div>

          {/* Right — Slot Config */}
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <FiClock className="h-4 w-4 text-ink-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Slot Configuration
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-ink-100 bg-ink-50/30 p-3">
                  <p className="text-[10px] font-medium text-ink-500">
                    Duration
                  </p>
                  <p className="mt-0.5 text-base font-bold text-ink-900">
                    {data.slot_duration} min
                  </p>
                </div>
                <div className="rounded-lg border border-ink-100 bg-ink-50/30 p-3">
                  <p className="text-[10px] font-medium text-ink-500">
                    Capacity
                  </p>
                  <p className="mt-0.5 text-base font-bold text-ink-900">
                    {data.capacity}
                  </p>
                </div>
                <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3">
                  <p className="text-[10px] font-medium text-brand-600">
                    Per Day
                  </p>
                  <p className="mt-0.5 text-base font-bold text-brand-700">
                    {dailySlots.length} slots
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-ink-100 bg-ink-50/30 p-3">
                  <p className="text-[10px] font-medium text-ink-500">
                    Total Days
                  </p>
                  <p className="mt-0.5 text-base font-bold text-ink-900">
                    {allDates.length}
                  </p>
                </div>
                <div className="rounded-lg border border-accent-200 bg-accent-50/50 p-3">
                  <p className="text-[10px] font-medium text-accent-700">
                    Total Slots
                  </p>
                  <p className="mt-0.5 text-base font-bold text-accent-800">
                    {allDates.length * dailySlots.length}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-accent-200 bg-accent-50/50 p-3">
                <div className="flex items-start gap-2">
                  <FiUsers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-700" />
                  <p className="text-[11px] leading-relaxed text-accent-800">
                    Each slot is <strong>{data.slot_duration} minutes</strong>{" "}
                    and can accommodate{" "}
                    <strong>
                      {data.capacity} patient{data.capacity > 1 ? "s" : ""}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit footer */}
        <div className="border-t border-ink-100 bg-ink-50/30 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-ink-500">
            {data.created_by && (
              <span>
                Created by{" "}
                <strong className="text-ink-700">{data.created_by.name}</strong>
              </span>
            )}
            {data.updated_by && (
              <span>
                Updated by{" "}
                <strong className="text-ink-700">{data.updated_by.name}</strong>
              </span>
            )}
            {data.created_at && (
              <span>
                Created on{" "}
                <strong className="text-ink-700">
                  {new Date(data.created_at).toLocaleString()}
                </strong>
              </span>
            )}
            {data.updated_at && (
              <span>
                Last updated{" "}
                <strong className="text-ink-700">
                  {new Date(data.updated_at).toLocaleString()}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Date-wise Slots */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-jakarta text-base font-bold text-ink-900">
              Date-wise Slots
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              All available dates and their generated slots
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="cursor-pointer rounded-md border border-ink-200 bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-600 hover:bg-ink-50"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="cursor-pointer rounded-md border border-ink-200 bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-600 hover:bg-ink-50"
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {allDates.length === 0 ? (
            <p className="text-sm text-ink-500">
              No dates in the selected range match the available days.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {visibleDates.map((dateItem) => {
                  const isExpanded = expandedDates[dateItem.dateStr];

                  return (
                    <div
                      key={dateItem.dateStr}
                      className="overflow-hidden rounded-lg border border-ink-100 bg-surface transition hover:border-ink-200"
                    >
                      {/* Date header — clickable */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(dateItem.dateStr)}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-ink-50/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-brand-50 text-brand-700">
                            <span className="text-[9px] font-semibold uppercase leading-none">
                              {dateItem.dayName.slice(0, 3)}
                            </span>
                            <span className="mt-0.5 text-xs font-bold leading-none">
                              {dateItem.jsDate.getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink-900">
                              {formatDateFull(dateItem.jsDate)}
                            </p>
                            <p className="text-[11px] text-ink-500">
                              {dailySlots.length} slots
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-700">
                            Available
                          </span>
                          {isExpanded ? (
                            <FiChevronUp className="h-4 w-4 text-ink-400" />
                          ) : (
                            <FiChevronDown className="h-4 w-4 text-ink-400" />
                          )}
                        </div>
                      </button>

                      {/* Slots — expanded */}
                      {isExpanded && (
                        <div className="border-t border-ink-100 bg-ink-50/20 px-4 py-3">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                            {dailySlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-md border border-brand-200 bg-surface px-3 py-2"
                              >
                                <div>
                                  <p className="text-[11px] font-semibold text-ink-800">
                                    {formatTime12(slot.start)}
                                  </p>
                                  <p className="text-[10px] text-ink-500">
                                    to {formatTime12(slot.end)}
                                  </p>
                                </div>
                                <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-700">
                                  #{idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show more / less */}
              {hiddenCount > 0 && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
                  >
                    Show all {allDates.length} dates ({hiddenCount} more)
                  </button>
                </div>
              )}

              {showAll && allDates.length > 7 && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
                  >
                    Show less
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div>
    <p className="mb-0.5 text-[11px] font-medium text-ink-500">{label}</p>
    <p className="text-sm font-medium text-ink-800">{value}</p>
  </div>
);

export default AvailabilityView;
