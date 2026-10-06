import { useState, useMemo, useEffect } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiUser,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { useSlotsForDate } from "../../../queries/availabilityExceptions";
import { useProviderAvailabilities } from "../../../queries/providerAvailabilities";
import SlotGrid from "./SlotGrid";
import AvailableDatesCalendar from "./AvailableDatesCalendar";

const Step3DateSlots = ({ formData, setFormData, onNext, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(
    formData.appointment_date || "",
  );

  const providerId = formData.provider_id?.value;
  const appointmentTypeId = formData.appointment_type_id?.value;

  // ==================== FETCH AVAILABILITY RULES ====================
  const {
    data: availabilitiesData,
    isLoading: loadingAvailabilities,
    isFetching: fetchingAvailabilities,
  } = useProviderAvailabilities(
    providerId && appointmentTypeId
      ? {
          admin_id: providerId,
          appointment_type_id: appointmentTypeId,
          status: 1,
          per_page: 100,
        }
      : { per_page: 0 },
  );

  const availabilities = availabilitiesData?.list || [];

  // Aggregate all date ranges and days from all active availabilities
  const availableConfig = useMemo(() => {
    if (!availabilities.length) {
      return { dateFrom: null, dateTo: null, daysOfWeek: [] };
    }

    // Find earliest date_from and latest date_to
    let earliestFrom = null;
    let latestTo = null;
    const allDays = new Set();

    availabilities.forEach((av) => {
      if (!earliestFrom || av.date_from < earliestFrom) {
        earliestFrom = av.date_from;
      }
      if (!latestTo || av.date_to > latestTo) {
        latestTo = av.date_to;
      }
      (av.days_of_week || []).forEach((d) => allDays.add(d));
    });

    return {
      dateFrom: earliestFrom,
      dateTo: latestTo,
      daysOfWeek: Array.from(allDays).sort((a, b) => a - b),
    };
  }, [availabilities]);

  const hasAvailability = !!availableConfig.dateFrom;

  // Auto-select first valid date if none selected
  useEffect(() => {
    if (selectedDate) return;
    if (!availableConfig.dateFrom) return;

    // Find first available date from today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [fy, fm, fd] = availableConfig.dateFrom.split("-").map(Number);
    const [ty, tm, td] = availableConfig.dateTo.split("-").map(Number);
    const from = new Date(fy, fm - 1, fd);
    const to = new Date(ty, tm - 1, td);

    const start = from < today ? today : from;

    const current = new Date(start);
    while (current <= to) {
      const jsDay = current.getDay();
      const isoDay = jsDay === 0 ? 7 : jsDay;
      if (availableConfig.daysOfWeek.includes(isoDay)) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, "0");
        const d = String(current.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        setSelectedDate(dateStr);
        setFormData((prev) => ({
          ...prev,
          appointment_date: dateStr,
        }));
        return;
      }
      current.setDate(current.getDate() + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableConfig.dateFrom, availableConfig.dateTo]);

  // ==================== FETCH SLOTS ====================
  const {
    data: slotsData,
    isLoading: loadingSlots,
    isFetching: fetchingSlots,
  } = useSlotsForDate({
    adminId: providerId,
    appointmentTypeId: appointmentTypeId,
    date: selectedDate,
  });

  const slots = slotsData || [];

  // Stats
  const stats = useMemo(() => {
    const available = slots.filter((s) => s.available === true).length;
    const blocked = slots.filter((s) => s.status === "blocked").length;
    const booked = slots.filter((s) => s.status === "booked").length;
    return { available, blocked, booked, total: slots.length };
  }, [slots]);

  // Sync date to formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, appointment_date: selectedDate }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Clear selected slot when date changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, selected_slot: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({
      ...prev,
      selected_slot: {
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: slot.status,
      },
    }));
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
  };

  const canProceed = !!formData.selected_slot;

  const providerName =
    formData.provider_id?.label?.split("—")[0]?.trim() || "—";
  const typeName =
    formData.appointment_type_id?.label?.split("—")[0]?.trim() || "—";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-jakarta text-base font-bold text-ink-900">
          Select Date & Slot
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Pick from available dates and choose a slot for this appointment.
        </p>
      </div>

      {/* Provider/Type summary */}
      <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-600">
            <FiUser className="h-3 w-3 text-ink-400" />
            <span className="font-medium">{providerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-600">
            <FiCalendar className="h-3 w-3 text-ink-400" />
            <span className="font-medium">{typeName}</span>
          </div>
        </div>
      </div>

      {/* Loading availability */}
      {(loadingAvailabilities || fetchingAvailabilities) && (
        <div className="flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50/50 px-3 py-2.5">
          <FiInfo className="h-4 w-4 text-accent-600" />
          <p className="text-xs text-accent-800">
            Loading provider availability...
          </p>
        </div>
      )}

      {/* No availability */}
      {!loadingAvailabilities &&
        !fetchingAvailabilities &&
        !hasAvailability &&
        providerId &&
        appointmentTypeId && (
          <div className="flex items-start gap-2.5 rounded-lg border border-warn-200 bg-warn-50/50 p-4">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
            <div>
              <p className="text-sm font-semibold text-warn-900">
                No availability found
              </p>
              <p className="mt-0.5 text-xs text-warn-800">
                This provider has no availability configured for this
                appointment type. Please set availability first.
              </p>
            </div>
          </div>
        )}

      {/* Date + Slots */}
      {hasAvailability && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
          {/* Calendar */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Available Dates
            </p>
            <AvailableDatesCalendar
              dateFrom={availableConfig.dateFrom}
              dateTo={availableConfig.dateTo}
              daysOfWeek={availableConfig.daysOfWeek}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              disabled={loadingSlots || fetchingSlots}
            />
          </div>

          {/* Slots */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Slots for {selectedDate || "—"}
              </p>
              {slots.length > 0 && (
                <p className="text-[11px] text-ink-500">
                  Click a slot to select
                </p>
              )}
            </div>

            {/* Slot stats */}
            {slots.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <StatPill value={stats.total} label="Total" variant="neutral" />
                <StatPill
                  value={stats.available}
                  label="Available"
                  variant="brand"
                />
                <StatPill value={stats.booked} label="Booked" variant="ink" />
                <StatPill
                  value={stats.blocked}
                  label="Blocked"
                  variant="danger"
                />
              </div>
            )}

            {/* Selected slot banner */}
            {formData.selected_slot && (
              <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-surface">
                    <FiClock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
                      Selected Slot
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-ink-900">
                      {formData.selected_slot.start_time} -{" "}
                      {formData.selected_slot.end_time}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slots grid */}
            <SlotGrid
              slots={slots}
              selectedSlot={formData.selected_slot}
              onSelect={handleSlotSelect}
              loading={loadingSlots || fetchingSlots}
              emptyText={
                selectedDate
                  ? "No slots available for this date."
                  : "Please select a date."
              }
            />

            {/* Legend */}
            {slots.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-3 text-[11px]">
                <LegendItem color="brand" label="Available" />
                <LegendItem color="ink" label="Booked" />
                <LegendItem color="danger" label="Blocked" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            canProceed
              ? "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
              : "cursor-not-allowed bg-ink-100 text-ink-400"
          }`}
        >
          Next
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ==================== HELPERS ====================
const StatPill = ({ label, value, variant = "neutral" }) => {
  const styles = {
    neutral: "border-ink-200 bg-ink-50 text-ink-600",
    brand: "border-brand-200 bg-brand-50 text-brand-700",
    danger: "border-danger-200 bg-danger-50 text-danger-700",
    ink: "border-ink-200 bg-ink-100 text-ink-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[variant]}`}
    >
      <span className="font-bold">{value}</span>
      <span className="opacity-80">{label}</span>
    </span>
  );
};

const LegendItem = ({ color, label }) => {
  const colors = {
    brand: "bg-brand-500",
    ink: "bg-ink-400",
    danger: "bg-danger-500",
  };
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2.5 w-2.5 rounded-full ${colors[color]}`} />
      <span className="text-ink-600">{label}</span>
    </div>
  );
};

export default Step3DateSlots;
