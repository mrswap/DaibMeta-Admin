// // src/features/patent/pages/cms/ClinicPrivileges/freeServices/FreeServicesList.jsx

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiPlus,
//   FiSearch,
//   FiRefreshCw,
//   FiEdit2,
//   FiTrash2,
//   FiEye,
//   FiCalendar,
// } from "react-icons/fi";

// import {
//   useFreeServices,
//   useDeleteFreeService,
//   useToggleFreeServiceStatus,
// } from "../../../../queries/clinicPrivileges";
// import Loader from "../../../../common/Loader";
// import ConfirmModal from "../../../../common/ConfirmModal";
// import CustomeTable from "../../../../common/table/CustomeTable";
// import { FilterSelect, ActionToggle } from "../../../../common/form";

// const STATUS_OPTIONS = [
//   { value: "1", label: "Active" },
//   { value: "0", label: "Inactive" },
// ];

// const FreeServicesList = () => {
//   const navigate = useNavigate();

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState(null);
//   const [page, setPage] = useState(1);
//   const [perPage] = useState(15);

//   const [confirm, setConfirm] = useState({
//     open: false,
//     type: null,
//     item: null,
//   });

//   const params = {
//     page,
//     per_page: perPage,
//     ...(search && { search }),
//     ...(statusFilter?.value && { status: statusFilter.value }),
//   };

//   const { data, isLoading, isFetching, refetch } = useFreeServices(params);
//   const toggleStatus = useToggleFreeServiceStatus();
//   const deleteMutation = useDeleteFreeService();

//   const list = data?.list || [];
//   const meta = data?.meta || {};

//   // Navigation (routes will be added in AdminRoutes.jsx)
//   const handleAdd = () =>
//     navigate("/cms/clinical-privileges/free-services/new");
//   const handleView = (row) =>
//     navigate(`/cms/clinical-privileges/free-services/${row.id}`);
//   const handleEdit = (row) =>
//     navigate(`/cms/clinical-privileges/free-services/${row.id}/edit`);

//   const handleToggleClick = (row) => {
//     setConfirm({ open: true, type: "toggle", item: row });
//   };

//   const handleDeleteClick = (row) => {
//     setConfirm({ open: true, type: "delete", item: row });
//   };

//   const handleConfirm = () => {
//     const { type, item } = confirm;
//     if (!item) return;

//     if (type === "toggle") {
//       toggleStatus.mutate(
//         { id: item.id, status: !item.status },
//         {
//           onSettled: () => setConfirm({ open: false, type: null, item: null }),
//         },
//       );
//     } else if (type === "delete") {
//       deleteMutation.mutate(item.id, {
//         onSettled: () => setConfirm({ open: false, type: null, item: null }),
//       });
//     }
//   };

//   const handleCancel = () => {
//     setConfirm({ open: false, type: null, item: null });
//   };

//   const currentPage = meta.current_page || 1;
//   const lastPage = meta.last_page || 1;
//   const total = meta.total || 0;
//   const metaPerPage = meta.per_page || perPage;

//   // ==================== COLUMNS ====================
//   const columns = [
//     {
//       header: "Service",
//       render: (_, row) => (
//         <div className="min-w-0">
//           <p className="truncate font-medium text-ink-900">
//             {row.title || "—"}
//           </p>
//           <p className="truncate text-[11px] text-ink-500">{row.slug || "—"}</p>
//         </div>
//       ),
//     },
//     {
//       header: "Appointment Type",
//       render: (_, row) => (
//         <span className="text-xs text-ink-700">
//           {row.appointment_type?.name || "—"}
//         </span>
//       ),
//     },
//     {
//       header: "Providers",
//       render: (_, row) => {
//         const providers = row.providers || [];
//         if (providers.length === 0) {
//           return <span className="text-xs text-ink-400">—</span>;
//         }
//         return (
//           <div className="flex flex-col gap-0.5">
//             {providers.slice(0, 2).map((p, idx) => (
//               <span key={idx} className="truncate text-xs text-ink-700">
//                 {p.provider?.name || p.name || "—"}
//               </span>
//             ))}
//             {providers.length > 2 && (
//               <span className="text-[10px] text-ink-500">
//                 +{providers.length - 2} more
//               </span>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       header: "Status",
//       render: (_, row) => <StatusBadge active={row.status} />,
//     },
//     {
//       header: "Created At",
//       render: (_, row) => (
//         <span className="text-xs text-ink-600">
//           {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
//         </span>
//       ),
//     },
//     {
//       header: "Actions",
//       align: "right",
//       render: (_, row) => (
//         <div className="flex items-center justify-end gap-1">
//           <IconBtn title="View" onClick={() => handleView(row)}>
//             <FiEye className="h-4 w-4" />
//           </IconBtn>
//           <IconBtn title="Edit" onClick={() => handleEdit(row)}>
//             <FiEdit2 className="h-4 w-4" />
//           </IconBtn>
//           <ActionToggle
//             active={row.status}
//             onClick={() => handleToggleClick(row)}
//             loading={
//               toggleStatus.isPending && toggleStatus.variables?.id === row.id
//             }
//           />
//           <IconBtn title="Delete" onClick={() => handleDeleteClick(row)} danger>
//             <FiTrash2 className="h-4 w-4" />
//           </IconBtn>
//         </div>
//       ),
//     },
//   ];

