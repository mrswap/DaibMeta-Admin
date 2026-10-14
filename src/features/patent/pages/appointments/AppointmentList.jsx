// src/features/patent/pages/appointments/AppointmentList.jsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiX,
  FiCalendar,
} from "react-icons/fi";
import {
  useAppointments,
  useDeleteAppointment,
  BOOKING_SOURCES,
  APPOINTMENT_STATUSES,
} from "../../queries/appointments";
import { useStaff } from "../../queries/staff";
import AppointmentStatusBadge from "./components/AppointmentStatusBadge";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, DatePicker } from "../../common/form";

const STATUS_OPTIONS = APPOINTMENT_STATUSES.map((s) => ({
  value: s.value,
  label: s.label,
}));

const SOURCE_OPTIONS = BOOKING_SOURCES.map((s) => ({
  value: s.value,
  label: s.label,
}));

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const AppointmentList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [sourceFilter, setSourceFilter] = useState(null);
  const [providerFilter, setProviderFilter] = useState(null);
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    item: null,
  });

  // ==================== LOAD PROVIDERS ====================
  const { data: staffData } = useStaff({ per_page: 100, status: 1 });

  const providerOptions = useMemo(
    () =>
      (staffData?.list || []).map((s) => ({
        value: String(s.id),
        label: `${s.name}${s.role?.label ? ` — ${s.role.label}` : ""}`,
      })),
    [staffData],
  );

  // ==================== PARAMS ====================
  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
    ...(sourceFilter?.value && { booking_source: sourceFilter.value }),
    ...(providerFilter?.value && { provider_id: providerFilter.value }),
    ...(dateFromFilter && { date_from: dateFromFilter }),
    ...(dateToFilter && { date_to: dateToFilter }),
  };

  const { data, isLoading, isFetching, refetch } = useAppointments(params);
  const deleteMutation = useDeleteAppointment();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleView = (row) => navigate(`/appointments/${row.id}`);
  const handleEdit = (row) => navigate(`/appointments/${row.id}/edit`);
  const handleBook = () => navigate("/appointments/book");

  const handleDeleteClick = (row) =>
    setConfirm({ open: true, type: "delete", item: row });

  const handleConfirm = () => {
    const { item } = confirm;
    if (!item) return;
    deleteMutation.mutate(item.id, {
      onSettled: () => setConfirm({ open: false, type: null, item: null }),
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setSourceFilter(null);
    setProviderFilter(null);
    setDateFromFilter("");
    setDateToFilter("");
    setPage(1);
  };

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const hasActiveFilters =
    search ||
    statusFilter ||
    sourceFilter ||
    providerFilter ||
    dateFromFilter ||
    dateToFilter;

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (sourceFilter ? 1 : 0) +
    (providerFilter ? 1 : 0) +
    (dateFromFilter ? 1 : 0) +
    (dateToFilter ? 1 : 0);

  const startItem = total === 0 ? 0 : (currentPage - 1) * metaPerPage + 1;
  const endItem = Math.min(currentPage * metaPerPage, total);

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "Date",
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <span className="text-[9px] font-bold uppercase leading-none">
              {row.appointment_date
                ? new Date(row.appointment_date).toLocaleDateString("en-GB", {
                    month: "short",
                  })
                : "—"}
            </span>
            <span className="mt-0.5 text-xs font-bold leading-none">
              {row.appointment_date
                ? new Date(row.appointment_date).getDate()
                : "—"}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-700">
              {row.appointment_date
                ? new Date(row.appointment_date).toLocaleDateString("en-GB", {
                    weekday: "short",
                  })
                : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Time",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-900">
            {formatTime12(row.start_time)}
            <span className="ml-1 font-normal text-ink-500">–</span>
          </p>
          <p className="mt-0.5 text-xs font-semibold text-ink-900">
            {formatTime12(row.end_time)}
          </p>
        </div>
      ),
    },
    {
      header: "Patient",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{row.name || "—"}</p>
          <p className="truncate text-[11px] text-ink-500">
            {row.mobile || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Provider",
      render: (_, row) => (
        <span className="text-xs text-ink-700">
          {row.provider?.name || "—"}
        </span>
      ),
    },
    {
      header: "Type",
      render: (_, row) => (
        <span className="text-xs text-ink-600">
          {row.appointment_type?.name || "—"}
        </span>
      ),
    },
    {
      header: "Source",
      render: (_, row) => <SourceBadge source={row.booking_source} />,
    },
    {
      header: "Status",
      render: (_, row) => <AppointmentStatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn title="View" onClick={() => handleView(row)}>
            <FiEye className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="Edit" onClick={() => handleEdit(row)}>
            <FiEdit2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="Delete" onClick={() => handleDeleteClick(row)} danger>
            <FiTrash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Appointments
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {total > 0
              ? `Showing ${startItem}–${endItem} of ${total} appointment${
                  total > 1 ? "s" : ""
                }`
              : "Manage patient appointments"}
          </p>
        </div>
        <button
          onClick={handleBook}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* Search + Filter toggle */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="text"
              placeholder="Search by name, mobile..."
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
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-surface">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => refetch()}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {filtersOpen && (
          <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Status */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
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

              {/* Source */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Source
                </label>
                <FilterSelect
                  value={sourceFilter}
                  onChange={(v) => {
                    setSourceFilter(v);
                    setPage(1);
                  }}
                  options={SOURCE_OPTIONS}
                  placeholder="All Sources"
                  isClearable
                />
              </div>

              {/* Provider */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Provider
                </label>
                <FilterSelect
                  value={providerFilter}
                  onChange={(v) => {
                    setProviderFilter(v);
                    setPage(1);
                  }}
                  options={providerOptions}
                  placeholder="All Providers"
                  isClearable
                  isDisabled={providerOptions.length === 0}
                />
              </div>

              {/* Date From */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Date From
                </label>
                <DatePicker
                  name="date_from"
                  isFormik={false}
                  value={dateFromFilter}
                  onChange={(v) => {
                    setDateFromFilter(v || "");
                    setPage(1);
                  }}
                  placeholder="From date"
                  max={dateToFilter || ""}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Date To
                </label>
                <DatePicker
                  name="date_to"
                  isFormik={false}
                  value={dateToFilter}
                  onChange={(v) => {
                    setDateToFilter(v || "");
                    setPage(1);
                  }}
                  placeholder="To date"
                  min={dateFromFilter || ""}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
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
        <Loader text="Loading appointments..." />
      ) : list.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClear={clearFilters}
          onBook={handleBook}
        />
      ) : (
        <CustomeTable
          columns={columns}
          data={list}
          serverSide
          currentPage={currentPage}
          totalPages={lastPage}
          totalItems={total}
          itemsPerPage={metaPerPage}
          onPageChange={(p) => setPage(p)}
          emptyText={
            hasActiveFilters
              ? "No appointments found for your filters."
              : "No appointments found."
          }
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirm.open}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false, type: null, item: null })}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================
const SourceBadge = ({ source }) => {
  const found = BOOKING_SOURCES.find((s) => s.value === source);
  return (
    <span className="inline-flex rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
      {found?.label || source || "—"}
    </span>
  );
};

const EmptyState = ({ hasFilters, onClear, onBook }) => (
  <div className="rounded-xl border border-dashed border-ink-200 bg-surface py-16 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
      <FiCalendar className="h-5 w-5 text-ink-400" />
    </div>
    <p className="text-sm font-medium text-ink-700">
      {hasFilters ? "No appointments found" : "No appointments yet"}
    </p>
    <p className="mt-1 text-xs text-ink-500">
      {hasFilters
        ? "Try a different filter or clear them."
        : "Book your first appointment to get started."}
    </p>
    <div className="mt-4">
      {hasFilters ? (
        <button
          onClick={onClear}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiX className="h-4 w-4" />
          Clear Filters
        </button>
      ) : (
        <button
          onClick={onBook}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Book Appointment
        </button>
      )}
    </div>
  </div>
);

const IconBtn = ({ children, title, onClick, disabled, danger }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
      danger
        ? "text-danger-500 hover:bg-danger-50"
        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
    }`}
  >
    {children}
  </button>
);

export default AppointmentList;
