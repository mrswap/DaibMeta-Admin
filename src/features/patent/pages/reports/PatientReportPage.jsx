// src/features/patent/pages/reports/PatientReportPage.jsx

import { useState, useMemo } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiUserPlus,
  FiActivity,
  FiHome,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiLock,
  FiSearch,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { usePatientReport, PERIOD_OPTIONS } from "../../queries/reports";
import { FilterSelect, DatePicker } from "../../common/form";
import { usePermission } from "../../hooks/usePermission";
import Loader from "../../common/Loader";
import CustomeTable from "../../common/table/CustomeTable";

// ==================== CONSTANTS ====================
const PER_PAGE = 10;

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

// ==================== HELPERS ====================
const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const safe = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

const num = (v) => Number(v) || 0;

const toChartData = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((r) => ({
      name: r.label || r.name || r.period || "",
      value: num(r.value ?? r.count ?? r.total),
    }));
  }
  return Object.entries(raw).map(([name, value]) => ({
    name,
    value: num(value),
  }));
};

// ==================== SUMMARY CARD ====================
const SummaryCard = ({ label, value, icon: Icon, tone = "brand" }) => {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    accent: "bg-accent-50 text-accent-800",
    warn: "bg-warn-100 text-warn-900",
    danger: "bg-danger-50 text-danger-700",
    ink: "bg-ink-100 text-ink-700",
  };
  return (
    <div className="rounded-xl border border-ink-100 bg-surface p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500 sm:text-[11px]">
          {label}
        </p>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${
            tones[tone] || tones.brand
          }`}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </div>
      <p className="mt-2 text-xl font-bold text-ink-900 sm:text-2xl">
        {num(value)}
      </p>
    </div>
  );
};

// ==================== CHART CARD ====================
const ChartCard = ({ title, children, empty }) => (
  <div className="rounded-xl border border-ink-100 bg-surface p-3 sm:p-4">
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-600 sm:text-xs">
      {title}
    </p>
    {empty ? (
      <div className="flex h-52 items-center justify-center text-xs text-ink-400 sm:h-56">
        No data available
      </div>
    ) : (
      <div className="h-52 w-full sm:h-56">{children}</div>
    )}
  </div>
);

// ==================== PAGE ====================
const PatientReportPage = () => {
  const { can, isLoading: permLoading } = usePermission();
  const canView = can("dashboard", "view");

  // ==================== FILTERS ====================
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [period, setPeriod] = useState(
    PERIOD_OPTIONS.find((p) => p.value === "this_month"),
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [patientType, setPatientType] = useState(null);
  const [relationType, setRelationType] = useState(null);
  const [patientStatus, setPatientStatus] = useState(null);
  const [page, setPage] = useState(1);

  const isCustom = period?.value === "custom";

  const params = useMemo(() => {
    const p = {
      period: period?.value || "this_month",
      page,
      per_page: PER_PAGE,
    };
    if (isCustom) {
      if (fromDate) p.from_date = fromDate;
      if (toDate) p.to_date = toDate;
    }
    if (search.trim()) p.search = search.trim();
    if (patientType?.value) p.patient_type = patientType.value;
    if (relationType?.value) p.relation_type = relationType.value;
    if (patientStatus?.value) p.status = patientStatus.value;
    return p;
  }, [
    period,
    isCustom,
    fromDate,
    toDate,
    search,
    patientType,
    relationType,
    patientStatus,
    page,
  ]);

  const { data, isLoading, isFetching, refetch } = usePatientReport(params, {
    enabled: canView,
  });

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const records = data?.records?.list || [];
  const meta = data?.records?.meta || {};

  // ==================== CHART DATA ====================
  const genderData = useMemo(
    () => toChartData(charts?.gender_distribution),
    [charts],
  );

  const typeData = useMemo(
    () => toChartData(charts?.patient_type_distribution),
    [charts],
  );

  const ageData = useMemo(
    () => toChartData(charts?.age_distribution),
    [charts],
  );

  const trendData = useMemo(() => {
    const t = charts?.registration_trend || [];
    if (!Array.isArray(t)) return [];
    return t.map((r) => ({
      label: r.period || r.date || r.label || "",
      count: num(r.total ?? r.count ?? r.value),
    }));
  }, [charts]);

  // ==================== RESET ====================
  const resetFilters = () => {
    setPeriod(PERIOD_OPTIONS.find((p) => p.value === "this_month"));
    setFromDate("");
    setToDate("");
    setSearch("");
    setPatientType(null);
    setRelationType(null);
    setPatientStatus(null);
    setPage(1);
  };

  const hasActiveFilters =
    (period?.value && period.value !== "this_month") ||
    (isCustom && (fromDate || toDate)) ||
    !!search ||
    !!patientType ||
    !!relationType ||
    !!patientStatus;

  // ==================== TABLE COLUMNS ====================
  const columns = useMemo(
    () => [
      {
        header: "Patient ID",
        accessor: "patient_id",
        align: "left",
        render: (val, row) => (
          <span className="text-xs text-ink-700">
            {safe(val || (row?.id ? `#${row.id}` : null))}
          </span>
        ),
      },
      {
        header: "Name",
        accessor: "name",
        align: "left",
        render: (val) => (
          <span className="text-xs font-medium text-ink-900">{safe(val)}</span>
        ),
      },
      {
        header: "Mobile",
        accessor: "mobile",
        align: "left",
        render: (val) => (
          <span className="text-xs text-ink-600">{safe(val)}</span>
        ),
      },
      {
        header: "Age",
        accessor: "age",
        align: "left",
        render: (val) => (
          <span className="text-xs text-ink-600">{safe(val)}</span>
        ),
      },
      {
        header: "Gender",
        accessor: "sex",
        align: "left",
        render: (val, row) => (
          <span className="text-xs capitalize text-ink-600">
            {safe(val || row?.gender)}
          </span>
        ),
      },
      {
        header: "Type",
        align: "left",
        render: (_, row) => {
          const isFamily = !!row.linked_primary_patient_id;
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isFamily
                  ? "bg-accent-50 text-accent-800"
                  : "bg-brand-50 text-brand-700"
              }`}
            >
              {isFamily ? "Family" : "Primary"}
            </span>
          );
        },
      },
      {
        header: "Primary Patient",
        align: "left",
        render: (_, row) =>
          safe(row?.primary_patient?.name || row?.primary_patient_name),
      },
      {
        header: "Status",
        align: "left",
        render: (_, row) => {
          const active = row?.status === true || row?.status === "active";
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "bg-ink-100 text-ink-600"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        header: "Visits",
        align: "left",
        render: (_, row) => num(row?.visits_count ?? row?.total_visits),
      },
      {
        header: "Registered",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatDate(row?.created_at || row?.registration_date)}
          </span>
        ),
      },
    ],
    [],
  );

  // ==================== GUARD ====================
  if (permLoading) return <Loader text="Checking permissions..." />;
  if (!canView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to view reports.
        </p>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Patient Report
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {num(meta.total) > 0
              ? `${num(meta.total)} patient${num(meta.total) > 1 ? "s" : ""}`
              : "Patient activity overview"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 self-start rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50 sm:self-auto"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="text"
              placeholder="Search by name, mobile or patient ID..."
              value={search}
              maxLength={150}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
              filtersOpen || hasActiveFilters
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
            }`}
          >
            <FiFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {filtersOpen && (
          <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Period
                </label>
                <FilterSelect
                  value={period}
                  onChange={(v) => {
                    setPeriod(v);
                    setPage(1);
                  }}
                  options={PERIOD_OPTIONS}
                  placeholder="This Month"
                  isClearable={false}
                />
              </div>

              {isCustom && (
                <>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                      From Date
                    </label>
                    <DatePicker
                      name="from_date"
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
                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                      To Date
                    </label>
                    <DatePicker
                      name="to_date"
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
                </>
              )}

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Patient Type
                </label>
                <FilterSelect
                  value={patientType}
                  onChange={(v) => {
                    setPatientType(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "primary", label: "Primary" },
                    { value: "family", label: "Family" },
                  ]}
                  placeholder="All Types"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Relation Type
                </label>
                <FilterSelect
                  value={relationType}
                  onChange={(v) => {
                    setRelationType(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "self", label: "Self" },
                    { value: "spouse", label: "Spouse" },
                    { value: "child", label: "Child" },
                    { value: "parent", label: "Parent" },
                    { value: "sibling", label: "Sibling" },
                    { value: "other", label: "Other" },
                  ]}
                  placeholder="All Relations"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Status
                </label>
                <FilterSelect
                  value={patientStatus}
                  onChange={(v) => {
                    setPatientStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  placeholder="All Status"
                  isClearable
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100"
                >
                  <FiX className="h-3 w-3" />
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <Loader text="Loading patient report..." />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            <SummaryCard
              label="Total Patients"
              value={summary.total_patients}
              icon={FiUsers}
              tone="brand"
            />
            <SummaryCard
              label="Primary Patients"
              value={summary.primary_patients}
              icon={FiUserCheck}
              tone="accent"
            />
            <SummaryCard
              label="Family Members"
              value={summary.family_members}
              icon={FiUsers}
              tone="warn"
            />
            <SummaryCard
              label="Active Patients"
              value={summary.active_patients}
              icon={FiUserCheck}
              tone="brand"
            />
            <SummaryCard
              label="Inactive Patients"
              value={summary.inactive_patients}
              icon={FiUserX}
              tone="danger"
            />
            <SummaryCard
              label="Clinic Patients"
              value={summary.clinic_patients}
              icon={FiHome}
              tone="ink"
            />
            <SummaryCard
              label="w/o Clinic Visit"
              value={
                summary.app_only_or_no_visit_patients ??
                summary.patients_without_clinic_visits
              }
              icon={FiActivity}
              tone="warn"
            />
            <SummaryCard
              label="Registered Today"
              value={summary.registered_today}
              icon={FiUserPlus}
              tone="accent"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ChartCard
              title="Gender Distribution"
              empty={genderData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    label
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Primary vs Family" empty={typeData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    label
                  >
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Age Group Distribution"
              empty={ageData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Registration Trend"
              empty={trendData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Table — CustomeTable (server-side, 10 per page) */}
          <CustomeTable
            columns={columns}
            data={records}
            serverSide
            currentPage={meta.current_page || 1}
            totalPages={meta.last_page || 1}
            totalItems={meta.total || 0}
            itemsPerPage={PER_PAGE}
            onPageChange={(p) => setPage(p)}
            emptyText="No patient records found."
          />
        </>
      )}
    </div>
  );
};

export default PatientReportPage;
