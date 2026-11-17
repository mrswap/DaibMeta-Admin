// src/features/patent/common/noitification/NotificationDropdown.jsx

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiMail,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../../queries/notifications";
import Loader from "../Loader";

const getIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("appointment")) return FiCalendar;
  if (t.includes("patient")) return FiUser;
  if (t.includes("alert") || t.includes("error")) return FiAlertCircle;
  if (t.includes("lead")) return FiMail;
  return FiInfo;
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return then.toLocaleDateString();
};

const NotificationDropdown = ({ open, onClose }) => {
  const navigate = useNavigate();
  const ref = useRef(null);

  const { data, isLoading } = useNotifications({ per_page: 10, page: 1 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const list = data?.list || [];
  const hasUnread = list.some((n) => !n.read_at);

  // Click outside + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleItemClick = (notif) => {
    if (!notif.read_at) markAsRead.mutate(notif.id);
    onClose();
    navigate(`/notifications/${notif.id}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate("/notifications");
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-ink-900">Notifications</h3>
        {hasUnread && (
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="cursor-pointer text-xs font-medium text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8">
            <Loader text="Loading..." />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <FiBell className="mb-3 h-10 w-10 text-ink-300" />
            <p className="text-sm font-medium text-ink-700">No notifications</p>
            <p className="mt-1 text-xs text-ink-500">You are all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {list.map((notif) => {
              const unread = !notif.read_at;
              const Icon = getIcon(notif.type);
              return (
                <li
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-ink-50 ${
                    unread ? "bg-brand-50/40" : "bg-surface"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      unread
                        ? "bg-brand-100 text-brand-700"
                        : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-sm ${
                          unread
                            ? "font-semibold text-ink-900"
                            : "font-medium text-ink-800"
                        }`}
                      >
                        {notif.title || "Notification"}
                      </p>
                      {unread && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-600">
                      {notif.message}
                    </p>
                    <p className="mt-1 text-[10px] text-ink-400">
                      {getRelativeTime(notif.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {list.length > 0 && (
        <button
          type="button"
          onClick={handleViewAll}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-ink-100 bg-ink-50/40 px-4 py-2.5 text-xs font-medium text-brand-700 transition hover:bg-ink-50"
        >
          View all notifications
          <FiArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default NotificationDropdown;
