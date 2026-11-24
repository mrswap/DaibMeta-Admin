// src/features/patent/pages/visits/components/tabs/CaloriesTab.jsx

import { useState } from "react";
import { FiZap, FiClock, FiLock, FiX } from "react-icons/fi";
import { useCalorieHistory } from "../../../../queries/visits";
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

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    // "2026-11-24 16:50:01" -> ISO-safe (Safari bhi parse kar le)
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

// "1556.25" -> "1556.3", "90.00" -> "90"
const formatNum = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return String(Math.round(n * 10) / 10);
};

const getBalanceStyle = (status) => {
  const styles = {
    deficit: "bg-danger-50 text-danger-700",
    surplus: "bg-warn-100 text-warn-900",
    balanced: "bg-brand-50 text-brand-700",
    maintenance: "bg-accent-50 text-accent-800",
  };
  return styles[status] || "bg-ink-100 text-ink-600";
};

const getBalanceLabel = (status) => {
  const labels = {
    deficit: "Deficit",
    surplus: "Surplus",
    balanced: "Balanced",
    maintenance: "Maintenance",
  };
  return labels[status] || status || "—";
};

const balanceTextClass = (cal) =>
  Number(cal) < 0 ? "text-danger-700" : "text-brand-700";

// ==================== SMALL UI ====================
const DetailRow = ({ label, value, unit }) => (
  <div className="flex items-center justify-between gap-2 py-1.5 text-xs">
    <span className="text-ink-500">{label}</span>
    <span className="font-semibold text-ink-900">
      {value}
      {unit && value !== "—" && (
        <span className="ml-1 font-normal text-ink-400">{unit}</span>
      )}
    </span>
  </div>
);

// Panel themes — Intake (green), Burn (amber), Balance (green / red)
const PANEL_THEMES = {
  intake: {
    border: "border-brand-100",
    head: "bg-brand-50",
    title: "text-brand-700",
    total: "text-brand-700",
    dot: "bg-brand-500",
  },
  burn: {
    border: "border-warn-100",
    head: "bg-warn-50",
    title: "text-warn-800",
    total: "text-warn-900",
    dot: "bg-warn-500",
  },
  balancePositive: {
    border: "border-brand-100",
    head: "bg-brand-50",
    title: "text-brand-700",
    total: "text-brand-700",
    dot: "bg-brand-500",
  },
  balanceNegative: {
    border: "border-danger-100",
    head: "bg-danger-50",
    title: "text-danger-700",
    total: "text-danger-700",
    dot: "bg-danger-500",
  },
};

const getBalanceTheme = (cal) =>
  Number(cal) < 0 ? PANEL_THEMES.balanceNegative : PANEL_THEMES.balancePositive;

