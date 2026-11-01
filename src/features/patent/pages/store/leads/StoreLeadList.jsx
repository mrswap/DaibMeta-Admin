// src/features/patent/pages/store/leads/StoreLeadList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiFilter,
  FiX,
  FiFileText,
} from "react-icons/fi";

import { useStoreLeads } from "../../../queries/storeLeads";
import Loader from "../../../common/Loader";
import CustomeTable from "../../../common/table/CustomeTable";
import { FilterSelect, DatePicker } from "../../../common/form";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "viewed", label: "Viewed" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancel", label: "Cancelled" },
];

const StoreLeadList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Prepare Params
  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
    ...(fromDate && { from_date: fromDate }),
    ...(toDate && { to_date: toDate }),
  };

  const { data, isLoading, isFetching, refetch } = useStoreLeads(params);

  const list = data?.list || [];
  const meta = data?.meta || {};

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  // Handlers
  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter || fromDate || toDate;
  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0);

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "Booking No.",
      render: (_, row) => (
        <span className="font-semibold text-brand-700 whitespace-nowrap">
          {row.booking_number || "—"}
        </span>
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
      header: "Items",
      render: (_, row) => (
        <span className="inline-flex items-center justify-center rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
          {row.items_count || 0}
        </span>
      ),
    },
    {
      header: "Item Total",
      render: (_, row) => (
        <span className="text-xs font-medium text-ink-600 whitespace-nowrap">
          ₹{row.price_details?.subtotal || "0.00"}
        </span>
      ),
    },
    {
      header: "Total Amount",
      render: (_, row) => (
        <span className="text-sm font-bold text-ink-900 whitespace-nowrap">
          ₹{row.price_details?.total_amount || "0.00"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (_, row) => (
        <StatusBadge status={row.status} label={row.status_label} />
      ),
    },
    {
      header: "Date",
      render: (_, row) => (
        <span className="text-xs text-ink-600 whitespace-nowrap">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/store/leads/${row.id}`)}
            className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
            title="View Details"
          >
            <FiEye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Store Leads
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Manage patient store booking requests
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex w-full flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="text"
              placeholder="Search booking no., patient name or mobile..."
              value={search}
              maxLength={150}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex h-10 flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition sm:flex-none ${
                filtersOpen || hasActiveFilters
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
              }`}
            >
              <FiFilter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-surface">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => refetch()}
              title="Refresh"
              className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-ink-200 bg-surface px-3 text-ink-700 transition hover:bg-ink-50 hover:text-brand-600"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="space-y-3 rounded-xl border border-ink-100 bg-ink-50/40 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Status */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Status
                </label>
                <FilterSelect
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                  options={STATUS_OPTIONS}
                  placeholder="All Status"
                  isClearable
                />
              </div>

              {/* From Date */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
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

              {/* To Date */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
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
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={clearFilters}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100"
                >
                  <FiX className="h-3 w-3" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <Loader text="Loading leads..." />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
            <FiFileText className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-lg font-semibold text-ink-900">
            No leads found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            {hasActiveFilters
              ? "We couldn't find any leads matching your filters."
              : "No store booking leads available yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
          <CustomeTable
            columns={columns}
            data={list}
            serverSide
            currentPage={currentPage}
            totalPages={lastPage}
            totalItems={total}
            itemsPerPage={metaPerPage}
            onPageChange={(p) => setPage(p)}
            emptyText="No leads found."
          />
        </div>
      )}
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

const StatusBadge = ({ status, label }) => {
  let colorClasses = "bg-ink-100 text-ink-600";

  switch (status) {
    case "new":
      colorClasses = "bg-accent-50 text-accent-700 ring-1 ring-accent-200";
      break;
    case "viewed":
      colorClasses = "bg-ink-100 text-ink-600 ring-1 ring-ink-200";
      break;
    case "processing":
      colorClasses = "bg-warn-50 text-warn-700 ring-1 ring-warn-200";
      break;
    case "delivered":
      colorClasses = "bg-brand-50 text-brand-700 ring-1 ring-brand-200";
      break;
    case "cancel":
      colorClasses = "bg-danger-50 text-danger-700 ring-1 ring-danger-200";
      break;
    default:
      colorClasses = "bg-ink-100 text-ink-600 ring-1 ring-ink-200";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${colorClasses}`}
    >
      {label || status}
    </span>
  );
};

export default StoreLeadList;
