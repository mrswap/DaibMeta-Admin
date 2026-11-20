// src/features/patent/pages/specializations/SpecializationList.jsx

import { useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiLock,
} from "react-icons/fi";
import {
  useSpecializations,
  useToggleSpecializationStatus,
  useDeleteSpecialization,
} from "../../queries/specializations";
import SpecializationForm from "./components/SpecializationForm";
import SpecializationView from "./components/SpecializationView";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, ActionToggle } from "../../common/form";
import { usePermission } from "../../hooks/usePermission";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const SpecializationList = () => {
  const { can, isLoading: permLoading } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("specializations", "view");
  const canManage = can("specializations", "manage");

  // ==================== STATE ====================
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewId, setViewId] = useState(null);

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

  const { data, isLoading, isFetching, refetch } = useSpecializations(params, {
    enabled: canView,
  });
  const toggleStatus = useToggleSpecializationStatus();
  const deleteMutation = useDeleteSpecialization();

  const list = data?.list || [];
  const meta = data?.meta || {};

  // ==================== HANDLERS ====================
  const handleAdd = () => {
    if (!canManage) return;
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    if (!canManage) return;
    setEditData(item);
    setFormOpen(true);
  };

  const handleView = (id) => {
    if (!canView) return;
    setViewId(id);
  };

  const handleToggleClick = (item) => {
    if (!canManage) return;
    setConfirm({ open: true, type: "toggle", item });
  };

  const handleDeleteClick = (item) => {
    if (!canManage) return;
    setConfirm({ open: true, type: "delete", item });
  };

  const handleConfirm = () => {
    const { type, item } = confirm;
    if (!item) return;
    const mutation = type === "toggle" ? toggleStatus : deleteMutation;
    mutation.mutate(item.id, {
      onSettled: () => setConfirm({ open: false, type: null, item: null }),
    });
  };

  const handleCancel = () => {
    setConfirm({ open: false, type: null, item: null });
  };

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  // ==================== PAGE ACCESS GUARD ====================
  if (permLoading) {
    return <Loader text="Checking permissions..." />;
  }
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
          You do not have permission to view specializations. Please contact
          your administrator.
        </p>
      </div>
    );
  }

  const columns = [
    {
      header: "#",
      render: (_, __, idx) => <span className="text-ink-500">{idx + 1}</span>,
    },
    {
      header: "Name",
      accessor: "name",
      render: (value) => (
        <span className="font-medium text-ink-900">{value}</span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      render: (value) => (
        <span className="block max-w-md truncate text-ink-600">
          {value || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => <StatusBadge active={value} />,
    },
    {
      header: "Created At",
      accessor: "created_at",
      render: (value) => (
        <span className="text-ink-600">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {/* View permission */}
          {canView && (
            <IconBtn title="View" onClick={() => handleView(row.id)}>
              <FiEye className="h-4 w-4" />
            </IconBtn>
          )}

          {/* Manage permission */}
          {canManage && (
            <>
              <IconBtn title="Edit" onClick={() => handleEdit(row)}>
                <FiEdit2 className="h-4 w-4" />
              </IconBtn>

              <ActionToggle
                active={row.status}
                onClick={() => handleToggleClick(row)}
                loading={
                  toggleStatus.isPending && toggleStatus.variables === row.id
                }
              />

              <IconBtn
                title="Delete"
                onClick={() => handleDeleteClick(row)}
                danger
              >
                <FiTrash2 className="h-4 w-4" />
              </IconBtn>
            </>
          )}

          {!canView && !canManage && (
            <span className="text-xs text-ink-400">—</span>
          )}
        </div>
      ),
    },
  ];

  const confirmConfig =
    confirm.type === "delete"
      ? {
          title: "Delete Specialization",
          message: `Are you sure you want to delete "${confirm.item?.name}"? This action cannot be undone.`,
          confirmText: "Delete",
          variant: "danger",
        }
      : {
          title: confirm.item?.status
            ? "Deactivate Specialization"
            : "Activate Specialization",
          message: `Are you sure you want to ${
            confirm.item?.status ? "deactivate" : "activate"
          } "${confirm.item?.name}"?`,
          confirmText: confirm.item?.status ? "Deactivate" : "Activate",
          variant: "warn",
        };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Specializations
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage medical specializations
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleAdd}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" />
            Add Specialization
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search specialization..."
            value={search}
            maxLength={150}
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

      {isLoading ? (
        <Loader text="Loading specializations..." />
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
              ? "No specializations found for your search."
              : "No specializations found."
          }
        />
      )}

      {canManage && (
        <SpecializationForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditData(null);
          }}
          initialData={editData}
        />
      )}

      {canView && (
        <SpecializationView
          open={!!viewId}
          onClose={() => setViewId(null)}
          id={viewId}
        />
      )}

      {canManage && (
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
      )}
    </div>
  );
};

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

export default SpecializationList;
