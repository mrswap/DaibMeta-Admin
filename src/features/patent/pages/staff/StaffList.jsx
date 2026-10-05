import { useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import {
  useStaff,
  useToggleStaffStatus,
  useDeleteStaff,
} from "../../queries/staff";
import { useRoles } from "../../queries/roles";
import StaffForm from "./components/StaffForm";
import StaffView from "./components/StaffView";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect } from "../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const SUPER_ADMIN_OPTIONS = [
  { value: "1", label: "Super Admin" },
  { value: "0", label: "Regular Staff" },
];

const StaffList = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [superAdminFilter, setSuperAdminFilter] = useState(null);
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

  const { data: rolesData } = useRoles({ per_page: 100 });
  const roles = rolesData?.list || [];

  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: r.label,
  }));

  const params = {
    page,
    per_page: perPage,
    ...(search && { search }),
    ...(roleFilter?.value && { role_id: roleFilter.value }),
    ...(statusFilter?.value && { status: statusFilter.value }),
    ...(superAdminFilter?.value && { is_super_admin: superAdminFilter.value }),
  };

  const { data, isLoading, isFetching, refetch } = useStaff(params);
  const toggleStatus = useToggleStaffStatus();
  const deleteMutation = useDeleteStaff();

  const list = data?.list || [];
  const meta = data?.meta || {};

  // ---------- Handlers ----------
  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setFormOpen(true);
  };

  const handleView = (id) => setViewId(id);

  const handleToggleClick = (item) => {
    if (item.is_super_admin) return;
    setConfirm({ open: true, type: "toggle", item });
  };

  const handleDeleteClick = (item) => {
    if (item.is_super_admin) return;
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

  const handleSearchChange = (v) => {
    setSearch(v);
    setPage(1);
  };

  const handleRoleChange = (val) => {
    setRoleFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSuperAdminChange = (val) => {
    setSuperAdminFilter(val);
    setPage(1);
  };

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Render specializations badges (max 2 visible + count)
  const renderSpecializations = (specializations) => {
    if (!specializations || specializations.length === 0) {
      return <span className="text-ink-400">—</span>;
    }
    const visible = specializations.slice(0, 2);
    const remaining = specializations.length - 2;
    return (
      <div className="flex flex-wrap items-center gap-1">
        {visible.map((s) => (
          <span
            key={s.id}
            className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
          >
            {s.name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">
            +{remaining}
          </span>
        )}
      </div>
    );
  };

  const columns = [
    {
      header: "#",
      render: (_, __, idx) => <span className="text-ink-500">{idx + 1}</span>,
    },
    {
      header: "Name",
      accessor: "name",
      render: (value, row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
            {getInitials(value)}
          </div>
          <div>
            <p className="font-medium text-ink-900">{value}</p>
            {row.is_super_admin && (
              <span className="inline-flex rounded-full bg-warn-100 px-1.5 py-0.5 text-[10px] font-medium text-warn-900">
                Super Admin
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (value) => <span className="text-ink-700">{value}</span>,
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (value) => <span className="text-ink-600">{value || "—"}</span>,
    },
    {
      header: "Role",
      render: (_, row) =>
        row.role ? (
          <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
            {row.role.label || row.role.name}
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      header: "Specializations",
      render: (_, row) => renderSpecializations(row.specializations),
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
          <IconBtn title="View" onClick={() => handleView(row.id)}>
            <FiEye className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="Edit" onClick={() => handleEdit(row)}>
            <FiEdit2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            title={
              row.is_super_admin
                ? "Super Admin status protected"
                : row.status
                  ? "Deactivate"
                  : "Activate"
            }
            onClick={() => handleToggleClick(row)}
            disabled={row.is_super_admin}
          >
            {row.status ? (
              <FiToggleRight className="h-4 w-4" />
            ) : (
              <FiToggleLeft className="h-4 w-4" />
            )}
          </IconBtn>
          <IconBtn
            title={
              row.is_super_admin ? "Super Admin cannot be deleted" : "Delete"
            }
            onClick={() => handleDeleteClick(row)}
            disabled={row.is_super_admin}
            danger
          >
            <FiTrash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ),
    },
  ];

  const confirmConfig =
    confirm.type === "delete"
      ? {
          title: "Delete Staff Member",
          message: `Are you sure you want to delete "${confirm.item?.name}"? This action cannot be undone.`,
          confirmText: "Delete",
          variant: "danger",
        }
      : {
          title: confirm.item?.status
            ? "Deactivate Staff Member"
            : "Activate Staff Member",
          message: `Are you sure you want to ${
            confirm.item?.status ? "deactivate" : "activate"
          } "${confirm.item?.name}"?`,
          confirmText: confirm.item?.status ? "Deactivate" : "Activate",
          variant: "warn",
        };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Staff
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage admin panel staff members
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>

        <FilterSelect
          value={roleFilter}
          onChange={handleRoleChange}
          options={roleOptions}
          placeholder="All Roles"
          isClearable
          width="w-48"
        />

        <FilterSelect
          value={statusFilter}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          placeholder="All Status"
          isClearable
          width="w-40"
        />

        <FilterSelect
          value={superAdminFilter}
          onChange={handleSuperAdminChange}
          options={SUPER_ADMIN_OPTIONS}
          placeholder="All Types"
          isClearable
          width="w-44"
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
        <Loader text="Loading staff..." />
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
            search ? "No staff found for your search." : "No staff found."
          }
        />
      )}

      {/* Modals */}
      <StaffForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />
      <StaffView open={!!viewId} onClose={() => setViewId(null)} id={viewId} />

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

export default StaffList;
