import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiUsers,
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiPlus,
} from "react-icons/fi";
import { useAppointmentTypes } from "../../../queries/appointmentTypes";
import { FilterSelect } from "../../../common/form";

const Step2AppointmentType = ({
  onNext,
  onBack,
  formData,
  setFormData,
  setAppointmentTypeDefaults,
}) => {
  const navigate = useNavigate();
  const roleId = formData.role_id?.value;

  const { data, isFetching } = useAppointmentTypes(
    roleId ? { role_id: roleId, per_page: 100 } : { per_page: 100 },
  );

  const list = data?.list || [];
  const options = list.map((a) => ({
    value: a.id,
    label: `${a.name} — ${a.duration} min`,
  }));

  const selectedType = list.find(
    (a) => a.id === formData.appointment_type_id?.value,
  );

  // Auto-update slot_duration and capacity when appointment type is selected
  useEffect(() => {
    if (!selectedType) return;

    const defaultDuration = selectedType.duration || 15;
    const defaultCapacity = selectedType.capacity || 1;

    // Only auto-fill if the field hasn't been touched OR is empty
    // (to avoid overwriting user's manual values when they come back)
    setFormData((prev) => ({
      ...prev,
      slot_duration: defaultDuration,
      capacity: defaultCapacity,
    }));

    // Pass defaults to parent for Step 3's max-limit enforcement
    if (setAppointmentTypeDefaults) {
      setAppointmentTypeDefaults({
        slot_duration: defaultDuration,
        capacity: defaultCapacity,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType?.id]);

  const handleChange = (val) => {
    setFormData((prev) => ({ ...prev, appointment_type_id: val }));
  };

  const canProceed = !!formData.appointment_type_id?.value;
  const hasNoAppointmentTypes = !isFetching && list.length === 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-jakarta text-base font-bold text-ink-900">
          Select Appointment Type
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Choose the type of appointment this provider will handle.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-form-label">
          Appointment Type <span className="text-form-required">*</span>
        </label>
        <FilterSelect
          value={formData.appointment_type_id}
          onChange={handleChange}
          options={options}
          placeholder={
            isFetching
              ? "Loading..."
              : hasNoAppointmentTypes
                ? "No appointment types available"
                : "Select appointment type..."
          }
          isDisabled={isFetching || hasNoAppointmentTypes}
          isClearable
        />
      </div>

      {isFetching && (
        <p className="text-xs text-ink-500">Loading appointment types...</p>
      )}

      {hasNoAppointmentTypes && (
        <div className="rounded-lg border border-warn-200 bg-warn-50/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warn-100 text-warn-700">
              <FiAlertCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-warn-900">
                No appointment types found
                {formData.role_id?.label
                  ? ` for "${formData.role_id.label}"`
                  : ""}
              </p>
              <p className="mt-0.5 text-xs text-warn-800">
                This provider role doesn't have any appointment types configured
                yet. Create one first.
              </p>
              <button
                type="button"
                onClick={() => navigate("/appointment-types")}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-warn-800 px-3 py-1.5 text-xs font-semibold text-surface transition hover:bg-warn-900"
              >
                <FiPlus className="h-3 w-3" />
                Create Appointment Type
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedType && (
        <div className="rounded-lg border border-accent-200 bg-accent-50/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-800">
            Appointment Type Information
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <FiClock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Default Duration</p>
                <p className="text-sm font-semibold text-ink-900">
                  {selectedType.duration} Minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <FiUsers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-ink-500">Max Capacity</p>
                <p className="text-sm font-semibold text-ink-900">
                  {selectedType.capacity} Patient
                  {selectedType.capacity > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-accent-700">
            Slot duration and capacity will be pre-filled in the next step.
            Capacity can't exceed this maximum.
          </p>
        </div>
      )}

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

export default Step2AppointmentType;
