import { useState, useEffect, useRef } from "react";
import { useRoles } from "../../../queries/roles";
import { useStaff } from "../../../queries/staff";
import { FilterSelect } from "../../../common/form";
import { FiArrowRight } from "react-icons/fi";

const Step1Provider = ({ onNext, formData, setFormData, isEdit = false }) => {
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

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: r.label,
  }));

  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.email || ""}`,
  }));

  // Keep selectedRoleId in sync with formData (external changes)
  useEffect(() => {
    if (formData.role_id && formData.role_id.value !== selectedRoleId?.value) {
      setSelectedRoleId(formData.role_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role_id?.value]);

  // Reset provider when role changes — BUT NOT on initial mount or edit mode
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Skip reset in edit mode — prefill kar rahe hain
    if (isEdit) return;

    setFormData((prev) => ({ ...prev, provider_id: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId?.value]);

  const handleRoleChange = (val) => {
    setSelectedRoleId(val);
    setFormData((prev) => ({ ...prev, role_id: val }));
  };

  const handleProviderChange = (val) => {
    setFormData((prev) => ({ ...prev, provider_id: val }));
  };

  const canProceed = formData.role_id?.value && formData.provider_id?.value;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-jakarta text-base font-bold text-ink-900">
          Select Provider
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Choose the provider role and the specific provider you want to set
          availability for.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
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
              selectedRoleId ? "Select provider..." : "Select role first"
            }
            isDisabled={!selectedRoleId || loadingStaff}
            isClearable
          />
        </div>
      </div>

      {loadingStaff && selectedRoleId && (
        <p className="text-xs text-ink-500">Loading providers...</p>
      )}

      {selectedRoleId && !loadingStaff && providers.length === 0 && (
        <div className="rounded-lg border border-warn-200 bg-warn-50/50 px-4 py-3">
          <p className="text-xs text-warn-800">
            No active providers found for this role.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
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

export default Step1Provider;
