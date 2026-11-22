// src/features/patent/pages/visits/VisitEdit.jsx

import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiLock,
  FiGift,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  useVisit,
  useUpdateVisit,
  VISIT_TYPES,
  PAYMENT_STATUSES,
} from "../../queries/visits";
import { useStaff } from "../../queries/staff";
import { useSlotsForDate } from "../../queries/providerAvailabilities";
import { useAllAvailabilities } from "../../queries/bookingCalendar";
import { SelectField } from "../../common/form";
import Loader from "../../common/Loader";
import { usePermission } from "../../hooks/usePermission";

// ==================== HELPERS ====================
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getISODay = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const jsDay = new Date(y, m - 1, d).getDay();
  return jsDay === 0 ? 7 : jsDay;
};

// date string me days add/subtract (local time, timezone issue nahi)
const shiftDate = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

// visit se original provider / date / slot nikalo
const getVisitSchedule = (visit) => {
  if (!visit) return null;
  return {
    providerId: visit.provider?.id || visit.provider_id || null,
    date: visit.visit_schedule?.date || visit.visit_date || todayStr(),
    start:
      visit.visit_schedule?.start_time?.slice(0, 5) ||
      visit.slot_start_time?.slice(0, 5) ||
      "",
    end:
      visit.visit_schedule?.end_time?.slice(0, 5) ||
      visit.slot_end_time?.slice(0, 5) ||
      "",
  };
};

// ==================== SLOT STYLES ====================
const SLOT_STYLES = {
  available:
    "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
  available_free:
    "cursor-pointer border-accent-300 bg-accent-50 text-accent-800 hover:border-accent-400 hover:bg-accent-100",
  selected:
    "cursor-pointer border-brand-600 bg-brand-100 text-brand-800 ring-2 ring-brand-500",
  booked:
    "cursor-not-allowed border-ink-200 bg-ink-100 text-ink-600 opacity-60",
  blocked:
    "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700 opacity-60",
};

