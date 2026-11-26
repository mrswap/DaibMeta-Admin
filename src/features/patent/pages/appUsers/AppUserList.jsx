// src/features/patent/pages/appUsers/AppUserList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiGrid,
  FiList,
  FiLock,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import {
  useAppUsers,
  useDeletePatient,
  useTogglePatientStatus,
} from "../../queries/patients";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, ActionToggle } from "../../common/form";
import { usePermission } from "../../hooks/usePermission";
import { PatientAvatar } from "../patients/PatientList";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const AppUserList = () => {
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canView = can("patients", "view");
  const canManage = can("patients", "manage");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [viewMode, setViewMode] = useState("grid");

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

  // List API (App Users specific)
  const { data, isLoading, isFetching, refetch } = useAppUsers(params, {
    enabled: canView,
  });

  // Use Patients mutations (same endpoints as PatientList)
  const toggleStatus = useTogglePatientStatus();
  const deleteMutation = useDeletePatient();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleView = (itemOrId) => {
    if (!canView) return;
    const id = typeof itemOrId === "object" ? itemOrId.id : itemOrId;
    navigate(`/app-users/${id}`);
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
    // ✅ sirf id bhejo — mutation id expect karta hai
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

  if (permLoading && !canView) return <Loader text="Checking permissions..." />;
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
          You do not have permission to view app users.
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
      header: "Patient ID",
      accessor: "patient_id",
      render: (v) => (
        <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">
          {v || "—"}
        </code>
      ),
    },
    {
      header: "Name",
      accessor: "name",
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <PatientAvatar name={v} image={row.image} size="sm" />
          <p className="font-medium text-ink-900">{v}</p>
        </div>
      ),
    },
    {
      header: "Mobile",
      accessor: "mobile",
      render: (v) => <span className="text-ink-700">{v}</span>,
    },
    {
      header: "Age",
      accessor: "age",
      render: (v) => <span className="text-ink-700">{v ?? "—"}</span>,
    },
    {
      header: "Gender",
      accessor: "sex",
      render: (v) => (
        <span className="text-ink-700">
          {v ? v.charAt(0).toUpperCase() + v.slice(1) : "—"}
        </span>
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

          {canManage && (
            <>
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
        </div>
      ),
    },
  ];

  const confirmConfig =
    confirm.type === "delete"
      ? {
          title: "Delete App User",
          message: `Are you sure you want to delete "${confirm.item?.name}"? This action cannot be undone.`,
          confirmText: "Delete",
          variant: "danger",
        }
      : {
          title: confirm.item?.status
            ? "Deactivate App User"
            : "Activate App User",
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
            App Users
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage app registered patients
            {total > 0 && ` · ${total} total`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name, patient ID, mobile, email..."
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
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          <span className="sm:hidden lg:inline">Refresh</span>
        </button>

        <div className="flex items-center rounded-lg border border-ink-200 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`cursor-pointer rounded-md p-1.5 transition ${
              viewMode === "grid"
                ? "bg-brand-50 text-brand-700"
                : "text-ink-500 hover:bg-ink-50"
            }`}
          >
            <FiGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`cursor-pointer rounded-md p-1.5 transition ${
              viewMode === "table"
                ? "bg-brand-50 text-brand-700"
                : "text-ink-500 hover:bg-ink-50"
            }`}
          >
            <FiList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader text="Loading app users..." />
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 bg-surface py-16 text-center">
          <p className="text-sm font-medium text-ink-700">
            {search ? "No app users found" : "No app users yet"}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {search
              ? "Try a different search term or clear filters."
              : "No app users have registered yet."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((user) => (
              <AppUserCard
                key={user.id}
                user={user}
                onView={handleView}
                onToggle={handleToggleClick}
                onDelete={handleDeleteClick}
                canManage={canManage}
                toggleLoading={
                  toggleStatus.isPending && toggleStatus.variables === user.id
                }
              />
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-ink-100 bg-surface px-4 py-3 sm:flex-row">
              <p className="text-xs text-ink-500">
                Showing {(currentPage - 1) * metaPerPage + 1}–
                {Math.min(currentPage * metaPerPage, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <PageBtn
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </PageBtn>
                <span className="px-3 text-xs text-ink-600">
                  Page {currentPage} of {lastPage}
                </span>
                <PageBtn
                  disabled={currentPage >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </PageBtn>
              </div>
            </div>
          )}
        </>
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
              ? "No app users found for your search."
              : "No app users found."
          }
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

const AppUserCard = ({
  user,
  onView,
  onToggle,
  onDelete,
  canManage,
  toggleLoading,
}) => {
  const sexLabel = user.sex
    ? user.sex.charAt(0).toUpperCase() + user.sex.slice(1)
    : "—";

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface transition hover:border-ink-200 hover:shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <PatientAvatar name={user.name} image={user.image} size="md" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">
            {user.name}
          </p>
          <code className="mt-0.5 inline-block rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
            {user.patient_id || "—"}
          </code>
        </div>

        <span
          className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${
            user.status ? "bg-brand-500" : "bg-ink-300"
          }`}
        />
      </div>

      <div className="space-y-2 border-t border-ink-100 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-ink-600">
          <FiPhone className="h-3 w-3 shrink-0 text-ink-400" />
          <span className="truncate">{user.mobile || "—"}</span>
        </div>

        <div className="flex items-center gap-2 text-ink-600">
          <FiUser className="h-3 w-3 shrink-0 text-ink-400" />
          <span className="truncate">
            {sexLabel}
            {user.age ? ` · ${user.age} yrs` : ""}
          </span>
        </div>
      </div>

      <div className="flex min-h-[38px] items-center justify-between border-t border-ink-100 bg-ink-50/30 px-2 py-1.5">
        <div className="flex gap-0.5">
          <IconBtn title="View" onClick={() => onView(user)}>
            <FiEye className="h-3.5 w-3.5" />
          </IconBtn>
        </div>

        {canManage ? (
          <div className="flex gap-0.5">
            <ActionToggle
              active={user.status}
              onClick={() => onToggle(user)}
              loading={toggleLoading}
            />
            <IconBtn title="Delete" onClick={() => onDelete(user)} danger>
              <FiTrash2 className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        ) : (
          <span className="pr-1 text-xs text-ink-400">—</span>
        )}
      </div>
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

const IconBtn = ({ children, title, onClick, danger }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`cursor-pointer rounded-lg p-1.5 transition ${
      danger
        ? "text-danger-500 hover:bg-danger-50"
        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
    }`}
  >
    {children}
  </button>
);

const PageBtn = ({ children, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="cursor-pointer rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 disabled:hover:border-ink-200 disabled:hover:text-ink-400"
  >
    {children}
  </button>
);

export default AppUserList;
