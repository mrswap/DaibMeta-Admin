// src/features/patent/pages/visits/VisitNew.jsx

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiUser,
  FiUserPlus,
  FiUserCheck,
  FiCalendar,
  FiCheck,
  FiInfo,
  FiAlertCircle,
  FiLock,
  FiGift,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  useCreateVisit,
  VISIT_TYPES,
  PAYMENT_STATUSES,
} from "../../queries/visits";
import { useCreatePatient, usePatients } from "../../queries/patients";
import { useStaff } from "../../queries/staff";
import { useAppointments } from "../../queries/appointments";
import { useSlotsForDate } from "../../queries/providerAvailabilities";
import { useAllAvailabilities } from "../../queries/bookingCalendar";
import {
  TextInput,
  SelectField,
  PhoneInputField,
  validatePhone,
} from "../../common/form";
import { usePermission } from "../../hooks/usePermission";
import Loader from "../../common/Loader";

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

// ==================== SEX OPTIONS ====================
const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

// ==================== MODES ====================
const MODES = [
  {
    value: "walk_in",
    label: "Walk-in / No Appointment",
    icon: FiUserPlus,
    description: "New or existing patient, direct check-in",
  },
  {
    value: "appointment",
    label: "Linked to Appointment",
    icon: FiCalendar,
    description: "Patient has a booked appointment",
  },
];

// ==================== WALK-IN PATIENT MODES ====================
const PATIENT_MODES = [
  { value: "new", label: "New Patient", icon: FiUserPlus },
  { value: "existing", label: "Existing Patient", icon: FiUserCheck },
];

// ==================== PAYMENT DEFAULTS ====================
// Walk-in visit me default Paid, baaki me Unpaid
const PAYMENT_PAID = { value: "paid", label: "Paid" };
const PAYMENT_UNPAID = { value: "unpaid", label: "Unpaid" };

// ==================== PATIENT MATCH BY MOBILE ====================
// Appointment me patient link na ho to mobile (last 10 digits) + name se existing patient dhundo
const normalizeMobile = (m) =>
  String(m || "")
    .replace(/\D/g, "")
    .slice(-10);

