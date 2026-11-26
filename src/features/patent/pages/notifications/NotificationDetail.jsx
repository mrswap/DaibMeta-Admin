// // src/features/patent/pages/notifications/NotificationDetail.jsx

// import { useMemo, useEffect, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiBell,
//   FiCalendar,
//   FiUser,
//   FiAlertCircle,
//   FiInfo,
//   FiMail,
//   FiCheckCircle,
//   FiClock,
//   FiTag,
//   FiExternalLink,
//   FiTrash2,
// } from "react-icons/fi";
// import {
//   useNotifications,
//   useMarkAsRead,
//   useMarkAsUnread,
//   useDeleteNotification,
// } from "../../queries/notifications";
// import Loader from "../../common/Loader";

// // ==================== HELPERS ====================
// const getIcon = (type = "") => {
//   const t = String(type).toLowerCase();
//   if (t.includes("appointment")) return FiCalendar;
//   if (t.includes("patient")) return FiUser;
//   if (t.includes("alert") || t.includes("error")) return FiAlertCircle;
//   if (t.includes("lead")) return FiMail;
//   return FiInfo;
// };

// const formatFullDate = (dateStr) => {
//   if (!dateStr) return "—";
//   try {
//     return new Date(dateStr).toLocaleString(undefined, {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return dateStr;
//   }
// };

// const getRelativeTime = (dateStr) => {
//   if (!dateStr) return "";
//   const diffMs = Date.now() - new Date(dateStr).getTime();
//   const m = Math.floor(diffMs / 60000);
//   const h = Math.floor(diffMs / 3600000);
//   const d = Math.floor(diffMs / 86400000);
//   if (m < 1) return "Just now";
//   if (m < 60) return `${m}m ago`;
//   if (h < 24) return `${h}h ago`;
//   if (d < 7) return `${d}d ago`;
//   return new Date(dateStr).toLocaleDateString();
// };

// // screen -> route mapping (API doc section 6)
// const resolveScreenRoute = (screen, data) => {
//   if (!screen) return null;
//   const id =
//     data?.appointment_id ??
//     data?.visit_id ??
//     data?.patient_id ??
//     data?.lead_id ??
//     data?.id;
//   switch (screen) {
//     case "appointment_detail":
//       return id ? `/appointments/${id}` : "/appointments";
//     case "visit_detail":
//       return id ? `/visits/${id}` : "/visits";
//     case "patient_detail":
//       return "/patients";
//     case "lead_detail":
//       return id ? `/service-manager/leads/${id}` : "/service-manager/leads";
//     default:
//       return null; // unknown screen — gracefully ignore
//   }
// };

// // ==================== SMALL COMPONENTS ====================
// const BackButton = ({ onClick }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
//   >
//     <FiArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
//     Back to Notifications
//   </button>
// );

// const MetaItem = ({ icon: Icon, label, value }) => (
//   <div className="flex items-start gap-2">
//     <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
//     <div className="min-w-0">
//       <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
//         {label}
//       </p>
//       <p className="truncate text-xs font-medium text-ink-800">{value}</p>
//     </div>
//   </div>
// );

// // ==================== MAIN COMPONENT ====================
// const NotificationDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // Backend mein dedicated detail endpoint nahi hai —
//   // list se id match karke notification pick kar rahe hain.
//   const { data, isLoading } = useNotifications({ per_page: 100 });

//   const markAsRead = useMarkAsRead();
//   const markAsUnread = useMarkAsUnread();
//   const deleteNotification = useDeleteNotification();

//   const notification = useMemo(() => {
//     const list = data?.list || [];
//     return list.find((n) => String(n.id) === String(id)) || null;
//   }, [data, id]);

//   const isUnread = notification ? !notification.read_at : false;
//   const Icon = getIcon(notification?.type);
//   const dataPayload = notification?.data || {};

