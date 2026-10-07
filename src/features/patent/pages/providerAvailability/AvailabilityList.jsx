import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiAlertCircle,
  FiFilter,
  FiX,
} from "react-icons/fi";
import {
  useProviderAvailabilities,
  useToggleAvailabilityStatus,
  useDeleteAvailability,
} from "../../queries/providerAvailabilities";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, ActionToggle, DatePicker } from "../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

// ==================== HELPERS ====================
const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  return dateStr.slice(0, 10);
};

const formatTime12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const DAY_SHORT = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

const splitDays = (daysOfWeek = []) => {
  const labels = daysOfWeek.map((d) => DAY_SHORT[d]);
  if (labels.length <= 3) {
    return { line1: labels.join(", "), line2: "" };
  }
  const mid = Math.ceil(labels.length / 2);
  return {
    line1: labels.slice(0, mid).join(", "),
    line2: labels.slice(mid).join(", "),
  };
};

const AvailabilityList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
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
    ...(dateFromFilter && { date_from: dateFromFilter }),
    ...(dateToFilter && { date_to: dateToFilter }),
  };

  const { data, isLoading, isFetching, refetch } =
    useProviderAvailabilities(params);
  const toggleStatus = useToggleAvailabilityStatus();
  const deleteMutation = useDeleteAvailability();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleAdd = () => navigate("/provider-availabilities/new");
  const handleEdit = (item) =>
    navigate(`/provider-availabilities/${item.id}/edit`);
  const handleView = (item) => navigate(`/provider-availabilities/${item.id}`);
  const handleManageExceptions = (item) =>
    navigate(`/provider-availabilities/${item.id}/exceptions`);

  const handleToggleClick = (item) =>
    setConfirm({ open: true, type: "toggle", item });
  const handleDeleteClick = (item) =>
    setConfirm({ open: true, type: "delete", item });

  const handleConfirm = () => {
    const { type, item } = confirm;
    if (!item) return;
    const mutation = type === "toggle" ? toggleStatus : deleteMutation;
    mutation.mutate(item.id, {
      onSettled: () => setConfirm({ open: false, type: null, item: null }),
    });
  };

  const handleCancel = () =>
    setConfirm({ open: false, type: null, item: null });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setDateFromFilter("");
    setDateToFilter("");
    setPage(1);
  };

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (dateFromFilter ? 1 : 0) +
    (dateToFilter ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const columns = [
    {
      header: "#",
      render: (_, __, idx) => <span className="text-ink-500">{idx + 1}</span>,
    },
    {
      header: "Provider",
      render: (_, row) => (
        <div>
          <p className="font-medium text-ink-900">{row.provider?.name}</p>
          <p className="text-[11px] text-ink-500">{row.provider?.role_label}</p>
        </div>
      ),
    },
    {
      header: "Appointment Type",
      render: (_, row) => (
        <span className="text-ink-700">{row.appointment_type?.name}</span>
      ),
    },
    {
      header: "Period",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-900">
            {formatDateShort(row.date_from)}
            <span className="ml-1 font-normal text-ink-500">–</span>
          </p>
          <p className="mt-0.5 text-xs font-semibold text-ink-900">
            {formatDateShort(row.date_to)}
          </p>
        </div>
      ),
    },
    {
      header: "Days",
      render: (_, row) => {
        const { line1, line2 } = splitDays(row.days_of_week);
        return (
          <div className="min-w-0">
            <p className="text-xs text-ink-700">{line1}</p>
            {line2 && <p className="mt-0.5 text-xs text-ink-700">{line2}</p>}
          </div>
        );
      },
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
      header: "Status",
      accessor: "status",
      render: (value) => <StatusBadge active={value} />,
    },
    {
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn title="View" onClick={() => handleView(row)}>
            <FiEye className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="Edit" onClick={() => handleEdit(row)}>
            <FiEdit2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            title="Manage Exceptions"
            onClick={() => handleManageExceptions(row)}
          >
            <FiAlertCircle className="h-4 w-4" />
          </IconBtn>
          <ActionToggle
            active={row.status}
            onClick={() => handleToggleClick(row)}
            loading={
              toggleStatus.isPending && toggleStatus.variables === row.id
            }
          />
          <IconBtn title="Delete" onClick={() => handleDeleteClick(row)} danger>
            <FiTrash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ),
    },
  ];

  const confirmConfig =
    confirm.type === "delete"
      ? {
          title: "Delete Availability",
          message:
            "Are you sure you want to delete this availability? This action cannot be undone.",
          confirmText: "Delete",
          variant: "danger",
        }
      : {
          title: confirm.item?.status
            ? "Deactivate Availability"
            : "Activate Availability",
          message: `Are you sure you want to ${
            confirm.item?.status ? "deactivate" : "activate"
          } this availability?`,
          confirmText: confirm.item?.status ? "Deactivate" : "Activate",
          variant: "warn",
        };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Provider Availability
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {total > 0
              ? `${total} availabilit${total === 1 ? "y" : "ies"}`
              : "Manage provider schedules and dynamic slot generation"}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Set Availability
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="text"
              placeholder="Search provider or appointment type..."
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
            title="Refresh"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {filtersOpen && (
          <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/40 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Table */}
      {isLoading ? (
        <Loader text="Loading availabilities..." />
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
              ? "No availabilities found for your filters."
              : "No availabilities found."
          }
        />
      )}

      <ConfirmModal
        open={confirm.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={toggleStatus.isPending || deleteMutation.isPending}
      />
    </div>
  );
};

// ==================== SHARED ====================
const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
      active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
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

export default AvailabilityList;
