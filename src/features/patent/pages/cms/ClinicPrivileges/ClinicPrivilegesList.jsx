// // src/features/patent/pages/cms/ClinicPrivileges/ClinicPrivilegesList.jsx

// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiShield,
//   FiSearch,
//   FiMail,
//   FiPhone,
//   FiClock,
//   FiUser,
//   FiChevronRight,
// } from "react-icons/fi";

// import Loader from "../../../common/Loader";
// import {
//   useClinicPrivilegeProviders,
//   useClinicPrivilegeProviderDetails,
// } from "../../../queries/clinicPrivileges";

// // ---------------------------------------------------------------
// // Status Badge
// // ---------------------------------------------------------------
// const StatusBadge = ({ status, label }) => {
//   const active = !!status;
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
//         active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
//       }`}
//     >
//       <span
//         className={`h-1.5 w-1.5 rounded-full ${
//           active ? "bg-brand-600" : "bg-ink-400"
//         }`}
//       />
//       {label || (active ? "Active" : "Inactive")}
//     </span>
//   );
// };

// // ---------------------------------------------------------------
// // Single Provider Card
// // ---------------------------------------------------------------
// const ProviderCard = ({ provider, onManage }) => {
//   const { data, isLoading, isError } = useClinicPrivilegeProviderDetails(
//     provider?.id,
//   );

//   const details = data || {};
//   const providerInfo = details.provider || provider || {};
//   const role = details.role || provider?.role || null;
//   const appointmentType = details.appointment_type || null;

//   if (isLoading) {
//     return (
//       <div className="flex h-64 items-center justify-center rounded-card border border-ink-100 bg-surface">
//         <Loader />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="rounded-card border border-danger-100 bg-danger-50 p-4 text-sm text-danger-600">
//         Failed to load provider details.
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col rounded-card border border-ink-100 bg-surface p-4 transition-shadow hover:shadow-sm">
//       {/* Top row: avatar + name + status */}
//       <div className="flex items-start gap-3">
//         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-ink-100 bg-brand-50 text-brand-600">
//           <FiUser className="h-5 w-5" />
//         </div>
//         <div className="min-w-0 flex-1">
//           <div className="flex items-start justify-between gap-2">
//             <h3 className="truncate text-sm font-semibold text-ink-900">
//               {providerInfo.name || "—"}
//             </h3>
//             <StatusBadge
//               status={providerInfo.status}
//               label={providerInfo.status_label}
//             />
//           </div>
//           {role?.label && (
//             <p className="mt-0.5 truncate text-xs text-ink-500">{role.label}</p>
//           )}
//         </div>
//       </div>

//       {/* Contact info */}
//       <div className="mt-3 space-y-1.5 text-xs text-ink-600">
//         {providerInfo.email && (
//           <div className="flex items-center gap-2">
//             <FiMail className="h-3.5 w-3.5 shrink-0 text-ink-400" />
//             <span className="truncate">{providerInfo.email}</span>
//           </div>
//         )}
//         {providerInfo.phone && (
//           <div className="flex items-center gap-2">
//             <FiPhone className="h-3.5 w-3.5 shrink-0 text-ink-400" />
//             <span className="truncate">{providerInfo.phone}</span>
//           </div>
//         )}
//       </div>

//       {/* Appointment Type */}
//       <div className="mt-3 rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2">
//         <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
//           Appointment Type
//         </p>
//         {appointmentType ? (
//           <div className="mt-1">
//             <p className="truncate text-xs font-medium text-ink-800">
//               {appointmentType.name}
//             </p>
//             <div className="mt-1 flex items-center gap-3 text-[11px] text-ink-500">
//               <span className="inline-flex items-center gap-1">
//                 <FiClock className="h-3 w-3" />
//                 {appointmentType.duration} min
//               </span>
//               <span>Capacity: {appointmentType.capacity}</span>
//             </div>
//           </div>
//         ) : (
//           <p className="mt-1 text-xs text-ink-500">Not configured</p>
//         )}
//       </div>

//       {/* Action */}
//       <div className="mt-4 flex justify-end">
//         <button
//           type="button"
//           onClick={() => onManage(provider)}
//           className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
//         >
//           Manage Privileges
//           <FiChevronRight className="h-3.5 w-3.5" />
//         </button>
//       </div>
//     </div>
//   );
// };

// // ---------------------------------------------------------------
// // Main Page
// // ---------------------------------------------------------------
// const ClinicPrivilegesList = () => {
//   const navigate = useNavigate();
//   const [search, setSearch] = useState("");

//   const { data, isLoading, isError } = useClinicPrivilegeProviders({
//     per_page: 100,
//     status: 1,
//   });

//   const providers = data?.list ?? [];

//   const filteredProviders = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return providers;
//     return providers.filter((p) => {
//       const name = (p.name || "").toLowerCase();
//       const email = (p.email || "").toLowerCase();
//       const phone = (p.phone || "").toLowerCase();
//       const roleLabel = (p.role?.label || "").toLowerCase();
//       return (
//         name.includes(q) ||
//         email.includes(q) ||
//         phone.includes(q) ||
//         roleLabel.includes(q)
//       );
//     });
//   }, [providers, search]);

//   const handleManage = (provider) => {
//     if (!provider?.id) return;
//     navigate(`/cms/clinical-privileges/${provider.id}`);
//   };

