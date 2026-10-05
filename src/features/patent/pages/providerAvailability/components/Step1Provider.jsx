import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiAlertCircle, FiPlus } from "react-icons/fi";
import { useRoles } from "../../../queries/roles";
import { useStaff } from "../../../queries/staff";
import { FilterSelect } from "../../../common/form";

const Step1Provider = ({ onNext, formData, setFormData, isEdit = false }) => {
  const navigate = useNavigate();
  const [selectedRoleId, setSelectedRoleId] = useState(
    formData.role_id || null,
  );
  const isInitialMount = useRef(true);

  // Load roles
  const { data: rolesData, isLoading: loadingRoles } = useRoles({
    per_page: 100,
  });
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

  // No roles available at all
  const hasNoRoles = !loadingRoles && roles.length === 0;

  // Role selected but no providers for that role
  const hasNoProviders =
    selectedRoleId && !loadingStaff && providers.length === 0;

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
            placeholder={loadingRoles ? "Loading roles..." : "Select role..."}
            isDisabled={loadingRoles}
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
                    ? "No providers available"
                    : "Select provider..."
            }
            isDisabled={!selectedRoleId || loadingStaff || hasNoProviders}
            isClearable
          />
        </div>
      </div>

      {/* No roles available */}
      {hasNoRoles && (
        <EmptyState
          title="No provider roles found"
          message="There are no roles configured yet. Create a role first to assign providers."
          buttonLabel="Go to Roles"
          onAction={() => navigate("/roles")}
        />
      )}

      {/* No providers for selected role */}
      {hasNoProviders && (
        <EmptyState
          title={`No providers found${
            selectedRoleId?.label ? ` for "${selectedRoleId.label}"` : ""
          }`}
          message="There are no active staff members assigned to this role. Add a staff member first."
          buttonLabel="Add Staff"
          onAction={() => navigate("/staff")}
        />
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

// ==================== EMPTY STATE ====================
const EmptyState = ({ title, message, buttonLabel, onAction }) => (
  <div className="rounded-lg border border-warn-200 bg-warn-50/50 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warn-100 text-warn-700">
        <FiAlertCircle className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-warn-900">{title}</p>
        <p className="mt-0.5 text-xs text-warn-800">{message}</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-warn-800 px-3 py-1.5 text-xs font-semibold text-surface transition hover:bg-warn-900"
        >
          <FiPlus className="h-3 w-3" />
          {buttonLabel}
        </button>
      </div>
    </div>
  </div>
);

export default Step1Provider;
