// src/features/patent/pages/reports/StoreReportPage.jsx

import { useState, useMemo } from "react";
import {
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiTruck,
  FiSettings,
  FiPlusCircle,
  FiPackage,
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

import { useStoreReport, PERIOD_OPTIONS } from "../../queries/reports";
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

const formatCurrency = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "₹0.00";
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const safe = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

const num = (v) => Number(v) || 0;

// ==================== SUMMARY CARD ====================
const SummaryCard = ({
  label,
  value,
  icon: Icon,
  tone = "brand",
  currency,
}) => {
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
      <p className="mt-2 text-lg font-bold text-ink-900 sm:text-2xl">
        {currency ? formatCurrency(value) : num(value)}
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
const StoreReportPage = () => {
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
  const [patient, setPatient] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);

  const isCustom = period?.value === "custom";

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

  // Product / category dropdowns — derive from charts so they work without
  // extra API calls. (Backend chart breakdown me unique products aate hain.)
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
    if (patient?.value) p.patient_id = patient.value;
    if (bookingStatus?.value) p.status = bookingStatus.value;
    if (product?.value) p.product_id = product.value;
    if (category?.value) p.product_category_id = category.value;
    return p;
  }, [
    period,
    isCustom,
    fromDate,
    toDate,
    search,
    patient,
    bookingStatus,
    product,
    category,
    page,
  ]);

  const { data, isLoading, isFetching, refetch } = useStoreReport(params, {
    enabled: canView,
  });

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const records = data?.records?.list || [];
  const meta = data?.records?.meta || {};

  // ==================== OPTIONS (from charts) ====================
  const productOptions = useMemo(
    () =>
      (charts?.product_breakdown || []).map((p) => ({
        value: p.product_id,
        label: p.product_name,
      })),
    [charts],
  );

  const categoryOptions = useMemo(
    () =>
      (charts?.category_breakdown || []).map((c) => ({
        value: c.category_id,
        label: c.category_name,
      })),
    [charts],
  );

  // ==================== CHART DATA (real API keys) ====================
  const trendData = useMemo(() => {
    const t = charts?.booking_trend || [];
    if (!Array.isArray(t)) return [];
    return t.map((r) => ({
      label: r.date || r.label || "",
      count: num(r.total_bookings ?? r.count ?? r.value),
    }));
  }, [charts]);

  const productSales = useMemo(() => {
    const p = charts?.product_breakdown || [];
    if (!Array.isArray(p)) return [];
    return p.map((r) => ({
      name: r.product_name || r.name || "—",
      product_id: r.product_id,
      quantity: num(r.total_quantity ?? r.quantity ?? r.qty),
      sales: num(r.total_sales ?? r.sales ?? r.amount ?? r.value),
    }));
  }, [charts]);

  const categorySales = useMemo(() => {
    const c = charts?.category_breakdown || [];
    if (!Array.isArray(c)) return [];
    return c.map((r) => ({
      name: r.category_name || r.name || "—",
      value: num(r.total_sales ?? r.sales ?? r.amount ?? r.value),
    }));
  }, [charts]);

  const statusData = useMemo(() => {
    const s = summary?.status_breakdown || [];
    if (!Array.isArray(s)) return [];
    return s.map((r) => ({
      name: r.status || r.label || r.name || "—",
      value: num(r.total ?? r.count ?? r.value),
    }));
  }, [summary]);

  // ==================== RESET ====================
  const resetFilters = () => {
    setPeriod(PERIOD_OPTIONS.find((p) => p.value === "this_month"));
    setFromDate("");
    setToDate("");
    setSearch("");
    setPatient(null);
    setBookingStatus(null);
    setProduct(null);
    setCategory(null);
    setPage(1);
  };

  const hasActiveFilters =
    (period?.value && period.value !== "this_month") ||
    (isCustom && (fromDate || toDate)) ||
    !!search ||
    !!patient ||
    !!bookingStatus ||
    !!product ||
    !!category;

  // ==================== TABLE COLUMNS ====================
  const columns = useMemo(
    () => [
      {
        header: "Booking #",
        align: "left",
        render: (_, row) => (
          <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">
            {safe(row.booking_number || row.booking_no || row.id)}
          </code>
        ),
      },
      {
        header: "Patient",
        align: "left",
        render: (_, row) => (
          <span className="text-xs font-medium text-ink-900">
            {safe(row.patient?.name || row.patient_name || row.customer_name)}
          </span>
        ),
      },
      {
        header: "Mobile",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {safe(
              row.patient?.mobile || row.delivery_address?.mobile || row.mobile,
            )}
          </span>
        ),
      },
      {
        header: "Booking Date",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatDate(row.booking_date || row.created_at)}
          </span>
        ),
      },
      {
        header: "Subtotal",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatCurrency(row.subtotal)}
          </span>
        ),
      },
      {
        header: "Delivery",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatCurrency(row.delivery_charge)}
          </span>
        ),
      },
      {
        header: "Processing",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatCurrency(row.processing_charge)}
          </span>
        ),
      },
      {
        header: "Other",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {formatCurrency(row.other_charge)}
          </span>
        ),
      },
      {
        header: "Total",
        align: "left",
        render: (_, row) => (
          <span className="text-xs font-semibold text-ink-900">
            {formatCurrency(row.total_amount || row.total)}
          </span>
        ),
      },
      {
        header: "Status",
        align: "left",
        render: (_, row) => {
          const cls =
            row.status === "completed" || row.status === "delivered"
              ? "bg-brand-50 text-brand-700"
              : row.status === "cancelled"
                ? "bg-danger-50 text-danger-700"
                : row.status === "processing"
                  ? "bg-accent-50 text-accent-800"
                  : "bg-warn-100 text-warn-900";
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${cls}`}
            >
              {safe(row.status_label || row.status)}
            </span>
          );
        },
      },
      {
        header: "Items",
        align: "left",
        render: (_, row) => (
          <span className="text-xs text-ink-600">
            {num(
              row.items_count ??
                (Array.isArray(row.items) ? row.items.length : row.items),
            )}
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
            Store Report
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {num(meta.total) > 0
              ? `${num(meta.total)} booking${num(meta.total) > 1 ? "s" : ""}`
              : "Store bookings & sales overview"}
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
              placeholder="Search by booking number or patient..."
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
                  Booking Status
                </label>
                <FilterSelect
                  value={bookingStatus}
                  onChange={(v) => {
                    setBookingStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "processing", label: "Processing" },
                    { value: "shipped", label: "Shipped" },
                    { value: "delivered", label: "Delivered" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                  placeholder="All Status"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Product
                </label>
                <FilterSelect
                  value={product}
                  onChange={(v) => {
                    setProduct(v);
                    setPage(1);
                  }}
                  options={productOptions}
                  placeholder="All Products"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Product Category
                </label>
                <FilterSelect
                  value={category}
                  onChange={(v) => {
                    setCategory(v);
                    setPage(1);
                  }}
                  options={categoryOptions}
                  placeholder="All Categories"
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
        <Loader text="Loading store report..." />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            <SummaryCard
              label="Total Bookings"
              value={summary.total_bookings}
              icon={FiShoppingBag}
              tone="brand"
            />
            <SummaryCard
              label="Unique Patients"
              value={summary.unique_patients}
              icon={FiUsers}
              tone="accent"
            />
            <SummaryCard
              label="Total Subtotal"
              value={summary.total_subtotal}
              icon={FiDollarSign}
              tone="ink"
              currency
            />
            <SummaryCard
              label="Delivery Charges"
              value={summary.total_delivery_charge}
              icon={FiTruck}
              tone="warn"
              currency
            />
            <SummaryCard
              label="Processing Charges"
              value={summary.total_processing_charge}
              icon={FiSettings}
              tone="warn"
              currency
            />
            <SummaryCard
              label="Other Charges"
              value={summary.total_other_charge}
              icon={FiPlusCircle}
              tone="ink"
              currency
            />
            <SummaryCard
              label="Total Order Value"
              value={summary.total_order_value}
              icon={FiDollarSign}
              tone="brand"
              currency
            />
            <SummaryCard
              label="Quantity Sold"
              value={summary.total_quantity_sold}
              icon={FiPackage}
              tone="accent"
            />
            <SummaryCard
              label="Unique Products"
              value={summary.unique_products_sold}
              icon={FiPackage}
              tone="ink"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ChartCard title="Booking Trend" empty={trendData.length === 0}>
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
              title="Product-wise Sales"
              empty={productSales.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Category-wise Sales"
              empty={categorySales.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    label
                  >
                    {categorySales.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Booking Status Breakdown"
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

          {/* Booking Table — CustomeTable (server-side, 10 per page) */}
          <CustomeTable
            columns={columns}
            data={records}
            serverSide
            currentPage={meta.current_page || 1}
            totalPages={meta.last_page || 1}
            totalItems={meta.total || 0}
            itemsPerPage={PER_PAGE}
            onPageChange={(p) => setPage(p)}
            emptyText="No store bookings found."
          />

          {/* Product-wise Sales Table (from charts — not paginated) */}
          {productSales.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
              <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                  Product-wise Sales
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="border-b border-ink-100 bg-ink-50/40">
                    <tr>
                      {[
                        "Product Name",
                        "Product ID",
                        "Quantity Sold",
                        "Total Sales",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productSales.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-ink-900">
                          {safe(p.name)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-ink-600">
                          {safe(p.product_id)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-ink-600">
                          {num(p.quantity)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-ink-900">
                          {formatCurrency(p.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreReportPage;
