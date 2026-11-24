// src/features/patent/pages/visits/components/tabs/FollowUpHistoryTab.jsx

import { useState } from "react";
import { FiLock, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useFollowUpHistory } from "../../../../queries/visits";
import Loader from "../../../../common/Loader";
import CustomeTable from "../../../../common/table/CustomeTable";
import { DatePicker } from "../../../../common/form";
import { usePermission } from "../../../../hooks/usePermission";

// ==================== HELPERS ====================
const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const formatTime12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
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

const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "—";

const visitStatusClass = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700";
    case "cancelled":
      return "bg-danger-50 text-danger-600";
    default:
      return "bg-ink-100 text-ink-600";
  }
};

// ==================== MAIN ====================
const FollowUpHistoryTab = ({ visitId, patientId, providerId }) => {
  const { can } = usePermission();
  const canView = can("visits", "view");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const params = {
    page,
    per_page: perPage,
    ...(visitId && { visit_id: visitId }),
    ...(patientId && { patient_id: patientId }),
    ...(providerId && { provider_id: providerId }),
    ...(fromDate && { date_from: fromDate }),
    ...(toDate && { date_to: toDate }),
  };

  const { data, isLoading, isFetching } = useFollowUpHistory(params, {
    enabled: canView,
  });

  const list = data?.list || [];
  const meta = data?.meta || {};

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const hasFilters = fromDate || toDate;

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "ID",
      accessor: "id",
      render: (v) => (
        <span className="text-xs font-semibold text-ink-700">#{v}</span>
      ),
    },
    {
      header: "Follow-up Date",
      accessor: "follow_up_date",
      render: (v, row) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-900">{formatDate(v)}</p>
          {row.follow_up_days != null && (
            <p className="text-[10px] text-ink-500">
              {row.follow_up_days} day{row.follow_up_days !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Patient",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">
            {row.patient?.name || "—"}
          </p>
          <p className="truncate text-[11px] text-ink-500">
            {row.patient?.mobile || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Visit",
      render: (_, row) =>
        row.visit?.id ? (
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-ink-900">
              {formatDate(row.visit.visit_date)}
            </p>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${visitStatusClass(
                row.visit.status,
              )}`}
            >
              {capitalize(row.visit.status)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-ink-400">—</span>
        ),
    },
    {
      header: "Notes",
      accessor: "notes",
      render: (v) => (
        <span
          className="block min-w-[260px] max-w-[400px] whitespace-normal break-words text-xs text-ink-500"
          title={v || ""}
        >
          {v || "—"}
        </span>
      ),
    },
    {
      header: "Created By",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-900">
            {row.created_by?.name || "—"}
          </p>
          <p className="text-[10px] text-ink-500">
            {formatDateTime(row.created_at)}
          </p>
        </div>
      ),
    },
    {
      header: "Updated By",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-900">
            {row.updated_by?.name || "—"}
          </p>
          <p className="text-[10px] text-ink-500">
            {formatDateTime(row.updated_at)}
          </p>
        </div>
      ),
    },
  ];

  // ==================== ACCESS DENIED ====================
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-900">Access Denied</p>
        <p className="mt-1 max-w-sm text-xs text-ink-500">
          You do not have permission to view follow-up history.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading follow-up history..." />;

  return (
    <div className="space-y-4">
      {/* Filters — visitId hai toh Date Filters hide */}
      {!visitId && (
        <div className="rounded-xl border border-ink-100 bg-surface p-3 sm:p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[140px] flex-1">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                From Date
              </label>
              <DatePicker
                name="fuh_from_date"
                isFormik={false}
                value={fromDate}
                onChange={(v) => {
                  setFromDate(v || "");
                  setPage(1);
                }}
                placeholder="From date"
                max={toDate || ""}
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                To Date
              </label>
              <DatePicker
                name="fuh_to_date"
                isFormik={false}
                value={toDate}
                onChange={(v) => {
                  setToDate(v || "");
                  setPage(1);
                }}
                placeholder="To date"
                min={fromDate || ""}
              />
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-3 py-2 text-xs font-medium text-ink-600 hover:bg-ink-50"
              >
                <FiX className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
          <p className="mt-2 text-[10px] text-ink-400">
            {total} total record{total !== 1 ? "s" : ""}
            {isFetching && " · updating..."}
          </p>
        </div>
      )}

      {/* Header for Visit Specific History */}
      {visitId && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">
              Visit Follow-ups
            </p>
            <p className="text-[11px] text-ink-500">
              {total} record{total !== 1 ? "s" : ""} found
              {isFetching && " · updating..."}
            </p>
          </div>
        </div>
      )}

      {/* Table — CustomeTable */}
      <CustomeTable
        columns={columns}
        data={list}
        serverSide
        currentPage={currentPage}
        totalPages={lastPage}
        totalItems={total}
        itemsPerPage={metaPerPage}
        onPageChange={(p) => setPage(p)}
        emptyText={
          hasFilters
            ? "No follow-ups found for the selected date range."
            : "No follow-up records yet."
        }
      />
    </div>
  );
};

export default FollowUpHistoryTab;
