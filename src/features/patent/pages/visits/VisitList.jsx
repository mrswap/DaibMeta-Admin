// src/features/patent/pages/visits/VisitList.jsx

import { useState } from "react";
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
} from "react-icons/fi";
import {
  useVisits,
  useDeleteVisit,
  VISIT_STATUSES,
  VISIT_TYPES,
  PAYMENT_STATUSES,
} from "../../queries/visits";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, DatePicker } from "../../common/form";

const STATUS_OPTIONS = VISIT_STATUSES.map((s) => ({
  value: s.value,
  label: s.label,
}));

const TYPE_OPTIONS = VISIT_TYPES.map((t) => ({
  value: t.value,
  label: t.label,
}));

const PAYMENT_OPTIONS = PAYMENT_STATUSES.map((p) => ({
  value: p.value,
  label: p.label,
}));

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const VisitList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [confirm, setConfirm] = useState({
    open: false,
    item: null,
  });

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
    ...(typeFilter?.value && { visit_type: typeFilter.value }),
    ...(paymentFilter?.value && { payment_status: paymentFilter.value }),
    ...(dateFromFilter && { date_from: dateFromFilter }),
    ...(dateToFilter && { date_to: dateToFilter }),
  };

  const { data, isLoading, isFetching, refetch } = useVisits(params);
  const deleteMutation = useDeleteVisit();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleAdd = () => navigate("/visits/new");
  const handleEdit = (row) => navigate(`/visits/${row.id}/edit`);
  const handleView = (row) => navigate(`/visits/${row.id}`);

  const handleDeleteClick = (item) => {
    // Cannot delete in_consultation or completed visits
    if (item.status === "in_consultation" || item.status === "completed") {
      return;
    }
    setConfirm({ open: true, item });
  };

  const handleConfirm = () => {
    const { item } = confirm;
    if (!item) return;
    deleteMutation.mutate(item.id, {
      onSettled: () => setConfirm({ open: false, item: null }),
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setTypeFilter(null);
    setPaymentFilter(null);
    setDateFromFilter("");
    setDateToFilter("");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    statusFilter ||
    typeFilter ||
    paymentFilter ||
    dateFromFilter ||
    dateToFilter;

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (typeFilter ? 1 : 0) +
    (paymentFilter ? 1 : 0) +
    (dateFromFilter ? 1 : 0) +
    (dateToFilter ? 1 : 0);

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "#",
      render: (_, __, idx) => <span className="text-ink-500">{idx + 1}</span>,
    },
    {
      header: "Visit ID",
      accessor: "id",
      render: (v) => (
        <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">
          #{v}
        </code>
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
      header: "Provider",
      render: (_, row) => (
        <span className="text-xs text-ink-700">
          {row.provider?.name || "—"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      render: (_, row) => {
        const date = row.visit_schedule?.date || row.visit_date;
        const start = row.visit_schedule?.start_time || row.slot_start_time;
        const end = row.visit_schedule?.end_time || row.slot_end_time;
        return (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-900">
              {date ? formatDate(date) : "—"}
            </p>
            <p className="text-[11px] text-ink-500">
              {formatTime12(start)} – {formatTime12(end)}
            </p>
          </div>
        );
      },
    },
    {
      header: "Type",
      render: (_, row) => (
        <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
          {row.visit_type_label || row.visit_type || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value, row) => (
        <StatusBadge status={value} label={row.status_label} />
      ),
    },
    {
      header: "Payment",
      accessor: "payment_status",
      render: (value, row) => (
        <PaymentBadge status={value} label={row.payment_status_label} />
      ),
    },
    {
      header: "Actions",
      render: (_, row) => {
        const canDelete =
          row.status !== "in_consultation" && row.status !== "completed";
        return (
          <div className="flex items-center justify-end gap-1">
            <IconBtn title="View" onClick={() => handleView(row)}>
              <FiEye className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Edit" onClick={() => handleEdit(row)}>
              <FiEdit2 className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title={canDelete ? "Delete" : "Cannot delete this visit"}
              onClick={() => handleDeleteClick(row)}
              disabled={!canDelete}
              danger
            >
              <FiTrash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Visits
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {total > 0
              ? `${total} visit${total > 1 ? "s" : ""} total`
              : "Manage patient visits and check-ins"}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          New Visit
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-surface px-3">
            <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="text"
              placeholder="Search by patient name, mobile..."
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
                  Visit Type
                </label>
                <FilterSelect
                  value={typeFilter}
                  onChange={(v) => {
                    setTypeFilter(v);
                    setPage(1);
                  }}
                  options={TYPE_OPTIONS}
                  placeholder="All Types"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Payment
                </label>
                <FilterSelect
                  value={paymentFilter}
                  onChange={(v) => {
                    setPaymentFilter(v);
                    setPage(1);
                  }}
                  options={PAYMENT_OPTIONS}
                  placeholder="All Payments"
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
        <Loader text="Loading visits..." />
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
              ? "No visits found for your filters."
              : "No visits yet."
          }
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={confirm.open}
        title="Delete Visit"
        message="Are you sure you want to delete this visit? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false, item: null })}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================
const StatusBadge = ({ status, label }) => {
  const styles = {
    waiting: "bg-warn-100 text-warn-900",
    in_consultation: "bg-accent-50 text-accent-800",
    completed: "bg-brand-50 text-brand-700",
    cancelled: "bg-danger-50 text-danger-700",
    no_show: "bg-danger-100 text-danger-900",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || "bg-ink-100 text-ink-600"
      }`}
    >
      {label || status}
    </span>
  );
};

const PaymentBadge = ({ status, label }) => {
  const styles = {
    paid: "bg-brand-50 text-brand-700",
    unpaid: "bg-warn-100 text-warn-900",
    partial: "bg-accent-50 text-accent-800",
    free: "bg-ink-100 text-ink-600",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || "bg-ink-100 text-ink-600"
      }`}
    >
      {label || status || "—"}
    </span>
  );
};

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

export default VisitList;