//   // Auto mark-as-read on open (sirf ek baar, sirf unread par)
//   const autoMarkedRef = useRef(false);
//   useEffect(() => {
//     if (!notification) return;
//     if (notification.read_at) return;
//     if (autoMarkedRef.current) return;
//     autoMarkedRef.current = true;
//     markAsRead.mutate(notification.id);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [notification?.id]);

//   const handleToggleRead = () => {
//     if (!notification) return;
//     if (isUnread) markAsRead.mutate(notification.id);
//     else markAsUnread.mutate(notification.id);
//   };

//   const handleDelete = () => {
//     if (!notification) return;
//     deleteNotification.mutate(notification.id, {
//       onSettled: () => navigate("/notifications"),
//     });
//   };

//   const handleGoToRelated = () => {
//     const route = resolveScreenRoute(dataPayload.screen, dataPayload);
//     if (route) navigate(route);
//   };

//   // ---------- LOADING ----------
//   if (isLoading) {
//     return (
//       <div className="space-y-5">
//         <BackButton onClick={() => navigate("/notifications")} />
//         <Loader text="Loading notification..." />
//       </div>
//     );
//   }

//   // ---------- NOT FOUND ----------
//   if (!notification) {
//     return (
//       <div className="space-y-5">
//         <BackButton onClick={() => navigate("/notifications")} />
//         <div className="flex flex-col items-center justify-center rounded-xl border border-ink-100 bg-surface px-6 py-16 text-center">
//           <FiBell className="mb-3 h-12 w-12 text-ink-300" />
//           <p className="text-sm font-medium text-ink-700">
//             Notification not found
//           </p>
//           <p className="mt-1 text-xs text-ink-500">
//             It may have been deleted or is on an earlier page.
//           </p>
//           <button
//             type="button"
//             onClick={() => navigate("/notifications")}
//             className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
//           >
//             <FiArrowLeft className="h-4 w-4" />
//             Back to Notifications
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const relatedRoute = resolveScreenRoute(dataPayload.screen, dataPayload);

//   // ---------- MAIN ----------
//   return (
//     <div className="space-y-5 pb-10">
//       <BackButton onClick={() => navigate("/notifications")} />

//       {/* Main card */}
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         {/* Header strip */}
//         <div
//           className={`flex items-start gap-3 border-b border-ink-100 px-5 py-5 ${
//             isUnread ? "bg-brand-50/40" : "bg-surface"
//           }`}
//         >
//           <div
//             className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
//               isUnread
//                 ? "bg-brand-100 text-brand-700"
//                 : "bg-ink-100 text-ink-500"
//             }`}
//           >
//             <Icon className="h-6 w-6" />
//           </div>
//           <div className="min-w-0 flex-1">
//             <div className="flex flex-wrap items-center gap-2">
//               <h1 className="text-lg font-bold text-ink-900 sm:text-xl">
//                 {notification.title || "Notification"}
//               </h1>
//               {isUnread && (
//                 <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
//                   New
//                 </span>
//               )}
//             </div>
//             <p className="mt-1 text-xs text-ink-500">
//               {formatFullDate(notification.created_at)} ·{" "}
//               {getRelativeTime(notification.created_at)}
//             </p>
//           </div>
//         </div>

//         {/* Message body */}
//         <div className="px-5 py-5">
//           <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">
//             {notification.message || "—"}
//           </p>
//         </div>

//         {/* Meta grid */}
//         <div className="grid grid-cols-1 gap-4 border-t border-ink-100 bg-ink-50/30 px-5 py-4 sm:grid-cols-2">
//           <MetaItem
//             icon={FiTag}
//             label="Type"
//             value={notification.type || "—"}
//           />
//           <MetaItem
//             icon={FiCheckCircle}
//             label="Status"
//             value={isUnread ? "Unread" : "Read"}
//           />
//           <MetaItem
//             icon={FiClock}
//             label="Created"
//             value={formatFullDate(notification.created_at)}
//           />
//           <MetaItem
//             icon={FiCheckCircle}
//             label="Read at"
//             value={
//               notification.read_at ? formatFullDate(notification.read_at) : "—"
//             }
//           />
//         </div>

