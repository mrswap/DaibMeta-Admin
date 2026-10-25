// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiPlus,
//   FiEdit2,
//   FiTrash2,
//   FiSearch,
//   FiPackage,
//   FiEye,
//   FiImage,
// } from "react-icons/fi";
// import Loader from "../../common/Loader";
// import ConfirmModal from "../../common/ConfirmModal";
// import ToggleSwitch from "../../common/form/ToggleSwitch";
// import {
//   useHealthPackages,
//   useDeleteHealthPackage,
//   useToggleHealthPackageStatus,
// } from "../../queries/healthPackages";

// const HealthPackagesList = () => {
//   const navigate = useNavigate();
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [deleteId, setDeleteId] = useState(null);

//   // API Calls
//   const { data, isLoading } = useHealthPackages({ page, search });
//   const deleteMutation = useDeleteHealthPackage();
//   const toggleMutation = useToggleHealthPackageStatus();

//   const packages = data?.list || [];
//   const meta = data?.meta || {};

//   const handleToggle = (id, currentStatus) => {
//     toggleMutation.mutate({ id, is_active: !currentStatus });
//   };

//   const handleConfirmDelete = () => {
//     if (deleteId) {
//       deleteMutation.mutate(deleteId, {
//         onSettled: () => setDeleteId(null),
//       });
//     }
//   };

//   if (isLoading) return <Loader text="Loading packages..." />;

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="font-jakarta text-2xl font-bold text-ink-900">
//             Health Packages
//           </h1>
//           <p className="mt-1 text-sm text-ink-500">
//             Manage bundled health packages for patients
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/health-packages/new")}
//           className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
//         >
//           <FiPlus className="h-4 w-4" />
//           Add Package
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="rounded-card border border-ink-100 bg-surface p-4">
//         <div className="relative max-w-md">
//           <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             maxLength={150}
//             placeholder="Search packages..."
//             className="w-full rounded-lg border border-form-border bg-form-bg py-2.5 pl-10 pr-3 text-sm text-form-text placeholder:text-form-placeholder focus:border-form-border-focus focus:outline-none focus:ring-2 focus:ring-form-ring/20"
//           />
//         </div>
//       </div>

