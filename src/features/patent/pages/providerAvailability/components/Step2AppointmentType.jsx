import { useAppointmentTypes } from "../../../queries/appointmentTypes";
import { FilterSelect } from "../../../common/form";
import { FiClock, FiUsers, FiArrowLeft, FiArrowRight } from "react-icons/fi";

const Step2AppointmentType = ({ onNext, onBack, formData, setFormData }) => {
  const roleId = formData.role_id?.value;

  // Filter appointment types by role
  const { data, isFetching } = useAppointmentTypes(
    roleId ? { role_id: roleId, per_page: 100 } : { per_page: 100 },
  );

  const list = data?.list || [];
  const options = list.map((a) => ({
    value: a.id,
    label: `${a.name} — ${a.duration} min`,
  }));

  // Selected type details
  const selectedType = list.find(
    (a) => a.id === formData.appointment_type_id?.value,
  );

  const handleChange = (val) => {
    setFormData((prev) => ({ ...prev, appointment_type_id: val }));
  };

  const canProceed = !!formData.appointment_type_id?.value;

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
          placeholder="Select appointment type..."
          isClearable
        />
      </div>

      {isFetching && (
        <p className="text-xs text-ink-500">Loading appointment types...</p>
      )}

      {/* Info panel */}
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
                <p className="text-[11px] text-ink-500">Default Capacity</p>
                <p className="text-sm font-semibold text-ink-900">
                  {selectedType.capacity} Patient
                  {selectedType.capacity > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
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
