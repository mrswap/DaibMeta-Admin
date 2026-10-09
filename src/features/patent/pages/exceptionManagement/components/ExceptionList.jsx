// src/features/patent/pages/exceptionManagement/components/ExceptionList.jsx

import { useMemo } from "react";
import {
  FiLock,
  FiClock,
  FiCalendar,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";
import {
  formatTime12,
  formatDateFull,
} from "../../../queries/exceptionManagement";

const ExceptionList = ({
  date,
  exceptions = [],
  provider,
  isLoading = false,
  onExceptionClick,
}) => {
  // ==================== STATS ====================
  const stats = useMemo(() => {
    const fullDay = exceptions.filter((e) => e.is_full_day).length;
    const partial = exceptions.length - fullDay;
    return { total: exceptions.length, fullDay, partial };
  }, [exceptions]);

  // ==================== LOADING ====================
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiLock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Blocked Slots
            </p>
          </div>
        </div>
        <div className="px-4 py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
            <p className="text-xs text-ink-500">Loading exceptions...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== EMPTY STATE ====================
  if (exceptions.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        {/* Header */}
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiLock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Blocked Slots
            </p>
          </div>
        </div>

        <div className="px-4 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <FiCalendar className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-ink-700">No blocked slots</p>
          <p className="mt-1 text-xs text-ink-500">
            {provider
              ? `${provider.name} has no blocked slots on this date.`
              : "No exceptions found for this date."}
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* ==================== HEADER ==================== */}
      <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiLock className="h-4 w-4 text-danger-600" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Blocked Slots
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
              {stats.total} total
            </span>
            {stats.fullDay > 0 && (
              <span className="rounded-md bg-warn-100 px-2 py-0.5 text-[10px] font-semibold text-warn-800">
                {stats.fullDay} full day
              </span>
            )}
          </div>
        </div>

        {/* Date + Provider subtitle */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
          <span className="font-medium">{formatDateFull(date)}</span>
          {provider && (
            <>
              <span className="text-ink-300">•</span>
              <span className="font-medium">{provider.name}</span>
            </>
          )}
        </div>
      </div>

      {/* ==================== LIST ==================== */}
      <div className="max-h-[480px] space-y-2 overflow-y-auto p-4">
        {exceptions.map((ex) => {
          const isFullDay = ex.is_full_day;

          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onExceptionClick(ex)}
              title="Click for details"
              className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-left transition hover:border-danger-500/50 hover:bg-danger-100/70"
            >
              {/* Icon */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-500 text-surface">
                <FiLock className="h-3 w-3" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {/* Time */}
                <div className="flex flex-wrap items-center gap-2">
                  {isFullDay ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn-800">
                      <FiAlertCircle className="h-2.5 w-2.5" />
                      Full Day
                    </span>
                  ) : (
                    <span className="text-[12px] font-semibold text-danger-700">
                      {formatTime12(ex.start_time)}
                      <span className="mx-1 font-normal text-danger-600">
                        –
                      </span>
                      {formatTime12(ex.end_time)}
                    </span>
                  )}

                  {/* Provider chip (only when no filter active) */}
                  {!provider && ex.provider?.name && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-700 ring-1 ring-ink-200">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-400" />
                      {ex.provider.name}
                    </span>
                  )}

                  {/* Appointment type chip */}
                  {ex.appointment_type?.name && (
                    <span className="inline-flex rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-600 ring-1 ring-ink-200">
                      {ex.appointment_type.name}
                    </span>
                  )}
                </div>

                {/* Reason */}
                {ex.reason && (
                  <p className="mt-1 truncate text-[11px] text-ink-600">
                    <span className="font-medium text-ink-500">Reason:</span>{" "}
                    {ex.reason}
                  </p>
                )}

                {/* Meta line */}
                {ex.created_at && (
                  <p className="mt-1 text-[10px] text-ink-400">
                    Created{" "}
                    {new Date(ex.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>

              {/* Right indicator */}
              <div className="flex shrink-0 items-center">
                <FiInfo className="h-3.5 w-3.5 text-danger-500" />
              </div>
            </button>
          );
        })}
      </div>

      {/* ==================== FOOTER ==================== */}
      <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-2.5">
        <p className="text-[10px] text-ink-500">
          Click any blocked slot to view full details
        </p>
      </div>
    </div>
  );
};

export default ExceptionList;
