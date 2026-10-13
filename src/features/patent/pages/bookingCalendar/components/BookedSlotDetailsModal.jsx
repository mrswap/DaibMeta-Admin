// src/features/patent/pages/bookingCalendar/components/BookedSlotDetailsModal.jsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiX,
  FiUser,
  FiPhone,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiCheck,
  FiAlertCircle,
  FiExternalLink,
  FiAlertTriangle,
  FiLink,
  FiUserPlus,
  FiEdit2,
} from "react-icons/fi";
import { useCreateVisit } from "../../../queries/visits";
import { useCreatePatient, usePatients } from "../../../queries/patients";
import {
  FilterSelect,
  PhoneInputField,
  validatePhone,
} from "../../../common/form";
import { api } from "../../../../../lib/axios";

// ==================== HELPERS ====================
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

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "free", label: "Free" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

const CHANGE_TABS = [
  { value: "new", label: "New Patient", icon: FiUserPlus },
  { value: "existing", label: "Existing Patient", icon: FiLink },
];

// ==================== COMPONENT ====================
const BookedSlotDetailsModal = ({ open, onClose, slot, provider, date }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createVisit = useCreateVisit();
  const createPatient = useCreatePatient();

  const [changeMode, setChangeMode] = useState(false);
  const [changeTab, setChangeTab] = useState("new");

  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newSex, setNewSex] = useState(null);

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [changeErrors, setChangeErrors] = useState({});

  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_OPTIONS[0]);

  const [submitError, setSubmitError] = useState(null);

  const [pendingPatient, setPendingPatient] = useState(null);

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

  // ==================== APPOINTMENT / SLOT DATA ====================
  const appointment = slot?.appointment || {};
  const existingVisit = slot?.visit || null;
  const hasExistingVisit = !!existingVisit;

  const currentPatientId =
    appointment.patient_id || appointment.patient?.id || null;
  const hasCurrentPatient = !!currentPatientId;
  const hasAppointmentPatientData = !!appointment.name && !!appointment.mobile;

  const canCreateVisit =
    !hasExistingVisit && (hasCurrentPatient || hasAppointmentPatientData);

  const isPending = createVisit.isPending || createPatient.isPending;

  // ==================== FIND CURRENT PATIENT IN OPTIONS ====================
  // Used to pre-select current patient in FilterSelect (existing tab)
  const currentPatientOption = useMemo(() => {
    if (!hasCurrentPatient || !patientOptions.length) return null;
    return patientOptions.find((o) => o.value === currentPatientId) || null;
  }, [hasCurrentPatient, currentPatientId, patientOptions]);

  // ==================== DISPLAY PATIENT ====================
  const displayPatient = useMemo(() => {
    if (pendingPatient) {
      if (pendingPatient.type === "link" && pendingPatient.patient) {
        return {
          id: pendingPatient.patient.id,
          name: pendingPatient.patient.name,
          mobile: pendingPatient.patient.mobile,
          patient_id: pendingPatient.patient.patient_id,
          isOverride: true,
          isLinked: true,
        };
      }
      if (pendingPatient.type === "create") {
        return {
          id: null,
          name: pendingPatient.name,
          mobile: pendingPatient.mobile,
          patient_id: null,
          isNew: true,
        };
      }
    }
    if (hasCurrentPatient) {
      return {
        id: currentPatientId,
        name: appointment.patient?.name || appointment.name || "—",
        mobile: appointment.patient?.mobile || appointment.mobile,
        patient_id: appointment.patient?.patient_id || null,
        isLinked: true,
      };
    }
    return {
      id: null,
      name: appointment.name || "—",
      mobile: appointment.mobile || "",
      patient_id: null,
      isWalkIn: true,
    };
  }, [pendingPatient, hasCurrentPatient, currentPatientId, appointment]);

  // ==================== RESET ====================
  useEffect(() => {
    if (open) {
      setChangeMode(false);
      setChangeTab("new");
      setNewName(appointment.name || "");
      setNewMobile(appointment.mobile || "");
      setNewAge("");
      setNewSex(null);
      setSelectedPatient(null);
      setChangeErrors({});
      setPaymentStatus(PAYMENT_OPTIONS[0]);
      setSubmitError(null);
      setPendingPatient(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slot?.start_time]);

  if (!open || !slot || !provider) return null;

  // ==================== HANDLERS ====================
  const handleViewVisit = () => {
    if (!existingVisit?.id) return;
    onClose();
    navigate(`/visits/${existingVisit.id}`);
  };

  const handleStartChange = () => {
    if (isPending) return;
    setChangeMode(true);
    // Default tab based on current patient state
    // - If patient linked → "existing" tab, with current pre-selected
    // - If walk-in → "new" tab, form pre-filled
    if (hasCurrentPatient) {
      setChangeTab("existing");
      setSelectedPatient(currentPatientOption);
    } else {
      setChangeTab("new");
    }
    // Always pre-fill "new" tab form with appointment data
    setNewName(appointment.name || "");
    setNewMobile(appointment.mobile || "");
    setNewAge("");
    setNewSex(null);
    setChangeErrors({});
  };

  const handleCancelChange = () => {
    if (isPending) return;
    setChangeMode(false);
    setChangeErrors({});
  };

  const handleTabSwitch = (tab) => {
    if (isPending) return;
    setChangeTab(tab);
    setChangeErrors({});

    // When switching to "existing", pre-select current patient if linked
    if (tab === "existing" && hasCurrentPatient && !selectedPatient) {
      setSelectedPatient(currentPatientOption);
    }
  };

  // ==================== VALIDATE ====================
  const validateChange = () => {
    const e = {};

    if (changeTab === "existing") {
      if (!selectedPatient) e.selectedPatient = "Please select a patient";
    } else {
      if (!newName.trim()) e.newName = "Name is required";
      else if (newName.trim().length > 150) e.newName = "Max 150 characters";

      if (!newMobile) e.newMobile = "Mobile is required";
      else if (!validatePhone(newMobile)) e.newMobile = "Invalid mobile";

      if (newAge === "" || newAge === null || newAge === undefined) {
        e.newAge = "Age is required";
      } else if (isNaN(Number(newAge))) {
        e.newAge = "Age must be a number";
      } else if (Number(newAge) < 0 || Number(newAge) > 150) {
        e.newAge = "Invalid age";
      }

      if (!newSex) e.newSex = "Sex is required";
    }

    setChangeErrors(e);
    return Object.keys(e).length === 0;
  };

  // ==================== APPLY CHANGE ====================
  const handleApplyChange = () => {
    if (!validateChange()) return;

    if (changeTab === "existing") {
      // Check if user selected the same patient (no change)
      if (selectedPatient.value === currentPatientId && !pendingPatient) {
        // No-op — same patient, close change mode
        setChangeMode(false);
        return;
      }
      setPendingPatient({
        type: "link",
        patient: selectedPatient.raw,
      });
    } else {
      setPendingPatient({
        type: "create",
        name: newName.trim(),
        mobile: newMobile.trim(),
        age: Number(newAge),
        sex: newSex?.value || newSex || "other",
      });
    }

    setChangeMode(false);
  };

  const handleClearPending = () => {
    if (isPending) return;
    setPendingPatient(null);
  };

  // ==================== CREATE VISIT ====================
  const handleCreateVisit = async () => {
    setSubmitError(null);

    if (!canCreateVisit) {
      setSubmitError("Patient information is missing. Cannot create visit.");
      return;
    }

    try {
      let finalPatientId = currentPatientId;
      let patientChanged = false;

      if (pendingPatient?.type === "link") {
        finalPatientId = pendingPatient.patient.id;
        if (finalPatientId !== currentPatientId) patientChanged = true;
      } else if (pendingPatient?.type === "create") {
        const patientRes = await createPatient.mutateAsync({
          name: pendingPatient.name,
          mobile: pendingPatient.mobile,
          age: pendingPatient.age,
          sex: pendingPatient.sex,
          pin: "0000",
          status: true,
        });

        const patientData =
          patientRes?.data?.data || patientRes?.data || patientRes;
        finalPatientId = patientData?.id;

        if (!finalPatientId) {
          throw new Error("Patient creation failed — no ID returned.");
        }

        patientChanged = true;
      }

      if (patientChanged && appointment.id) {
        await api
          .put(`/admin/appointments/${appointment.id}`, {
            patient_id: finalPatientId,
          })
          .catch(() => {
            // Non-fatal
          });
      }

      const payload = {
        appointment_id: appointment.id || null,
        patient_id: finalPatientId,
        provider_id: provider.id,
        visit_date: date,
        slot_start_time: slot.start_time,
        slot_end_time: slot.end_time,
        visit_type: "consultation",
        payment_status: paymentStatus?.value || "unpaid",
      };

      const visitRes = await createVisit.mutateAsync(payload);

      queryClient.invalidateQueries({ queryKey: ["bookingCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });

      const visitData = visitRes?.data?.data || visitRes?.data || visitRes;
      const visitId = visitData?.id;

      onClose();

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

  const handleFinalClose = () => {
    if (isPending) return;
    setChangeMode(false);
    setSubmitError(null);
    onClose();
  };

  // ==================== RENDER ====================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isPending ? undefined : handleFinalClose}
      />

      <div className="relative z-10 flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                hasExistingVisit
                  ? "bg-brand-50 text-brand-600"
                  : "bg-accent-50 text-accent-600"
              }`}
            >
              <FiCheckCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-jakarta text-base font-bold text-ink-900">
                {hasExistingVisit ? "Visit Exists" : "Booked Slot"}
              </h2>
              <p className="text-[11px] text-ink-500">
                {hasExistingVisit
                  ? `Visit #${existingVisit.id} already created`
                  : "This slot is already booked"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinalClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* ==================== STATUS BANNER ==================== */}
        <div
          className={`border-b border-ink-100 px-5 py-3 ${
            hasExistingVisit ? "bg-brand-50/40" : "bg-accent-50/40"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                hasExistingVisit
                  ? "bg-brand-100 text-brand-800"
                  : "bg-accent-100 text-accent-800"
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  hasExistingVisit ? "bg-brand-600" : "bg-accent-500"
                }`}
              />
              {appointment.status_label || appointment.status || "Booked"}
            </span>
            {appointment.id && (
              <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
                Appt #{appointment.id}
              </code>
            )}
          </div>
        </div>

        {/* ==================== SCROLLABLE BODY ==================== */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 px-5 py-4">
            {hasExistingVisit && (
              <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50/60 px-3 py-2.5">
                <FiCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                <p className="text-[11px] leading-relaxed text-brand-800">
                  Visit already created. Click <strong>View Visit</strong> to
                  open.
                </p>
              </div>
            )}

            {/* ============ PROVIDER + DATE + TIME ============ */}
            <div className="rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2.5 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <FiUser className="h-3 w-3 shrink-0 text-ink-400" />
                <span className="font-semibold text-ink-800">
                  {provider.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <FiCalendar className="h-3 w-3 shrink-0 text-ink-400" />
                <span className="font-semibold text-ink-800">
                  {formatDateFull(date)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <FiClock className="h-3 w-3 shrink-0 text-ink-400" />
                <span className="font-semibold text-ink-800">
                  {formatTime12(slot.start_time)} –{" "}
                  {formatTime12(slot.end_time)}
                </span>
              </div>
            </div>

            {/* ============ PATIENT SECTION ============ */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  Patient
                </p>
                {!hasExistingVisit && !changeMode && (
                  <button
                    type="button"
                    onClick={handleStartChange}
                    disabled={isPending}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiEdit2 className="h-2.5 w-2.5" />
                    Change
                  </button>
                )}
              </div>

              {/* Display patient (only when NOT in change mode) */}
              {!changeMode && (
                <div className="flex items-start gap-2.5 rounded-lg border border-ink-100 bg-ink-50/40 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
                    {getInitials(displayPatient.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {displayPatient.name}
                    </p>
                    {displayPatient.mobile && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500">
                        <FiPhone className="h-3 w-3" />
                        <span className="tabular-nums">
                          {displayPatient.mobile}
                        </span>
                      </div>
                    )}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {displayPatient.isLinked &&
                        !displayPatient.isOverride && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200">
                            Linked ·{" "}
                            {displayPatient.patient_id ||
                              `#${displayPatient.id}`}
                          </span>
                        )}
                      {displayPatient.isWalkIn && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-warn-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warn-800 ring-1 ring-warn-200">
                          <FiAlertTriangle className="h-2.5 w-2.5" />
                          Walk-in · No Patient ID
                        </span>
                      )}
                      {displayPatient.isOverride && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-800 ring-1 ring-accent-200">
                          <FiLink className="h-2.5 w-2.5" />
                          Change Pending
                        </span>
                      )}
                      {displayPatient.isNew && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-800 ring-1 ring-accent-200">
                          <FiUserPlus className="h-2.5 w-2.5" />
                          New · Will be created
                        </span>
                      )}
                    </div>
                  </div>
                  {pendingPatient && !isPending && (
                    <button
                      type="button"
                      onClick={handleClearPending}
                      title="Clear change"
                      className="cursor-pointer rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                    >
                      <FiX className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* ============ CHANGE MODE (with 2 tabs) ============ */}
              {changeMode && !hasExistingVisit && (
                <div className="overflow-hidden rounded-lg border border-accent-200 bg-accent-50/40">
                  {/* Tab header */}
                  <div className="flex border-b border-accent-200 bg-surface/60">
                    {CHANGE_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = changeTab === tab.value;
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => handleTabSwitch(tab.value)}
                          disabled={isPending}
                          className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            isActive
                              ? "text-brand-700"
                              : "text-ink-500 hover:text-ink-700"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {tab.label}
                          {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab body */}
                  <div className="space-y-3 p-3">
                    {/* === NEW PATIENT TAB === */}
                    {changeTab === "new" && (
                      <>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-form-label">
                            Name <span className="text-form-required">*</span>
                          </label>
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => {
                              setNewName(e.target.value);
                              if (changeErrors.newName)
                                setChangeErrors((p) => ({
                                  ...p,
                                  newName: "",
                                }));
                            }}
                            placeholder="Enter name"
                            maxLength={150}
                            disabled={isPending}
                            className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                          {changeErrors.newName && (
                            <p className="mt-1 text-xs text-form-error">
                              {changeErrors.newName}
                            </p>
                          )}
                        </div>

                        <PhoneInputField
                          name="newMobile"
                          label="Mobile"
                          placeholder="Enter phone"
                          defaultCountry="IN"
                          required
                          isFormik={false}
                          value={newMobile}
                          onChange={(val) => {
                            setNewMobile(val || "");
                            if (changeErrors.newMobile)
                              setChangeErrors((p) => ({
                                ...p,
                                newMobile: "",
                              }));
                          }}
                        />
                        {changeErrors.newMobile && (
                          <p className="-mt-3 text-xs text-form-error">
                            {changeErrors.newMobile}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-form-label">
                              Age <span className="text-form-required">*</span>
                            </label>
                            <input
                              type="number"
                              value={newAge}
                              onChange={(e) => {
                                setNewAge(e.target.value);
                                if (changeErrors.newAge)
                                  setChangeErrors((p) => ({
                                    ...p,
                                    newAge: "",
                                  }));
                              }}
                              placeholder="Age"
                              maxLength={3}
                              disabled={isPending}
                              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {changeErrors.newAge && (
                              <p className="mt-1 text-xs text-form-error">
                                {changeErrors.newAge}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-form-label">
                              Sex <span className="text-form-required">*</span>
                            </label>
                            <select
                              value={newSex?.value || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const opt = SEX_OPTIONS.find(
                                  (o) => o.value === val,
                                );
                                setNewSex(opt || null);
                                if (changeErrors.newSex)
                                  setChangeErrors((p) => ({
                                    ...p,
                                    newSex: "",
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
                            {changeErrors.newSex && (
                              <p className="mt-1 text-xs text-form-error">
                                {changeErrors.newSex}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* === EXISTING PATIENT TAB === */}
                    {changeTab === "existing" && (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-form-label">
                          Search Patient{" "}
                          <span className="text-form-required">*</span>
                        </label>
                        <FilterSelect
                          name="link_patient"
                          options={patientOptions}
                          value={selectedPatient}
                          onChange={(opt) => {
                            setSelectedPatient(opt);
                            setChangeErrors((p) => ({
                              ...p,
                              selectedPatient: "",
                            }));
                          }}
                          placeholder="Search patient by name or mobile..."
                          isDisabled={isPending}
                        />
                        {changeErrors.selectedPatient && (
                          <p className="mt-1 text-xs text-form-error">
                            {changeErrors.selectedPatient}
                          </p>
                        )}
                      </div>
                    )}

                    {/* === ACTIONS === */}
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelChange}
                        disabled={isPending}
                        className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyChange}
                        disabled={isPending}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiCheck className="h-3 w-3" />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ============ PAYMENT STATUS ============ */}
            {!hasExistingVisit && (
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

            {/* ============ ERROR ============ */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50/60 px-3 py-2.5">
                <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger-600" />
                <p className="text-[11px] text-danger-800">{submitError}</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/30 px-5 py-4">
          <button
            type="button"
            onClick={handleFinalClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>

          {hasExistingVisit && (
            <button
              type="button"
              onClick={handleViewVisit}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              View Visit #{existingVisit.id}
            </button>
          )}

          {!hasExistingVisit && canCreateVisit && (
            <button
              type="button"
              onClick={handleCreateVisit}
              disabled={isPending || changeMode}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface/40 border-t-surface" />
                  Creating...
                </>
              ) : (
                <>
                  <FiCheck className="h-3.5 w-3.5" />
                  Create Visit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookedSlotDetailsModal;