//         {/* Data payload (only if non-empty) */}
//         {dataPayload && Object.keys(dataPayload).length > 0 && (
//           <div className="border-t border-ink-100 px-5 py-4">
//             <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
//               <FiInfo className="h-3 w-3" />
//               Additional Data
//             </p>
//             <pre className="overflow-x-auto rounded-lg bg-ink-50 px-3 py-2 text-[11px] text-ink-700">
//               {JSON.stringify(dataPayload, null, 2)}
//             </pre>
//           </div>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <button
//           type="button"
//           onClick={handleDelete}
//           disabled={deleteNotification.isPending}
//           className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-danger-200 bg-surface px-3 py-2 text-sm font-medium text-danger-600 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <FiTrash2 className="h-4 w-4" />
//           {deleteNotification.isPending ? "Deleting..." : "Delete"}
//         </button>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             onClick={handleToggleRead}
//             disabled={markAsRead.isPending || markAsUnread.isPending}
//             className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <FiCheckCircle className="h-4 w-4" />
//             {isUnread ? "Mark as read" : "Mark as unread"}
//           </button>

//           {relatedRoute && (
//             <button
//               type="button"
//               onClick={handleGoToRelated}
//               className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700"
//             >
//               <FiExternalLink className="h-4 w-4" />
//               Open Related
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationDetail;

// src/features/patent/pages/notifications/NotificationDetail.jsx

import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBell,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiInfo,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiTag,
  FiExternalLink,
  FiTrash2,
  FiImage,
  FiLink,
  FiDatabase,
  FiPackage,
  FiHash,
  FiSend,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  useNotification,
  useMarkAsRead,
  useMarkAsUnread,
  useDeleteNotification,
} from "../../queries/notifications";
import Loader from "../../common/Loader";

// ==================== HELPERS ====================
const getIcon = (type = "") => {
  const t = String(type).toLowerCase();
  if (t.includes("appointment")) return FiCalendar;
  if (t.includes("patient")) return FiUser;
  if (t.includes("alert") || t.includes("error")) return FiAlertCircle;
  if (t.includes("lead") || t.includes("booking")) return FiMail;
  return FiInfo;
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const prettyLabel = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const prettyValue = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

const isUrl = (val) =>
  typeof val === "string" && /^https?:\/\//i.test(val.trim());

const resolveScreenRoute = (screen, data) => {
  if (!screen) return null;
  const id =
    data?.appointment_id ??
    data?.visit_id ??
    data?.booking_id ??
    data?.patient_id ??
    data?.lead_id ??
    data?.id;

  switch (screen) {
    case "appointment_detail":
      return id ? `/appointments/${id}` : "/appointments";
    case "visit_detail":
      return id ? `/visits/${id}` : "/visits";
    case "patient_detail":
      return "/patients";
    case "lead_detail":
    case "store_lead_detail":
      return id ? `/service-manager/leads/${id}` : "/service-manager/leads";
    case "booking_detail":
    case "store_booking_detail":
      return id
        ? `/service-manager/bookings/${id}`
        : "/service-manager/bookings";
    default:
      return null;
  }
};

// ==================== SMALL COMPONENTS ====================
const BackButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
  >
    <FiArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
    Back to Notifications
  </button>
);

