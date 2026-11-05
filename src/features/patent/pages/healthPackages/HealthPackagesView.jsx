// // src/features/patent/pages/healthPackages/HealthPackagesView.jsx

// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiEdit2,
//   FiTrash2,
//   FiImage,
//   FiActivity,
//   FiChevronDown,
//   FiChevronUp,
// } from "react-icons/fi";
// import Loader from "../../common/Loader";
// import ConfirmModal from "../../common/ConfirmModal";
// import {
//   useHealthPackage,
//   useDeleteHealthPackage,
// } from "../../queries/healthPackages";

// const HealthPackagesView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [expandedService, setExpandedService] = useState(null);

//   const { data: pkg, isLoading } = useHealthPackage(id);
//   const deleteMutation = useDeleteHealthPackage();

//   const handleConfirmDelete = () => {
//     deleteMutation.mutate(id, {
//       onSuccess: () => navigate("/health-packages"),
//     });
//   };

//   const toggleExpand = (serviceId) => {
//     setExpandedService((prev) => (prev === serviceId ? null : serviceId));
//   };

//   if (isLoading) return <Loader text="Loading package details..." />;

//   if (!pkg) {
//     return (
//       <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
//         <h3 className="font-jakarta text-base font-semibold text-ink-900">
//           Package not found
//         </h3>
//         <p className="mt-1 text-sm text-ink-500">
//           The package you are looking for does not exist.
//         </p>
//         <button
//           onClick={() => navigate("/health-packages")}
//           className="mt-4 cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
//         >
//           Back to Packages
//         </button>
//       </div>
//     );
//   }

//   // Calculate package total offer price
//   const totalOfferPrice =
//     pkg.services?.reduce((acc, s) => acc + Number(s.offer_price || 0), 0) || 0;

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/health-packages")}
//             className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
//           >
//             <FiArrowLeft className="h-5 w-5" />
//           </button>
//           <div>
//             <h1 className="font-jakarta text-2xl font-bold text-ink-900">
//               {pkg.name}
//             </h1>
//             <p className="mt-0.5 text-sm text-ink-500">
//               Health Package Details
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => navigate(`/health-packages/${id}/edit`)}
//             className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
//           >
//             <FiEdit2 className="h-4 w-4" />
//             Edit
//           </button>
//           <button
//             onClick={() => setDeleteOpen(true)}
//             className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-danger-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger-600"
//           >
//             <FiTrash2 className="h-4 w-4" />
//             Delete
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
//         {/* Left: Image & Basic Info */}
//         <div className="space-y-6">
//           <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
//             <div className="aspect-square w-full bg-ink-50 flex items-center justify-center p-4">
//               {pkg.image ? (
//                 <img
//                   src={pkg.image}
//                   alt={pkg.name}
//                   className="h-full w-full object-contain"
//                 />
//               ) : (
//                 <FiImage className="h-12 w-12 text-ink-300" />
//               )}
//             </div>
//           </div>

//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="font-jakarta text-lg font-semibold text-ink-900 mb-2">
//               About this package
//             </h2>
//             <p className="text-sm leading-relaxed text-ink-600 mb-4">
//               {pkg.description || "No description provided."}
//             </p>
//             <div className="flex flex-wrap gap-2">
//               {pkg.is_active ? (
//                 <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
//                   Active
//                 </span>
//               ) : (
//                 <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500">
//                   Inactive
//                 </span>
//               )}
//               <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
//                 Package #{pkg.id}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Right: Pricing & Services */}
//         <div className="space-y-6">
//           {/* Summary Card */}
//           <div className="rounded-card border border-ink-100 bg-surface p-5 flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-ink-500">
//                 Total Package Offer Price
//               </p>
//               <p className="font-jakarta text-2xl font-bold text-brand-700 mt-1">
//                 ₹{totalOfferPrice.toFixed(2)}
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm font-medium text-ink-500">
//                 Services Included
//               </p>
//               <p className="font-jakarta text-2xl font-bold text-ink-900 mt-1">
//                 {pkg.services?.length || 0}
//               </p>
//             </div>
//           </div>

//           {/* Services List */}
//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="font-jakarta text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
//               <FiActivity className="h-5 w-5 text-brand-600" />
//               Services & Pricing
//             </h2>

