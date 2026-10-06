import { useState, useEffect, useMemo, useRef } from "react";
import {
  FiArrowLeft,
  FiSave,
  FiRefreshCw,
  FiInfo,
  FiAlertTriangle,
  FiEdit3,
} from "react-icons/fi";
import { usePreviewAvailability } from "../../../queries/providerAvailabilities";
import Loader from "../../../common/Loader";
import SlotCalendar from "./SlotCalendar";

// ==================== HELPERS ====================
const timeToMin = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isDayInList = (dateStr, daysOfWeek) => {
  if (!dateStr || !daysOfWeek?.length) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const jsDay = dt.getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;
  return daysOfWeek.includes(isoDay);
};

const isDateInRange = (dateStr, fromStr, toStr) => {
  if (!dateStr || !fromStr || !toStr) return false;
  return dateStr >= fromStr && dateStr <= toStr;
};

const isSlotOverlapping = (dateStr, slot, overlap) => {
  if (!isDateInRange(dateStr, overlap.date_from, overlap.date_to)) return false;
  if (!isDayInList(dateStr, overlap.days_of_week)) return false;
  const slotStart = timeToMin(slot.start_time);
  const slotEnd = timeToMin(slot.end_time);
  const ovStart = timeToMin(overlap.start_time);
  const ovEnd = timeToMin(overlap.end_time);
  return slotStart < ovEnd && slotEnd > ovStart;
};

const formatTimeRange = (start, end) => {
  const fmt = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hr}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
};

const DAY_NAMES = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

const formatDays = (days = []) => days.map((d) => DAY_NAMES[d]).join(", ");

