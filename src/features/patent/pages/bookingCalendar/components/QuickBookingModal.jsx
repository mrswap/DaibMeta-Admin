// src/features/patent/pages/bookingCalendar/components/QuickBookingModal.jsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiX,
  FiUser,
  FiCalendar,
  FiClock,
  FiFileText,
  FiAlertCircle,
  FiUserPlus,
  FiUserCheck,
} from "react-icons/fi";
import { useCreateAppointment } from "../../../queries/appointments";
import { useCreatePatient, usePatients } from "../../../queries/patients";
import { useCreateVisit } from "../../../queries/visits";
import {
  PhoneInputField,
  FilterSelect,
  validatePhone,
} from "../../../common/form";

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

// Payment status options for dropdown
const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "free", label: "Free" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

// ==================== TABS ====================
const TABS = [
  {
    key: "book",
    label: "Book Appointment",
    icon: FiCalendar,
  },
  {
    key: "visit",
    label: "Create Visit",
    icon: FiFileText,
  },
];

// ==================== PATIENT MODES ====================
const PATIENT_MODES = [
  { value: "new", label: "New", icon: FiUserPlus },
  { value: "existing", label: "Existing", icon: FiUserCheck },
];

// ==================== COMPONENT ====================
const QuickBookingModal = ({
  open,
  onClose,
  slot,
  provider,
  appointmentTypeId,
  date,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createPatient = useCreatePatient();
  const createAppointment = useCreateAppointment();
  const createVisit = useCreateVisit();

  const [activeTab, setActiveTab] = useState("book");
  const [patientMode, setPatientMode] = useState("new");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);

  // Payment dropdown (default: unpaid)
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_OPTIONS[0]);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // ==================== LOAD PATIENTS ====================
  const { data: patientsData } = usePatients({ per_page: 200 });

  const patientOptions = useMemo(() => {
    const list = patientsData?.list || [];
    return list.map((p) => ({
      value: p.id,
      label: `${p.name} — ${p.patient_id || `#${p.id}`}${
        p.mobile ? ` · ${p.mobile}` : ""
      }`,
      raw: p,
    }));
  }, [patientsData]);

  // ==================== RESET ====================
  useEffect(() => {
    if (open) {
      setActiveTab("book");
      setPatientMode("new");
      setName("");
      setMobile("");
      setAge("");
      setSex(null);
      setSelectedPatient(null);
      setPaymentStatus(PAYMENT_OPTIONS[0]);
      setErrors({});
      setSubmitError(null);
    }
  }, [open, slot?.start_time]);

  if (!open || !slot || !provider) return null;

  const isPatientPending = createPatient.isPending;
  const isAppointmentPending = createAppointment.isPending;
  const isVisitPending = createVisit.isPending;

  const isPending = isPatientPending || isAppointmentPending || isVisitPending;

  const isVisitTab = activeTab === "visit";
  const isExistingMode = patientMode === "existing";

  // ==================== VALIDATION ====================
  const validate = () => {
    const e = {};

    if (isExistingMode) {
      if (!selectedPatient) e.patient = "Please select a patient";
    } else {
      if (!name.trim()) e.name = "Patient name is required";
      else if (name.trim().length > 150) e.name = "Max 150 characters";

      if (!mobile) e.mobile = "Mobile number is required";
      else if (!validatePhone(mobile)) e.mobile = "Invalid mobile number";

      if (isVisitTab) {
        if (age === "" || age === null || age === undefined) {
          e.age = "Age is required";
        } else if (isNaN(Number(age))) {
          e.age = "Age must be a number";
        } else if (Number(age) < 0 || Number(age) > 150) {
          e.age = "Invalid age";
        }

        if (!sex) e.sex = "Sex is required";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ==================== CREATE APPOINTMENT ====================
  const createAppointmentOnly = async (
    patientId,
    patientName,
    patientMobile,
  ) => {
    const appointmentPayload = {
      patient_id: patientId,
      provider_id: provider.id,
      appointment_type_id: appointmentTypeId,
      name: patientName,
      mobile: patientMobile,
      appointment_date: date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      booking_source: "reception",
      status: "booked",
      notes: null,
    };

    const apptRes = await createAppointment.mutateAsync(appointmentPayload);

    const apptData = apptRes?.data?.data || apptRes?.data || apptRes;
    const apptId = apptData?.id;

    if (!apptId) {
      throw new Error("Appointment creation failed — no ID returned.");
    }

    return apptId;
  };

  // ==================== TAB 1: BOOK APPOINTMENT ====================
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError(null);

    try {
      if (isExistingMode) {
        const p = selectedPatient.raw;
        await createAppointmentOnly(p.id, p.name, p.mobile);
      } else {
        await createAppointmentOnly(null, name.trim(), mobile.trim());
      }

      queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to book appointment. Please try again.";
      setSubmitError(msg);
    }
  };

  // ==================== TAB 2: CREATE VISIT ====================
  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError(null);

    try {
      let patientId;
      let patientName;
      let patientMobile;

      if (isExistingMode) {
        const p = selectedPatient.raw;
        patientId = p.id;
        patientName = p.name;
        patientMobile = p.mobile;
      } else {
        const patientRes = await createPatient.mutateAsync({
          name: name.trim(),
          mobile: mobile.trim(),
          age: Number(age),
          sex: sex?.value || sex || "other",
          pin: "0000",
          status: true,
        });

        const patientData =
          patientRes?.data?.data || patientRes?.data || patientRes;
        patientId = patientData?.id;
        patientName = name.trim();
        patientMobile = mobile.trim();

        if (!patientId) {
          throw new Error("Patient creation failed — no ID returned.");
        }
      }

      const appointmentId = await createAppointmentOnly(
        patientId,
        patientName,
        patientMobile,
      );

      const visitPayload = {
        appointment_id: appointmentId,
        patient_id: patientId,
        provider_id: provider.id,
        visit_date: date,
        slot_start_time: slot.start_time,
        slot_end_time: slot.end_time,
        visit_type: "consultation", // always consultation
        payment_status: paymentStatus?.value || "unpaid",
      };

      const visitRes = await createVisit.mutateAsync(visitPayload);

      queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });

      const visitData = visitRes?.data?.data || visitRes?.data || visitRes;
      const visitId = visitData?.id;

      if (onSuccess) onSuccess();

      if (visitId) {
        navigate(`/visits/${visitId}`);
      } else {
        navigate("/visits");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create visit. Please try again.";
      setSubmitError(msg);
    }
  };

  // ==================== HANDLERS ====================
  const handleTabChange = (key) => {
    if (isPending) return;
    setActiveTab(key);
    setErrors({});
    setSubmitError(null);
  };

  const handlePatientModeChange = (mode) => {
    if (isPending) return;
    setPatientMode(mode);
    setErrors({});
    setSubmitError(null);
  };

  const handleFinalClose = () => {
    if (isPending) return;
    onClose();
    if (onSuccess) onSuccess();
  };

  // ==================== RENDER ====================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isPending ? undefined : handleFinalClose}
      />

      <div className="relative z-10 flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* TABS + CLOSE */}
        <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/30 px-3 py-2.5">
          <div className="flex flex-1 gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  disabled={isPending}
                  className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive
                      ? "bg-surface text-brand-700 shadow-sm ring-1 ring-brand-200"
                      : "text-ink-500 hover:bg-ink-100/50 hover:text-ink-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleFinalClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* SLOT SUMMARY */}
        <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-3">
          <div className="grid grid-cols-1 gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <FiUser className="h-3 w-3 shrink-0 text-ink-400" />
              <span className="font-semibold text-ink-800">
                {provider.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="h-3 w-3 shrink-0 text-ink-400" />
              <span className="font-semibold text-ink-800">
                {formatDate(date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="h-3 w-3 shrink-0 text-ink-400" />
              <span className="font-semibold text-ink-800">
                {formatTime12(slot.start_time)} – {formatTime12(slot.end_time)}
              </span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={isVisitTab ? handleVisitSubmit : handleBookSubmit}
            className="space-y-4 px-5 py-5"
          >
            {/* PATIENT MODE TOGGLE */}
            <div className="grid grid-cols-2 gap-2">
              {PATIENT_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = patientMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handlePatientModeChange(mode.value)}
                    disabled={isPending}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* EXISTING PATIENT SELECT */}
            {isExistingMode ? (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-form-label">
                  Select Patient <span className="text-form-required">*</span>
                </label>
                <FilterSelect
                  name="patient_select"
                  options={patientOptions}
                  value={selectedPatient}
                  onChange={(opt) => {
                    setSelectedPatient(opt);
                    if (errors.patient)
                      setErrors((p) => ({
                        ...p,
                        patient: "",
                      }));
                  }}
                  placeholder="Search patient by name or mobile..."
                  isDisabled={isPending}
                />
                {errors.patient && (
                  <p className="mt-1 text-xs text-form-error">
                    {errors.patient}
                  </p>
                )}
              </div>
            ) : (
              // NEW PATIENT FIELDS
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-form-label">
                    Patient Name <span className="text-form-required">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((p) => ({
                          ...p,
                          name: "",
                        }));
                    }}
                    placeholder="Enter patient name"
                    maxLength={150}
                    disabled={isPending}
                    className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-form-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <PhoneInputField
                  name="mobile"
                  label="Mobile Number"
                  placeholder="Enter phone number"
                  defaultCountry="IN"
                  required
                  isFormik={false}
                  value={mobile}
                  onChange={(val) => {
                    setMobile(val || "");
                    if (errors.mobile)
                      setErrors((p) => ({
                        ...p,
                        mobile: "",
                      }));
                  }}
                />
                {errors.mobile && (
                  <p className="-mt-3 text-xs text-form-error">
                    {errors.mobile}
                  </p>
                )}

                {/* Age + Sex only in visit tab */}
                {isVisitTab && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-form-label">
                        Age <span className="text-form-required">*</span>
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => {
                          setAge(e.target.value);
                          if (errors.age)
                            setErrors((p) => ({
                              ...p,
                              age: "",
                            }));
                        }}
                        placeholder="Age"
                        maxLength={3}
                        disabled={isPending}
                        className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      {errors.age && (
                        <p className="mt-1 text-xs text-form-error">
                          {errors.age}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-form-label">
                        Sex <span className="text-form-required">*</span>
                      </label>
                      <select
                        value={sex?.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const opt = SEX_OPTIONS.find((o) => o.value === val);
                          setSex(opt || null);
                          if (errors.sex)
                            setErrors((p) => ({
                              ...p,
                              sex: "",
                            }));
                        }}
                        disabled={isPending}
                        className="h-10 w-full cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Select</option>
                        {SEX_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      {errors.sex && (
                        <p className="mt-1 text-xs text-form-error">
                          {errors.sex}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PAYMENT STATUS (only visit tab) */}
            {isVisitTab && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-form-label">
                  Payment Status <span className="text-form-required">*</span>
                </label>
                <FilterSelect
                  name="payment_status"
                  options={PAYMENT_OPTIONS}
                  value={paymentStatus}
                  onChange={(opt) =>
                    setPaymentStatus(opt || PAYMENT_OPTIONS[0])
                  }
                  placeholder="Select payment status..."
                  isDisabled={isPending}
                />
              </div>
            )}

            {/* ERROR */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50/60 px-3 py-2.5">
                <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-600" />
                <p className="text-[11px] text-danger-800">{submitError}</p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
              <button
                type="button"
                onClick={handleFinalClose}
                disabled={isPending}
                className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface/40 border-t-surface" />
                    {isVisitTab ? "Creating Visit..." : "Booking..."}
                  </>
                ) : (
                  <>{isVisitTab ? "Create Visit" : "Book Appointment"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickBookingModal;