//   return (
//     <div className="flex h-full flex-col">
//       {/* Page Header */}
//       <div className="sticky top-0 z-10 border-b border-ink-100 bg-surface px-4 py-4 sm:px-6">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
//               <FiShield className="h-5 w-5" />
//             </div>
//             <div>
//               <h1 className="text-lg font-semibold text-ink-900">
//                 Clinical Privileges
//               </h1>
//               <p className="text-xs text-ink-500">
//                 Manage clinical privileges for each provider.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters — raw input (no Formik context) */}
//       <div className="border-b border-ink-100 bg-surface px-4 py-3 sm:px-6">
//         <div className="flex w-full items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3 sm:max-w-sm">
//           <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
//           <input
//             type="text"
//             value={search}
//             maxLength={150}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search..."
//             className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
//           />
//         </div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 overflow-auto px-4 py-4 sm:px-6">
//         {isLoading ? (
//           <div className="flex h-64 items-center justify-center">
//             <Loader />
//           </div>
//         ) : isError ? (
//           <div className="rounded-card border border-danger-100 bg-danger-50 p-4 text-sm text-danger-600">
//             Failed to load providers. Please try again.
//           </div>
//         ) : filteredProviders.length === 0 ? (
//           <div className="rounded-card border border-ink-100 bg-surface p-12 text-center">
//             <FiShield className="mx-auto h-8 w-8 text-ink-300" />
//             <p className="mt-3 text-sm font-medium text-ink-700">
//               No providers found
//             </p>
//             <p className="mt-1 text-xs text-ink-500">
//               Try changing your search or filters.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {filteredProviders.map((provider) => (
//               <ProviderCard
//                 key={provider.id}
//                 provider={provider}
//                 onManage={handleManage}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClinicPrivilegesList;

// src/features/patent/pages/cms/ClinicPrivileges/ClinicPrivilegesList.jsx
// src/features/patent/pages/cms/ClinicPrivileges/ClinicPrivilegesList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi";

import {
  useFreeServices,
  useDeleteFreeService,
  useToggleFreeServiceStatus,
} from "../../../queries/clinicPrivileges";
import Loader from "../../../common/Loader";
import ConfirmModal from "../../../common/ConfirmModal";
import CustomeTable from "../../../common/table/CustomeTable";
import { FilterSelect, ActionToggle } from "../../../common/form";

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const ClinicPrivilegesList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);

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

  const { data, isLoading, isFetching, refetch } = useFreeServices(params);
  const toggleStatus = useToggleFreeServiceStatus();
  const deleteMutation = useDeleteFreeService();

  const list = data?.list || [];
  const meta = data?.meta || {};

  const handleAdd = () => navigate("/cms/clinical-privileges/new");
  const handleView = (row) => navigate(`/cms/clinical-privileges/${row.id}`);
  const handleEdit = (row) =>
    navigate(`/cms/clinical-privileges/${row.id}/edit`);

  const handleToggleClick = (row) => {
    setConfirm({ open: true, type: "toggle", item: row });
  };

  const handleDeleteClick = (row) => {
    setConfirm({ open: true, type: "delete", item: row });
  };

  const handleConfirm = () => {
    const { type, item } = confirm;
    if (!item) return;

    if (type === "toggle") {
      toggleStatus.mutate(
        { id: item.id, status: !item.status },
        {
          onSettled: () => setConfirm({ open: false, type: null, item: null }),
        },
      );
    } else if (type === "delete") {
      deleteMutation.mutate(item.id, {
        onSettled: () => setConfirm({ open: false, type: null, item: null }),
      });
    }
  };

  const handleCancel = () => {
    setConfirm({ open: false, type: null, item: null });
  };

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const total = meta.total || 0;
  const metaPerPage = meta.per_page || perPage;

  // ==================== COLUMNS ====================
  const columns = [
    {
      header: "Privilege",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">
            {row.title || "—"}
          </p>
          <p className="truncate text-[11px] text-ink-500">{row.slug || "—"}</p>
        </div>
      ),
    },
    {
      header: "Appointment Type",
      render: (_, row) => (
        <span className="text-xs text-ink-700">
          {row.appointment_type?.name || "—"}
        </span>
      ),
    },
    {
      header: "Providers",
      render: (_, row) => {
        const providers = row.providers || [];
        if (providers.length === 0) {
          return <span className="text-xs text-ink-400">—</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            {providers.slice(0, 2).map((p, idx) => (
              <span key={idx} className="truncate text-xs text-ink-700">
                {p.provider?.name || p.name || "—"}
              </span>
            ))}
            {providers.length > 2 && (
              <span className="text-[10px] text-ink-500">
                +{providers.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      render: (_, row) => <StatusBadge active={row.status} />,
    },
    {
      header: "Created At",
      render: (_, row) => (
        <span className="text-xs text-ink-600">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
        </span>
      ),
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
          <ActionToggle
            active={row.status}
            onClick={() => handleToggleClick(row)}
            loading={
              toggleStatus.isPending && toggleStatus.variables?.id === row.id
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
          title: "Delete Clinical Privilege",
          message: `Are you sure you want to delete "${confirm.item?.title}"? This action cannot be undone.`,
          confirmText: "Delete",
          variant: "danger",
        }
      : {
          title: confirm.item?.status
            ? "Deactivate Clinical Privilege"
            : "Activate Clinical Privilege",
          message: `Are you sure you want to ${
            confirm.item?.status ? "deactivate" : "activate"
          } "${confirm.item?.title}"?`,
          confirmText: confirm.item?.status ? "Deactivate" : "Activate",
          variant: "warn",
        };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Clinical Privileges
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Manage clinical privileges offered by the clinic
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Add Clinical Privilege
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
          <FiSearch className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search by privilege title..."
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
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <Loader text="Loading clinical privileges..." />
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
            search || statusFilter
              ? "No clinical privileges found for your filters."
              : "No clinical privileges found."
          }
        />
      )}

      {/* Confirm Modal */}
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

export default ClinicPrivilegesList;
