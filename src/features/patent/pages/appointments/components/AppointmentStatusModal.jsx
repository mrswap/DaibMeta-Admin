import { useState } from "react";
import {
  FiX,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle,
  FiLock,
} from "react-icons/fi";
import {
  useUpdateAppointmentStatus,
  getStatusLabel,
} from "../../../queries/appointments";

// Statuses that are disabled (UI restrictions)
const DISABLED_STATUSES = ["checked_in", "completed"];

const AppointmentStatusModal = ({
  open,
  onClose,
  appointmentId,
  currentStatus,
  allowedTransitions = [],
}) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const updateMutation = useUpdateAppointmentStatus();

  if (!open) return null;

  const handleSubmit = () => {
    if (!selectedStatus) return;
    updateMutation.mutate(
      { id: appointmentId, status: selectedStatus },
      {
        onSuccess: () => {
          setSelectedStatus(null);
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    if (updateMutation.isPending) return;
    setSelectedStatus(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={updateMutation.isPending ? undefined : handleClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FiRefreshCw className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-jakarta text-base font-bold text-ink-900">
                Change Status
              </h2>
              <p className="text-[11px] text-ink-500">
                Current: {getStatusLabel(currentStatus)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={updateMutation.isPending}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="mb-3 text-xs font-medium text-ink-500">
            Select a new status
          </p>

          <div className="space-y-2">
            {allowedTransitions.map((status) => {
              const isSelected = selectedStatus === status;
              const isDisabled = DISABLED_STATUSES.includes(status);

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => !isDisabled && setSelectedStatus(status)}
                  disabled={isDisabled || updateMutation.isPending}
                  title={
                    isDisabled
                      ? "Currently unavailable"
                      : getStatusLabel(status)
                  }
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                    isDisabled
                      ? "cursor-not-allowed border-ink-100 bg-ink-50 opacity-60"
                      : isSelected
                        ? "cursor-pointer border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                        : "cursor-pointer border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-medium ${
                      isDisabled
                        ? "text-ink-400"
                        : isSelected
                          ? "text-brand-800"
                          : "text-ink-700"
                    }`}
                  >
                    {isDisabled && <FiLock className="h-3 w-3" />}
                    {getStatusLabel(status)}
                  </span>
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      isDisabled
                        ? "border-ink-200"
                        : isSelected
                          ? "border-brand-600 bg-brand-600"
                          : "border-ink-300"
                    }`}
                  >
                    {isSelected && !isDisabled && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {allowedTransitions.length === 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-warn-200 bg-warn-50/50 px-3 py-2.5">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
              <p className="text-xs text-warn-800">
                No status transitions available for this appointment.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={updateMutation.isPending}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedStatus || updateMutation.isPending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheck className="h-3.5 w-3.5" />
            {updateMutation.isPending ? "Updating..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatusModal;
