// src/features/patent/pages/reports/AppointmentReportPage.jsx

import { useState, useMemo } from "react";
import {
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiGift,
  FiClock,
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

import { useAppointmentReport, PERIOD_OPTIONS } from "../../queries/reports";
import { useStaff } from "../../queries/staff";
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
// API date: "2026-11-24T18:30:00.000000Z" — timezone issue avoid karke split
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

// Format snake_case to Title Case (e.g., in_consultation -> In Consultation)
const formatLabel = (str) => {
  if (!str) return "—";
  return String(str)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Backend label mapping
const BOOKING_SOURCE_LABELS = {
  walk_in: "Walk In",
  patient_app: "Patient App",
  admin: "Admin",
  app: "App",
};

const STATUS_LABELS = {
  booked: "Booked",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
  in_consultation: "In Consultation",
};

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
const AppointmentReportPage = () => {
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
  const [appointmentType, setAppointmentType] = useState(null);
  const [bookingSource, setBookingSource] = useState(null);
  const [appointmentStatus, setAppointmentStatus] = useState(null);
  const [slotType, setSlotType] = useState(null);
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
    if (appointmentType?.value) p.appointment_type_id = appointmentType.value;
    if (bookingSource?.value) p.booking_source = bookingSource.value;
    if (appointmentStatus?.value) p.status = appointmentStatus.value;
    if (slotType?.value) p.slot_type = slotType.value;
    return p;
  }, [
    period,
    isCustom,
    fromDate,
    toDate,
    search,
    provider,
    appointmentType,
    bookingSource,
    appointmentStatus,
    slotType,
    page,
  ]);

  const { data, isLoading, isFetching, refetch } = useAppointmentReport(
    params,
    { enabled: canView },
  );

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const records = data?.records?.list || [];
  const meta = data?.records?.meta || {};

  // ==================== CHART DATA ====================
  const trendData = useMemo(() => {
    const t = charts?.appointment_trend || [];
    if (!Array.isArray(t)) return [];
    return t.map((r) => ({
      label: r.date || r.label || r.period || "",
      count: num(r.total ?? r.count ?? r.value),
    }));
  }, [charts]);

  const providerData = useMemo(
    () => toChartData(charts?.provider_breakdown, "provider_name", "total"),
    [charts],
  );

  const typeData = useMemo(
    () =>
      toChartData(
        charts?.appointment_type_breakdown,
        "appointment_type",
        "total",
      ),
    [charts],
  );

  const sourceData = useMemo(() => {
    const s =
      charts?.booking_source_breakdown ||
      summary?.booking_source_breakdown ||
      [];
    return toChartData(s, "booking_source", "total").map((r) => ({
      name: BOOKING_SOURCE_LABELS[r.name] || formatLabel(r.name),
      value: r.value,
    }));
  }, [charts, summary]);

  const statusData = useMemo(() => {
    const s =
      charts?.appointment_status_breakdown || summary?.status_breakdown || [];
    return toChartData(s, "status", "total").map((r) => ({
      name: STATUS_LABELS[r.name] || formatLabel(r.name),
      value: r.value,
    }));
  }, [charts, summary]);

  // ==================== RESET ====================
  const resetFilters = () => {
    setPeriod(PERIOD_OPTIONS.find((p) => p.value === "this_month"));
    setFromDate("");
    setToDate("");
    setSearch("");
    setProvider(null);
    setAppointmentType(null);
    setBookingSource(null);
    setAppointmentStatus(null);
    setSlotType(null);
    setPage(1);
  };

  const hasActiveFilters =
    (period?.value && period.value !== "this_month") ||
    (isCustom && (fromDate || toDate)) ||
    !!search ||
    !!provider ||
    !!appointmentType ||
    !!bookingSource ||
    !!appointmentStatus ||
    !!slotType;

  // ==================== TABLE COLUMNS ====================
  const columns = useMemo(
    () => [
      {
        header: "Appt ID",
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
            {safe(row.patient?.name || row.name)}
          </span>
        ),
      },
      {
        header: "Mobile",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {safe(row.patient?.mobile || row.mobile)}
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
        header: "Type",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {safe(
              row.appointment_type?.name ||
                formatLabel(row.appointment_type_label) ||
                formatLabel(row.appointment_type),
            )}
          </span>
        ),
      },
      {
        header: "Date",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatDate(row.appointment_date)}
          </span>
        ),
      },
      {
        header: "Start",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatTime12(row.start_time)}
          </span>
        ),
      },
      {
        header: "End",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatTime12(row.end_time)}
          </span>
        ),
      },
      {
        header: "Source",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {safe(
              BOOKING_SOURCE_LABELS[row.booking_source] ||
                formatLabel(row.booking_source_label || row.booking_source),
            )}
          </span>
        ),
      },
      {
        header: "Slot",
        align: "left",
        render: (_, row) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
              row.slot_type === "free"
                ? "bg-accent-50 text-accent-800"
                : "bg-ink-100 text-ink-700"
            }`}
          >
            {row.slot_type === "free"
              ? "Free"
              : formatLabel(row.slot_type) || "Normal"}
          </span>
        ),
      },
      {
        header: "Status",
        align: "left",
        render: (_, row) => {
          // Use formatLabel to handle any raw snake_case strings from the API
          const label =
            STATUS_LABELS[row.status] ||
            formatLabel(row.status_label || row.status);
          const cls =
            row.status === "completed"
              ? "bg-brand-50 text-brand-700"
              : row.status === "cancelled" || row.status === "no_show"
                ? "bg-danger-50 text-danger-700"
                : row.status === "in_consultation"
                  ? "bg-accent-50 text-accent-800"
                  : "bg-warn-100 text-warn-900";
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
            >
              {label}
            </span>
          );
        },
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
            Appointment Report
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {num(meta.total) > 0
              ? `${num(meta.total)} appointment${num(meta.total) > 1 ? "s" : ""}`
              : "Appointment activity overview"}
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
              placeholder="Search by patient name, mobile or appointment ID..."
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
                  Appointment Type
                </label>
                <FilterSelect
                  value={appointmentType}
                  onChange={(v) => {
                    setAppointmentType(v);
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
                  Booking Source
                </label>
                <FilterSelect
                  value={bookingSource}
                  onChange={(v) => {
                    setBookingSource(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "patient_app", label: "Patient App" },
                    { value: "walk_in", label: "Walk In" },
                    { value: "admin", label: "Admin" },
                  ]}
                  placeholder="All Sources"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Status
                </label>
                <FilterSelect
                  value={appointmentStatus}
                  onChange={(v) => {
                    setAppointmentStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "booked", label: "Booked" },
                    { value: "confirmed", label: "Confirmed" },
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
                  Slot Type
                </label>
                <FilterSelect
                  value={slotType}
                  onChange={(v) => {
                    setSlotType(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "free", label: "Free" },
                    { value: "normal", label: "Normal" },
                  ]}
                  placeholder="All Slot Types"
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
        <Loader text="Loading appointment report..." />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            <SummaryCard
              label="Total Appointments"
              value={summary.total_appointments}
              icon={FiCalendar}
              tone="brand"
            />
            <SummaryCard
              label="Unique Patients"
              value={summary.unique_registered_patients}
              icon={FiUsers}
              tone="accent"
            />
            <SummaryCard
              label="Registered Appts"
              value={summary.registered_patient_appointments}
              icon={FiUserCheck}
              tone="brand"
            />
            <SummaryCard
              label="Walk-in Appointments"
              value={summary.walk_in_appointments}
              icon={FiUserPlus}
              tone="warn"
            />
            <SummaryCard
              label="Free Slot Appts"
              value={summary.free_slot_appointments}
              icon={FiGift}
              tone="accent"
            />
            <SummaryCard
              label="Normal Slot Appts"
              value={summary.normal_slot_appointments}
              icon={FiClock}
              tone="ink"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ChartCard title="Appointment Trend" empty={trendData.length === 0}>
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
              title="Provider-wise Appointments"
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
              title="Appointment Type Breakdown"
              empty={typeData.length === 0}
            >
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
              title="Booking Source Breakdown"
              empty={sourceData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    label
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Appointment Status Breakdown"
              empty={statusData.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
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
            emptyText="No appointment records found."
          />
        </>
      )}
    </div>
  );
};

export default AppointmentReportPage;
