import { useState, useEffect, useRef } from "react";
import { FiArrowLeft, FiArrowRight, FiClock, FiUsers } from "react-icons/fi";
import { useRoles } from "../../../queries/roles";
import { useStaff } from "../../../queries/staff";
import { useAppointmentTypes } from "../../../queries/appointmentTypes";
import { FilterSelect } from "../../../common/form";

const Step2Provider = ({ formData, setFormData, onNext, onBack }) => {
  const [selectedRoleId, setSelectedRoleId] = useState(
    formData.role_id || null,
  );
  const isInitialMount = useRef(true);

  // Load roles
  const { data: rolesData } = useRoles({ per_page: 100 });
  const roles = rolesData?.list || [];

  // Load providers filtered by role
  const { data: staffData, isFetching: loadingStaff } = useStaff(
    selectedRoleId?.value
      ? { role_id: selectedRoleId.value, per_page: 100 }
      : { per_page: 0 },
  );
  const providers = staffData?.list || [];

  // Load appointment types filtered by role
  const { data: typesData, isFetching: loadingTypes } = useAppointmentTypes(
    selectedRoleId?.value
      ? { role_id: selectedRoleId.value, per_page: 100 }
      : { per_page: 0 },
  );
  const appointmentTypes = typesData?.list || [];

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.label }));
  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.email || ""}`,
  }));
  const typeOptions = appointmentTypes.map((a) => ({
    value: a.id,
    label: `${a.name} — ${a.duration} min`,
  }));

  const selectedType = appointmentTypes.find(
    (a) => a.id === formData.appointment_type_id,
  );

  // Reset provider + type when role changes (NOT on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setFormData((prev) => ({
      ...prev,
      provider_id: null,
      appointment_type_id: null,
      appointment_date: "",
      selected_slot: null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId?.value]);

  const handleRoleChange = (val) => {
    setSelectedRoleId(val);
    setFormData((prev) => ({ ...prev, role_id: val }));
  };

  const handleProviderChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      provider_id: val,
      // Reset date/slot on provider change
      appointment_date: "",
      selected_slot: null,
    }));
  };

  const handleTypeChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      appointment_type_id: val,
      // Reset date/slot on type change
      appointment_date: "",
      selected_slot: null,
    }));
  };

  const canProceed =
    formData.role_id?.value &&
    formData.provider_id?.value &&
    formData.appointment_type_id?.value;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-jakarta text-base font-bold text-ink-900">
          Select Provider & Appointment Type
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Choose the provider role, provider, and the type of appointment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            Provider Role <span className="text-form-required">*</span>
          </label>
          <FilterSelect
            value={selectedRoleId}
            onChange={handleRoleChange}
            options={roleOptions}
            placeholder="Select role..."
            isClearable
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            Provider <span className="text-form-required">*</span>
          </label>
          <FilterSelect
            value={formData.provider_id}
            onChange={handleProviderChange}
            options={providerOptions}
            placeholder={
              !selectedRoleId
                ? "Select role first"
                : loadingStaff
                  ? "Loading providers..."
                  : providers.length === 0
                    ? "No providers"
                    : "Select provider..."
            }
            isDisabled={
              !selectedRoleId || loadingStaff || providers.length === 0
            }
            isClearable
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-form-label">
            Appointment Type <span className="text-form-required">*</span>
          </label>
          <FilterSelect
            value={formData.appointment_type_id}
            onChange={handleTypeChange}
            options={typeOptions}
            placeholder={
              !selectedRoleId
                ? "Select role first"
                : loadingTypes
                  ? "Loading types..."
                  : appointmentTypes.length === 0
                    ? "No types available"
                    : "Select appointment type..."
            }
            isDisabled={
              !selectedRoleId || loadingTypes || appointmentTypes.length === 0
            }
            isClearable
          />
        </div>
      </div>

      {/* Type info */}
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
                <p className="text-[11px] text-ink-500">Duration</p>
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
                <p className="text-[11px] text-ink-500">Capacity</p>
                <p className="text-sm font-semibold text-ink-900">
                  {selectedType.capacity} Patient
                  {selectedType.capacity > 1 ? "s" : ""}
                </p>
              </div>
            </div>
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

export default Step2Provider;
