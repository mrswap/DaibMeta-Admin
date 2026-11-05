// src/features/patent/pages/serviceManager/leads/ServiceLeadList.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiFilter,
  FiX,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";

import Loader from "../../../common/Loader";
import CustomeTable from "../../../common/table/CustomeTable";
import { FilterSelect, DatePicker } from "../../../common/form";
import {
  useServiceLeads,
  LEAD_STATUSES,
  getLeadStatusLabel,
} from "../../../queries/serviceManager";

const STATUS_OPTIONS = LEAD_STATUSES.map((s) => ({
  value: s.value,
  label: s.label,
}));

const ServiceLeadList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = {
    page,
    per_page: perPage,
    search: search || undefined,
    status: statusFilter?.value,
    from_date: dateFrom || undefined,
    to_date: dateTo || undefined,
  };

  const { data, isLoading, isFetching, refetch } = useServiceLeads(params);
  const leads = data?.list || [];
  const meta = data?.meta || {};

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = search || statusFilter || dateFrom || dateTo;
  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "Lead / Date",
      render: (_, row) => (
        <div>
          <p className="font-semibold text-ink-900">#{row.id}</p>
          <p className="text-xs text-ink-500">
            {row.created_at
              ? new Date(row.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Patient",
      render: (_, row) => (
        <div>
          <p className="font-medium text-ink-900">
            {row.patient?.name || "N/A"}
          </p>
          <p className="text-xs text-ink-500">{row.patient?.mobile || ""}</p>
        </div>
      ),
    },
    {
      header: "Enquiry For",
      render: (_, row) => (
        <span className="text-sm text-ink-700">
          {row.health_service_package?.name || row.service?.name || (
            <span className="text-ink-400">—</span>
          )}
        </span>
      ),
    },
    {
      header: "Status",
      render: (_, row) => {
        let cls = "bg-ink-100 text-ink-600 ring-1 ring-ink-200";
        if (row.status === "new_lead")
          cls = "bg-brand-50 text-brand-700 ring-1 ring-brand-200";
        else if (row.status === "viewed")
          cls = "bg-accent-50 text-accent-700 ring-1 ring-accent-200";
        else if (row.status === "contacted")
          cls = "bg-warn-50 text-warn-700 ring-1 ring-warn-200";
        else if (row.status === "closed")
          cls = "bg-danger-50 text-danger-700 ring-1 ring-danger-200";

        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
          >
            {getLeadStatusLabel(row.status)}
          </span>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/service-manager/leads/${row.id}`)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
          >
            <FiEye className="h-4 w-4" /> View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Service Leads
          </h1>
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            Manage patient enquiries and follow-ups for services
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
              placeholder="Search by name, mobile, patient ID..."
              value={search}
              maxLength={150}
              onChange={handleSearchChange}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex h-10 flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition sm:flex-none ${
                filtersOpen || hasFilters
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
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Status
                </label>
                <FilterSelect
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                  placeholder="All Statuses"
                  isClearable
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  From Date
                </label>
                <DatePicker
                  name="from_date"
                  isFormik={false}
                  value={dateFrom}
                  onChange={(v) => {
                    setDateFrom(v || "");
                    setPage(1);
                  }}
                  placeholder="From date"
                  max={dateTo || ""}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  To Date
                </label>
                <DatePicker
                  name="to_date"
                  isFormik={false}
                  value={dateTo}
                  onChange={(v) => {
                    setDateTo(v || "");
                    setPage(1);
                  }}
                  placeholder="To date"
                  min={dateFrom || ""}
                />
              </div>
            </div>

            {hasFilters && (
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

      {/* Table Content */}
      {isLoading ? (
        <Loader text="Loading leads..." />
      ) : (
        <div className="overflow-hidden rounded-xl">
          <CustomeTable
            columns={columns}
            data={leads}
            serverSide
            currentPage={currentPage}
            totalPages={lastPage}
            totalItems={total}
            itemsPerPage={metaPerPage}
            onPageChange={(p) => setPage(p)}
            emptyText={
              hasFilters
                ? "No leads found for your filters."
                : "No leads found."
            }
          />
        </div>
      )}
    </div>
  );
};

export default ServiceLeadList;
