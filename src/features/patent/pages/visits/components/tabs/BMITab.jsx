// src/features/patent/pages/visits/components/tabs/BMITab.jsx

import { useState } from "react";
import { FiActivity, FiClock, FiLock, FiX } from "react-icons/fi";
import { useBMIHistory } from "../../../../queries/visits";
import Loader from "../../../../common/Loader";
import CustomeTable from "../../../../common/table/CustomeTable";
import { DatePicker } from "../../../../common/form";
import { usePermission } from "../../../../hooks/usePermission";

// ==================== HELPERS ====================
const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    // "2026-11-24 16:48:16" -> ISO-safe (Safari bhi parse kar le)
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

const formatNum = (v, decimals = 2) => {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toFixed(decimals);
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

// BMI category badge styling
const getBMIStyle = (category, bmi) => {
  const map = {
    underweight: "bg-warn-100 text-warn-900",
    normal: "bg-brand-50 text-brand-700",
    normal_weight: "bg-brand-50 text-brand-700",
    overweight: "bg-warn-100 text-warn-900",
    obese: "bg-danger-50 text-danger-700",
    obesity_grade_1: "bg-danger-50 text-danger-700",
    obesity_grade_2: "bg-danger-100 text-danger-900",
    obesity_grade_3: "bg-danger-100 text-danger-900",
  };
  if (category && map[category]) return map[category];

  const n = Number(bmi);
  if (!n) return "bg-ink-100 text-ink-600";
  if (n < 18.5) return "bg-warn-100 text-warn-900";
  if (n < 25) return "bg-brand-50 text-brand-700";
  if (n < 30) return "bg-warn-100 text-warn-900";
  return "bg-danger-100 text-danger-900";
};

const getBMILabel = (category, bmi) => {
  if (category) {
    return category
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  const n = Number(bmi);
  if (!n) return "—";
  if (n < 18.5) return "Underweight";
  if (n < 25) return "Normal";
  if (n < 30) return "Overweight";
  return "Obese";
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
const BMITab = ({ visitId }) => {
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

  const { data, isLoading, isFetching } = useBMIHistory(visitId, filters, {
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
      header: "Recorded At",
      accessor: "created_at",
      render: (v) => (
        <span className="text-xs font-medium text-ink-800">
          {formatDateTime(v)}
        </span>
      ),
    },
    {
      header: "BMI",
      accessor: "bmi",
      render: (v) => (
        <span className="text-sm font-bold text-ink-900">{formatNum(v)}</span>
      ),
    },
    {
      header: "Category",
      render: (_, row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBMIStyle(
            row.category,
            row.bmi,
          )}`}
        >
          {getBMILabel(row.category, row.bmi)}
        </span>
      ),
    },
    {
      header: "Weight",
      accessor: "weight_kg",
      render: (v) => (
        <span className="text-xs text-ink-700">
          {formatNum(v, 1)} <span className="text-ink-400">kg</span>
        </span>
      ),
    },
    {
      header: "Height",
      accessor: "height_cm",
      render: (v) => (
        <span className="text-xs text-ink-700">
          {formatNum(v, 1)} <span className="text-ink-400">cm</span>
        </span>
      ),
    },
    {
      header: "Age",
      accessor: "age",
      render: (v) => (
        <span className="text-xs text-ink-700">
          {v ?? "—"}
          {v != null && <span className="text-ink-400"> yrs</span>}
        </span>
      ),
    },
    {
      header: "Sex",
      accessor: "sex",
      render: (v) => (
        <span className="text-xs text-ink-700">{capitalize(v)}</span>
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

  if (isLoading) return <Loader text="Loading BMI history..." />;

  return (
    <div className="space-y-4">
      {/* Latest BMI card */}
      {latest ? (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FiActivity className="h-4 w-4 text-brand-600" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Latest BMI
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
              <FiClock className="h-3 w-3" />
              {formatDateTime(latest.created_at)}
            </span>
          </div>

          <div className="space-y-4 p-4">
            {/* BMI + category */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <span className="text-2xl font-bold leading-none">
                  {formatNum(latest.bmi, 2)}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wide">
                  BMI
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBMIStyle(
                    latest.category,
                    latest.bmi,
                  )}`}
                >
                  {getBMILabel(latest.category, latest.bmi)}
                </span>
              </div>
            </div>

            {/* Detail tiles */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <StatTile
                label="Weight"
                value={formatNum(latest.weight_kg, 1)}
                unit="kg"
              />
              <StatTile
                label="Height"
                value={formatNum(latest.height_cm, 1)}
                unit="cm"
              />
              <StatTile label="Age" value={latest.age ?? "—"} unit="yrs" />
              <StatTile label="Sex" value={capitalize(latest.sex)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiActivity className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm font-medium text-ink-700">No BMI records</p>
          <p className="mt-1 text-xs text-ink-500">
            {hasFilters
              ? "No BMI records found for the selected date range."
              : "This patient has no recorded BMI entries."}
          </p>
        </div>
      )}

      {/* History header + Filters */}
      <div className="rounded-xl border border-ink-100 bg-surface p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">BMI History</p>
            <p className="text-[11px] text-ink-500">
              {totalRecords} record{totalRecords !== 1 ? "s" : ""}
              {isFetching && " · updating..."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
              From Date
            </label>
            <DatePicker
              name="bmi_from_date"
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
              name="bmi_to_date"
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
            ? "No BMI records found for the selected date range."
            : "No BMI records yet."
        }
      />
    </div>
  );
};

export default BMITab;
