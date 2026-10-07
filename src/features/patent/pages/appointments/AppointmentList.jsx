import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiFilter,
  FiX,
} from "react-icons/fi";
import {
  useAppointments,
  useDeleteAppointment,
  BOOKING_SOURCES,
  APPOINTMENT_STATUSES,
} from "../../queries/appointments";
import AppointmentStatusBadge from "./components/AppointmentStatusBadge";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
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

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
    ...(sourceFilter?.value && { booking_source: sourceFilter.value }),
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
    setDateFromFilter("");
    setDateToFilter("");
    setPage(1);
  };

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const hasActiveFilters =
    search || statusFilter || sourceFilter || dateFromFilter || dateToFilter;

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (sourceFilter ? 1 : 0) +
    (dateFromFilter ? 1 : 0) +
    (dateToFilter ? 1 : 0);

  const startItem = total === 0 ? 0 : (currentPage - 1) * metaPerPage + 1;
  const endItem = Math.min(currentPage * metaPerPage, total);

  const confirmConfig = {
    title: "Delete Appointment",
    message:
      "Are you sure you want to delete this appointment? This action cannot be undone.",
    confirmText: "Delete",
    variant: "danger",
  };

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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-ink-100 bg-surface lg:block">
            <table className="w-full">
              <thead className="border-b border-ink-100 bg-ink-50/60">
                <tr>
                  <Th>Date</Th>
                  <Th>Time</Th>
                  <Th>Patient</Th>
                  <Th>Provider</Th>
                  <Th>Type</Th>
                  <Th>Source</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-ink-100 transition hover:bg-ink-50/40"
                  >
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <span className="text-[9px] font-bold uppercase leading-none">
                            {row.appointment_date
                              ? new Date(
                                  row.appointment_date,
                                ).toLocaleDateString("en-GB", {
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
                              ? new Date(
                                  row.appointment_date,
                                ).toLocaleDateString("en-GB", {
                                  weekday: "short",
                                })
                              : ""}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {/* ========== 2 LINES: start + dash on line 1, end on line 2 ========== */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink-900">
                          {formatTime12(row.start_time)}
                          <span className="ml-1 font-normal text-ink-500">
                            –
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-ink-900">
                          {formatTime12(row.end_time)}
                        </p>
                      </div>
                    </Td>
                    <Td>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">
                          {row.name || "—"}
                        </p>
                        <p className="truncate text-[11px] text-ink-500">
                          {row.mobile || "—"}
                        </p>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-xs text-ink-700">
                        {row.provider?.name || "—"}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-ink-600">
                        {row.appointment_type?.name || "—"}
                      </span>
                    </Td>
                    <Td>
                      <SourceBadge source={row.booking_source} />
                    </Td>
                    <Td>
                      <AppointmentStatusBadge status={row.status} />
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="View" onClick={() => handleView(row)}>
                          <FiEye className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn title="Edit" onClick={() => handleEdit(row)}>
                          <FiEdit2 className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          title="Delete"
                          onClick={() => handleDeleteClick(row)}
                          danger
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            {lastPage > 1 && (
              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                total={total}
                startItem={startItem}
                endItem={endItem}
                onPageChange={setPage}
              />
            )}
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {list.map((row) => (
              <MobileCard
                key={row.id}
                row={row}
                onView={() => handleView(row)}
                onEdit={() => handleEdit(row)}
                onDelete={() => handleDeleteClick(row)}
              />
            ))}

            {lastPage > 1 && (
              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                total={total}
                startItem={startItem}
                endItem={endItem}
                onPageChange={setPage}
                compact
              />
            )}
          </div>
        </>
      )}

      <ConfirmModal
        open={confirm.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
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

const MobileCard = ({ row, onView, onEdit, onDelete }) => {
  const sourceLabel =
    BOOKING_SOURCES.find((s) => s.value === row.booking_source)?.label ||
    row.booking_source ||
    "—";

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-600 text-surface">
            <span className="text-[9px] font-bold uppercase leading-none">
              {row.appointment_date
                ? new Date(row.appointment_date).toLocaleDateString("en-GB", {
                    month: "short",
                  })
                : "—"}
            </span>
            <span className="mt-0.5 text-sm font-bold leading-none">
              {row.appointment_date
                ? new Date(row.appointment_date).getDate()
                : "—"}
            </span>
          </div>
          <div>
            {/* 2 lines: start + dash, end */}
            <p className="text-xs font-semibold text-ink-800">
              {formatTime12(row.start_time)}
              <span className="ml-1 font-normal text-ink-500">–</span>
            </p>
            <p className="mt-0.5 text-xs font-semibold text-ink-800">
              {formatTime12(row.end_time)}
            </p>
            <p className="mt-1 text-[10px] text-ink-500">
              {row.appointment_date
                ? new Date(row.appointment_date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })
                : ""}
            </p>
          </div>
        </div>
        <AppointmentStatusBadge status={row.status} />
      </div>

      <div className="space-y-2.5 p-4">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-surface">
            {(row.name || "?")
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">
              {row.name || "—"}
            </p>
            <p className="truncate text-[11px] text-ink-500">
              {row.mobile || "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-50/50 p-2.5 text-[11px]">
          <div>
            <p className="font-medium text-ink-500">Provider</p>
            <p className="mt-0.5 truncate font-semibold text-ink-800">
              {row.provider?.name || "—"}
            </p>
          </div>
          <div>
            <p className="font-medium text-ink-500">Type</p>
            <p className="mt-0.5 truncate font-semibold text-ink-800">
              {row.appointment_type?.name || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="font-medium text-ink-500">Source</p>
            <p className="mt-0.5 truncate font-semibold text-ink-800">
              {sourceLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-ink-100 bg-ink-50/30 px-2 py-1.5">
        <IconBtn title="View" onClick={onView}>
          <FiEye className="h-4 w-4" />
        </IconBtn>
        <IconBtn title="Edit" onClick={onEdit}>
          <FiEdit2 className="h-4 w-4" />
        </IconBtn>
        <IconBtn title="Delete" onClick={onDelete} danger>
          <FiTrash2 className="h-4 w-4" />
        </IconBtn>
      </div>
    </div>
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

const Pagination = ({
  currentPage,
  lastPage,
  total,
  startItem,
  endItem,
  onPageChange,
  compact = false,
}) => (
  <div
    className={`flex flex-col items-center gap-3 border-t border-ink-100 ${
      compact ? "px-3 py-3" : "justify-between px-5 py-3 sm:flex-row"
    }`}
  >
    <p className="text-[11px] text-ink-500">
      Showing <strong className="text-ink-700">{startItem}</strong>–
      <strong className="text-ink-700">{endItem}</strong> of{" "}
      <strong className="text-ink-700">{total}</strong>
    </p>
    <div className="flex items-center gap-1">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="cursor-pointer rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 disabled:hover:border-ink-200 disabled:hover:text-ink-400"
      >
        Previous
      </button>
      <span className="px-2 text-xs text-ink-500">
        {currentPage} / {lastPage}
      </span>
      <button
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="cursor-pointer rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 disabled:hover:border-ink-200 disabled:hover:text-ink-400"
      >
        Next
      </button>
    </div>
  </div>
);

const Th = ({ children, align = "left" }) => (
  <th
    className={`px-4 py-3 text-${align} text-[11px] font-semibold uppercase tracking-wide text-ink-500`}
  >
    {children}
  </th>
);

const Td = ({ children, align = "left" }) => (
  <td className={`px-4 py-3 text-sm text-${align}`}>{children}</td>
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
