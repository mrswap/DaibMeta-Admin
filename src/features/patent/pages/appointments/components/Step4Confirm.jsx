import { useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiCalendar,
  FiClock,
  FiPhone,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";
import { BOOKING_SOURCES } from "../../../queries/appointments";

const Step4Confirm = ({ formData, setFormData, onBack, onSave, isSaving }) => {
  const [error, setError] = useState("");

  const providerName =
    formData.provider_id?.label?.split("—")[0]?.trim() || "—";
  const typeName =
    formData.appointment_type_id?.label?.split("—")[0]?.trim() || "—";

  const handleSubmit = () => {
    setError("");

    if (!formData.selected_slot) {
      setError("Please select a slot before confirming.");
      return;
    }

    const payload = {
      patient_id: formData.patient_id || null,
      provider_id: formData.provider_id?.value,
      appointment_type_id: formData.appointment_type_id?.value,
      name: formData.name?.trim(),
      mobile: formData.mobile?.trim(),
      appointment_date: formData.appointment_date,
      start_time: formData.selected_slot.start_time,
      end_time: formData.selected_slot.end_time,
      booking_source: formData.booking_source,
      status: "booked",
      notes: formData.notes?.trim() || null,
    };

    onSave(payload);
  };

  // Disabled booking sources (currently unavailable)
  const DISABLED_SOURCES = ["patient_app"];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-jakarta text-base font-bold text-ink-900">
          Confirm Booking
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Review the details below and confirm to create the appointment.
        </p>
      </div>

      {/* Patient */}
      <Section
        title="Patient"
        icon={FiUser}
        iconBg="bg-brand-50"
        iconColor="text-brand-600"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row icon={FiUser} label="Name" value={formData.name || "—"} />
          <Row icon={FiPhone} label="Mobile" value={formData.mobile || "—"} />
          <Row
            icon={FiFileText}
            label="Type"
            value={
              formData.patient_id ? (
                <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                  Existing Patient
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-warn-100 px-2 py-0.5 text-[11px] font-medium text-warn-800">
                  Walk-in / New
                </span>
              )
            }
          />
        </div>
      </Section>

      {/* Appointment */}
      <Section
        title="Appointment"
        icon={FiCalendar}
        iconBg="bg-accent-50"
        iconColor="text-accent-600"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row icon={FiUser} label="Provider" value={providerName} />
          <Row icon={FiFileText} label="Type" value={typeName} />
          <Row
            icon={FiCalendar}
            label="Date"
            value={formData.appointment_date || "—"}
          />
          <Row
            icon={FiClock}
            label="Time"
            value={
              formData.selected_slot
                ? `${formData.selected_slot.start_time} - ${formData.selected_slot.end_time}`
                : "—"
            }
          />
        </div>
      </Section>

      {/* Booking Source */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-form-label">
          Booking Source <span className="text-form-required">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {BOOKING_SOURCES.map((src) => {
            const isActive = formData.booking_source === src.value;
            const isDisabled = DISABLED_SOURCES.includes(src.value);

            return (
              <button
                key={src.value}
                type="button"
                disabled={isDisabled}
                onClick={() =>
                  !isDisabled &&
                  setFormData((prev) => ({
                    ...prev,
                    booking_source: src.value,
                  }))
                }
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  isDisabled
                    ? "cursor-not-allowed border-ink-100 bg-ink-50 text-ink-400 opacity-60"
                    : isActive
                      ? "cursor-pointer border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                      : "cursor-pointer border-ink-200 bg-surface text-ink-600 hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                {src.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-form-label">
          Notes
        </label>
        <textarea
          rows={3}
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Optional notes about this appointment..."
          className="w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        />
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2.5">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
          <p className="text-xs text-danger-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !formData.selected_slot}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
            isSaving || !formData.selected_slot
              ? "cursor-not-allowed bg-ink-100 text-ink-400"
              : "cursor-pointer bg-brand-600 text-surface hover:bg-brand-700"
          }`}
        >
          <FiCheck className="h-4 w-4" />
          {isSaving ? "Creating..." : "Create Appointment"}
        </button>
      </div>
    </div>
  );
};

// ==================== HELPERS ====================
const Section = ({ title, icon: Icon, iconBg, iconColor, children }) => (
  <div className="overflow-hidden rounded-lg border border-ink-100 bg-surface">
    <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/40 px-3 py-2">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-md ${iconBg} ${iconColor}`}
      >
        <Icon className="h-3 w-3" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
        {title}
      </p>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

const Row = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-ink-800">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default Step4Confirm;