const findPatientByMobile = (patients = [], appt) => {
  const mob = normalizeMobile(appt?.mobile);
  if (mob.length < 10) return null;
  const candidates = patients.filter((p) => normalizeMobile(p.mobile) === mob);
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const n = (appt?.name || "").trim().toLowerCase();
    return (
      candidates.find((p) => (p.name || "").trim().toLowerCase() === n) || null
    );
  }
  return null;
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

        const isAvailable =
          status === "available" && s.available === true && availableCount > 0;
        const isFree = !!s.is_free;

        return {
          ...s,
          status,
          appointments,
          capacity,
          bookedCount,
          availableCount,
          isAvailable,
          isFree,
          styleKey:
            status === "available" && isFree ? "available_free" : status,
        };
      }),
    [slots],
  );

  const totalCapacity = computedSlots.reduce((a, s) => a + s.capacity, 0);
  const totalBooked = computedSlots.reduce((a, s) => a + s.bookedCount, 0);

  return (
    <div className="space-y-3">
      {/* Date — default today, provider select hone ke baad arrows se change */}
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
              const styleKey = isSelected ? "selected" : slot.styleKey;

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
                  </div>{" "}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ==================== WATCHER — Formik <-> parent sync ====================
//  1. provider_id  -> parent state
//  2. selectedDate -> formik visit_date  (pehle sync nahi hota tha)
//  3. walk-in me provider / date / mode badle to purana slot clear
//  4. mode badle to payment default (walk-in = Paid)
const FormSyncWatcher = ({
  mode,
  selectedDate,
  setSelectedProviderId,
  setSelectedSlot,
}) => {
  const { values, setFieldValue } = useFormikContext();
  const providerValue = values.provider_id?.value || null;

  useEffect(() => {
    setSelectedProviderId(providerValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerValue]);

  useEffect(() => {
    if (selectedDate) setFieldValue("visit_date", selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    if (mode === "walk_in") {
      setSelectedSlot(null);
      setFieldValue("slot_start_time", "");
      setFieldValue("slot_end_time", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerValue, selectedDate, mode]);

  useEffect(() => {
    setFieldValue(
      "payment_status",
      mode === "walk_in" ? PAYMENT_PAID : PAYMENT_UNPAID,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return null;
};

// ==================== FORM INNER ====================
const VisitNewInner = ({
  mode,
  setMode,
  patientMode,
  setPatientMode,
  patientOptions,
  providerOptions,
  appointmentOptions,
  apptMatchedPatient,
  isPending,
  selectedProviderId,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedAppointment,
  setSelectedAppointment,
  disableModeSwitch,
  activeAvailability,
  apiSlots,
  slotsLoading,
}) => {
  const { values, setFieldValue } = useFormikContext();

  // ==================== APPOINTMENT SELECT ====================
  const handleAppointmentSelect = (val) => {
    setFieldValue("appointment_id", val);
    setSelectedAppointment(val);

    if (val?.raw) {
      const appt = val.raw;

      if (appt.provider?.id) {
        setFieldValue("provider_id", {
          value: appt.provider.id,
          label: appt.provider.name || "",
        });
      }

      if (appt.appointment_date) {
        setSelectedDate(appt.appointment_date);
        setFieldValue("visit_date", appt.appointment_date);
      }

      if (appt.start_time && appt.end_time) {
        const slot = {
          start_time: appt.start_time.slice(0, 5),
          end_time: appt.end_time.slice(0, 5),
        };
        setSelectedSlot(slot);
        setFieldValue("slot_start_time", slot.start_time);
        setFieldValue("slot_end_time", slot.end_time);
      }

      setFieldValue("visit_type", {
        value: "consultation",
        label: "Consultation",
      });

      setFieldValue(
        "payment_status",
        appt.booking_source === "walk_in" ? PAYMENT_PAID : PAYMENT_UNPAID,
      );
    } else {
      setSelectedAppointment(null);
      setFieldValue("provider_id", null);
      setSelectedSlot(null);
      setFieldValue("slot_start_time", "");
      setFieldValue("slot_end_time", "");
    }
  };

  // ==================== SLOT CLICK ====================
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setFieldValue("slot_start_time", slot.start_time);
    setFieldValue("slot_end_time", slot.end_time);
  };

  const isAppointmentMode = mode === "appointment";
  const isExistingPatientMode =
    !isAppointmentMode && patientMode === "existing";
  const selectedExisting = values.existing_patient?.raw || null;

  // ==================== APPOINTMENT PATIENT STATE ====================
  const apptHasPatient =
    !!selectedAppointment?.raw?.patient?.id || !!apptMatchedPatient;
  const apptNeedsPatientCreate =
    isAppointmentMode &&
    !!selectedAppointment?.raw &&
    !apptHasPatient &&
    !!selectedAppointment.raw.name &&
    !!selectedAppointment.raw.mobile;

  // ==================== FORM COMPLETE? (submit button enable/disable) ====================
  const ageNum = Number(values.patient_age);
  const isAgeSexValid =
    values.patient_age !== "" &&
    values.patient_age !== null &&
    !isNaN(ageNum) &&
    ageNum >= 0 &&
    ageNum <= 150 &&
    !!values.patient_sex;

  const isPatientPartComplete = isAppointmentMode
    ? !!values.appointment_id?.value &&
      (!apptNeedsPatientCreate || isAgeSexValid)
    : isExistingPatientMode
      ? !!values.existing_patient?.value
      : !!values.patient_name?.trim() &&
        !!values.patient_mobile &&
        validatePhone(values.patient_mobile) &&
        isAgeSexValid;

  const isFormComplete =
    isPatientPartComplete &&
    !!values.provider_id?.value &&
    !!values.visit_date &&
    !!values.visit_type?.value &&
    !!values.payment_status?.value &&
    !!values.slot_start_time &&
    !!values.slot_end_time;

  return (
    <Form className="space-y-5">
      {/* Mode toggle */}
      <div className="rounded-xl border border-ink-100 bg-surface p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          Visit Type
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => !disableModeSwitch && setMode(m.value)}
                disabled={disableModeSwitch}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                    : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-brand-600 text-surface"
                      : "bg-ink-100 text-ink-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      isActive ? "text-brand-800" : "text-ink-800"
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-500">
                    {m.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient section */}
      {isAppointmentMode ? (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
          <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FiCalendar className="h-4 w-4 text-ink-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Select Appointment
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <SelectField
              label="Appointment"
              name="appointment_id"
              options={appointmentOptions}
              placeholder="Select a booked appointment..."
              required
              onChange={(opt) => handleAppointmentSelect(opt)}
            />

            {selectedAppointment?.raw && (
              <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-50/50 p-4">
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      Patient
                    </p>
                    <p className="mt-0.5 font-semibold text-ink-900">
                      {selectedAppointment.raw.patient?.name ||
                        apptMatchedPatient?.name ||
                        selectedAppointment.raw.name ||
                        "—"}
                    </p>
                    <p className="text-[11px] text-ink-500">
                      {selectedAppointment.raw.patient?.mobile ||
                        selectedAppointment.raw.mobile ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      Provider
                    </p>
                    <p className="mt-0.5 font-semibold text-ink-900">
                      {selectedAppointment.raw.provider?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      Date
                    </p>
                    <p className="mt-0.5 font-semibold text-ink-900">
                      {selectedAppointment.raw.appointment_date || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      Time
                    </p>
                    <p className="mt-0.5 font-semibold text-ink-900">
                      {selectedAppointment.raw.start_time?.slice(0, 5) || "—"}
                      {" – "}
                      {selectedAppointment.raw.end_time?.slice(0, 5) || "—"}
                    </p>
                  </div>
                </div>

                {apptNeedsPatientCreate && (
                  <div className="space-y-3 rounded-lg border border-warn-200 bg-warn-50/40 p-3">
                    <p className="text-[11px] font-semibold text-warn-800">
                      Patient not available
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextInput
                        label="Age"
                        name="patient_age"
                        type="number"
                        placeholder="Enter age"
                        maxLength={3}
                        required
                      />
                      <SelectField
                        label="Sex"
                        name="patient_sex"
                        options={SEX_OPTIONS}
                        placeholder="Select sex..."
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
          <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FiUser className="h-4 w-4 text-ink-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Patient Details
              </p>
            </div>
          </div>

          <div className="p-4">
            {/* New / Existing toggle */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              {PATIENT_MODES.map((pm) => {
                const Icon = pm.icon;
                const isActive = patientMode === pm.value;
                return (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => !isPending && setPatientMode(pm.value)}
                    disabled={isPending}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                        : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-brand-600" : "text-ink-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        isActive ? "text-brand-800" : "text-ink-700"
                      }`}
                    >
                      {pm.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {isExistingPatientMode ? (
              <div className="space-y-4">
                <SelectField
                  label="Select Patient"
                  name="existing_patient"
                  options={patientOptions}
                  placeholder="Search patient by name or mobile..."
                  required
                />

                {selectedExisting && (
                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-brand-200 bg-brand-50/50 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                        Name
                      </p>
                      <p className="mt-0.5 truncate font-semibold text-ink-900">
                        {selectedExisting.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                        Mobile
                      </p>
                      <p className="mt-0.5 truncate font-semibold text-ink-900">
                        {selectedExisting.mobile || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                        Patient ID
                      </p>
                      <p className="mt-0.5 truncate font-semibold text-ink-900">
                        {selectedExisting.patient_id ||
                          `#${selectedExisting.id}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Row 1 — Name + Mobile (2 cols on sm+) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Patient Name"
                    name="patient_name"
                    placeholder="Enter full name"
                    maxLength={150}
                    required
                  />

                  <PhoneInputField
                    label="Mobile Number"
                    name="patient_mobile"
                    placeholder="Enter phone number"
                    defaultCountry="IN"
                    required
                  />
                </div>

                {/* Row 2 — Age + Sex (2 cols on sm+) */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Age"
                    name="patient_age"
                    type="number"
                    placeholder="Enter age"
                    maxLength={3}
                    required
                  />

                  <SelectField
                    label="Sex"
                    name="patient_sex"
                    options={SEX_OPTIONS}
                    placeholder="Select sex..."
                    required
                  />
                </div>

                {/* Info banner */}
                <div className="mt-4 rounded-lg border border-accent-200 bg-accent-50/50 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <FiInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-700" />
                    <p className="text-[11px] text-accent-800">
                      A new patient profile will be created automatically with
                      the default PIN. You can update full details later from
                      the Patients module.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Provider + Slot */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiCheck className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Provider & Slot
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
            isDisabled={isAppointmentMode && !!selectedAppointment?.raw}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Select Slot <span className="text-form-required">*</span>
            </label>

            {isAppointmentMode && selectedAppointment?.raw?.start_time ? (
              <div className="rounded-lg border border-brand-200 bg-brand-50/50 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-brand-700">
                  Slot (Auto-filled from appointment)
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink-900">
                  {selectedSlot?.start_time || "—"} –{" "}
                  {selectedSlot?.end_time || "—"}
                </p>
              </div>
            ) : (
              <SlotPicker
                providerId={selectedProviderId}
                date={selectedDate}
                onDateChange={setSelectedDate}
                availability={activeAvailability}
                slots={apiSlots}
                slotsLoading={slotsLoading}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
                disabled={isPending}
              />
            )}
          </div>
        </div>
      </div>

      {/* Visit Info */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiInfo className="h-4 w-4 text-ink-500" />
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
            isDisabled={!isAppointmentMode}
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
            {isPending ? "Checking In..." : "Check In Patient"}
          </button>
        </div>
      </div>
    </Form>
  );
};

// ==================== MAIN ====================
const VisitNew = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canManage = can("visits", "manage");
  const createVisit = useCreateVisit();
  const createPatient = useCreatePatient();

  const [mode, setMode] = useState("walk_in");
  const [patientMode, setPatientMode] = useState("new"); // walk-in: new | existing
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Load data
  const { data: staffData } = useStaff({ per_page: 100, status: 1 });
  const { data: appointmentsData } = useAppointments({ per_page: 100 });
  const { data: patientsData } = usePatients({ per_page: 200 });

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

  const providerOptions = useMemo(
    () =>
      (staffData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.role?.label ? ` — ${p.role.label}` : ""}`,
      })),
    [staffData],
  );

  const patientOptions = useMemo(
    () =>
      (patientsData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name} — ${p.patient_id || `#${p.id}`}${
          p.mobile ? ` · ${p.mobile}` : ""
        }`,
        raw: p,
      })),
    [patientsData],
  );

  // Appointment me patient link nahi hai to mobile se existing patient match
  const apptMatchedPatient = useMemo(() => {
    const appt = selectedAppointment?.raw;
    if (!appt || appt.patient?.id) return null;
    return findPatientByMobile(patientsData?.list || [], appt);
  }, [selectedAppointment, patientsData]);

  const appointmentOptions = useMemo(
    () =>
      (appointmentsData?.list || [])
        .filter((a) => a.status === "booked" || a.status === "confirmed")
        .map((a) => ({
          value: a.id,
          label: `#${a.id} — ${a.name || a.patient?.name || "—"} · ${
            a.appointment_date || ""
          } ${a.start_time ? `· ${a.start_time.slice(0, 5)}` : ""}`,
          raw: a,
        })),
    [appointmentsData],
  );

  useEffect(() => {
    setSubmitError(null);
  }, [mode, patientMode]);

  // ==================== INITIAL VALUES ====================
  const initialValues = {
    // Appointment mode
    appointment_id: null,

    // Walk-in mode — existing patient
    existing_patient: null,

    // Walk-in mode — new patient
    patient_name: "",
    patient_mobile: "",
    patient_sex: null,
    patient_age: "",

    // Common
    provider_id: null,
    visit_date: todayStr(),
    visit_type: { value: "walk_in", label: "Walk In" },
    payment_status: PAYMENT_PAID, // walk-in default Paid
    slot_start_time: "",
    slot_end_time: "",
  };

  // ==================== VALIDATION ====================
  const isNewWalkIn = () => mode === "walk_in" && patientMode === "new";
  const isExistingWalkIn = () =>
    mode === "walk_in" && patientMode === "existing";
  // Appointment me patient nahi mila (na link, na mobile match) to age/sex chahiye
  const needsAgeSex = () =>
    isNewWalkIn() ||
    (mode === "appointment" &&
      !!selectedAppointment?.raw &&
      !selectedAppointment.raw.patient?.id &&
      !apptMatchedPatient &&
      !!selectedAppointment.raw.name &&
      !!selectedAppointment.raw.mobile);

  const validationSchema = Yup.object().shape(
    {
      appointment_id: Yup.object().when([], {
        is: () => mode === "appointment",
        then: (s) => s.nullable().required("Appointment is required"),
        otherwise: (s) => s.nullable(),
      }),
      existing_patient: Yup.object().when([], {
        is: isExistingWalkIn,
        then: (s) => s.nullable().required("Patient is required"),
        otherwise: (s) => s.nullable(),
      }),
      patient_name: Yup.string().when([], {
        is: isNewWalkIn,
        then: (s) =>
          s.trim().required("Patient name is required").max(150, "Max 150"),
        otherwise: (s) => s.nullable(),
      }),
      patient_mobile: Yup.string().when([], {
        is: isNewWalkIn,
        then: (s) =>
          s
            .required("Mobile is required")
            .test("phone", "Invalid mobile", validatePhone),
        otherwise: (s) => s.nullable(),
      }),
      patient_sex: Yup.object().when([], {
        is: needsAgeSex,
        then: (s) => s.nullable().required("Sex is required"),
        otherwise: (s) => s.nullable(),
      }),
      patient_age: Yup.number().when([], {
        is: needsAgeSex,
        then: (s) =>
          s
            .typeError("Age must be a number")
            .required("Age is required")
            .integer("Must be a whole number")
            .min(0, "Must be 0 or more")
            .max(150, "Invalid age"),
        otherwise: (s) => s.nullable(),
      }),
      provider_id: Yup.object().nullable().required("Provider is required"),
      visit_date: Yup.string().required("Date is required"),
      visit_type: Yup.object().nullable().required("Visit type is required"),
      payment_status: Yup.object()
        .nullable()
        .required("Payment status is required"),
      slot_start_time: Yup.string().required("Slot start time is required"),
      slot_end_time: Yup.string().required("Slot end time is required"),
    },
    [
      [
        "appointment_id",
        "patient_name",
        "patient_mobile",
        "patient_sex",
        "patient_age",
      ],
    ],
  );

  // ==================== CREATE PATIENT HELPER ====================
  const createPatientFromData = async (
    name,
    mobile,
    sex = "other",
    age = 0,
  ) => {
    const patientRes = await createPatient.mutateAsync({
      name: name.trim(),
      mobile: mobile.trim(),
      status: true,
      pin: "0000",
      age: Number(age) || 0,
      sex: sex || "other",
    });

    const patientData =
      patientRes?.data?.data || patientRes?.data || patientRes;
    const pid = patientData?.id;

    if (!pid) {
      throw new Error("Patient creation failed — no ID returned");
    }

    return pid;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (values) => {
    if (!canManage) return;
    if (!values.slot_start_time || !values.slot_end_time) {
      setSubmitError("Please select a slot.");
      return;
    }
    setSubmitError(null);

    try {
      let patientId = null;

      if (mode === "walk_in") {
        if (patientMode === "existing") {
          // ✅ Existing patient — naya patient nahi banega
          patientId = values.existing_patient?.value;
          if (!patientId) {
            throw new Error("Please select a patient.");
          }
        } else {
          patientId = await createPatientFromData(
            values.patient_name,
            values.patient_mobile,
            values.patient_sex?.value || "other",
            values.patient_age || 0,
          );
        }
      } else {
        const appt = selectedAppointment?.raw;

        if (appt?.patient?.id) {
          patientId = appt.patient.id;
        } else if (apptMatchedPatient?.id) {
          // mobile se existing patient mil gaya — naya nahi banega
          patientId = apptMatchedPatient.id;
        } else if (appt?.name && appt?.mobile) {
          patientId = await createPatientFromData(
            appt.name,
            appt.mobile,
            values.patient_sex?.value || "other",
            values.patient_age || 0,
          );
        } else {
          throw new Error(
            "Appointment is missing patient information. Please select a valid appointment.",
          );
        }
      }

      const payload = {
        appointment_id:
          mode === "appointment" ? values.appointment_id?.value : null,
        patient_id: patientId,
        provider_id: values.provider_id?.value,
        visit_date: values.visit_date,
        slot_start_time: values.slot_start_time,
        slot_end_time: values.slot_end_time,
        visit_type:
          mode === "walk_in"
            ? "walk_in"
            : values.visit_type?.value || "consultation",
        payment_status: values.payment_status?.value,
      };

      await createVisit.mutateAsync(payload);
      navigate("/visits");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setSubmitError(msg);
    }
  };

  const isPending = createVisit.isPending || createPatient.isPending;

  if (permLoading) {
    return <Loader text="Checking permissions..." />;
  }

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
          You do not have permission to create visits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/visits")}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Visits
          </button>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            New Visit
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Check in a patient and create a visit
          </p>
        </div>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-danger-200 bg-danger-50/60 px-4 py-3">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
          <div>
            <p className="text-xs font-semibold text-danger-900">
              Could not create visit
            </p>
            <p className="mt-0.5 text-[11px] text-danger-800">{submitError}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <>
          <FormSyncWatcher
            mode={mode}
            selectedDate={selectedDate}
            setSelectedProviderId={setSelectedProviderId}
            setSelectedSlot={setSelectedSlot}
          />

          <VisitNewInner
            mode={mode}
            setMode={setMode}
            patientMode={patientMode}
            setPatientMode={setPatientMode}
            patientOptions={patientOptions}
            providerOptions={providerOptions}
            appointmentOptions={appointmentOptions}
            apptMatchedPatient={apptMatchedPatient}
            isPending={isPending}
            selectedProviderId={selectedProviderId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            selectedAppointment={selectedAppointment}
            setSelectedAppointment={setSelectedAppointment}
            disableModeSwitch={isPending}
            activeAvailability={activeAvailability}
            apiSlots={apiSlots}
            slotsLoading={slotsLoading}
          />
        </>
      </Formik>
    </div>
  );
};

export default VisitNew;