//             {!pkg.services || pkg.services.length === 0 ? (
//               <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-6 text-center">
//                 <p className="text-sm text-ink-500">
//                   No services added to this package yet.
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {pkg.services.map((service) => (
//                   <div
//                     key={service.id}
//                     className="rounded-lg border border-ink-200 bg-surface overflow-hidden"
//                   >
//                     <div className="flex items-center justify-between p-4 bg-ink-50/30">
//                       <div>
//                         <span className="text-sm font-semibold text-ink-900">
//                           {service.name}
//                         </span>
//                         {service.is_active === false && (
//                           <span className="ml-2 text-[10px] font-semibold text-danger-600 uppercase">
//                             Inactive
//                           </span>
//                         )}
//                       </div>
//                       <div className="text-right">
//                         <p className="text-xs text-ink-400 line-through">
//                           MRP: ₹{service.actual_mrp}
//                         </p>
//                         <p className="text-sm font-bold text-brand-700">
//                           Offer: ₹{service.offer_price}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Expand Tests */}
//                     <button
//                       onClick={() => toggleExpand(service.id)}
//                       className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-ink-600 bg-surface hover:bg-ink-50 border-t border-ink-100 transition-colors cursor-pointer"
//                     >
//                       <span>
//                         {service.active_tests_count || 0} Active Tests
//                       </span>
//                       {expandedService === service.id ? (
//                         <FiChevronUp />
//                       ) : (
//                         <FiChevronDown />
//                       )}
//                     </button>

//                     {expandedService === service.id && (
//                       <div className="px-4 py-3 bg-ink-50/50 border-t border-ink-100 space-y-2">
//                         {service.tests?.map((test) => (
//                           <div
//                             key={test.id}
//                             className="flex justify-between text-xs text-ink-600"
//                           >
//                             <span>{test.name}</span>
//                             <span>
//                               MRP: ₹{test.mrp} | Disc: ₹{test.discount_price}
//                             </span>
//                           </div>
//                         ))}
//                         {(!service.tests || service.tests.length === 0) && (
//                           <p className="text-xs text-ink-500 italic">
//                             No test details available.
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <ConfirmModal
//         open={deleteOpen}
//         title="Delete Health Package"
//         message="Are you sure you want to delete this package? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="danger"
//         onConfirm={handleConfirmDelete}
//         onCancel={() => setDeleteOpen(false)}
//         loading={deleteMutation.isPending}
//       />
//     </div>
//   );
// };

// export default HealthPackagesView;

// src/features/patent/pages/healthPackages/HealthPackagesView.jsx

// import React, { useMemo, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import DOMPurify from "dompurify";
// import "react-quill-new/dist/quill.snow.css";
// import {
//   FiArrowLeft,
//   FiEdit2,
//   FiTrash2,
//   FiImage,
//   FiTag,
//   FiFileText,
//   FiMessageSquare,
// } from "react-icons/fi";
// import Loader from "../../common/Loader";
// import ConfirmModal from "../../common/ConfirmModal";
// import {
//   useHealthPackage,
//   useDeleteHealthPackage,
// } from "../../queries/healthPackages";

// const formatDate = (value) => {
//   if (!value) return "-";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "-";
//   return d.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatPrice = (value) => {
//   if (value === null || value === undefined || value === "") return "-";
//   return `₹${Number(value).toFixed(2)}`;
// };

// const HealthPackagesView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [deleteOpen, setDeleteOpen] = useState(false);

//   const { data: pkg, isLoading } = useHealthPackage(id);
//   const deleteMutation = useDeleteHealthPackage();

//   // API ka HTML safe nahi maante -> sanitize
//   const safeContent = useMemo(
//     () => (pkg?.content ? DOMPurify.sanitize(pkg.content) : ""),
//     [pkg?.content],
//   );

//   const handleConfirmDelete = () => {
//     deleteMutation.mutate(id, {
//       onSuccess: () => navigate("/health-packages"),
//       onSettled: () => setDeleteOpen(false),
//     });
//   };

//   if (isLoading) return <Loader text="Loading package details..." />;

//   // is_health_package hi source of truth hai
//   if (!pkg || pkg.is_health_package === false) {
//     return (
//       <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
//         <h3 className="font-jakarta text-base font-semibold text-ink-900">
//           Package not found
//         </h3>
//         <p className="mt-1 text-sm text-ink-500">
//           The package you are looking for does not exist.
//         </p>
//         <button
//           onClick={() => navigate("/health-packages")}
//           className="mt-4 cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
//         >
//           Back to Packages
//         </button>
//       </div>
//     );
//   }

//   const packagePrice = Number(pkg.service_price || 0);
//   const offerPrice = Number(pkg.offer_price || 0);
//   const discountPercent =
//     packagePrice > 0 && offerPrice < packagePrice
//       ? Math.round(((packagePrice - offerPrice) / packagePrice) * 100)
//       : 0;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/health-packages")}
//             className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
//           >
//             <FiArrowLeft className="h-5 w-5" />
//           </button>
//           <div>
//             <h1 className="font-jakarta text-2xl font-bold text-ink-900">
//               {pkg.name}
//             </h1>
//             <p className="mt-0.5 text-sm text-ink-500">
//               Health Package Details
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => navigate(`/health-packages/${id}/edit`)}
//             className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
//           >
//             <FiEdit2 className="h-4 w-4" />
//             Edit
//           </button>
//           <button
//             onClick={() => setDeleteOpen(true)}
//             className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-danger-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger-600"
//           >
//             <FiTrash2 className="h-4 w-4" />
//             Delete
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
//         {/* Left: Image & Basic Info */}
//         <div className="space-y-6">
//           <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
//             <div className="flex aspect-square w-full items-center justify-center bg-ink-50 p-4">
//               {pkg.image ? (
//                 <img
//                   src={pkg.image}
//                   alt={pkg.name}
//                   className="h-full w-full object-contain"
//                 />
//               ) : (
//                 <FiImage className="h-12 w-12 text-ink-300" />
//               )}
//             </div>
//           </div>

//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="mb-2 font-jakarta text-lg font-semibold text-ink-900">
//               About this package
//             </h2>
//             <p className="mb-4 text-sm leading-relaxed text-ink-600">
//               {pkg.description || "No description provided."}
//             </p>
//             <div className="flex flex-wrap gap-2">
//               {pkg.is_active ? (
//                 <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
//                   Active
//                 </span>
//               ) : (
//                 <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500">
//                   Inactive
//                 </span>
//               )}
//               <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
//                 Package #{pkg.id}
//               </span>
//             </div>

//             <div className="mt-4 space-y-1 border-t border-ink-100 pt-4 text-xs text-ink-500">
//               <p>Created: {formatDate(pkg.created_at)}</p>
//               <p>Updated: {formatDate(pkg.updated_at)}</p>
//             </div>
//           </div>
//         </div>

//         {/* Right: Pricing, Message, Content */}
//         <div className="space-y-6">
//           {/* Pricing */}
//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="mb-4 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
//               <FiTag className="h-5 w-5 text-brand-600" />
//               Package Pricing
//             </h2>
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//               <div>
//                 <p className="text-sm font-medium text-ink-500">
//                   Package Price
//                 </p>
//                 <p className="mt-1 font-jakarta text-xl font-bold text-ink-400 line-through">
//                   {formatPrice(pkg.service_price)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-ink-500">Offer Price</p>
//                 <p className="mt-1 font-jakarta text-2xl font-bold text-brand-700">
//                   {formatPrice(pkg.offer_price)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-ink-500">Discount</p>
//                 <p className="mt-1 font-jakarta text-xl font-bold text-ink-900">
//                   {discountPercent > 0 ? `${discountPercent}% OFF` : "-"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Success Message */}
//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="mb-3 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
//               <FiMessageSquare className="h-5 w-5 text-brand-600" />
//               Booking Success Message
//             </h2>
//             <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">
//               {pkg.success_message || "No success message provided."}
//             </p>
//           </div>

//           {/* Content */}
//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="mb-3 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
//               <FiFileText className="h-5 w-5 text-brand-600" />
//               Package Content
//             </h2>
//             {safeContent ? (
//               <div className="ql-snow">
//                 <div
//                   className="ql-editor !p-0 text-sm text-ink-700"
//                   dangerouslySetInnerHTML={{ __html: safeContent }}
//                 />
//               </div>
//             ) : (
//               <p className="text-sm italic text-ink-500">
//                 No content provided.
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       <ConfirmModal
//         open={deleteOpen}
//         title="Delete Health Package"
//         message="Are you sure you want to delete this package? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="danger"
//         onConfirm={handleConfirmDelete}
//         onCancel={() => setDeleteOpen(false)}
//         loading={deleteMutation.isPending}
//       />
//     </div>
//   );
// };

// export default HealthPackagesView;

// src/features/patent/pages/healthPackages/HealthPackagesView.jsx

import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiTag,
  FiFileText,
  FiMessageSquare,
} from "react-icons/fi";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";
import {
  useHealthPackage,
  useDeleteHealthPackage,
} from "../../queries/healthPackages";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `₹${Number(value).toFixed(2)}`;
};

