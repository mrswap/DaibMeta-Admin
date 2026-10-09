// src/features/patent/pages/exceptionManagement/components/ExceptionDetailsModal.jsx

import {
  FiX,
  FiUser,
  FiCalendar,
  FiClock,
  FiLock,
  FiFileText,
  FiBriefcase,
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  formatTime12,
  formatDateFull,
} from "../../../queries/exceptionManagement";

const ExceptionDetailsModal = ({ open, onClose, exception }) => {
  const navigate = useNavigate();

  if (!open || !exception) return null;

  const isFullDay = exception.is_full_day;
  const availabilityId = exception.availability_id;

  // ==================== MANAGE NAVIGATION ====================
  const handleManage = () => {
    if (!availabilityId) return;
    onClose();
    navigate(`/provider-availabilities/${availabilityId}/exceptions`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-50 text-danger-600">
              <FiLock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-jakarta text-base font-bold text-ink-900">
                Blocked Slot
              </h2>
              <p className="text-[11px] text-ink-500">Exception details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
            title="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* ==================== STATUS BANNER ==================== */}
        <div className="border-b border-ink-100 bg-danger-50/50 px-5 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-danger-900">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger-500" />
              {isFullDay ? "Full Day Block" : "Blocked"}
            </span>
            {exception.id && (
              <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
                #{exception.id}
              </code>
            )}
          </div>
        </div>

        {/* ==================== BODY ==================== */}
        <div className="space-y-4 px-5 py-5">
          {/* Provider */}
          {exception.provider?.name && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Provider
              </p>
              <div className="mt-1.5 flex items-start gap-2.5 rounded-lg border border-ink-100 bg-ink-50/40 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
                  {(exception.provider.name || "?")
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {exception.provider.name}
                  </p>
                  {exception.provider.role_label && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500">
                      <FiBriefcase className="h-3 w-3" />
                      <span>{exception.provider.role_label}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
              <div className="flex items-center gap-1.5">
                <FiCalendar className="h-3 w-3 text-ink-400" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  Date
                </p>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-900">
                {formatDateFull(exception.exception_date)}
              </p>
            </div>

            <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
              <div className="flex items-center gap-1.5">
                <FiClock className="h-3 w-3 text-ink-400" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  Time
                </p>
              </div>
              {isFullDay ? (
                <p className="mt-1 text-sm font-semibold text-warn-800">
                  Full Day
                </p>
              ) : (
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {formatTime12(exception.start_time)} –{" "}
                  {formatTime12(exception.end_time)}
                </p>
              )}
            </div>
          </div>

          {/* Appointment Type */}
          {exception.appointment_type?.name && (
            <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
              <div className="flex items-center gap-1.5">
                <FiBriefcase className="h-3 w-3 text-ink-400" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  Appointment Type
                </p>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-900">
                {exception.appointment_type.name}
                {exception.appointment_type.duration && (
                  <span className="ml-1.5 text-[11px] font-normal text-ink-500">
                    ({exception.appointment_type.duration} min)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
            <div className="flex items-center gap-1.5">
              <FiFileText className="h-3 w-3 text-ink-400" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Reason
              </p>
            </div>
            {exception.reason ? (
              <p className="mt-1 break-words text-sm text-ink-800">
                {exception.reason}
              </p>
            ) : (
              <p className="mt-1 text-sm italic text-ink-400">
                No reason provided
              </p>
            )}
          </div>

          {/* Meta */}
          {exception.created_at && (
            <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-ink-200 bg-ink-50/30 px-3 py-2">
              <FiAlertCircle className="h-3 w-3 shrink-0 text-ink-400" />
              <p className="text-[10px] text-ink-500">
                Created on{" "}
                <span className="font-medium text-ink-700">
                  {new Date(exception.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {" at "}
                <span className="font-medium text-ink-700">
                  {new Date(exception.created_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          )}

          {/* Info note */}
          {availabilityId && (
            <div className="rounded-lg border border-accent-200 bg-accent-50/60 px-3 py-2">
              <p className="text-[11px] text-accent-900">
                Slot ko unblock ya reason update karne ke liye{" "}
                <strong>Manage Slot</strong> click karo.
              </p>
            </div>
          )}
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/30 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Close
          </button>
          {availabilityId && (
            <button
              type="button"
              onClick={handleManage}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              Manage Slot
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExceptionDetailsModal;
