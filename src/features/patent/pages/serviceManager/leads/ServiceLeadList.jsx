import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiFilter, FiCalendar } from "react-icons/fi";
import Loader from "../../../common/Loader";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = {
    page,
    search: search || undefined,
    status: statusFilter?.value,
    from_date: dateFrom || undefined,
    to_date: dateTo || undefined,
  };

  const { data, isLoading } = useServiceLeads(params);
  const leads = data?.list || [];
  const meta = data?.meta || {};

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = search || statusFilter || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Service Leads
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage patient enquiries and follow-ups for services
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-card border border-ink-100 bg-surface p-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, patient ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
              filtersOpen || hasFilters
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
            }`}
          >
            <FiFilter className="h-4 w-4" /> Filters
          </button>
        </div>

        {filtersOpen && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
            <div>
              <label className="mb-1 text-xs font-medium text-ink-500">
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
              <label className="mb-1 text-xs font-medium text-ink-500">
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
                placeholder="From"
                max={dateTo || ""}
              />
            </div>
            <div>
              <label className="mb-1 text-xs font-medium text-ink-500">
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
                placeholder="To"
                min={dateFrom || ""}
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <Loader text="Loading leads..." />
      ) : leads.length === 0 ? (
        <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
          <FiCalendar className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-4 text-sm font-medium text-ink-700">
            No leads found
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-table-head-bg">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-table-head-text">
                    Lead / Date
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-table-head-text">
                    Patient
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-table-head-text">
                    Enquiry For
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-table-head-text">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-table-head-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-table-row-border hover:bg-table-row-hover-bg"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink-900">#{lead.id}</p>
                      <p className="text-xs text-ink-500">
                        {new Date(lead.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">
                        {lead.patient?.name || "N/A"}
                      </p>
                      <p className="text-xs text-ink-500">
                        {lead.patient?.mobile || ""}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      {lead.health_service_package ? (
                        <span className="text-sm text-ink-700">
                          {lead.health_service_package.name}
                        </span>
                      ) : lead.service ? (
                        <span className="text-sm text-ink-700">
                          {lead.service.name}
                        </span>
                      ) : (
                        <span className="text-sm text-ink-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide
                        ${lead.status === "new_lead" ? "bg-brand-50 text-brand-700" : ""}
                        ${lead.status === "viewed" ? "bg-accent-50 text-accent-700" : ""}
                        ${lead.status === "contacted" ? "bg-warn-50 text-warn-800" : ""}
                        ${lead.status === "closed" ? "bg-danger-50 text-danger-900" : ""}
                      `}
                      >
                        {getLeadStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          navigate(`/service-manager/leads/${lead.id}`)
                        }
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                      >
                        <FiEye className="h-4 w-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
              <span className="text-xs text-ink-500">
                Showing page {meta.current_page} of {meta.last_page} (
                {meta.total} leads)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={meta.current_page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceLeadList;