// Quick stat pill in header area
const StatPill = ({ icon: Icon, label, value, tone = "ink" }) => {
  const tones = {
    ink: "bg-ink-50 text-ink-700",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
  };
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${tones[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

// Detail row — label + value, 2-col grid ke andar
const DetailItem = ({ label, value, icon: Icon, full = false }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <div className="flex items-start gap-2">
      {Icon ? (
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
      ) : (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </p>
        {isUrl(value) ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 break-all text-xs font-medium text-brand-600 hover:underline"
          >
            <FiLink className="h-3 w-3 shrink-0" />
            {value}
          </a>
        ) : (
          <p className="mt-0.5 break-words text-xs font-medium text-ink-800">
            {prettyValue(value)}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Section wrapper — clean card with header
const Section = ({ title, icon: Icon, children, tone = "ink" }) => {
  const tones = {
    ink: "bg-ink-50 text-ink-600",
    brand: "bg-brand-50 text-brand-600",
    warn: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-md ${tones[tone]}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
          {title}
        </p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
};

// Recursive key-value renderer for payload
const PayloadGrid = ({ data }) => {
  if (!data || typeof data !== "object") return null;
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {entries.map(([key, val]) => {
        if (val && typeof val === "object" && !Array.isArray(val)) {
          return (
            <div key={key} className="sm:col-span-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                {prettyLabel(key)}
              </p>
              <div className="ml-2 border-l-2 border-ink-100 pl-3">
                <PayloadGrid data={val} />
              </div>
            </div>
          );
        }
        return (
          <DetailItem
            key={key}
            label={prettyLabel(key)}
            value={Array.isArray(val) ? val.map(prettyValue).join(", ") : val}
          />
        );
      })}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: notification, isLoading } = useNotification(id);

  const markAsRead = useMarkAsRead();
  const markAsUnread = useMarkAsUnread();
  const deleteNotification = useDeleteNotification();

  const isUnread = notification ? !notification.read_at : false;
  const Icon = getIcon(notification?.type);
  const dataPayload = notification?.data || {};

  const autoMarkedRef = useRef(false);
  useEffect(() => {
    if (!notification) return;
    if (notification.read_at) return;
    if (autoMarkedRef.current) return;
    autoMarkedRef.current = true;
    markAsRead.mutate(notification.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?.id]);

  const handleToggleRead = () => {
    if (!notification) return;
    if (isUnread) markAsRead.mutate(notification.id);
    else markAsUnread.mutate(notification.id);
  };

  const handleDelete = () => {
    if (!notification) return;
    deleteNotification.mutate(notification.id, {
      onSettled: () => navigate("/notifications"),
    });
  };

  const handleGoToRelated = () => {
    const route = resolveScreenRoute(dataPayload.screen, dataPayload);
    if (route) navigate(route);
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <BackButton onClick={() => navigate("/notifications")} />
        <Loader text="Loading notification..." />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="space-y-5">
        <BackButton onClick={() => navigate("/notifications")} />
        <div className="flex flex-col items-center justify-center rounded-xl border border-ink-100 bg-surface px-6 py-16 text-center">
          <FiBell className="mb-3 h-12 w-12 text-ink-300" />
          <p className="text-sm font-medium text-ink-700">
            Notification not found
          </p>
          <p className="mt-1 text-xs text-ink-500">
            It may have been deleted or does not exist.
          </p>
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Notifications
          </button>
        </div>
      </div>
    );
  }

  const relatedRoute = resolveScreenRoute(dataPayload.screen, dataPayload);

  // push_status tone
  const pushTone =
    notification.push_status === "sent" ||
    notification.push_status === "delivered"
      ? "success"
      : notification.push_status === "failed"
        ? "danger"
        : "ink";

  return (
    <div className="space-y-5 pb-10">
      <BackButton onClick={() => navigate("/notifications")} />

      {/* ============ MAIN CARD (header + message + image) ============ */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        {/* Header */}
        <div
          className={`flex items-start gap-3 border-b border-ink-100 px-5 py-5 ${
            isUnread ? "bg-brand-50/40" : "bg-surface"
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isUnread
                ? "bg-brand-100 text-brand-700"
                : "bg-ink-100 text-ink-500"
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-ink-900 sm:text-xl">
                {notification.title || "Notification"}
              </h1>
              {isUnread && (
                <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
                  New
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-600">
                <FiHash className="h-2.5 w-2.5" />
                {notification.id}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {formatFullDate(notification.created_at)} ·{" "}
              {getRelativeTime(notification.created_at)}
            </p>

            {/* Quick stat pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {notification.type && (
                <StatPill icon={FiTag} label="Type" value={notification.type} />
              )}
              {notification.push_status && (
                <StatPill
                  icon={FiSend}
                  label="Push"
                  value={notification.push_status}
                  tone={pushTone}
                />
              )}
              <StatPill
                icon={FiCheckCircle}
                label="Status"
                value={isUnread ? "Unread" : "Read"}
                tone={isUnread ? "warn" : "success"}
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="px-5 py-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Message
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">
            {notification.message || "—"}
          </p>
        </div>

        {/* Image */}
        {notification.image && (
          <div className="border-t border-ink-100 bg-ink-50/30 px-5 py-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              <FiImage className="h-3 w-3" />
              Attachment
            </p>
            <img
              src={notification.image}
              alt={notification.title || "Notification attachment"}
              className="max-h-72 w-auto rounded-lg border border-ink-100 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* ============ META GRID (2 sections side by side) ============ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Notification Info */}
        <Section title="Notification Info" icon={FiInfo}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <DetailItem icon={FiTag} label="Type" value={notification.type} />
            <DetailItem
              icon={FiCheckCircle}
              label="Status"
              value={isUnread ? "Unread" : "Read"}
            />
            <DetailItem
              icon={FiHash}
              label="ID"
              value={`#${notification.id}`}
            />
            <DetailItem
              icon={FiUser}
              label="Recipient Type"
              value={notification.recipient_type}
            />
            <DetailItem
              icon={FiUser}
              label="Recipient ID"
              value={notification.recipient_id}
            />
            <DetailItem
              icon={FiPackage}
              label="Campaign UUID"
              value={notification.campaign_uuid}
            />
          </div>
        </Section>

        {/* Timeline */}
        <Section title="Timeline" icon={FiClock}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <DetailItem
              icon={FiCalendar}
              label="Created At"
              value={formatFullDate(notification.created_at)}
            />
            <DetailItem
              icon={FiClock}
              label="Updated At"
              value={formatFullDate(notification.updated_at)}
            />
            <DetailItem
              icon={FiCheckCircle}
              label="Read At"
              value={
                notification.read_at
                  ? formatFullDate(notification.read_at)
                  : "Not read yet"
              }
            />
            <DetailItem
              icon={FiCalendar}
              label="Scheduled At"
              value={notification.scheduled_at}
            />
          </div>
        </Section>
      </div>

      {/* ============ PUSH STATUS (only if any push field present) ============ */}
      {(notification.push_status ||
        notification.push_sent_at ||
        notification.push_error) && (
        <Section title="Push Status" icon={FiSend} tone="brand">
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <DetailItem
              icon={FiSend}
              label="Status"
              value={notification.push_status}
            />
            <DetailItem
              icon={FiCalendar}
              label="Sent At"
              value={
                notification.push_sent_at
                  ? formatFullDate(notification.push_sent_at)
                  : "—"
              }
            />
            {notification.push_error && (
              <div className="sm:col-span-2">
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                  <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                      Push Error
                    </p>
                    <p className="mt-0.5 break-words text-xs font-medium text-rose-800">
                      {notification.push_error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ============ PAYLOAD DATA ============ */}
      {dataPayload && Object.keys(dataPayload).length > 0 && (
        <Section title="Payload Data" icon={FiDatabase}>
          <PayloadGrid data={dataPayload} />
        </Section>
      )}

      {/* ============ ACTIONS ============ */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteNotification.isPending}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 bg-surface px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiTrash2 className="h-4 w-4" />
          {deleteNotification.isPending ? "Deleting..." : "Delete"}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleRead}
            disabled={markAsRead.isPending || markAsUnread.isPending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheckCircle className="h-4 w-4" />
            {isUnread ? "Mark as read" : "Mark as unread"}
          </button>

          {relatedRoute && (
            <button
              type="button"
              onClick={handleGoToRelated}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface transition hover:bg-brand-700"
            >
              <FiExternalLink className="h-4 w-4" />
              Open Related
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
