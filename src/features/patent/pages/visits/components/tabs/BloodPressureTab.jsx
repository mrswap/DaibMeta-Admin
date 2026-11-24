// src/features/patent/pages/visits/components/tabs/BloodPressureTab.jsx

import { useState } from "react";
import { FiClock, FiHeart, FiLock, FiX } from "react-icons/fi";
import { useBloodPressureHistory } from "../../../../queries/visits";
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
    // "2026-11-24 16:47:13" -> ISO-safe (Safari bhi parse kar le)
    const date = new Date(String(d).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return d;
  }
};

const getBPCategory = (systolic, diastolic) => {
  const s = Number(systolic);
  const d = Number(diastolic);
  if (!s || !d) return { label: "—", style: "bg-ink-100 text-ink-600" };
  if (s < 90 || d < 60)
    return { label: "Low", style: "bg-accent-50 text-accent-800" };
  if (s < 120 && d < 80)
    return { label: "Normal", style: "bg-brand-50 text-brand-700" };
  if (s < 130 && d < 80)
    return { label: "Elevated", style: "bg-warn-100 text-warn-900" };
  if (s < 140 || d < 90)
    return { label: "Stage 1", style: "bg-warn-100 text-warn-900" };
  if (s < 180 || d < 120)
    return { label: "Stage 2", style: "bg-danger-50 text-danger-700" };
  return { label: "Crisis", style: "bg-danger-100 text-danger-900" };
};

// ==================== SMALL UI ====================
const StatTile = ({ label, value, unit }) => (
  <div className="rounded-lg border border-ink-100 bg-surface px-3 py-2.5">
    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
      {label}
    </p>
    <p className="mt-0.5 text-sm font-semibold text-ink-900">
      {value}
      {unit && value !== "—" && (
        <span className="ml-1 text-xs font-normal text-ink-400">{unit}</span>
      )}
    </p>
  </div>
);

// ==================== MAIN ====================
const BloodPressureTab = ({ visitId }) => {
  const { can } = usePermission();
  const canView = can("medical_records", "view");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const filters = {
    page,
    per_page: perPage,
    ...(fromDate && { from_date: fromDate }),
    ...(toDate && { to_date: toDate }),
  };

  const { data, isLoading, isFetching } = useBloodPressureHistory(
    visitId,
    filters,
    { enabled: !!visitId && canView },
  );

  const latest = data?.latest || null;
  const records = data?.records || [];
  const pagination = data?.pagination || {};
  const totalRecords = data?.total_records ?? pagination.total ?? 0;

  const currentPage = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;
  const metaPerPage = pagination.per_page || perPage;

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
      header: "Reading Date",
      accessor: "reading_date",
      render: (v) => (
        <span className="text-xs font-medium text-ink-800">
          {formatDate(v)}
        </span>
      ),
    },
    {
      header: "Time",
      accessor: "reading_time",
      render: (v) => (
        <span className="text-xs text-ink-600">{formatTime12(v)}</span>
      ),
    },
    {
      header: "Reading",
      render: (_, row) => (
        <span className="text-xs font-semibold text-ink-900">
          {row.systolic}/{row.diastolic}{" "}
          <span className="font-normal text-ink-400">mmHg</span>
        </span>
      ),
    },
    {
      header: "Pulse",
      accessor: "pulse_rate",
      render: (v) => (
        <span className="text-xs text-ink-600">{v ? `${v} bpm` : "—"}</span>
      ),
    },
    {
      header: "Category",
      render: (_, row) => {
        const cat = getBPCategory(row.systolic, row.diastolic);
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cat.style}`}
          >
            {cat.label}
          </span>
        );
      },
    },
    {
      header: "Notes",
      accessor: "notes",
      render: (v) => (
        <span
          className="block min-w-[200px] max-w-[320px] whitespace-normal break-words text-xs text-ink-500"
          title={v || ""}
        >
          {v || "—"}
        </span>
      ),
    },
    {
      header: "Recorded At",
      accessor: "created_at",
      render: (v) => (
        <span className="text-[11px] text-ink-500">{formatDateTime(v)}</span>
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
          You do not have permission to view medical records.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading blood pressure history..." />;

  const latestCategory = latest
    ? getBPCategory(latest.systolic, latest.diastolic)
    : null;

  return (
    <div className="space-y-4">
      {/* Latest reading card */}
      {latest ? (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FiHeart className="h-4 w-4 text-danger-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Latest Reading
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
              <FiClock className="h-3 w-3" />
              {formatDateTime(latest.created_at)}
            </span>
          </div>

          <div className="space-y-4 p-4">
            {/* Reading + category */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 min-w-[5rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-danger-50 px-3 text-danger-600">
                <span className="text-2xl font-bold leading-none">
                  {latest.systolic}
                  <span className="mx-0.5 text-base font-normal">/</span>
                  {latest.diastolic}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wide">
                  mmHg
                </span>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${latestCategory.style}`}
                >
                  {latestCategory.label}
                </span>
              </div>
            </div>

            {/* Detail tiles */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <StatTile
                label="Systolic"
                value={latest.systolic ?? "—"}
                unit="mmHg"
              />
              <StatTile
                label="Diastolic"
                value={latest.diastolic ?? "—"}
                unit="mmHg"
              />
              <StatTile
                label="Pulse Rate"
                value={latest.pulse_rate ?? "—"}
                unit="bpm"
              />
              <StatTile
                label="Reading Time"
                value={`${formatDate(latest.reading_date)}, ${formatTime12(
                  latest.reading_time,
                )}`}
              />
            </div>

            {/* Notes */}
            <div className="rounded-lg border border-ink-100 bg-ink-50/30 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Notes
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-800">
                {latest.notes || "—"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiHeart className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm font-medium text-ink-700">
            No blood pressure readings
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {hasFilters
              ? "No readings found for the selected date range."
              : "This patient has no recorded blood pressure readings."}
          </p>
        </div>
      )}

      {/* History header + Filters */}
      <div className="rounded-xl border border-ink-100 bg-surface p-3 sm:p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-ink-900">
            Blood Pressure History
          </p>
          <p className="text-[11px] text-ink-500">
            {totalRecords} record{totalRecords !== 1 ? "s" : ""}
            {isFetching && " · updating..."}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
              From Date
            </label>
            <DatePicker
              name="bp_from_date"
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
              name="bp_to_date"
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
      </div>

      {/* History table — CustomeTable */}
      <CustomeTable
        columns={columns}
        data={records}
        serverSide
        currentPage={currentPage}
        totalPages={lastPage}
        totalItems={totalRecords}
        itemsPerPage={metaPerPage}
        onPageChange={(p) => setPage(p)}
        emptyText={
          hasFilters
            ? "No readings found for the selected date range."
            : "No blood pressure readings recorded yet."
        }
      />
    </div>
  );
};

export default BloodPressureTab;