//   const confirmConfig =
//     confirm.type === "delete"
//       ? {
//           title: "Delete Free Service",
//           message: `Are you sure you want to delete "${confirm.item?.title}"? This action cannot be undone.`,
//           confirmText: "Delete",
//           variant: "danger",
//         }
//       : {
//           title: confirm.item?.status
//             ? "Deactivate Free Service"
//             : "Activate Free Service",
//           message: `Are you sure you want to ${
//             confirm.item?.status ? "deactivate" : "activate"
//           } "${confirm.item?.title}"?`,
//           confirmText: confirm.item?.status ? "Deactivate" : "Activate",
//           variant: "warn",
//         };

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div className="min-w-0">
//           <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
//             Free Services
//           </h1>
//           <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
//             Manage free healthcare services offered by the clinic
//           </p>
//         </div>
//         <button
//           onClick={handleAdd}
//           className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700 sm:w-auto"
//         >
//           <FiPlus className="h-4 w-4" />
//           Add Free Service
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-surface p-4 lg:flex-row lg:items-center">
//         <div className="flex flex-1 items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3">
//           <FiSearch className="h-4 w-4 text-ink-400" />
//           <input
//             type="text"
//             placeholder="Search by service title..."
//             value={search}
//             maxLength={150}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
//           />
//         </div>

//         <FilterSelect
//           value={statusFilter}
//           onChange={(v) => {
//             setStatusFilter(v);
//             setPage(1);
//           }}
//           options={STATUS_OPTIONS}
//           placeholder="All Status"
//           isClearable
//           width="w-40"
//         />

//         <button
//           onClick={() => refetch()}
//           className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
//         >
//           <FiRefreshCw
//             className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
//           />
//           Refresh
//         </button>
//       </div>

//       {/* Content */}
//       {isLoading ? (
//         <Loader text="Loading free services..." />
//       ) : (
//         <CustomeTable
//           columns={columns}
//           data={list}
//           serverSide
//           currentPage={currentPage}
//           totalPages={lastPage}
//           totalItems={total}
//           itemsPerPage={metaPerPage}
//           onPageChange={(p) => setPage(p)}
//           emptyText={
//             search || statusFilter
//               ? "No free services found for your filters."
//               : "No free services found."
//           }
//         />
//       )}

//       {/* Confirm Modal */}
//       <ConfirmModal
//         open={confirm.open}
//         title={confirmConfig.title}
//         message={confirmConfig.message}
//         confirmText={confirmConfig.confirmText}
//         variant={confirmConfig.variant}
//         onConfirm={handleConfirm}
//         onCancel={handleCancel}
//         loading={toggleStatus.isPending || deleteMutation.isPending}
//       />
//     </div>
//   );
// };

// const StatusBadge = ({ active }) => (
//   <span
//     className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
//       active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
//     }`}
//   >
//     {active ? "Active" : "Inactive"}
//   </span>
// );

// const IconBtn = ({ children, title, onClick, disabled, danger }) => (
//   <button
//     type="button"
//     title={title}
//     onClick={onClick}
//     disabled={disabled}
//     className={`cursor-pointer rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
//       danger
//         ? "text-danger-500 hover:bg-danger-50"
//         : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
//     }`}
//   >
//     {children}
//   </button>
// );

// export default FreeServicesList;
