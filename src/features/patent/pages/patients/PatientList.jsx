import { useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiGrid,
  FiList,
} from "react-icons/fi";
import {
  usePatients,
  useTogglePatientStatus,
  useDeletePatient,
} from "../../queries/patients";
import PatientForm from "./components/PatientForm";
import PatientView from "./components/PatientView";
import PatientCard from "./components/PatientCard";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import CustomeTable from "../../common/table/CustomeTable";
import { FilterSelect, ActionToggle } from "../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const PatientList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [viewMode, setViewMode] = useState("grid");

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

  const { data, isLoading, isFetching, refetch } = usePatients(params);
  const toggleStatus = useTogglePatientStatus();
  const deleteMutation = useDeletePatient();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setFormOpen(true);
  };

  const handleView = (itemOrId) => {
    const id = typeof itemOrId === "object" ? itemOrId.id : itemOrId;
    setViewId(id);
  };

  const handleToggleClick = (item) => {
    setConfirm({ open: true, type: "toggle", item });
  };

  const handleDeleteClick = (item) => {
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-surface">
            {v
              ?.split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-ink-900">{v}</p>
            {row.linked_primary_patient_id && (
              <p className="text-[10px] text-ink-500">
                Family of {row.primary_patient?.name}
              </p>
            )}
          </div>
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
      header: "Relation",
      render: (_, row) =>
        row.linked_primary_patient_id ? (
          <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
            {row.relation_type?.label || "Family"}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            Primary
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
          title: "Delete Patient",
          message: `Are you sure you want to delete "${confirm.item?.name}"? This action cannot be undone.`,
          confirmText: "Delete",
          variant: "danger",
        }
      : {
          title: confirm.item?.status
            ? "Deactivate Patient"
            : "Activate Patient",
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
            Patients
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage patient profiles and family members
            {total > 0 && ` · ${total} total`}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Patient
        </button>
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
            title="Grid view"
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
            title="Table view"
          >
            <FiList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader text="Loading patients..." />
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 bg-surface py-16 text-center">
          <p className="text-sm font-medium text-ink-700">
            {search ? "No patients found" : "No patients yet"}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {search
              ? "Try a different search term or clear filters."
              : "Add your first patient to get started."}
          </p>
          {!search && (
            <button
              onClick={handleAdd}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
            >
              <FiPlus className="h-4 w-4" />
              Add Patient
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onView={handleView}
                onEdit={handleEdit}
                onToggle={handleToggleClick}
                onDelete={handleDeleteClick}
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
            search ? "No patients found for your search." : "No patients found."
          }
        />
      )}

      <PatientForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        initialData={editData}
      />
      <PatientView
        open={!!viewId}
        onClose={() => setViewId(null)}
        id={viewId}
        onEdit={handleEdit}
      />

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

export default PatientList;
