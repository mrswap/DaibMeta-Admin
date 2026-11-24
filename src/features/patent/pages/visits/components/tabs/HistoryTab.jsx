// // src/features/patent/pages/visits/components/tabs/HistoryTab.jsx

// import {
//   FiClock,
//   FiInfo,
//   FiUser,
//   FiCalendar,
//   FiFileText,
//   FiActivity,
//   FiLock,
// } from "react-icons/fi";
// import { useVisitHistory } from "../../../../queries/visits";
// import Loader from "../../../../common/Loader";

// // ==================== HELPERS ====================
// const formatDate = (d) => {
//   if (!d) return "—";
//   try {
//     return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
//       weekday: "short",
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return d;
//   }
// };

// const formatDateTime = (d) => {
//   if (!d) return "—";
//   try {
//     return new Date(d).toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return d;
//   }
// };

// // ==================== MAIN ====================
// const HistoryTab = ({ visitId, canManage = false }) => {
//   const { data: history, isLoading } = useVisitHistory(visitId);

//   if (isLoading) return <Loader text="Loading history..." />;

//   const list = Array.isArray(history) ? history : [];

//   // ==================== EMPTY ====================
//   if (list.length === 0) {
//     return (
//       <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
//         <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
//           <FiInfo className="h-5 w-5 text-ink-500" />
//         </div>
//         <p className="text-sm font-medium text-ink-700">No previous visits</p>
//         <p className="mt-1 text-xs text-ink-500">
//           This patient has no completed visits before this one.
//         </p>
//       </div>
//     );
//   }

//   // ==================== LIST ====================
//   return (
//     <div className="space-y-3">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-100 bg-ink-50/40 px-4 py-2.5">
//         <div className="flex items-center gap-2">
//           <FiClock className="h-4 w-4 text-ink-500" />
//           <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//             Previous Visits
//           </p>
//         </div>
//         <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink-600">
//           {list.length}
//         </span>
//       </div>

//       {/* Cards */}
//       <div className="space-y-3">
//         {list.map((visit) => (
//           <HistoryCard key={visit.id} visit={visit} />
//         ))}
//       </div>
//     </div>
//   );
// };

// // ==================== HISTORY CARD ====================
// const HistoryCard = ({ visit }) => {
//   const consultation = visit.consultation;
//   const provider = visit.provider;

//   return (
//     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//         <div className="flex items-center gap-3">
//           {/* Date badge */}
//           <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
//             <span className="text-[9px] font-bold uppercase leading-none">
//               {visit.visit_date
//                 ? new Date(visit.visit_date + "T00:00:00").toLocaleDateString(
//                     "en-GB",
//                     { month: "short" },
//                   )
//                 : "—"}
//             </span>
//             <span className="mt-0.5 text-xs font-bold leading-none">
//               {visit.visit_date
//                 ? new Date(visit.visit_date + "T00:00:00").getDate()
//                 : "—"}
//             </span>
//           </div>
//           <div className="min-w-0">
//             <p className="text-sm font-semibold text-ink-900">
//               {formatDate(visit.visit_date)}
//             </p>
//             <p className="mt-0.5 text-[11px] text-ink-500">
//               {provider?.name || "—"}
//               {visit.visit_type_label || visit.visit_type
//                 ? ` · ${visit.visit_type_label || visit.visit_type}`
//                 : ""}
//             </p>
//           </div>
//         </div>
//         <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-700">
//           {visit.status_label || visit.status || "—"}
//         </span>
//       </div>

//       {/* Consultation details */}
//       {consultation ? (
//         <div className="space-y-3 p-4">
//           {consultation.symptoms && (
//             <ConsultationRow
//               icon={FiActivity}
//               label="Symptoms"
//               value={consultation.symptoms}
//             />
//           )}

//           {consultation.clinical_details && (
//             <ConsultationRow
//               icon={FiFileText}
//               label="Clinical Details"
//               value={consultation.clinical_details}
//             />
//           )}

//           {consultation.doctor_notes && (
//             <ConsultationRow
//               icon={FiFileText}
//               label="Doctor Notes"
//               value={consultation.doctor_notes}
//             />
//           )}

//           {consultation.advice && (
//             <ConsultationRow
//               icon={FiInfo}
//               label="Advice"
//               value={consultation.advice}
//             />
//           )}

//           {/* Timing */}
//           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-100 pt-3 text-[10px] text-ink-500">
//             {consultation.consultation_started_at && (
//               <span>
//                 Started:{" "}
//                 <strong className="text-ink-700">
//                   {formatDateTime(consultation.consultation_started_at)}
//                 </strong>
//               </span>
//             )}
//             {consultation.consultation_completed_at && (
//               <span>
//                 Completed:{" "}
//                 <strong className="text-ink-700">
//                   {formatDateTime(consultation.consultation_completed_at)}
//                 </strong>
//               </span>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="px-4 py-5 text-center">
//           <p className="text-xs text-ink-500">
//             No consultation details available.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ==================== ROW ====================
// const ConsultationRow = ({ icon: Icon, label, value }) => (
//   <div className="flex items-start gap-2.5">
//     <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
//     <div className="min-w-0 flex-1">
//       <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
//         {label}
//       </p>
//       <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-800">
//         {value}
//       </p>
//     </div>
//   </div>
// );