// ==================== SLOT PICKER (slots API + capacity) ====================
const SlotPicker = ({
  providerId,
  date,
  onDateChange,
  availability,
  slots = [],
  slotsLoading = false,
  selectedSlot,
  onSlotSelect,
  currentSlot, // visit ka apna original slot (provider + date same ho to hi)
  disabled = false,
}) => {
  const computedSlots = useMemo(
    () =>
      slots.map((s) => {
        const rawStatus = s.status || (s.available ? "available" : "booked");
        // partially_booked alag status nahi — capacity bachi hai to "available"
        const status =
          rawStatus === "partially_booked" ? "available" : rawStatus;

        const appointments = Array.isArray(s.appointments)
          ? s.appointments
          : [];
        const capacity = Number(s.capacity) || 1;
        const bookedCount = Number(s.booked_count) || appointments.length;
        const availableCount = Math.max(capacity - bookedCount, 0);

        // Is visit ka apna slot already count ho chuka hota hai, isliye
        // full hone par bhi usi ko dobara select karne dena hai
        const isCurrent =
          !!currentSlot && currentSlot.start_time === s.start_time;

        const isAvailable =
          (status === "available" &&
            s.available === true &&
            availableCount > 0) ||
          (isCurrent && status !== "blocked");
        const isFree = !!s.is_free;

        return {
          ...s,
          status,
          capacity,
          bookedCount,
          availableCount,
          isAvailable,
          isCurrent,
          isFree,
          styleKey:
            status === "available" && isFree ? "available_free" : status,
        };
      }),
    [slots, currentSlot],
  );

  const totalCapacity = computedSlots.reduce((a, s) => a + s.capacity, 0);
  const totalBooked = computedSlots.reduce((a, s) => a + s.bookedCount, 0);

  return (
    <div className="space-y-3">
      {/* Date — arrows se change */}
      {providerId && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-ink-200 bg-surface px-2 py-1.5">
          <button
            type="button"
            onClick={() => onDateChange(shiftDate(date, -1))}
            disabled={disabled || date <= todayStr()}
            aria-label="Previous day"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-600 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-ink-900">
              {formatDateLabel(date)}
            </p>
            {date === todayStr() && (
              <p className="text-[10px] font-medium uppercase tracking-wide text-brand-700">
                Today
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onDateChange(shiftDate(date, 1))}
            disabled={disabled}
            aria-label="Next day"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-600 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {!providerId ? (
        <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 py-6 text-center text-xs text-ink-500">
          Select a provider to see slots.
        </div>
      ) : !availability ? (
        <div className="rounded-lg border border-warn-200 bg-warn-50/40 px-3 py-6 text-center text-xs text-warn-800">
          No availability configured for this provider on this date.
        </div>
      ) : slotsLoading ? (
        <div className="py-6 text-center text-xs text-ink-500">
          Loading slots...
        </div>
      ) : computedSlots.length === 0 ? (
        <div className="py-6 text-center text-xs text-ink-500">
          No slots available.
        </div>
      ) : (
        <>
          <span className="inline-flex items-center gap-1 rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-700">
            <FiUsers className="h-2.5 w-2.5" />
            {totalCapacity - totalBooked} / {totalCapacity} capacity available
          </span>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {computedSlots.map((slot, idx) => {
              const isSelected = selectedSlot?.start_time === slot.start_time;
              const styleKey = isSelected
                ? "selected"
                : slot.isAvailable && slot.status !== "available"
                  ? "available"
                  : slot.styleKey;

              return (
                <button
                  key={`${slot.start_time}-${idx}`}
                  type="button"
                  disabled={disabled || !slot.isAvailable}
                  onClick={() =>
                    onSlotSelect({
                      start_time: slot.start_time,
                      end_time: slot.end_time,
                    })
                  }
                  className={`flex w-full flex-col gap-2 rounded-lg border p-2.5 text-left transition hover:shadow-sm disabled:cursor-not-allowed ${
                    SLOT_STYLES[styleKey] || SLOT_STYLES.available
                  }`}
                >
                  {/* Row 1: time + Free / selected tick */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="whitespace-nowrap text-[13px] font-semibold leading-tight">
                        {formatTime12(slot.start_time)}
                      </p>
                      <p className="mt-0.5 whitespace-nowrap text-[10px] leading-tight opacity-70">
                        to {formatTime12(slot.end_time)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-1">
                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                          <FiCheck className="h-3.5 w-3.5 text-surface" />
                        </div>
                      )}
                      {slot.isFree && (
                        <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-[8px] font-bold uppercase tracking-wide text-accent-700">
                          <FiGift className="h-2.5 w-2.5" />
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: capacity */}
                  <span className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-md bg-accent-100 px-1.5 py-0.5 text-[10px] font-semibold text-accent-800 ring-1 ring-accent-200">
                    <FiUsers className="h-2.5 w-2.5 shrink-0" />
                    {slot.availableCount}/{slot.capacity} capacity
                  </span>

                  {/* Row 3: available + booked */}
                  <div className="flex flex-nowrap items-center gap-1">
                    <span
                      className={`min-w-0 truncate whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${
                        slot.availableCount > 0
                          ? "bg-brand-100 text-brand-800 ring-brand-200"
                          : "bg-surface/60 text-ink-500 ring-ink-200"
                      }`}
                    >
                      {slot.availableCount} available
                    </span>
                    {slot.bookedCount > 0 && (
                      <span className="min-w-0 truncate whitespace-nowrap rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 ring-1 ring-ink-300">
                        {slot.bookedCount} booked
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ==================== FORM INNER ====================
const VisitEditInner = ({
  visit,
  providerOptions,
  isPending,
  selectedProviderId,
  setSelectedProviderId,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  activeAvailability,
  apiSlots,
  slotsLoading,
}) => {
  const { values, setFieldValue } = useFormikContext();

  const clearSlot = () => {
    setSelectedSlot(null);
    setFieldValue("slot_start_time", "");
    setFieldValue("slot_end_time", "");
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setFieldValue("slot_start_time", slot.start_time);
    setFieldValue("slot_end_time", slot.end_time);
  };

  // ✅ Date badle: form ki visit_date bhi update + purana slot clear
  const handleDateChange = (newDate) => {
    if (!newDate || newDate === selectedDate) return;
    setSelectedDate(newDate);
    setFieldValue("visit_date", newDate);
    clearSlot();
  };

  // ✅ Provider badle: slots naye provider ke aayein + purana slot clear
  const handleProviderChange = (opt) => {
    const newId = opt?.value || null;
    if (newId === (values.provider_id?.value || null)) return;
    setFieldValue("provider_id", opt);
    setSelectedProviderId(newId);
    clearSlot();
  };

  // Visit ka original slot — sirf tab jab provider + date wahi ho
  const original = getVisitSchedule(visit);
  const currentSlot =
    original &&
    original.start &&
    original.providerId === selectedProviderId &&
    original.date === selectedDate
      ? { start_time: original.start, end_time: original.end }
      : null;

  const isFormComplete =
    !!values.provider_id?.value &&
    !!values.visit_date &&
    !!values.visit_type?.value &&
    !!values.payment_status?.value &&
    !!values.slot_start_time &&
    !!values.slot_end_time;

  return (
    <Form className="space-y-5">
      {/* Locked info banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-accent-200 bg-accent-50/50 px-4 py-3">
        <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
        <div>
          <p className="text-xs font-semibold text-accent-900">
            Patient &amp; appointment are locked
          </p>
          <p className="mt-0.5 text-[11px] text-accent-800">
            To change patient or appointment, create a new visit instead.
          </p>
        </div>
      </div>

      {/* Locked info card — patient + appointment */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiUser className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Patient (Locked)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Name
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {visit.patient?.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Mobile
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {visit.patient?.mobile || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Patient ID
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {visit.patient?.patient_id || visit.patient_id || "—"}
            </p>
          </div>
        </div>

        {visit.appointment && (
          <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Linked Appointment
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink-800">
              #{visit.appointment.id}
              {visit.appointment.appointment_date && (
                <span className="ml-1.5 font-normal text-ink-500">
                  · {visit.appointment.appointment_date}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Editable: Provider & Slot */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiCheck className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Provider &amp; Slot
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <SelectField
            label="Provider"
            name="provider_id"
            options={providerOptions}
            placeholder="Select provider..."
            required
            onChange={handleProviderChange}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Select Slot <span className="text-form-required">*</span>
            </label>
            <SlotPicker
              providerId={selectedProviderId}
              date={selectedDate}
              onDateChange={handleDateChange}
              availability={activeAvailability}
              slots={apiSlots}
              slotsLoading={slotsLoading}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              currentSlot={currentSlot}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Visit Info */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Visit Information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <SelectField
            label="Visit Type"
            name="visit_type"
            options={VISIT_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            placeholder="Select type..."
            required
          />
          <SelectField
            label="Payment Status"
            name="payment_status"
            options={PAYMENT_STATUSES.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
            placeholder="Select payment status..."
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <div className="w-full sm:w-48">
          <button
            type="submit"
            disabled={isPending || !isFormComplete}
            className="w-full cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500 disabled:hover:bg-ink-200"
          >
            {isPending ? "Updating..." : "Update Visit"}
          </button>
        </div>
      </div>
    </Form>
  );
};

// ==================== MAIN ====================
const VisitEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("visits", "view");
  const canManage = can("visits", "manage");

  const { data: visit, isLoading } = useVisit(id, { enabled: canView });
  const updateVisit = useUpdateVisit();

  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Load providers
  const { data: staffData } = useStaff({ per_page: 100, status: 1 });

  const providerOptions = useMemo(
    () =>
      (staffData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.role?.label ? ` — ${p.role.label}` : ""}`,
      })),
    [staffData],
  );

  // ==================== AVAILABILITIES + SLOTS API ====================
  const { data: availabilities = [] } = useAllAvailabilities();

  // Selected provider + date ke liye matching availability (appointment_type yahin se milta hai)
  const activeAvailability = useMemo(() => {
    if (!selectedProviderId || !selectedDate) return null;
    const isoDay = getISODay(selectedDate);

    return (
      availabilities.find((av) => {
        if (av.provider?.id !== selectedProviderId) return false;
        if (!av.status) return false;
        if (selectedDate < av.date_from || selectedDate > av.date_to)
          return false;
        const days = av.days_of_week || [];
        return days.includes(isoDay);
      }) || null
    );
  }, [availabilities, selectedProviderId, selectedDate]);

  const appointmentTypeId = activeAvailability?.appointment_type?.id || null;

  const { data: slotsData, isLoading: slotsLoading } = useSlotsForDate({
    admin_id: selectedProviderId,
    appointment_type_id: appointmentTypeId,
    date: selectedDate,
    enabled: !!selectedProviderId && !!appointmentTypeId && !!selectedDate,
  });

  const apiSlots = slotsData?.slots || [];

  // Hydrate state from visit
  useEffect(() => {
    if (!visit) return;

    const sch = getVisitSchedule(visit);
    setSelectedProviderId(sch.providerId);
    setSelectedDate(sch.date);

    if (sch.start && sch.end) {
      setSelectedSlot({ start_time: sch.start, end_time: sch.end });
    }
  }, [visit]);

  // ==================== INITIAL VALUES ====================
  const initialValues = useMemo(() => {
    if (!visit) return null;

    const sch = getVisitSchedule(visit);
    const providerId = sch.providerId;
    const providerObj = providerId
      ? {
          value: providerId,
          label:
            visit.provider?.name ||
            providerOptions.find((p) => p.value === providerId)?.label ||
            "",
        }
      : null;

    const visitType = visit.visit_type
      ? {
          value: visit.visit_type,
          label:
            VISIT_TYPES.find((t) => t.value === visit.visit_type)?.label ||
            visit.visit_type,
        }
      : null;

    const paymentStatus = visit.payment_status
      ? {
          value: visit.payment_status,
          label:
            PAYMENT_STATUSES.find((p) => p.value === visit.payment_status)
              ?.label || visit.payment_status,
        }
      : null;

    return {
      provider_id: providerObj,
      visit_date: sch.date,
      visit_type: visitType,
      payment_status: paymentStatus,
      slot_start_time: sch.start,
      slot_end_time: sch.end,
    };
  }, [visit, providerOptions]);

  // ==================== VALIDATION ====================
  const validationSchema = Yup.object({
    provider_id: Yup.object().nullable().required("Provider is required"),
    visit_date: Yup.string().required("Date is required"),
    visit_type: Yup.object().nullable().required("Visit type is required"),
    payment_status: Yup.object()
      .nullable()
      .required("Payment status is required"),
    slot_start_time: Yup.string().required("Slot start time is required"),
    slot_end_time: Yup.string().required("Slot end time is required"),
  });

  // ==================== SUBMIT ====================
  const handleSubmit = (values) => {
    if (!canManage) return;

    const payload = {
      provider_id: values.provider_id?.value,
      visit_date: values.visit_date,
      slot_start_time: values.slot_start_time,
      slot_end_time: values.slot_end_time,
      visit_type: values.visit_type?.value,
      payment_status: values.payment_status?.value,
    };

    updateVisit.mutate(
      { id, payload },
      {
        onSuccess: () => navigate(`/visits/${id}`),
      },
    );
  };

  // ==================== PAGE ACCESS GUARD ====================
  if (permLoading && !canView) {
    return <Loader text="Checking permissions..." />;
  }

  if (!canView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to view this visit.
        </p>
      </div>
    );
  }

  // Strict Guard: Only Managers can edit
  if (!canManage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to edit this visit. Please contact your
          administrator.
        </p>
        <button
          onClick={() => navigate(`/visits/${id}`)}
          className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          Back to Visit
        </button>
      </div>
    );
  }

  // ==================== LOADING / NOT FOUND ====================
  if (isLoading) return <Loader text="Loading visit..." />;

  if (!visit) {
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm text-ink-500">Visit not found.</p>
      </div>
    );
  }

  // Guard: cannot edit completed/cancelled/no_show visits
  const isLocked = ["completed", "cancelled", "no_show"].includes(visit.status);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/visits/${id}`)}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Visit
          </button>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Edit Visit #{visit.id}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Update provider, slot, or payment status
          </p>
        </div>
      </div>

      {/* Locked banner */}
      {isLocked && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warn-200 bg-warn-50/50 px-4 py-3">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
          <div>
            <p className="text-xs font-semibold text-warn-900">
              This visit cannot be edited
            </p>
            <p className="mt-0.5 text-[11px] text-warn-800">
              Visits with status{" "}
              <strong>{visit.status_label || visit.status}</strong> cannot be
              modified.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {!isLocked && initialValues && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <VisitEditInner
            visit={visit}
            providerOptions={providerOptions}
            isPending={updateVisit.isPending}
            selectedProviderId={selectedProviderId}
            setSelectedProviderId={setSelectedProviderId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            activeAvailability={activeAvailability}
            apiSlots={apiSlots}
            slotsLoading={slotsLoading}
          />
        </Formik>
      )}
    </div>
  );
};

export default VisitEdit;
