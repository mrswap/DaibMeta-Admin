// src/features/patent/pages/visits/components/tabs/HistoryTab.jsx

import {
  FiClock,
  FiInfo,
  FiUser,
  FiCalendar,
  FiFileText,
  FiActivity,
} from "react-icons/fi";
import { useVisitHistory } from "../../../../queries/visits";
import Loader from "../../../../common/Loader";

// ==================== HELPERS ====================
const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

// ==================== MAIN ====================
const HistoryTab = ({ visitId }) => {
  const { data: history, isLoading } = useVisitHistory(visitId);

  if (isLoading) return <Loader text="Loading history..." />;

  const list = Array.isArray(history) ? history : [];

  // ==================== EMPTY ====================
  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
          <FiInfo className="h-5 w-5 text-ink-500" />
        </div>
        <p className="text-sm font-medium text-ink-700">No previous visits</p>
        <p className="mt-1 text-xs text-ink-500">
          This patient has no completed visits before this one.
        </p>
      </div>
    );
  }

  // ==================== LIST ====================
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-100 bg-ink-50/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FiClock className="h-4 w-4 text-ink-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
            Previous Visits
          </p>
        </div>
        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
          {list.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {list.map((visit) => (
          <HistoryCard key={visit.id} visit={visit} />
        ))}
      </div>
    </div>
  );
};

// ==================== HISTORY CARD ====================
const HistoryCard = ({ visit }) => {
  const consultation = visit.consultation;
  const provider = visit.provider;

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Date badge */}
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <span className="text-[9px] font-bold uppercase leading-none">
              {visit.visit_date
                ? new Date(visit.visit_date + "T00:00:00").toLocaleDateString(
                    "en-GB",
                    { month: "short" },
                  )
                : "—"}
            </span>
            <span className="mt-0.5 text-xs font-bold leading-none">
              {visit.visit_date
                ? new Date(visit.visit_date + "T00:00:00").getDate()
                : "—"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">
              {formatDate(visit.visit_date)}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-500">
              {provider?.name || "—"}
              {visit.visit_type_label || visit.visit_type
                ? ` · ${visit.visit_type_label || visit.visit_type}`
                : ""}
            </p>
          </div>
        </div>
        <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-700">
          {visit.status_label || visit.status || "—"}
        </span>
      </div>

      {/* Consultation details */}
      {consultation ? (
        <div className="space-y-3 p-4">
          {consultation.symptoms && (
            <ConsultationRow
              icon={FiActivity}
              label="Symptoms"
              value={consultation.symptoms}
            />
          )}

          {consultation.clinical_details && (
            <ConsultationRow
              icon={FiFileText}
              label="Clinical Details"
              value={consultation.clinical_details}
            />
          )}

          {consultation.doctor_notes && (
            <ConsultationRow
              icon={FiFileText}
              label="Doctor Notes"
              value={consultation.doctor_notes}
            />
          )}

          {consultation.advice && (
            <ConsultationRow
              icon={FiInfo}
              label="Advice"
              value={consultation.advice}
            />
          )}

          {/* Timing */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-100 pt-3 text-[10px] text-ink-500">
            {consultation.consultation_started_at && (
              <span>
                Started:{" "}
                <strong className="text-ink-700">
                  {formatDateTime(consultation.consultation_started_at)}
                </strong>
              </span>
            )}
            {consultation.consultation_completed_at && (
              <span>
                Completed:{" "}
                <strong className="text-ink-700">
                  {formatDateTime(consultation.consultation_completed_at)}
                </strong>
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-5 text-center">
          <p className="text-xs text-ink-500">
            No consultation details available.
          </p>
        </div>
      )}
    </div>
  );
};

// ==================== ROW ====================
const ConsultationRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-800">
        {value}
      </p>
    </div>
  </div>
);

export default HistoryTab;
