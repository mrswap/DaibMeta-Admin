// src/features/patent/pages/reports/VisitReportPage.jsx

import { useState, useMemo } from "react";
import {
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiClipboard,
  FiRepeat,
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

import { useVisitReport, PERIOD_OPTIONS } from "../../queries/reports";
import { useStaff } from "../../queries/staff";
import { usePatients } from "../../queries/patients";
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
    const clean = String(d).split("T")[0];
    const [y, m, day] = clean.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-GB", {
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
  const [h, m] = String(t).slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const safe = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

const num = (v) => Number(v) || 0;

// Array -> chart data
const toChartData = (raw, nameKey = "label", valueKey = "value") => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((r) => ({
      name: r[nameKey] || r.label || r.name || "—",
      value: num(r[valueKey] ?? r.total ?? r.count),
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
const VisitReportPage = () => {
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
  const [provider, setProvider] = useState(null);
  const [patient, setPatient] = useState(null);
  const [visitType, setVisitType] = useState(null);
  const [visitStatus, setVisitStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [page, setPage] = useState(1);

  const isCustom = period?.value === "custom";

  // Providers
  const { data: staffData } = useStaff({ per_page: 100, status: 1 });
  const providerOptions = useMemo(
    () =>
      (staffData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.role?.label ? ` — ${p.role.label}` : ""}`,
      })),
    [staffData],
  );

  // Patients
  const { data: patientsData } = usePatients({ per_page: 200 });
  const patientOptions = useMemo(
    () =>
      (patientsData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name} — ${p.patient_id || `#${p.id}`}${
          p.mobile ? ` · ${p.mobile}` : ""
        }`,
      })),
    [patientsData],
  );

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
    if (provider?.value) p.provider_id = provider.value;
    if (patient?.value) p.patient_id = patient.value;
    if (visitType?.value) p.visit_type = visitType.value;
    if (visitStatus?.value) p.status = visitStatus.value;
    if (paymentStatus?.value) p.payment_status = paymentStatus.value;
    return p;
  }, [
    period,
    isCustom,
    fromDate,
    toDate,
    search,
    provider,
    patient,
    visitType,
    visitStatus,
    paymentStatus,
    page,
  ]);

  const { data, isLoading, isFetching, refetch } = useVisitReport(params, {
    enabled: canView,
  });

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const records = data?.records?.list || [];
  const meta = data?.records?.meta || {};

  // ==================== CHART DATA (real API keys) ====================
  const trendData = useMemo(() => {
    const t = charts?.visit_trend || [];
    if (!Array.isArray(t)) return [];
    return t.map((r) => ({
      label: r.date || r.label || "",
      count: num(r.total ?? r.count ?? r.value),
    }));
  }, [charts]);

  const providerData = useMemo(
    () => toChartData(charts?.provider_breakdown, "provider_name", "total"),
    [charts],
  );

  const followUpTrend = useMemo(() => {
    const f = charts?.follow_up_trend || [];
    if (!Array.isArray(f)) return [];
    return f.map((r) => ({
      label: r.date || r.label || "",
      count: num(r.total ?? r.count ?? r.value),
    }));
  }, [charts]);

  const statusData = useMemo(
    () =>
      toChartData(
        summary?.status_breakdown || charts?.visit_status_breakdown,
        "status",
        "total",
      ),
    [charts, summary],
  );

  const typeData = useMemo(
    () =>
      toChartData(
        summary?.visit_type_breakdown || charts?.visit_type_breakdown,
        "visit_type",
        "total",
      ),
    [charts, summary],
  );

  const paymentStatusData = useMemo(
    () =>
      toChartData(
        summary?.payment_status_breakdown || charts?.payment_status_breakdown,
        "payment_status",
        "total",
      ),
    [charts, summary],
  );

  // ==================== RESET ====================
  const resetFilters = () => {
    setPeriod(PERIOD_OPTIONS.find((p) => p.value === "this_month"));
    setFromDate("");
    setToDate("");
    setSearch("");
    setProvider(null);
    setPatient(null);
    setVisitType(null);
    setVisitStatus(null);
    setPaymentStatus(null);
    setPage(1);
  };

  const hasActiveFilters =
    (period?.value && period.value !== "this_month") ||
    (isCustom && (fromDate || toDate)) ||
    !!search ||
    !!provider ||
    !!patient ||
    !!visitType ||
    !!visitStatus ||
    !!paymentStatus;

  // ==================== TABLE COLUMNS ====================
  const columns = useMemo(
    () => [
      {
        header: "Visit ID",
        align: "left",
        render: (_, row) => (
          <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">
            #{row.id}
          </code>
        ),
      },
      {
        header: "Patient",
        align: "left",
        render: (_, row) => (
          <span className="text-xs font-medium text-ink-900">
            {safe(row.patient?.name || row.patient_name)}
          </span>
        ),
      },
      {
        header: "Patient ID",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {safe(
              row.patient?.patient_id ||
                (row.patient_id ? `#${row.patient_id}` : null),
            )}
          </span>
        ),
      },
      {
        header: "Provider",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-700">
            {safe(row.provider?.name || row.provider_name)}
          </span>
        ),
      },
      {
        header: "Appointment",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {row.appointment_id ? `#${row.appointment_id}` : "—"}
          </span>
        ),
      },
      {
        header: "Visit Date",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatDate(row.visit_date)}
          </span>
        ),
      },
      {
        header: "Slot Time",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatTime12(row.slot_start_time)} –{" "}
            {formatTime12(row.slot_end_time)}
          </span>
        ),
      },
      {
        header: "Type",
        align: "left",
        render: (_, row) => (
          <span className="text-xs capitalize text-ink-600">
            {safe(row.visit_type_label || row.visit_type)}
          </span>
        ),
      },
      {
        header: "Status",
        align: "left",
        render: (_, row) => {
          const cls =
            row.status === "completed"
              ? "bg-brand-50 text-brand-700"
              : row.status === "in_consultation"
                ? "bg-accent-50 text-accent-800"
                : row.status === "waiting"
                  ? "bg-warn-100 text-warn-900"
                  : "bg-danger-50 text-danger-700";
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
            >
              {safe(row.status_label || row.status)}
            </span>
          );
        },
      },
      {
        header: "Payment",
        align: "left",
        render: (_, row) => {
          const cls =
            row.payment_status === "paid"
              ? "bg-brand-50 text-brand-700"
              : row.payment_status === "partial"
                ? "bg-accent-50 text-accent-800"
                : row.payment_status === "free"
                  ? "bg-ink-100 text-ink-600"
                  : "bg-warn-100 text-warn-900";
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
            >
              {safe(row.payment_status_label || row.payment_status)}
            </span>
          );
        },
      },
      {
        header: "Consultation",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {row.consultation ? "Yes" : "No"}
          </span>
        ),
      },
      {
        header: "Follow-up",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {Array.isArray(row.follow_ups) && row.follow_ups.length > 0
              ? "Yes"
              : "No"}
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
            Visit Report
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {num(meta.total) > 0
              ? `${num(meta.total)} visit${num(meta.total) > 1 ? "s" : ""}`
              : "Visit activity overview"}
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
              placeholder="Search by patient name, mobile or visit ID..."
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
                  Provider
                </label>
                <FilterSelect
                  value={provider}
                  onChange={(v) => {
                    setProvider(v);
                    setPage(1);
                  }}
                  options={providerOptions}
                  placeholder="All Providers"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Patient
                </label>
                <FilterSelect
                  value={patient}
                  onChange={(v) => {
                    setPatient(v);
                    setPage(1);
                  }}
                  options={patientOptions}
                  placeholder="All Patients"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Visit Type
                </label>
                <FilterSelect
                  value={visitType}
                  onChange={(v) => {
                    setVisitType(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "consultation", label: "Consultation" },
                    { value: "follow_up", label: "Follow Up" },
                    { value: "walk_in", label: "Walk In" },
                  ]}
                  placeholder="All Types"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Visit Status
                </label>
                <FilterSelect
                  value={visitStatus}
                  onChange={(v) => {
                    setVisitStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "waiting", label: "Waiting" },
                    { value: "in_consultation", label: "In Consultation" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "no_show", label: "No Show" },
                  ]}
                  placeholder="All Status"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Payment Status
                </label>
                <FilterSelect
                  value={paymentStatus}
                  onChange={(v) => {
                    setPaymentStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "free", label: "Free" },
                    { value: "unpaid", label: "Unpaid" },
                    { value: "partial", label: "Partial" },
                    { value: "paid", label: "Paid" },
                  ]}
                  placeholder="All Payment Status"
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
        <Loader text="Loading visit report..." />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
            <SummaryCard
              label="Total Visits"
              value={summary.total_visits}
              icon={FiActivity}
              tone="brand"
            />
            <SummaryCard
              label="Unique Patients"
              value={summary.unique_patients}
              icon={FiUsers}
              tone="accent"
            />
            <SummaryCard
              label="Completed Visits"
              value={summary.completed_visits}
              icon={FiCheckCircle}
              tone="brand"
            />
            <SummaryCard
              label="Consultation Visits"
              value={summary.consultation_visits}
              icon={FiClipboard}
              tone="ink"
            />
            <SummaryCard
              label="With Follow-up"
              value={summary.visits_with_follow_up}
              icon={FiRepeat}
              tone="warn"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ChartCard title="Visit Trend" empty={trendData.length === 0}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Provider-wise Visits"
              empty={providerData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Follow-up Trend"
              empty={followUpTrend.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={followUpTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Visit Status Breakdown"
              empty={statusData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    label
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Visit Type Breakdown"
              empty={typeData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Payment Status Breakdown"
              empty={paymentStatusData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
                </BarChart>
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
            emptyText="No visit records found."
          />
        </>
      )}
    </div>
  );
};

export default VisitReportPage;
