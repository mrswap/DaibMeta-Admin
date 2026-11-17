// src/features/patent/pages/notifications/NotificationDetail.jsx

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiMail,
  FiInfo,
} from "react-icons/fi";
import { useNotifications, useMarkAsRead } from "../../queries/notifications";
import Loader from "../../common/Loader";

const getIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("appointment")) return FiCalendar;
  if (t.includes("patient")) return FiUser;
  if (t.includes("alert") || t.includes("error")) return FiAlertCircle;
  if (t.includes("lead")) return FiMail;
  return FiInfo;
};

const humanize = (key = "") =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications({ per_page: 100, page: 1 });
  const markAsRead = useMarkAsRead();

  const list = data?.list || [];
  const notif = list.find((n) => String(n.id) === String(id));

  // Auto mark-as-read when detail opens (only if unread)
  useEffect(() => {
    if (notif && !notif.read_at) {
      markAsRead.mutate(notif.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notif?.id, notif?.read_at]);

  if (isLoading) {
    return <Loader text="Loading notification..." />;
  }

  if (!notif) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/notifications")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-ink-900">
            Notification Not Found
          </h1>
        </div>
        <div className="rounded-card border border-ink-100 bg-surface p-10 text-center">
          <p className="text-sm text-ink-500">
            The notification you are looking for does not exist or has been
            deleted.
          </p>
          <button
            onClick={() => navigate("/notifications")}
            className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Back to Notifications
          </button>
        </div>
      </div>
    );
  }

  const Icon = getIcon(notif.type);
  const payload = notif.data || {};

  // Visible data fields (exclude `screen` — technical key, not user-facing)
  const dataFields = Object.entries(payload).filter(
    ([key, value]) =>
      key !== "screen" && value !== null && value !== undefined && value !== "",
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/notifications")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            Notification Details
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Full details of this notification
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        {/* Icon + Title */}
        <div className="flex items-start gap-4 border-b border-ink-100 px-5 py-5 sm:px-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink-900">
              {notif.title || "Notification"}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-700">
                {humanize(notif.type || "notification")}
              </span>
              <span>{formatDateTime(notif.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="px-5 py-5 sm:px-6">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Message
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
            {notif.message || "No message"}
          </p>
        </div>

        {/* Data payload */}
        {dataFields.length > 0 && (
          <div className="border-t border-ink-100 px-5 py-5 sm:px-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Additional Information
            </p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {dataFields.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-400">
                    {humanize(key)}
                  </dt>
                  <dd className="mt-0.5 break-words text-sm font-medium text-ink-800">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetail;