const Step4Preview = ({
  onBack,
  onEditSchedule,
  formData,
  previewData,
  setPreviewData,
  previewSnapshot,
  setPreviewSnapshot,
  onSave,
  isSaving,
  isEdit = false,
}) => {
  const [viewMode, setViewMode] = useState("list");
  const previewMutation = usePreviewAvailability();

  const lastGeneratedConfigRef = useRef(null);

  const currentPayload = useMemo(
    () => ({
      admin_id: formData.provider_id?.value,
      appointment_type_id: formData.appointment_type_id?.value,
      date_from: formData.date_from,
      date_to: formData.date_to,
      days_of_week: formData.days_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      slot_duration: formData.slot_duration,
      capacity: formData.capacity,
    }),
    [formData],
  );

  const currentConfigStr = JSON.stringify(currentPayload);

  const configChanged = useMemo(() => {
    if (!previewSnapshot) return true;
    return JSON.stringify(previewSnapshot) !== currentConfigStr;
  }, [previewSnapshot, currentConfigStr]);

  useEffect(() => {
    if (!currentPayload.admin_id) return;
    if (!currentPayload.appointment_type_id) return;
    if (!currentPayload.date_from) return;
    if (!currentPayload.date_to) return;
    if (previewMutation.isPending) return;

    if (lastGeneratedConfigRef.current === currentConfigStr) return;
    if (previewSnapshot && !configChanged) return;

    lastGeneratedConfigRef.current = currentConfigStr;

    previewMutation.mutate(currentPayload, {
      onSuccess: (data) => {
        setPreviewData(data.data);
        setPreviewSnapshot(currentPayload);
      },
      onError: () => {
        lastGeneratedConfigRef.current = null;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConfigStr, configChanged, previewSnapshot]);

  const handleRegenerate = () => {
    lastGeneratedConfigRef.current = currentConfigStr;
    previewMutation.mutate(currentPayload, {
      onSuccess: (data) => {
        setPreviewData(data.data);
        setPreviewSnapshot(currentPayload);
      },
    });
  };

  // ==================== ENRICH SLOTS ====================
  const overlaps = previewData?.overlaps || [];
  const hasOverlap = previewData?.has_overlap || false;

  const enrichedDates = useMemo(() => {
    if (!previewData?.dates) return [];
    if (!overlaps.length) return previewData.dates;

    return previewData.dates.map((dateItem) => {
      const enrichedSlots = dateItem.slots.map((slot) => {
        const overlapping = overlaps.some((ov) =>
          isSlotOverlapping(dateItem.date, slot, ov),
        );
        return { ...slot, isOverlapping: overlapping };
      });

      const overlapCount = enrichedSlots.filter((s) => s.isOverlapping).length;

      return { ...dateItem, slots: enrichedSlots, overlapCount };
    });
  }, [previewData, overlaps]);

  const totalOverlapSlots = useMemo(() => {
    return enrichedDates.reduce((sum, d) => sum + (d.overlapCount || 0), 0);
  }, [enrichedDates]);

  const summary = previewData?.summary;
  const totalSlots = summary?.total_slots || 0;
  const newSlotsCount = totalSlots - totalOverlapSlots;

  const handleSave = () => {
    onSave({ ...currentPayload, status: true });
  };

  const isGenerating = previewMutation.isPending;
  const showSaveButton = previewData && !configChanged && !isGenerating;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-jakarta text-base font-bold text-ink-900">
            Preview & Save
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Review generated slots before saving the availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onEditSchedule && (
            <button
              type="button"
              onClick={onEditSchedule}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
            >
              <FiEdit3 className="h-3.5 w-3.5" />
              Change Schedule
            </button>
          )}

          {configChanged && !isGenerating && previewData && (
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-700 hover:bg-accent-100"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Current config summary chip */}
      {summary && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2.5 text-[11px]">
          <span className="font-semibold text-ink-700">
            {summary.date_from} → {summary.date_to}
          </span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-600">
            {formatTimeRange(summary.start_time, summary.end_time)}
          </span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-600">
            {summary.slot_duration} min slots
          </span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-600">{summary.capacity} capacity</span>
        </div>
      )}

      {isGenerating && (
        <div className="rounded-lg border border-accent-200 bg-accent-50/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiRefreshCw className="h-4 w-4 animate-spin text-accent-700" />
            <p className="text-xs font-medium text-accent-800">
              Generating preview with current configuration...
            </p>
          </div>
        </div>
      )}

      {configChanged && previewData && !isGenerating && (
        <div className="rounded-lg border border-ink-200 bg-ink-50/50 px-4 py-3">
          <div className="flex items-start gap-2">
            <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-ink-600" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink-900">
                Configuration has changed
              </p>
              <p className="mt-0.5 text-[11px] text-ink-700">
                Click <strong>Regenerate</strong> to see updated slots.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== OVERLAP INFO (not block) ==================== */}
      {hasOverlap && !configChanged && (
        <div className="rounded-lg border border-danger-200 bg-danger-50/60 px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger-100">
              <FiAlertTriangle className="h-4 w-4 text-danger-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-danger-900">
                Overlap detected
              </p>
              <p className="mt-0.5 text-xs text-danger-800">
                {totalOverlapSlots} slot{totalOverlapSlots > 1 ? "s" : ""}{" "}
                already exist in another availability for this provider.
                Overlapping slots will be <strong>skipped</strong> when saving.
              </p>
              <p className="mt-1.5 text-[11px] font-semibold text-brand-700">
                ✓ {newSlotsCount} new slot{newSlotsCount !== 1 ? "s" : ""} will
                be created
              </p>

              {/* Overlap details */}
              {overlaps.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {overlaps.slice(0, 3).map((ov) => (
                    <div
                      key={ov.id}
                      className="rounded-md border border-danger-200 bg-surface/70 px-3 py-2 text-[11px]"
                    >
                      <p className="font-semibold text-danger-900">
                        Existing: {ov.date_from} → {ov.date_to}
                      </p>
                      <p className="mt-0.5 text-ink-600">
                        {formatDays(ov.days_of_week)} ·{" "}
                        {formatTimeRange(ov.start_time, ov.end_time)}
                      </p>
                    </div>
                  ))}
                  {overlaps.length > 3 && (
                    <p className="text-[11px] text-danger-700">
                      +{overlaps.length - 3} more overlapping rule
                      {overlaps.length - 3 > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}

              {onEditSchedule && (
                <button
                  type="button"
                  onClick={onEditSchedule}
                  className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-danger-300 bg-surface px-3 py-1.5 text-[11px] font-semibold text-danger-700 hover:bg-danger-50"
                >
                  <FiEdit3 className="h-3 w-3" />
                  Or change schedule to avoid overlap
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {previewData && summary && !configChanged && (
        <>
          {/* Summary Card */}
          <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] text-ink-500">Provider</p>
                <p className="text-sm font-semibold text-ink-900">
                  {summary.provider?.name}
                </p>
                <p className="text-[11px] text-ink-500">
                  {summary.provider?.role_label}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Appointment Type</p>
                <p className="text-sm font-semibold text-ink-900">
                  {summary.appointment_type?.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Period</p>
                <p className="text-sm font-semibold text-ink-900">
                  {summary.date_from} → {summary.date_to}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Time</p>
                <p className="text-sm font-semibold text-ink-900">
                  {summary.start_time} - {summary.end_time}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Slot Duration</p>
                <p className="text-sm font-semibold text-ink-900">
                  {summary.slot_duration} Minutes
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Capacity</p>
                <p className="text-sm font-semibold text-ink-900">
                  {summary.capacity} Patient
                  {summary.capacity > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Total Slots</p>
                <p className="text-sm font-semibold text-ink-900">
                  {totalSlots}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-500">
                  {hasOverlap ? "Will Save" : "Will Save"}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    hasOverlap ? "text-brand-700" : "text-brand-700"
                  }`}
                >
                  {newSlotsCount} slot{newSlotsCount !== 1 ? "s" : ""}
                </p>
                {hasOverlap && (
                  <p className="text-[10px] text-danger-600">
                    ({totalOverlapSlots} skipped)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "list"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-surface text-ink-600 hover:bg-ink-50"
              }`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "calendar"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-surface text-ink-600 hover:bg-ink-50"
              }`}
            >
              Calendar View
            </button>
          </div>

          {viewMode === "list" ? (
            <div className="max-h-[400px] space-y-4 overflow-y-auto rounded-lg border border-ink-100 bg-surface p-4">
              {enrichedDates.map((dateItem) => (
                <div key={dateItem.date}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">
                      {dateItem.day}, {dateItem.date}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {dateItem.overlapCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2 py-0.5 text-[10px] font-semibold text-danger-800">
                          <FiAlertTriangle className="h-2.5 w-2.5" />
                          {dateItem.overlapCount} overlap
                        </span>
                      )}
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                        {dateItem.total_slots} slots
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {dateItem.slots.map((slot, idx) => {
                      const isOverlap = slot.isOverlapping;

                      let cls;
                      let label;

                      if (!slot.selected) {
                        cls = "border-ink-200 bg-ink-100 text-ink-500";
                        label = "Blocked";
                      } else if (isOverlap) {
                        cls =
                          "border-danger-200 bg-danger-50/60 text-danger-700";
                        label = "Overlap";
                      } else {
                        cls = "border-brand-200 bg-brand-50 text-brand-700";
                        label = "New";
                      }

                      return (
                        <div
                          key={idx}
                          className={`flex flex-col gap-0.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium ${cls}`}
                        >
                          <span>
                            {slot.start_time} - {slot.end_time}
                          </span>
                          <span className="text-[9px] font-semibold uppercase opacity-70">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SlotCalendar dates={enrichedDates} overlaps={overlaps} />
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-100 pt-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              <span className="text-ink-600">New slot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-danger-300" />
              <span className="text-ink-600">Overlap (skipped)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-ink-400" />
              <span className="text-ink-600">Blocked (exception)</span>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-ink-100 pt-4 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>

        {showSaveButton && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
              isSaving
                ? "cursor-wait bg-ink-100 text-ink-500"
                : "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
            }`}
          >
            <FiSave className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Availability"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Step4Preview;
