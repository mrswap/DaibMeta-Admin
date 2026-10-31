// // src/features/patent/pages/cms/ClinicPrivileges/freeServices/FreeServiceView.jsx

// import { useParams, useNavigate } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiEdit2,
//   FiCalendar,
//   FiClock,
//   FiUser,
//   FiInfo,
//   FiAlertCircle,
//   FiBriefcase,
//   FiType,
//   FiLink,
// } from "react-icons/fi";

// import { useFreeService } from "../../../../queries/clinicPrivileges";
// import Loader from "../../../../common/Loader";

// const FreeServiceView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const { data: service, isLoading, isError } = useFreeService(id);

//   // Helper to format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "—";
//     return new Date(dateString).toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   if (isLoading) {
//     return <Loader text="Loading free service details..." />;
//   }

//   if (isError || !service) {
//     return (
//       <div className="space-y-4">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/cms/clinical-privileges/free-services")}
//             className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
//           >
//             <FiArrowLeft className="h-5 w-5" />
//           </button>
//           <h1 className="text-xl font-bold text-ink-900">Service Not Found</h1>
//         </div>
//         <div className="rounded-card border border-ink-100 bg-surface p-10 text-center">
//           <FiAlertCircle className="mx-auto h-8 w-8 text-danger-500" />
//           <p className="mt-3 text-sm text-ink-600">
//             The free service you are looking for does not exist or failed to
//             load.
//           </p>
//           <button
//             onClick={() => navigate("/cms/clinical-privileges/free-services")}
//             className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
//           >
//             <FiArrowLeft className="h-4 w-4" />
//             Back to List
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//         <div className="flex items-start gap-3">
//           <button
//             onClick={() => navigate("/cms/clinical-privileges/free-services")}
//             className="mt-1 cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
//           >
//             <FiArrowLeft className="h-5 w-5" />
//           </button>
//           <div>
//             <div className="flex items-center gap-3">
//               <h1 className="text-xl font-bold text-ink-900">
//                 {service.title}
//               </h1>
//               <StatusBadge active={service.status} />
//             </div>
//             <p className="mt-1 text-sm text-ink-500">
//               {service.description || "No description provided."}
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() =>
//             navigate(
//               `/cms/clinical-privileges/free-services/${service.id}/edit`,
//             )
//           }
//           className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
//         >
//           <FiEdit2 className="h-4 w-4" />
//           Edit Service
//         </button>
//       </div>

//       <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
//         {/* Main Info Column */}
//         <div className="space-y-5 lg:col-span-2">
//           {/* Service Details Card */}
//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-800">
//               Service Information
//             </h2>
//             <div className="space-y-4">
//               <InfoRow icon={FiType} label="Title" value={service.title} />
//               <InfoRow icon={FiLink} label="Slug" value={service.slug} />
//               <InfoRow
//                 icon={FiBriefcase}
//                 label="Appointment Type"
//                 value={service.appointment_type?.name || "—"}
//               />
//               <InfoRow
//                 icon={FiInfo}
//                 label="Button Text"
//                 value={service.button_text || "—"}
//               />
//               <div className="border-t border-ink-100 pt-4">
//                 <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
//                   Description
//                 </p>
//                 <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">
//                   {service.description || "—"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Assigned Providers Card */}
//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <div className="mb-4 flex items-center justify-between">
//               <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-800">
//                 Assigned Providers
//               </h2>
//               <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
//                 {service.providers?.length || 0} Provider(s)
//               </span>
//             </div>
//             {!service.providers || service.providers.length === 0 ? (
//               <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-6 text-center text-sm text-ink-500">
//                 No providers assigned to this service yet.
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                 {service.providers.map((p) => (
//                   <div
//                     key={p.id}
//                     className="flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50/30 p-3"
//                   >
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
//                       <FiUser className="h-5 w-5" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-ink-900">
//                         {p.provider?.name || "Unknown Provider"}
//                       </p>
//                       <p className="truncate text-xs text-ink-500">
//                         ID: {p.provider_id}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sidebar Info Column */}
//         <div className="space-y-5">
//           <div className="rounded-card border border-ink-100 bg-surface p-5">
//             <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-800">
//               Metadata
//             </h2>
//             <div className="space-y-4">
//               <InfoRow
//                 icon={FiCalendar}
//                 label="Created At"
//                 value={formatDate(service.created_at)}
//               />
//               <InfoRow
//                 icon={FiClock}
//                 label="Last Updated"
//                 value={formatDate(service.updated_at)}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ---------------------------------------------------------------
// // Sub-components
// // ---------------------------------------------------------------
// const StatusBadge = ({ active }) => (
//   <span
//     className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
//       active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
//     }`}
//   >
//     <span
//       className={`h-1.5 w-1.5 rounded-full ${active ? "bg-brand-600" : "bg-ink-400"}`}
//     />
//     {active ? "Active" : "Inactive"}
//   </span>
// );

// const InfoRow = ({ icon: Icon, label, value }) => (
//   <div className="flex items-start gap-3">
//     <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
//       <Icon className="h-4 w-4" />
//     </div>
//     <div className="min-w-0 flex-1">
//       <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
//         {label}
//       </p>
//       <p className="mt-0.5 text-sm text-ink-800">{value || "—"}</p>
//     </div>
//   </div>
// );

// export default FreeServiceView;
