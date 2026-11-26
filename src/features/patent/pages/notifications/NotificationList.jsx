// src/features/patent/pages/notifications/NotificationList.jsx

import { useMemo, useState } from "react"; // 👈 useMemo add
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheckCircle,
  FiTrash2,
  FiMail,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAsUnread,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../../queries/notifications";
import { FilterSelect } from "../../common/form";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";

const STATUS_OPTIONS = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

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

const NotificationList = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10); // 👈 10 per page
  const [confirm, setConfirm] = useState({ open: false, item: null });

  // ✅ FIX 1: params memoized — har render pe naya object nahi banega
  const params = useMemo(
    () => ({
      page,
      per_page: perPage,
      ...(statusFilter?.value && { status: statusFilter.value }),
    }),
    [page, perPage, statusFilter?.value],
  );

  const { data, isLoading, isFetching } = useNotifications(params);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAsUnread = useMarkAsUnread();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const list = data?.list || [];
  const meta = data?.meta || {};

  // ✅ FIX 2: meta se strict fallback
  const currentPage = meta.current_page ?? page;
  const lastPage = meta.last_page ?? 1;
  const total = meta.total ?? list.length;
  const metaPerPage = meta.per_page ?? perPage; // 👈 API ka per_page use karo

  // ✅ FIX 3: id safely extract karo
  const getNotificationId = (notif) =>
    notif?.id ?? notif?.notification_id ?? notif?.uuid ?? null;

  const handleItemClick = (notif) => {
    const nid = getNotificationId(notif);
    if (!nid) {
      console.error("Notification ID missing in item:", notif);
      return;
    }
    if (!notif.read_at) markAsRead.mutate(nid);
    navigate(`/notifications/${nid}`);
  };

  const handleMarkRead = (e, notif) => {
    e.stopPropagation();
    const nid = getNotificationId(notif);
    if (!nid) return;
    if (!notif.read_at) markAsRead.mutate(nid);
  };

  const handleMarkUnread = (e, notif) => {
    e.stopPropagation();
    const nid = getNotificationId(notif);
    if (!nid) return;
    if (notif.read_at) markAsUnread.mutate(nid);
  };

  const handleDeleteClick = (e, notif) => {
    e.stopPropagation();
    const nid = getNotificationId(notif);
    if (!nid) return;
    setConfirm({ open: true, item: { ...notif, id: nid } });
  };

  const handleConfirmDelete = () => {
    if (!confirm.item) return;
    deleteNotification.mutate(confirm.item.id, {
      onSettled: () => setConfirm({ open: false, item: null }),
    });
  };

  const handleCancelDelete = () => {
    setConfirm({ open: false, item: null });
  };

  // ✅ FIX 4: range calculation metaPerPage se (API se aaya hua)
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * metaPerPage + 1;
  const rangeEnd = Math.min(currentPage * metaPerPage, total);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }`
              : "All caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheckCircle className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 sm:flex-row sm:items-center">
        <FilterSelect
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="All Status"
          isClearable
          width="w-48"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <Loader text="Loading notifications..." />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-ink-100 bg-surface px-6 py-16 text-center">
          <FiBell className="mb-3 h-12 w-12 text-ink-300" />
          <p className="text-sm font-medium text-ink-700">
            No notifications found
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {statusFilter?.value
              ? "Try changing the filter."
              : "You are all caught up."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
            <ul className="divide-y divide-ink-100">
              {list.map((notif) => {
                const unread = !notif.read_at;
                const Icon = getIcon(notif.type);
                const nid = getNotificationId(notif);
                return (
                  <li
                    key={nid || Math.random()}
                    onClick={() => handleItemClick(notif)}
                    className={`group relative flex cursor-pointer items-start gap-3 px-4 py-4 transition hover:bg-ink-50 sm:px-5 ${
                      unread ? "bg-brand-50/40" : "bg-surface"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        unread
                          ? "bg-brand-100 text-brand-700"
                          : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm ${
                            unread
                              ? "font-semibold text-ink-900"
                              : "font-medium text-ink-800"
                          }`}
                        >
                          {notif.title || "Notification"}
                        </p>
                        {unread && (
                          <span className="inline-flex items-center rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink-600">
                        {notif.message}
                      </p>
                      <p className="mt-1.5 text-[11px] text-ink-400">
                        {getRelativeTime(notif.created_at)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                      {unread ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkRead(e, notif)}
                          disabled={markAsRead.isPending}
                          className="cursor-pointer whitespace-nowrap rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark as read
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleMarkUnread(e, notif)}
                          disabled={markAsUnread.isPending}
                          className="cursor-pointer whitespace-nowrap rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 transition hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark as unread
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete"
                        onClick={(e) => handleDeleteClick(e, notif)}
                        disabled={deleteNotification.isPending}
                        className="cursor-pointer rounded-lg p-1.5 text-danger-500 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-ink-100 bg-surface px-4 py-3 sm:flex-row">
            <p className="text-xs text-table-page-text">
              Showing{" "}
              <span className="font-semibold text-ink-800">
                {rangeStart}-{rangeEnd}
              </span>{" "}
              of <span className="font-semibold text-ink-800">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isFetching}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-table-page-btn-border px-3 py-1.5 text-xs font-medium text-table-page-btn-text transition hover:border-table-page-btn-hover-border hover:text-table-page-btn-hover-text disabled:cursor-not-allowed disabled:bg-table-page-btn-disabled-bg disabled:text-table-page-btn-disabled-text"
              >
                <FiChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <span className="text-xs font-medium text-ink-700">
                {currentPage} / {lastPage}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage || isFetching}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-table-page-btn-border px-3 py-1.5 text-xs font-medium text-table-page-btn-text transition hover:border-table-page-btn-hover-border hover:text-table-page-btn-hover-text disabled:cursor-not-allowed disabled:bg-table-page-btn-disabled-bg disabled:text-table-page-btn-disabled-text"
              >
                Next
                <FiChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirm.open}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteNotification.isPending}
      />
    </div>
  );
};

export default NotificationList;