//       {/* Packages Grid */}
//       {packages.length === 0 ? (
//         <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
//             <FiPackage className="h-6 w-6 text-ink-400" />
//           </div>
//           <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
//             No packages found
//           </h3>
//           <p className="mt-1 text-sm text-ink-500">
//             {search
//               ? "Try adjusting your search."
//               : "Add your first health package to get started."}
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           {packages.map((pkg) => (
//             <div
//               key={pkg.id}
//               className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
//             >
//               {/* Image */}
//               <div className="relative h-40 w-full overflow-hidden bg-ink-50">
//                 {pkg.image ? (
//                   <img
//                     src={pkg.image}
//                     alt={pkg.name}
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center">
//                     <FiImage className="h-10 w-10 text-ink-300" />
//                   </div>
//                 )}
//                 <div className="absolute right-3 top-3">
//                   <ToggleSwitch
//                     isFormik={false}
//                     variant="pill"
//                     value={pkg.is_active}
//                     onChange={() => handleToggle(pkg.id, pkg.is_active)}
//                     loading={
//                       toggleMutation.isPending &&
//                       toggleMutation.variables?.id === pkg.id
//                     }
//                   />
//                 </div>
//               </div>

//               {/* Body */}
//               <div className="flex-1 p-5">
//                 <h3 className="font-jakarta text-base font-semibold text-ink-900 line-clamp-1">
//                   {pkg.name}
//                 </h3>
//                 <p className="mt-1 text-sm leading-relaxed text-ink-500 line-clamp-2">
//                   {pkg.description || "No description"}
//                 </p>

//                 <div className="mt-4 flex flex-wrap items-center gap-2">
//                   <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
//                     {pkg.services_count || 0} Services
//                   </span>
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-5 py-3">
//                 <button
//                   onClick={() => navigate(`/health-packages/${pkg.id}`)}
//                   className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
//                 >
//                   <FiEye className="h-4 w-4" />
//                   View
//                 </button>
//                 <div className="flex items-center gap-1">
//                   <button
//                     onClick={() => navigate(`/health-packages/${pkg.id}/edit`)}
//                     className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600"
//                     title="Edit package"
//                   >
//                     <FiEdit2 className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => setDeleteId(pkg.id)}
//                     className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-danger-600"
//                     title="Delete package"
//                   >
//                     <FiTrash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Pagination */}
//       {meta.last_page > 1 && (
//         <div className="flex justify-center gap-2 mt-6">
//           <button
//             disabled={page === 1}
//             onClick={() => setPage((p) => p - 1)}
//             className="px-4 py-2 border border-ink-200 rounded-lg text-sm disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2 text-sm text-ink-600">
//             Page {meta.current_page} of {meta.last_page}
//           </span>
//           <button
//             disabled={page === meta.last_page}
//             onClick={() => setPage((p) => p + 1)}
//             className="px-4 py-2 border border-ink-200 rounded-lg text-sm disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       <ConfirmModal
//         open={!!deleteId}
//         title="Delete Health Package"
//         message="Are you sure you want to delete this package? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="danger"
//         onConfirm={handleConfirmDelete}
//         onCancel={() => setDeleteId(null)}
//         loading={deleteMutation.isPending}
//       />
//     </div>
//   );
// };

// export default HealthPackagesList;

// src/features/patent/pages/healthPackages/HealthPackagesList.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiEye,
  FiImage,
} from "react-icons/fi";
import ConfirmModal from "../../common/ConfirmModal";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import { HEALTH_PACKAGES } from "./healthPackagesData";

const HealthPackagesList = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState(HEALTH_PACKAGES);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [packages, search]);

  const handleToggle = (id) => {
    setLoadingId(id);
    setTimeout(() => {
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)),
      );
      setLoadingId(null);
    }, 300);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setPackages((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Health Packages
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage bundled health packages for patients
          </p>
        </div>
        <button
          onClick={() => navigate("/health-packages/new")}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FiPlus className="h-4 w-4" />
          Add Package
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-card border border-ink-100 bg-surface p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={150}
            placeholder="Search packages..."
            className="w-full rounded-lg border border-form-border bg-form-bg py-2.5 pl-10 pr-3 text-sm text-form-text placeholder:text-form-placeholder focus:border-form-border-focus focus:outline-none focus:ring-2 focus:ring-form-ring/20"
          />
        </div>
      </div>

      {/* Packages Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-50">
            <FiPackage className="h-6 w-6 text-ink-400" />
          </div>
          <h3 className="mt-4 font-jakarta text-base font-semibold text-ink-900">
            No packages found
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            {search
              ? "Try adjusting your search."
              : "Add your first health package to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className="group flex flex-col overflow-hidden rounded-card border border-ink-100 bg-surface transition-all hover:border-brand-200 hover:shadow-sm"
            >
              {/* Image */}
              <div className="relative h-40 w-full overflow-hidden bg-ink-50">
                {pkg.image ? (
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FiImage className="h-10 w-10 text-ink-300" />
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <ToggleSwitch
                    isFormik={false}
                    variant="pill"
                    value={pkg.is_active}
                    onChange={() => handleToggle(pkg.id)}
                    loading={loadingId === pkg.id}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-5">
                <h3 className="font-jakarta text-base font-semibold text-ink-900">
                  {pkg.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {pkg.services.length} Services
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                    <span className="line-through opacity-60">₹{pkg.mrp}</span>
                    <span className="font-bold text-ink-900">₹{pkg.price}</span>
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-5 py-3">
                <button
                  onClick={() => navigate(`/health-packages/${pkg.id}`)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                >
                  <FiEye className="h-4 w-4" />
                  View
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/health-packages/${pkg.id}/edit`)}
                    className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-brand-600"
                    title="Edit package"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(pkg.id)}
                    className="cursor-pointer rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface hover:text-danger-600"
                    title="Delete package"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Health Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={false}
      />
    </div>
  );
};

export default HealthPackagesList;