// export default HistoryTab;

// src/features/patent/pages/visits/components/tabs/HistoryTab.jsx

import { FiClock, FiCalendar, FiLock, FiFileText } from "react-icons/fi";
import { useVisitHistory } from "../../../../queries/visits";
import Loader from "../../../../common/Loader";
import { usePermission } from "../../../../hooks/usePermission";

// ==================== HELPERS ====================
// ✅ Safe date formatter — ISO datetime ("...T...Z") aur date-only ("YYYY-MM-DD") dono handle
const formatDate = (d) => {
  if (!d) return "—";
  try {
    // Agar string mein "T" hai (ISO datetime) to direct parse,
    // warna date-only maan kar local midnight se parse.
    const dt =
      typeof d === "string" && d.includes("T")
        ? new Date(d)
        : new Date(d + "T00:00:00");

    if (isNaN(dt.getTime())) return "—";

    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "—";
    return dt.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const formatTime12 = (t) => {
  if (!t) return "—";
  // Agar ISO datetime aa gaya to time nikalo
  if (typeof t === "string" && t.includes("T")) {
    try {
      const dt = new Date(t);
      if (isNaN(dt.getTime())) return "—";
      return dt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "—";
    }
  }
  // "HH:mm:ss" ya "HH:mm"
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

// ==================== STATUS BADGE ====================
const STATUS_STYLES = {
  waiting: "bg-warn-100 text-warn-900",
  in_consultation: "bg-accent-50 text-accent-800",
  completed: "bg-brand-50 text-brand-700",
  cancelled: "bg-danger-50 text-danger-700",
  no_show: "bg-danger-100 text-danger-900",
};

const STATUS_LABELS = {
  waiting: "Waiting",
  in_consultation: "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const TYPE_LABELS = {
  consultation: "Consultation",
  follow_up: "Follow Up",
  walk_in: "Walk In",
};

// ==================== MAIN ====================
const HistoryTab = ({ visitId }) => {
  const { can } = usePermission();
  const canView = can("visits", "view");

  const { data: history = [], isLoading } = useVisitHistory(
    canView ? visitId : null,
  );

  // ==================== ACCESS DENIED ====================
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-900">Access Denied</p>
        <p className="mt-1 max-w-sm text-xs text-ink-500">
          You do not have permission to view visit history.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading history..." />;

  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
          <FiClock className="h-5 w-5 text-ink-500" />
        </div>
        <p className="text-sm font-medium text-ink-700">No history found</p>
        <p className="mt-1 text-xs text-ink-500">
          No previous visits recorded for this patient.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FiClock className="h-4 w-4 text-ink-500" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
          Visit History ({history.length})
        </p>
      </div>

      <div className="space-y-2.5">
        {history.map((h) => {
          const isCurrent = String(h.id) === String(visitId);
          const statusStyle =
            STATUS_STYLES[h.status] || "bg-ink-100 text-ink-600";

          return (
            <div
              key={h.id}
              className={`overflow-hidden rounded-xl border bg-surface ${
                isCurrent
                  ? "border-brand-300 ring-1 ring-brand-200"
                  : "border-ink-100"
              }`}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-700">
                    #{h.id}
                  </code>
                  {isCurrent && (
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold uppercase text-surface">
                      Current
                    </span>
                  )}
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle}`}
                  >
                    {STATUS_LABELS[h.status] || h.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-600">
                  <span className="inline-flex items-center gap-1">
                    <FiCalendar className="h-3 w-3" />
                    {formatDate(h.visit_date)}
                  </span>
                  {h.provider?.name && (
                    <span className="text-ink-500">{h.provider.name}</span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-medium text-accent-800">
                    {TYPE_LABELS[h.visit_type] || h.visit_type || "—"}
                  </span>
                  {h.consultation?.consultation_started_at && (
                    <span className="text-ink-500">
                      Started:{" "}
                      {formatDateTime(h.consultation.consultation_started_at)}
                    </span>
                  )}
                  {h.consultation?.consultation_completed_at && (
                    <span className="text-ink-500">
                      Completed:{" "}
                      {formatDateTime(h.consultation.consultation_completed_at)}
                    </span>
                  )}
                </div>

                {h.consultation &&
                  (h.consultation.symptoms ||
                    h.consultation.clinical_details ||
                    h.consultation.doctor_notes ||
                    h.consultation.advice) && (
                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-ink-100 bg-ink-50/30 p-2.5 sm:grid-cols-2">
                      {h.consultation.symptoms && (
                        <Field
                          label="Symptoms"
                          value={h.consultation.symptoms}
                        />
                      )}
                      {h.consultation.clinical_details && (
                        <Field
                          label="Clinical Details"
                          value={h.consultation.clinical_details}
                        />
                      )}
                      {h.consultation.doctor_notes && (
                        <Field
                          label="Doctor Notes"
                          value={h.consultation.doctor_notes}
                        />
                      )}
                      {h.consultation.advice && (
                        <Field label="Advice" value={h.consultation.advice} />
                      )}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== SUB-COMPONENT ====================
const Field = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-500">
      {label}
    </p>
    <p className="mt-0.5 whitespace-pre-wrap text-xs text-ink-800">{value}</p>
  </div>
);

export default HistoryTab;
