// src/features/patent/pages/visits/components/VisitLifecycleModal.jsx

import { useState, useEffect } from "react";
import { FiX, FiAlertCircle, FiCheck } from "react-icons/fi";
import {
  useVisitLifecycle,
  LIFECYCLE_ACTION_LABELS,
  LIFECYCLE_ACTION_DESCRIPTIONS,
} from "../../../queries/visits";

// ==================== ACTION STYLES ====================
const ACTION_STYLES = {
  start_consultation: {
    border: "border-brand-500 bg-brand-50 ring-1 ring-brand-500",
    text: "text-brand-800",
    radio: "border-brand-600 bg-brand-600",
  },
  revert_to_waiting: {
    border: "border-warn-500 bg-warn-50 ring-1 ring-warn-500",
    text: "text-warn-900",
    radio: "border-warn-600 bg-warn-600",
  },
  complete: {
    border: "border-brand-500 bg-brand-50 ring-1 ring-brand-500",
    text: "text-brand-800",
    radio: "border-brand-600 bg-brand-600",
  },
  cancel: {
    border: "border-danger-500 bg-danger-50 ring-1 ring-danger-500",
    text: "text-danger-800",
    radio: "border-danger-600 bg-danger-600",
  },
  no_show: {
    border: "border-danger-500 bg-danger-50 ring-1 ring-danger-500",
    text: "text-danger-800",
    radio: "border-danger-600 bg-danger-600",
  },
};

// ==================== STATUS LABEL ====================
const STATUS_LABELS = {
  waiting: "Waiting",
  in_consultation: "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

// ==================== MAIN ====================
const VisitLifecycleModal = ({
  open,
  onClose,
  visitId,
  currentStatus,
  allowedActions = [],
}) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const lifecycleMutation = useVisitLifecycle();

  useEffect(() => {
    if (open) setSelectedAction(null);
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!selectedAction) return;
    lifecycleMutation.mutate(
      { id: visitId, action: selectedAction },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const isPending = lifecycleMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FiAlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-jakarta text-base font-bold text-ink-900">
                Change Visit Status
              </h2>
              <p className="text-[11px] text-ink-500">
                Current:{" "}
                <strong className="text-ink-700">
                  {STATUS_LABELS[currentStatus] || currentStatus}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {allowedActions.length > 0 ? (
            <>
              <p className="mb-3 text-xs font-medium text-ink-500">
                Select an action
              </p>

              <div className="space-y-2">
                {allowedActions.map((action) => {
                  const isSelected = selectedAction === action;
                  const style = ACTION_STYLES[action] || ACTION_STYLES.cancel;

                  return (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setSelectedAction(action)}
                      disabled={isPending}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left transition ${
                        isSelected
                          ? style.border
                          : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            isSelected ? style.text : "text-ink-800"
                          }`}
                        >
                          {LIFECYCLE_ACTION_LABELS[action] || action}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-500">
                          {LIFECYCLE_ACTION_DESCRIPTIONS[action] || ""}
                        </p>
                      </div>
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? style.radio : "border-ink-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-warn-200 bg-warn-50/50 px-3 py-2.5">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
              <div>
                <p className="text-xs font-semibold text-warn-900">
                  No actions available
                </p>
                <p className="mt-0.5 text-[11px] text-warn-800">
                  This visit has reached a final state and cannot be changed
                  further.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedAction || isPending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheck className="h-3.5 w-3.5" />
            {isPending ? "Updating..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitLifecycleModal;