const SummaryPanel = ({ title, total, theme, children }) => (
  <div
    className={`overflow-hidden rounded-xl border bg-surface shadow-sm ${theme.border}`}
  >
    <div className={`px-3.5 py-3 ${theme.head}`}>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
        <p
          className={`text-[11px] font-semibold uppercase tracking-wide ${theme.title}`}
        >
          {title}
        </p>
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${theme.total}`}>
        {total}
        <span className="ml-1 text-xs font-medium text-ink-500">kcal</span>
      </p>
    </div>
    <div className="divide-y divide-ink-100 px-3.5 py-1">{children}</div>
  </div>
);

// ==================== MAIN ====================
const CaloriesTab = ({ visitId }) => {
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

  const { data, isLoading, isFetching } = useCalorieHistory(visitId, filters, {
    enabled: !!visitId && canView,
  });

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
      header: "Date",
      accessor: "date",
      render: (v) => (
        <span className="text-xs font-medium text-ink-800">
          {formatDate(v)}
        </span>
      ),
    },
    {
      header: "Intake",
      render: (_, row) => (
        <div className="min-w-[170px]">
          <p className="text-xs font-semibold text-ink-900">
            {formatNum(row.intake?.total_calories)}{" "}
            <span className="font-normal text-ink-400">kcal</span>
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-ink-500">
            Carbs {formatNum(row.intake?.carbs)}g · Protein{" "}
            {formatNum(row.intake?.protein)}g
            <br />
            Fat {formatNum(row.intake?.fat)}g · Fiber{" "}
            {formatNum(row.intake?.fiber)}g
          </p>
        </div>
      ),
    },
    {
      header: "Burn",
      render: (_, row) => (
        <div className="min-w-[170px]">
          <p className="text-xs font-semibold text-ink-900">
            {formatNum(row.burn?.total_burn)}{" "}
            <span className="font-normal text-ink-400">kcal</span>
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-ink-500">
            Resting {formatNum(row.burn?.resting_calories)} · Activity{" "}
            {formatNum(row.burn?.activity_calories)}
            <br />
            Exercise {formatNum(row.burn?.exercise_calories)}
          </p>
        </div>
      ),
    },
    {
      header: "Balance",
      render: (_, row) => (
        <div className="min-w-0 space-y-1">
          <p
            className={`text-xs font-semibold ${balanceTextClass(
              row.balance?.calories,
            )}`}
          >
            {formatNum(row.balance?.calories)}{" "}
            <span className="font-normal text-ink-400">kcal</span>
          </p>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getBalanceStyle(
              row.balance?.status,
            )}`}
          >
            {getBalanceLabel(row.balance?.status)}
          </span>
        </div>
      ),
    },
    {
      header: "Snapshot At",
      accessor: "snapshot_at",
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

  if (isLoading) return <Loader text="Loading calorie history..." />;

  return (
    <div className="space-y-4">
      {/* Latest summary card */}
      {latest ? (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FiZap className="h-4 w-4 text-warn-600" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Latest Daily Summary
              </p>
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                {formatDate(latest.date)}
              </span>
            </div>
            {latest.snapshot_at && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                <FiClock className="h-3 w-3" />
                Snapshot: {formatDateTime(latest.snapshot_at)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
            {/* Intake */}
            <SummaryPanel
              title="Intake"
              total={formatNum(latest.intake?.total_calories)}
              theme={PANEL_THEMES.intake}
            >
              <DetailRow
                label="Carbs"
                value={formatNum(latest.intake?.carbs)}
                unit="g"
              />
              <DetailRow
                label="Protein"
                value={formatNum(latest.intake?.protein)}
                unit="g"
              />
              <DetailRow
                label="Fat"
                value={formatNum(latest.intake?.fat)}
                unit="g"
              />
              <DetailRow
                label="Fiber"
                value={formatNum(latest.intake?.fiber)}
                unit="g"
              />
            </SummaryPanel>

            {/* Burn */}
            <SummaryPanel
              title="Burn"
              total={formatNum(latest.burn?.total_burn)}
              theme={PANEL_THEMES.burn}
            >
              <DetailRow
                label="Resting"
                value={formatNum(latest.burn?.resting_calories)}
                unit="kcal"
              />
              <DetailRow
                label="Activity"
                value={formatNum(latest.burn?.activity_calories)}
                unit="kcal"
              />
              <DetailRow
                label="Exercise"
                value={formatNum(latest.burn?.exercise_calories)}
                unit="kcal"
              />
            </SummaryPanel>

            {/* Balance */}
            <SummaryPanel
              title="Balance"
              total={formatNum(latest.balance?.calories)}
              theme={getBalanceTheme(latest.balance?.calories)}
            >
              <div className="flex items-center justify-between gap-2 py-1.5 text-xs">
                <span className="text-ink-500">Status</span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getBalanceStyle(
                    latest.balance?.status,
                  )}`}
                >
                  {getBalanceLabel(latest.balance?.status)}
                </span>
              </div>
              <DetailRow
                label="Intake"
                value={formatNum(latest.intake?.total_calories)}
                unit="kcal"
              />
              <DetailRow
                label="Burn"
                value={formatNum(latest.burn?.total_burn)}
                unit="kcal"
              />
            </SummaryPanel>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiZap className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm font-medium text-ink-700">
            No calorie summaries
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {hasFilters
              ? "No summaries found for the selected date range."
              : "This patient has no recorded daily calorie summaries."}
          </p>
        </div>
      )}

      {/* History header + Filters */}
      <div className="rounded-xl border border-ink-100 bg-surface p-3 sm:p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-ink-900">Calorie History</p>
          <p className="text-[11px] text-ink-500">
            {totalRecords} summar{totalRecords !== 1 ? "ies" : "y"}
            {isFetching && " · updating..."}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
              From Date
            </label>
            <DatePicker
              name="cal_from_date"
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
              name="cal_to_date"
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
            ? "No summaries found for the selected date range."
            : "No calorie summaries recorded yet."
        }
      />
    </div>
  );
};

export default CaloriesTab;