const HealthPackagesView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: pkg, isLoading } = useHealthPackage(id);
  const deleteMutation = useDeleteHealthPackage();

  // API ka HTML safe nahi maante -> sanitize
  const safeContent = useMemo(
    () => (pkg?.content ? DOMPurify.sanitize(pkg.content) : ""),
    [pkg?.content],
  );

  const handleConfirmDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate("/health-packages"),
      onSettled: () => setDeleteOpen(false),
    });
  };

  if (isLoading) return <Loader text="Loading package details..." />;

  // is_health_package hi source of truth hai
  if (!pkg || pkg.is_health_package === false) {
    return (
      <div className="rounded-card border border-ink-100 bg-surface p-16 text-center">
        <h3 className="font-jakarta text-base font-semibold text-ink-900">
          Package not found
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          The package you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/health-packages")}
          className="mt-4 cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  const packagePrice = Number(pkg.service_price || 0);
  const offerPrice = Number(pkg.offer_price || 0);
  const discountPercent =
    packagePrice > 0 && offerPrice < packagePrice
      ? Math.round(((packagePrice - offerPrice) / packagePrice) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/health-packages")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              {pkg.name}
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              Health Package Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/health-packages/${id}/edit`)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
          >
            <FiEdit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-danger-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger-600"
          >
            <FiTrash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
        {/* Left: Image & Basic Info */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-card border border-ink-100 bg-surface">
            <div className="flex aspect-square w-full items-center justify-center bg-ink-50 p-4">
              {pkg.image ? (
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <FiImage className="h-12 w-12 text-ink-300" />
              )}
            </div>

            {/* Size Guide Added Below Image */}
            <div className="border-t border-ink-100 p-4 bg-white">
              <div className="text-xs text-ink-600 space-y-1.5">
                <p>
                  <span className="font-medium text-ink-900">Size:</span> 216 x
                  216 px
                </p>
                <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-2 font-jakarta text-lg font-semibold text-ink-900">
              About this package
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-ink-600">
              {pkg.description || "No description provided."}
            </p>
            <div className="flex flex-wrap gap-2">
              {pkg.is_active ? (
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500">
                  Inactive
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                Package #{pkg.id}
              </span>
            </div>

            <div className="mt-4 space-y-1 border-t border-ink-100 pt-4 text-xs text-ink-500">
              <p>Created: {formatDate(pkg.created_at)}</p>
              <p>Updated: {formatDate(pkg.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Right: Pricing, Message, Content */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
              <FiTag className="h-5 w-5 text-brand-600" />
              Package Pricing
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-ink-500">
                  Package Price
                </p>
                <p className="mt-1 font-jakarta text-xl font-bold text-ink-400 line-through">
                  {formatPrice(pkg.service_price)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Offer Price</p>
                <p className="mt-1 font-jakarta text-2xl font-bold text-brand-700">
                  {formatPrice(pkg.offer_price)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-500">Discount</p>
                <p className="mt-1 font-jakarta text-xl font-bold text-ink-900">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
              <FiMessageSquare className="h-5 w-5 text-brand-600" />
              Booking Success Message
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {pkg.success_message || "No success message provided."}
            </p>
          </div>

          {/* Content */}
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 font-jakarta text-lg font-semibold text-ink-900">
              <FiFileText className="h-5 w-5 text-brand-600" />
              Package Content
            </h2>
            {safeContent ? (
              <div className="ql-snow">
                <div
                  className="ql-editor !p-0 text-sm text-ink-700"
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                />
              </div>
            ) : (
              <p className="text-sm italic text-ink-500">
                No content provided.
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Delete Health Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default HealthPackagesView;
