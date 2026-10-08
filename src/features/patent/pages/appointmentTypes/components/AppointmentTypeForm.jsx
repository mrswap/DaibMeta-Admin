import { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";
import {
  useCreateAppointmentType,
  useUpdateAppointmentType,
  useAppointmentTypeProviders,
} from "../../../queries/appointmentTypes";
import { useRoles } from "../../../queries/roles";
import { TextInput, FormButton, FilterSelect } from "../../../common/form";

// Backend allowed roles (Doc point 4)
const ALLOWED_ROLE_NAMES = ["doctor", "dietitian", "pathologist", "guest"];

// ==================== MAIN FORM ====================
const AppointmentTypeForm = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;
  const createMutation = useCreateAppointmentType();
  const updateMutation = useUpdateAppointmentType();

  // ==================== ROLES ====================
  const { data: rolesData } = useRoles({ per_page: 100 });
  const allRoles = rolesData?.list || [];
  const allowedRoles = allRoles.filter((r) =>
    ALLOWED_ROLE_NAMES.includes(r.name),
  );

  const roleOptions = allowedRoles.map((r) => ({
    value: r.id,
    label: `${r.label} (${r.name})`,
  }));

  // ==================== LOCAL STATE ====================
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(15);
  const [capacity, setCapacity] = useState(1);
  const [status, setStatus] = useState(true);
  const [errors, setErrors] = useState({});

  const isInitialMount = useRef(true);

  // ==================== SYNC INITIAL DATA ====================
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const roleObj = allowedRoles.find(
        (r) => r.id === (initialData.role_id || initialData.role?.id),
      );
      setSelectedRoleId(
        roleObj
          ? { value: roleObj.id, label: `${roleObj.label} (${roleObj.name})` }
          : null,
      );
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setDuration(initialData.duration || 15);
      setCapacity(initialData.capacity || 1);
      setStatus(initialData.status ?? true);
    } else {
      setSelectedRoleId(null);
      setSelectedProvider(null);
      setName("");
      setDescription("");
      setDuration(15);
      setCapacity(1);
      setStatus(true);
    }
    setErrors({});
    isInitialMount.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  // ==================== PROVIDERS FETCH ====================
  const { data: providers = [], isFetching: loadingProviders } =
    useAppointmentTypeProviders(
      selectedRoleId?.value,
      isEdit ? initialData?.id : null,
    );

  // ==================== PRE-FILL PROVIDER ON EDIT ====================
  useEffect(() => {
    if (!isEdit) return;
    if (!providers || providers.length === 0) return;
    const adminId = initialData?.admin_id || initialData?.provider?.id;
    if (!adminId) return;
    const found = providers.find((p) => p.id === adminId);
    if (found) {
      setSelectedProvider({
        value: found.id,
        label: found.name,
        isDisabled: found.disabled,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, isEdit, initialData]);

  // ==================== PROVIDER OPTIONS ====================
  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: p.disabled
      ? `${p.name} (${p.disabled_reason || "Already assigned"})`
      : p.name,
    isDisabled: p.disabled,
  }));

  // ==================== RESET PROVIDER WHEN ROLE CHANGES ====================
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSelectedProvider(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId?.value]);

  // ==================== HANDLERS ====================
  const handleRoleChange = (val) => {
    setSelectedRoleId(val);
  };

  const handleProviderChange = (val) => {
    if (val?.isDisabled) return;
    setSelectedProvider(val);
    if (errors.provider_id) {
      setErrors((prev) => ({ ...prev, provider_id: "" }));
    }
  };

  // ==================== VALIDATION ====================
  const validate = () => {
    const e = {};
    if (!selectedRoleId?.value) e.role_id = "Role is required";
    if (!selectedProvider?.value) e.provider_id = "Provider is required";
    if (!name.trim()) e.name = "Appointment type name is required";
    else if (name.trim().length > 150) e.name = "Max 150 characters";
    if (!duration || Number(duration) < 1)
      e.duration = "Duration must be at least 1 minute";
    if (!capacity || Number(capacity) < 1)
      e.capacity = "Capacity must be at least 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      role_id: selectedRoleId?.value,
      admin_id: selectedProvider?.value,
      name: name.trim(),
      description: description?.trim() || null,
      duration: Number(duration),
      capacity: Number(capacity),
      status: status,
    };

    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: initialData.id, payload })
      : createMutation.mutateAsync(payload);

    mutation.then(() => onClose()).catch(() => {});
  };

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasRoleSelected = !!selectedRoleId?.value;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900">
            {isEdit ? "Edit Appointment Type" : "Add Appointment Type"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            {/* Role */}
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
              {errors.role_id && (
                <p className="mt-1 text-xs text-form-error">{errors.role_id}</p>
              )}
            </div>

            {/* Provider */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Provider <span className="text-form-required">*</span>
              </label>
              <FilterSelect
                value={selectedProvider}
                onChange={handleProviderChange}
                options={providerOptions}
                placeholder={
                  !hasRoleSelected
                    ? "Select role first"
                    : loadingProviders
                      ? "Loading providers..."
                      : providerOptions.length === 0
                        ? "No providers available"
                        : "Select provider..."
                }
                isDisabled={
                  !hasRoleSelected ||
                  loadingProviders ||
                  providerOptions.length === 0
                }
                isClearable
                isOptionDisabled={(opt) => opt.isDisabled}
              />
              {errors.provider_id && (
                <p className="mt-1 text-xs text-form-error">
                  {errors.provider_id}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="sm:col-span-2">
              <TextInput
                label="Appointment Type Name"
                name="at_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isFormik={false}
                placeholder="e.g. General Physician Appointment"
                maxLength={150}
                required
              />
              {errors.name && (
                <p className="mt-1 text-xs text-form-error">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Short description..."
                className="w-full resize-y rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Duration (minutes) <span className="text-form-required">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 15"
                className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
              {errors.duration && (
                <p className="mt-1 text-xs text-form-error">
                  {errors.duration}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Capacity (patients per slot){" "}
                <span className="text-form-required">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 1"
                className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-form-error">
                  {errors.capacity}
                </p>
              )}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-800">
                {status ? "Active" : "Inactive"}
              </p>
              <p className="text-[11px] text-ink-500">
                Toggle to activate or deactivate
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={status}
              onClick={() => setStatus((v) => !v)}
              disabled={isPending}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                status ? "bg-brand-600" : "bg-ink-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                  status ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <div className="w-40">
              <FormButton
                type="submit"
                text={
                  isPending
                    ? isEdit
                      ? "Updating..."
                      : "Creating..."
                    : isEdit
                      ? "Update"
                      : "Create"
                }
                disabled={isPending}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentTypeForm;
