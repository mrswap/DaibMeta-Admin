import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiAlertCircle,
} from "react-icons/fi";
import {
  useProviderAvailabilities,
  useToggleAvailabilityStatus,
  useDeleteAvailability,
  getDaysLabel,
} from "../../queries/providerAvailabilities";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect } from "../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const AvailabilityList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

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
  };

  const { data, isLoading, isFetching, refetch } =
    useProviderAvailabilities(params);
  const toggleStatus = useToggleAvailabilityStatus();
  const deleteMutation = useDeleteAvailability();

  const list = data?.list || [];
  const meta = data?.meta || {};

  // ---------- Handlers ----------
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

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  // ---------- Columns ----------
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
        <span className="text-xs text-ink-600">
          {row.date_from} → {row.date_to}
        </span>
      ),
    },
    {
      header: "Days",
      render: (_, row) => (
        <span className="text-xs text-ink-600">
          {getDaysLabel(row.days_of_week)}
        </span>
      ),
    },
    {
      header: "Time",
      render: (_, row) => (
        <span className="text-xs text-ink-600">
          {row.start_time} - {row.end_time}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
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
          <IconBtn
            title={row.status ? "Deactivate" : "Activate"}
            onClick={() => handleToggleClick(row)}
          >
            {row.status ? (
              <FiToggleRight className="h-4 w-4" />
            ) : (
              <FiToggleLeft className="h-4 w-4" />
            )}
          </IconBtn>
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
          message: `Are you sure you want to delete this availability? This action cannot be undone.`,
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Provider Availability
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage provider schedules and dynamic slot generation
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Set Availability
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search provider or appointment type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>

        <FilterSelect
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="All Status"
          isClearable
          width="w-40"
        />

        <button
          onClick={() => refetch()}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
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
            search
              ? "No availabilities found for your search."
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
