// src/features/patent/pages/visits/VisitNew.jsx

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiUser,
  FiUserPlus,
  FiCalendar,
  FiCheck,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";
import {
  useCreateVisit,
  VISIT_TYPES,
  PAYMENT_STATUSES,
} from "../../queries/visits";
import { useCreatePatient } from "../../queries/patients";
import { useStaff } from "../../queries/staff";
import { useAppointments } from "../../queries/appointments";
import {
  TextInput,
  SelectField,
  FormButton,
  PhoneInputField,
  validatePhone,
} from "../../common/form";
import SlotSelector from "./components/SlotSelector";

// ==================== HELPERS ====================
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ==================== MODES ====================
const MODES = [
  {
    value: "walk_in",
    label: "Walk-in / No Appointment",
    icon: FiUserPlus,
    description: "New patient, direct check-in",
  },
  {
    value: "appointment",
    label: "Linked to Appointment",
    icon: FiCalendar,
    description: "Patient has a booked appointment",
  },
];

// ==================== WATCHER — syncs provider_id from Formik to parent ====================
const ProviderWatcher = ({ setSelectedProviderId }) => {
  const { values } = useFormikContext();

  useEffect(() => {
    setSelectedProviderId(values.provider_id?.value || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.provider_id?.value]);

  return null;
};

// ==================== FORM INNER ====================
const VisitNewInner = ({
  mode,
  setMode,
  providerOptions,
  appointmentOptions,
  isPending,
  selectedProviderId,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedAppointment,
  setSelectedAppointment,
  disableModeSwitch,
}) => {
  const { values, setFieldValue } = useFormikContext();

  // ==================== APPOINTMENT SELECT ====================
  const handleAppointmentSelect = (val) => {
    setFieldValue("appointment_id", val);
    setSelectedAppointment(val);

    if (val?.raw) {
      const appt = val.raw;

      // Auto-select provider
      if (appt.provider?.id) {
        setFieldValue("provider_id", {
          value: appt.provider.id,
          label: appt.provider.name || "",
        });
      }

      // Auto-fill date
      if (appt.appointment_date) {
        setSelectedDate(appt.appointment_date);
        setFieldValue("visit_date", appt.appointment_date);
      }

      // Auto-fill slot
      if (appt.start_time && appt.end_time) {
        const slot = {
          start_time: appt.start_time.slice(0, 5),
          end_time: appt.end_time.slice(0, 5),
        };
        setSelectedSlot(slot);
        setFieldValue("slot_start_time", slot.start_time);
        setFieldValue("slot_end_time", slot.end_time);
      }

      // Auto-set visit_type → "consultation" (since appointment linked)
      setFieldValue("visit_type", {
        value: "consultation",
        label: "Consultation",
      });
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

  // Is appointment linked to a registered patient?
  const apptHasPatient = !!selectedAppointment?.raw?.patient?.id;
  const apptNeedsPatientCreate =
    isAppointmentMode &&
    selectedAppointment?.raw &&
    !apptHasPatient &&
    !!selectedAppointment.raw.name &&
    !!selectedAppointment.raw.mobile;

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

                {/* Info banner — patient auto-create */}
                {apptNeedsPatientCreate && (
                  <div className="flex items-start gap-2 rounded-lg border border-accent-200 bg-accent-50/60 px-3 py-2.5">
                    <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-700" />
                    <p className="text-[11px] leading-relaxed text-accent-800">
                      This appointment is not linked to a registered patient. A
                      new patient profile will be created automatically using
                      the name and mobile above.
                    </p>
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
                New Patient Details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextInput
                label="Patient Name"
                name="patient_name"
                placeholder="Enter full name"
                maxLength={150}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <PhoneInputField
                label="Mobile Number"
                name="patient_mobile"
                placeholder="Enter phone number"
                defaultCountry="IN"
                required
              />
            </div>

            <div className="sm:col-span-2 rounded-lg border border-accent-200 bg-accent-50/50 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <FiInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-700" />
                <p className="text-[11px] text-accent-800">
                  A new patient profile will be created automatically with the
                  default PIN. You can update full details later from the
                  Patients module.
                </p>
              </div>
            </div>
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
              <SlotSelector
                providerId={selectedProviderId}
                date={selectedDate}
                onDateChange={setSelectedDate}
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
          <FormButton
            type="submit"
            text={isPending ? "Checking In..." : "Check In Patient"}
            disabled={isPending}
          />
        </div>
      </div>
    </Form>
  );
};

// ==================== MAIN ====================
const VisitNew = () => {
  const navigate = useNavigate();
  const createVisit = useCreateVisit();
  const createPatient = useCreatePatient();

  const [mode, setMode] = useState("walk_in");
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Load data
  const { data: staffData } = useStaff({ per_page: 100, status: 1 });
  const { data: appointmentsData } = useAppointments({ per_page: 100 });

  const providerOptions = useMemo(
    () =>
      (staffData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.role?.label ? ` — ${p.role.label}` : ""}`,
      })),
    [staffData],
  );

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

  // Reset submit error when mode changes
  useEffect(() => {
    setSubmitError(null);
  }, [mode]);

  // ==================== INITIAL VALUES ====================
  const initialValues = {
    // Appointment mode
    appointment_id: null,

    // Walk-in mode
    patient_name: "",
    patient_mobile: "",

    // Common
    provider_id: null,
    visit_date: todayStr(),
    visit_type: { value: "walk_in", label: "Walk In" },
    payment_status: { value: "unpaid", label: "Unpaid" },
    slot_start_time: "",
    slot_end_time: "",
  };

  // ==================== VALIDATION ====================
  const validationSchema = Yup.object().shape(
    {
      appointment_id: Yup.object().when([], {
        is: () => mode === "appointment",
        then: (s) => s.nullable().required("Appointment is required"),
        otherwise: (s) => s.nullable(),
      }),
      patient_name: Yup.string().when([], {
        is: () => mode === "walk_in",
        then: (s) =>
          s.trim().required("Patient name is required").max(150, "Max 150"),
        otherwise: (s) => s.nullable(),
      }),
      patient_mobile: Yup.string().when([], {
        is: () => mode === "walk_in",
        then: (s) =>
          s
            .required("Mobile is required")
            .test("phone", "Invalid mobile", validatePhone),
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
    [["appointment_id", "patient_name", "patient_mobile"]],
  );

  // ==================== CREATE PATIENT HELPER ====================
  const createPatientFromData = async (name, mobile) => {
    const patientRes = await createPatient.mutateAsync({
      name: name.trim(),
      mobile: mobile.trim(),
      status: true,
      pin: "0000",
      age: 0,
      sex: "other",
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
    setSubmitError(null);

    try {
      let patientId = null;

      if (mode === "walk_in") {
        // WALK-IN → create patient from form values
        patientId = await createPatientFromData(
          values.patient_name,
          values.patient_mobile,
        );
      } else {
        // APPOINTMENT MODE
        const appt = selectedAppointment?.raw;

        if (appt?.patient?.id) {
          // Patient already linked
          patientId = appt.patient.id;
        } else if (appt?.name && appt?.mobile) {
          // Walk-in appointment — create patient from appointment data
          patientId = await createPatientFromData(appt.name, appt.mobile);
        } else {
          throw new Error(
            "Appointment is missing patient information. Please select a valid appointment.",
          );
        }
      }

      // Build visit payload
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
          <ProviderWatcher setSelectedProviderId={setSelectedProviderId} />

          <VisitNewInner
            mode={mode}
            setMode={setMode}
            providerOptions={providerOptions}
            appointmentOptions={appointmentOptions}
            isPending={isPending}
            selectedProviderId={selectedProviderId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            selectedAppointment={selectedAppointment}
            setSelectedAppointment={setSelectedAppointment}
            disableModeSwitch={isPending}
          />
        </>
      </Formik>
    </div>
  );
};

export default VisitNew;
