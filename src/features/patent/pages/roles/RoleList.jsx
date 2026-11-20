// src/features/patent/pages/roles/RoleList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  useRoles,
  useToggleRoleStatus,
  useDeleteRole,
} from "../../queries/roles";
import RoleForm from "./components/RoleForm";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, ActionToggle } from "../../common/form";
import { usePermission } from "../../hooks/usePermission";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const TYPE_OPTIONS = [
  { value: "1", label: "System" },
  { value: "0", label: "Custom" },
];

const PROVIDER_OPTIONS = [
  { value: "1", label: "Providers" },
  { value: "0", label: "Non-Providers" },
];

const RoleList = () => {
  const navigate = useNavigate();
  const { can } = usePermission();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [systemFilter, setSystemFilter] = useState(null);
  const [providerFilter, setProviderFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    item: null,
  });

  // ==================== PERMISSIONS ====================
  const canView = can("roles", "view");
  const canManage = can("roles", "manage");

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(statusFilter?.value && { status: statusFilter.value }),
    ...(systemFilter?.value && { is_system: systemFilter.value }),
    ...(providerFilter?.value && { is_provider: providerFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } = useRoles(params, {
    enabled: canView,
  });
  const toggleStatus = useToggleRoleStatus();
  const deleteMutation = useDeleteRole();

  const list = data?.list || [];
  const meta = data?.meta || {};

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
    navigate(`/roles/${id}`);
  };

  const handleToggleClick = (item) => {
    if (!canManage || item.is_system) return;
    setConfirm({ open: true, type: "toggle", item });
  };

  const handleDeleteClick = (item) => {
    if (!canManage || item.is_system) return;
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

  const columns = [
    {
      header: "#",
      render: (_, __, idx) => <span className="text-ink-500">{idx + 1}</span>,
    },
    {
      header: "Name",
      accessor: "name",
      render: (value) => (
        <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs text-ink-700">
          {value}
        </code>
      ),
    },
    {
      header: "Label",
      accessor: "label",
      render: (value) => (
        <span className="font-medium text-ink-900">{value}</span>
      ),
    },
    {
      header: "Type",
      accessor: "is_system",
      render: (value) =>
        value ? (
          <span className="inline-flex rounded-full bg-warn-100 px-2.5 py-0.5 text-xs font-medium text-warn-900">
            System
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600">
            Custom
          </span>
        ),
    },
    {
      header: "Provider",
      accessor: "is_provider",
      render: (value) =>
        value ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            Yes
          </span>
        ) : (
          <span className="text-xs text-ink-400">No</span>
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
          {canView && (
            <IconBtn title="View" onClick={() => handleView(row.id)}>
              <FiEye className="h-4 w-4" />
            </IconBtn>
          )}

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
                disabled={row.is_system}
              />

              <IconBtn
                title={
                  row.is_system ? "System role cannot be deleted" : "Delete"
                }
                onClick={() => handleDeleteClick(row)}
                disabled={row.is_system}
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
          title: "Delete Role",
          message: `Are you sure you want to delete "${confirm.item?.label}"? This action cannot be undone.`,
          confirmText: "Delete",
          variant: "danger",
        }
      : {
          title: confirm.item?.status ? "Deactivate Role" : "Activate Role",
          message: `Are you sure you want to ${
            confirm.item?.status ? "deactivate" : "activate"
          } "${confirm.item?.label}"?`,
          confirmText: confirm.item?.status ? "Deactivate" : "Activate",
          variant: "warn",
        };

  // ==================== PAGE ACCESS GUARD ====================
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
          You do not have permission to view roles. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Roles
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage admin panel roles and permissions
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleAdd}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" />
            Add Role
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex w-full lg:w-auto lg:flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search roles..."
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
          width="w-36"
        />

        <FilterSelect
          value={systemFilter}
          onChange={(v) => {
            setSystemFilter(v);
            setPage(1);
          }}
          options={TYPE_OPTIONS}
          placeholder="All Types"
          isClearable
          width="w-40"
        />

        <FilterSelect
          value={providerFilter}
          onChange={(v) => {
            setProviderFilter(v);
            setPage(1);
          }}
          options={PROVIDER_OPTIONS}
          placeholder="All Providers"
          isClearable
          width="w-48"
        />

        <button
          onClick={() => refetch()}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <Loader text="Loading roles..." />
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
            search ? "No roles found for your search." : "No roles found."
          }
        />
      )}

      {canManage && (
        <RoleForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditData(null);
          }}
          initialData={editData}
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

export default RoleList;
