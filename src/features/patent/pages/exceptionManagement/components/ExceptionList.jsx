// // // // src/features/patent/pages/exceptionManagement/components/ExceptionList.jsx

// // // import { useMemo } from "react";
// // // import {
// // //   FiLock,
// // //   FiClock,
// // //   FiCalendar,
// // //   FiInfo,
// // //   FiAlertCircle,
// // // } from "react-icons/fi";
// // // import { usePermission } from "../../../hooks/usePermission";
// // // import {
// // //   formatTime12,
// // //   formatDateFull,
// // // } from "../../../queries/exceptionManagement";

// // // const ExceptionList = ({
// // //   date,
// // //   exceptions = [],
// // //   provider,
// // //   isLoading = false,
// // //   onExceptionClick,
// // // }) => {
// // //   const { can, isLoading: permLoading } = usePermission();

// // //   const canView = can("availability", "view");

// // //   if (!canView) {
// // //     return (
// // //       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// // //         <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
// // //           <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
// // //             <FiLock className="h-5 w-5 text-ink-500" />
// // //           </div>

// // //           <p className="text-sm font-semibold text-ink-700">
// // //             Permission Required
// // //           </p>

// // //           <p className="mt-1 text-xs text-ink-500">
// // //             You don't have permission to view availability exceptions.
// // //           </p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }
// // //   // ==================== STATS ====================
// // //   // total = blocked SLOTS (full day ho to us din ke saare slots)
// // //   const stats = useMemo(() => {
// // //     const fullDay = exceptions.filter((e) => e.is_full_day).length;
// // //     const total = exceptions.reduce((sum, e) => sum + (e.slot_count || 1), 0);
// // //     return { total, fullDay };
// // //   }, [exceptions]);

// // //   // ==================== LOADING ====================
// // //   if (isLoading) {
// // //     return (
// // //       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// // //         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// // //           <div className="flex items-center gap-2">
// // //             <FiLock className="h-4 w-4 text-ink-500" />
// // //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// // //               Blocked Slots
// // //             </p>
// // //           </div>
// // //         </div>
// // //         <div className="px-4 py-12">
// // //           <div className="flex flex-col items-center justify-center gap-2">
// // //             <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
// // //             <p className="text-xs text-ink-500">Loading exceptions...</p>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   // ==================== EMPTY STATE ====================
// // //   if (exceptions.length === 0) {
// // //     return (
// // //       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// // //         {/* Header */}
// // //         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// // //           <div className="flex items-center gap-2">
// // //             <FiLock className="h-4 w-4 text-ink-500" />
// // //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// // //               Blocked Slots
// // //             </p>
// // //           </div>
// // //         </div>

// // //         <div className="px-4 py-10 text-center">
// // //           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
// // //             <FiCalendar className="h-4 w-4" />
// // //           </div>
// // //           <p className="text-sm font-medium text-ink-700">No blocked slots</p>
// // //           <p className="mt-1 text-xs text-ink-500">
// // //             {provider
// // //               ? `${provider.name} has no blocked slots on this date.`
// // //               : "No exceptions found for this date."}
// // //           </p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   // ==================== RENDER ====================
// // //   return (
// // //     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// // //       {/* ==================== HEADER ==================== */}
// // //       <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// // //         <div className="flex flex-wrap items-center justify-between gap-2">
// // //           <div className="flex items-center gap-2">
// // //             <FiLock className="h-4 w-4 text-danger-600" />
// // //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// // //               Blocked Slots
// // //             </p>
// // //           </div>
// // //           <div className="flex items-center gap-1.5">
// // //             <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
// // //               {stats.total} total
// // //             </span>
// // //             {stats.fullDay > 0 && (
// // //               <span className="rounded-md bg-warn-100 px-2 py-0.5 text-[10px] font-semibold text-warn-800">
// // //                 {stats.fullDay} full day
// // //               </span>
// // //             )}
// // //           </div>
// // //         </div>

// // //         {/* Date + Provider subtitle */}
// // //         <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
// // //           <span className="font-medium">{formatDateFull(date)}</span>
// // //           {provider && (
// // //             <>
// // //               <span className="text-ink-300">•</span>
// // //               <span className="font-medium">{provider.name}</span>
// // //             </>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* ==================== LIST ==================== */}
// // //       <div className="max-h-[480px] space-y-2 overflow-y-auto p-4">
// // //         {exceptions.map((ex) => {
// // //           const isFullDay = ex.is_full_day;

// // //           return (
// // //             <button
// // //               key={ex._key || ex.id}
// // //               type="button"
// // //               onClick={() => onExceptionClick(ex)}
// // //               title="Click for details"
// // //               className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-left transition hover:border-danger-500/50 hover:bg-danger-100/70"
// // //             >
// // //               {/* Icon */}
// // //               <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-500 text-surface">
// // //                 <FiLock className="h-3 w-3" />
// // //               </div>

// // //               {/* Content */}
// // //               <div className="min-w-0 flex-1">
// // //                 {/* Time */}
// // //                 <div className="flex flex-wrap items-center gap-2">
// // //                   {isFullDay ? (
// // //                     <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn-800">
// // //                       <FiAlertCircle className="h-2.5 w-2.5" />
// // //                       Full Day
// // //                       {ex.slot_count > 1 && ` · ${ex.slot_count} slots`}
// // //                     </span>
// // //                   ) : (
// // //                     <span className="text-[12px] font-semibold text-danger-700">
// // //                       {formatTime12(ex.start_time)}
// // //                       <span className="mx-1 font-normal text-danger-600">
// // //                         –
// // //                       </span>
// // //                       {formatTime12(ex.end_time)}
// // //                     </span>
// // //                   )}

// // //                   {/* Provider chip (only when no filter active) */}
// // //                   {!provider && ex.provider?.name && (
// // //                     <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-700 ring-1 ring-ink-200">
// // //                       <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-400" />
// // //                       {ex.provider.name}
// // //                     </span>
// // //                   )}

// // //                   {/* Appointment type chip */}
// // //                   {ex.appointment_type?.name && (
// // //                     <span className="inline-flex rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-600 ring-1 ring-ink-200">
// // //                       {ex.appointment_type.name}
// // //                     </span>
// // //                   )}
// // //                 </div>

// // //                 {/* Reason */}
// // //                 {ex.reason && (
// // //                   <p className="mt-1 truncate text-[11px] text-ink-600">
// // //                     <span className="font-medium text-ink-500">Reason:</span>{" "}
// // //                     {ex.reason}
// // //                   </p>
// // //                 )}

// // //                 {/* Meta line */}
// // //                 {ex.created_at && (
// // //                   <p className="mt-1 text-[10px] text-ink-400">
// // //                     Created{" "}
// // //                     {new Date(ex.created_at).toLocaleDateString("en-GB", {
// // //                       day: "2-digit",
// // //                       month: "short",
// // //                       year: "numeric",
// // //                     })}
// // //                   </p>
// // //                 )}
// // //               </div>

// // //               {/* Right indicator */}
// // //               <div className="flex shrink-0 items-center">
// // //                 <FiInfo className="h-3.5 w-3.5 text-danger-500" />
// // //               </div>
// // //             </button>
// // //           );
// // //         })}
// // //       </div>

// // //       {/* ==================== FOOTER ==================== */}
// // //       <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-2.5">
// // //         <p className="text-[10px] text-ink-500">
// // //           Click any blocked slot to view full details
// // //         </p>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ExceptionList;

// // // src/features/patent/pages/exceptionManagement/components/ExceptionList.jsx

// // import { useMemo } from "react";
// // import {
// //   FiLock,
// //   FiClock,
// //   FiCalendar,
// //   FiInfo,
// //   FiAlertCircle,
// //   FiUsers,
// // } from "react-icons/fi";
// // import { usePermission } from "../../../hooks/usePermission";
// // import {
// //   formatTime12,
// //   formatDateFull,
// // } from "../../../queries/exceptionManagement";
// // import { useSlotsForDate } from "../../../queries/providerAvailabilities";

// // // ==================== BOOKINGS FOR AN EXCEPTION ====================
// // // Exception ke provider + appointment type + date ke liye slots API se
// // // dekhta hai ki us blocked slot (ya full day me saare slots) me kitni booking hai.
// // // Same provider/type/date ki query react-query khud dedupe karta hai.
// // // Agar API counts hi nahi deti to hasData=false (kuch dikhana nahi).
// // export const useExceptionBookings = (ex) => {
// //   const providerId = ex?.provider?.id || null;
// //   const typeId = ex?.appointment_type?.id || null;
// //   const date = ex?.exception_date || null;

// //   const { data, isLoading } = useSlotsForDate({
// //     admin_id: providerId,
// //     appointment_type_id: typeId,
// //     date,
// //     enabled: !!(providerId && typeId && date),
// //   });

// //   const slots = data?.slots;

// //   return useMemo(() => {
// //     const empty = {
// //       loading: isLoading,
// //       hasData: false,
// //       booked: 0,
// //       capacity: 0,
// //     };
// //     if (!ex || !Array.isArray(slots) || slots.length === 0) return empty;

// //     let relevant = slots;
// //     if (!ex.is_full_day && ex.start_time) {
// //       const st = String(ex.start_time).slice(0, 5);
// //       relevant = slots.filter((s) => s.start_time === st);
// //     }
// //     if (relevant.length === 0) return empty;

// //     const hasCounts = relevant.some(
// //       (s) => s.booked_count !== undefined || Array.isArray(s.appointments),
// //     );
// //     if (!hasCounts) return empty;

// //     const booked = relevant.reduce(
// //       (sum, s) =>
// //         sum +
// //         (Number(s.booked_count) ||
// //           (Array.isArray(s.appointments) ? s.appointments.length : 0)),
// //       0,
// //     );
// //     const capacity = relevant.reduce(
// //       (sum, s) => sum + (Number(s.capacity) || 1),
// //       0,
// //     );

// //     return { loading: false, hasData: true, booked, capacity };
// //   }, [ex, slots, isLoading]);
// // };

// // // ==================== SINGLE EXCEPTION ROW ====================
// // const ExceptionItem = ({ ex, provider, onExceptionClick }) => {
// //   const isFullDay = ex.is_full_day;
// //   const bookings = useExceptionBookings(ex);

// //   return (
// //     <button
// //       type="button"
// //       onClick={() => onExceptionClick(ex)}
// //       title="Click for details"
// //       className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-left transition hover:border-danger-500/50 hover:bg-danger-100/70"
// //     >
// //       {/* Icon */}
// //       <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-500 text-surface">
// //         <FiLock className="h-3 w-3" />
// //       </div>

// //       {/* Content */}
// //       <div className="min-w-0 flex-1">
// //         {/* Time */}
// //         <div className="flex flex-wrap items-center gap-2">
// //           {isFullDay ? (
// //             <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn-800">
// //               <FiAlertCircle className="h-2.5 w-2.5" />
// //               Full Day
// //               {ex.slot_count > 1 && ` · ${ex.slot_count} slots`}
// //             </span>
// //           ) : (
// //             <span className="text-[12px] font-semibold text-danger-700">
// //               {formatTime12(ex.start_time)}
// //               <span className="mx-1 font-normal text-danger-600">–</span>
// //               {formatTime12(ex.end_time)}
// //             </span>
// //           )}

// //           {/* Provider chip (only when no filter active) */}
// //           {!provider && ex.provider?.name && (
// //             <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-700 ring-1 ring-ink-200">
// //               <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-400" />
// //               {ex.provider.name}
// //             </span>
// //           )}

// //           {/* Appointment type chip */}
// //           {ex.appointment_type?.name && (
// //             <span className="inline-flex rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-600 ring-1 ring-ink-200">
// //               {ex.appointment_type.name}
// //             </span>
// //           )}

// //           {/* ✅ Booking chip */}
// //           {bookings.hasData &&
// //             (bookings.booked > 0 ? (
// //               <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[9px] font-semibold text-warn-800 ring-1 ring-warn-200">
// //                 <FiUsers className="h-2.5 w-2.5" />
// //                 {bookings.booked} booked
// //               </span>
// //             ) : (
// //               <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-500 ring-1 ring-ink-200">
// //                 <FiUsers className="h-2.5 w-2.5" />
// //                 No bookings
// //               </span>
// //             ))}
// //         </div>

// //         {/* Reason */}
// //         {ex.reason && (
// //           <p className="mt-1 truncate text-[11px] text-ink-600">
// //             <span className="font-medium text-ink-500">Reason:</span>{" "}
// //             {ex.reason}
// //           </p>
// //         )}

// //         {/* Meta line */}
// //         {ex.created_at && (
// //           <p className="mt-1 text-[10px] text-ink-400">
// //             Created{" "}
// //             {new Date(ex.created_at).toLocaleDateString("en-GB", {
// //               day: "2-digit",
// //               month: "short",
// //               year: "numeric",
// //             })}
// //           </p>
// //         )}
// //       </div>

// //       {/* Right indicator */}
// //       <div className="flex shrink-0 items-center">
// //         <FiInfo className="h-3.5 w-3.5 text-danger-500" />
// //       </div>
// //     </button>
// //   );
// // };

// // // ==================== LIST ====================
// // const ExceptionList = ({
// //   date,
// //   exceptions = [],
// //   provider,
// //   isLoading = false,
// //   onExceptionClick,
// // }) => {
// //   const { can } = usePermission();

// //   const canView = can("availability", "view");

// //   // ==================== STATS ====================
// //   // total = blocked SLOTS (full day ho to us din ke saare slots)
// //   // (hooks hamesha early return se pehle — rules of hooks)
// //   const stats = useMemo(() => {
// //     const fullDay = exceptions.filter((e) => e.is_full_day).length;
// //     const total = exceptions.reduce((sum, e) => sum + (e.slot_count || 1), 0);
// //     return { total, fullDay };
// //   }, [exceptions]);

// //   if (!canView) {
// //     return (
// //       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// //         <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
// //           <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
// //             <FiLock className="h-5 w-5 text-ink-500" />
// //           </div>

// //           <p className="text-sm font-semibold text-ink-700">
// //             Permission Required
// //           </p>

// //           <p className="mt-1 text-xs text-ink-500">
// //             You don't have permission to view availability exceptions.
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ==================== LOADING ====================
// //   if (isLoading) {
// //     return (
// //       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// //         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// //           <div className="flex items-center gap-2">
// //             <FiLock className="h-4 w-4 text-ink-500" />
// //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// //               Blocked Slots
// //             </p>
// //           </div>
// //         </div>
// //         <div className="px-4 py-12">
// //           <div className="flex flex-col items-center justify-center gap-2">
// //             <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
// //             <p className="text-xs text-ink-500">Loading exceptions...</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ==================== EMPTY STATE ====================
// //   if (exceptions.length === 0) {
// //     return (
// //       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// //         {/* Header */}
// //         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// //           <div className="flex items-center gap-2">
// //             <FiLock className="h-4 w-4 text-ink-500" />
// //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// //               Blocked Slots
// //             </p>
// //           </div>
// //         </div>

// //         <div className="px-4 py-10 text-center">
// //           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
// //             <FiCalendar className="h-4 w-4" />
// //           </div>
// //           <p className="text-sm font-medium text-ink-700">No blocked slots</p>
// //           <p className="mt-1 text-xs text-ink-500">
// //             {provider
// //               ? `${provider.name} has no blocked slots on this date.`
// //               : "No exceptions found for this date."}
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ==================== RENDER ====================
// //   return (
// //     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// //       {/* ==================== HEADER ==================== */}
// //       <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// //         <div className="flex flex-wrap items-center justify-between gap-2">
// //           <div className="flex items-center gap-2">
// //             <FiLock className="h-4 w-4 text-danger-600" />
// //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// //               Blocked Slots
// //             </p>
// //           </div>
// //           <div className="flex items-center gap-1.5">
// //             <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
// //               {stats.total} total
// //             </span>
// //             {stats.fullDay > 0 && (
// //               <span className="rounded-md bg-warn-100 px-2 py-0.5 text-[10px] font-semibold text-warn-800">
// //                 {stats.fullDay} full day
// //               </span>
// //             )}
// //           </div>
// //         </div>

// //         {/* Date + Provider subtitle */}
// //         <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
// //           <span className="font-medium">{formatDateFull(date)}</span>
// //           {provider && (
// //             <>
// //               <span className="text-ink-300">•</span>
// //               <span className="font-medium">{provider.name}</span>
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       {/* ==================== LIST ==================== */}
// //       <div className="max-h-[480px] space-y-2 overflow-y-auto p-4">
// //         {exceptions.map((ex) => (
// //           <ExceptionItem
// //             key={ex._key || ex.id}
// //             ex={ex}
// //             provider={provider}
// //             onExceptionClick={onExceptionClick}
// //           />
// //         ))}
// //       </div>

// //       {/* ==================== FOOTER ==================== */}
// //       <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-2.5">
// //         <p className="text-[10px] text-ink-500">
// //           Click any blocked slot to view full details
// //         </p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ExceptionList;

// import { useMemo } from "react";
// import {
//   FiLock,
//   FiClock,
//   FiCalendar,
//   FiInfo,
//   FiAlertCircle,
//   FiUsers,
// } from "react-icons/fi";
// import { usePermission } from "../../../hooks/usePermission";
// import {
//   formatTime12,
//   formatDateFull,
// } from "../../../queries/exceptionManagement";
// import { useSlotsForDate } from "../../../queries/providerAvailabilities";

// // ==================== BOOKINGS FOR AN EXCEPTION ====================
// // Exception ke provider + appointment type + date ke liye slots API se
// // dekhta hai ki us blocked slot (ya full day me saare slots) me kitni booking hai.
// // Same provider/type/date ki query react-query khud dedupe karta hai.
// //
// // ⚠️ IMPORTANT FIX:
// // Pehle code sirf ye dekhta tha ki booked_count > 0 hai ya nahi, aur usi ko
// // "booked" maan leta tha. Lekin ek slot me capacity 2 ho aur sirf 1 booked ho
// // to wo slot FULLY BOOKED nahi hai — usme 1 seat abhi bhi available hai.
// // Isliye ab hum teen cheezein alag-alag track karte hain:
// //   - booked      : total booked seats
// //   - capacity    : total capacity
// //   - available   : total available seats (capacity - booked)
// //   - fullyBooked : kya koi bhi relevant slot FULLY booked hai?
// //                   (tabhi block karna chahiye)
// export const useExceptionBookings = (ex) => {
//   const providerId = ex?.provider?.id || null;
//   const typeId = ex?.appointment_type?.id || null;
//   const date = ex?.exception_date || null;

//   const { data, isLoading } = useSlotsForDate({
//     admin_id: providerId,
//     appointment_type_id: typeId,
//     date,
//     enabled: !!(providerId && typeId && date),
//   });

//   const slots = data?.slots;

//   return useMemo(() => {
//     const empty = {
//       loading: isLoading,
//       hasData: false,
//       booked: 0,
//       capacity: 0,
//       available: 0,
//       fullyBooked: false,
//       partiallyBooked: false,
//     };
//     if (!ex || !Array.isArray(slots) || slots.length === 0) return empty;

//     let relevant = slots;
//     if (!ex.is_full_day && ex.start_time) {
//       const st = String(ex.start_time).slice(0, 5);
//       relevant = slots.filter((s) => s.start_time === st);
//     }
//     if (relevant.length === 0) return empty;

//     const hasCounts = relevant.some(
//       (s) => s.booked_count !== undefined || Array.isArray(s.appointments),
//     );
//     if (!hasCounts) return empty;

//     let booked = 0;
//     let capacity = 0;
//     let fullyBooked = false;
//     let partiallyBooked = false;

//     for (const s of relevant) {
//       const b =
//         Number(s.booked_count) ||
//         (Array.isArray(s.appointments) ? s.appointments.length : 0);
//       const c = Number(s.capacity) || 1;

//       booked += b;
//       capacity += c;

//       // ✅ Ek slot ko "fully booked" tabhi maano jab booked >= capacity ho.
//       // Agar booked < capacity hai to us slot me seat available hai,
//       // chahe API ka `available` flag kuch bhi kehta ho.
//       if (b >= c) {
//         fullyBooked = true;
//       } else if (b > 0) {
//         partiallyBooked = true;
//       }
//     }

//     const available = Math.max(capacity - booked, 0);

//     return {
//       loading: false,
//       hasData: true,
//       booked,
//       capacity,
//       available,
//       fullyBooked,
//       partiallyBooked,
//     };
//   }, [ex, slots, isLoading]);
// };

// // ==================== SINGLE EXCEPTION ROW ====================
// const ExceptionItem = ({ ex, provider, onExceptionClick }) => {
//   const isFullDay = ex.is_full_day;
//   const bookings = useExceptionBookings(ex);

//   // ✅ Booking chip ka logic:
//   //   - fully booked  → warn "X/X booked" (ye actually block-worthy hai)
//   //   - partially     → neutral "X/Y booked · Z available"
//   //   - kuch nahi     → "No bookings"
//   const renderBookingChip = () => {
//     if (!bookings.hasData) return null;

//     if (bookings.fullyBooked) {
//       return (
//         <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[9px] font-semibold text-warn-800 ring-1 ring-warn-200">
//           <FiUsers className="h-2.5 w-2.5" />
//           Fully booked ({bookings.booked}/{bookings.capacity})
//         </span>
//       );
//     }

//     if (bookings.partiallyBooked) {
//       return (
//         <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold text-accent-800 ring-1 ring-accent-200">
//           <FiUsers className="h-2.5 w-2.5" />
//           {bookings.booked}/{bookings.capacity} booked · {bookings.available}{" "}
//           available
//         </span>
//       );
//     }

//     return (
//       <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-500 ring-1 ring-ink-200">
//         <FiUsers className="h-2.5 w-2.5" />
//         No bookings
//       </span>
//     );
//   };

//   return (
//     <button
//       type="button"
//       onClick={() => onExceptionClick(ex)}
//       title="Click for details"
//       className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-left transition hover:border-danger-500/50 hover:bg-danger-100/70"
//     >
//       {/* Icon */}
//       <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-500 text-surface">
//         <FiLock className="h-3 w-3" />
//       </div>

//       {/* Content */}
//       <div className="min-w-0 flex-1">
//         {/* Time */}
//         <div className="flex flex-wrap items-center gap-2">
//           {isFullDay ? (
//             <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn-800">
//               <FiAlertCircle className="h-2.5 w-2.5" />
//               Full Day
//               {ex.slot_count > 1 && ` · ${ex.slot_count} slots`}
//             </span>
//           ) : (
//             <span className="text-[12px] font-semibold text-danger-700">
//               {formatTime12(ex.start_time)}
//               <span className="mx-1 font-normal text-danger-600">–</span>
//               {formatTime12(ex.end_time)}
//             </span>
//           )}

//           {/* Provider chip (only when no filter active) */}
//           {!provider && ex.provider?.name && (
//             <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-700 ring-1 ring-ink-200">
//               <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-400" />
//               {ex.provider.name}
//             </span>
//           )}

//           {/* Appointment type chip */}
//           {ex.appointment_type?.name && (
//             <span className="inline-flex rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-600 ring-1 ring-ink-200">
//               {ex.appointment_type.name}
//             </span>
//           )}

//           {/* ✅ Booking chip (fixed) */}
//           {renderBookingChip()}
//         </div>

//         {/* Reason */}
//         {ex.reason && (
//           <p className="mt-1 truncate text-[11px] text-ink-600">
//             <span className="font-medium text-ink-500">Reason:</span>{" "}
//             {ex.reason}
//           </p>
//         )}

//         {/* Meta line */}
//         {ex.created_at && (
//           <p className="mt-1 text-[10px] text-ink-400">
//             Created{" "}
//             {new Date(ex.created_at).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "short",
//               year: "numeric",
//             })}
//           </p>
//         )}
//       </div>

//       {/* Right indicator */}
//       <div className="flex shrink-0 items-center">
//         <FiInfo className="h-3.5 w-3.5 text-danger-500" />
//       </div>
//     </button>
//   );
// };

// // ==================== LIST ====================
// const ExceptionList = ({
//   date,
//   exceptions = [],
//   provider,
//   isLoading = false,
//   onExceptionClick,
// }) => {
//   const { can } = usePermission();

//   const canView = can("availability", "view");

//   // ==================== STATS ====================
//   // total = blocked SLOTS (full day ho to us din ke saare slots)
//   // (hooks hamesha early return se pehle — rules of hooks)
//   const stats = useMemo(() => {
//     const fullDay = exceptions.filter((e) => e.is_full_day).length;
//     const total = exceptions.reduce((sum, e) => sum + (e.slot_count || 1), 0);
//     return { total, fullDay };
//   }, [exceptions]);

//   if (!canView) {
//     return (
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
//           <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
//             <FiLock className="h-5 w-5 text-ink-500" />
//           </div>

//           <p className="text-sm font-semibold text-ink-700">
//             Permission Required
//           </p>

//           <p className="mt-1 text-xs text-ink-500">
//             You don't have permission to view availability exceptions.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ==================== LOADING ====================
//   if (isLoading) {
//     return (
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//           <div className="flex items-center gap-2">
//             <FiLock className="h-4 w-4 text-ink-500" />
//             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//               Blocked Slots
//             </p>
//           </div>
//         </div>
//         <div className="px-4 py-12">
//           <div className="flex flex-col items-center justify-center gap-2">
//             <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
//             <p className="text-xs text-ink-500">Loading exceptions...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ==================== EMPTY STATE ====================
//   if (exceptions.length === 0) {
//     return (
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         {/* Header */}
//         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//           <div className="flex items-center gap-2">
//             <FiLock className="h-4 w-4 text-ink-500" />
//             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//               Blocked Slots
//             </p>
//           </div>
//         </div>

//         <div className="px-4 py-10 text-center">
//           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
//             <FiCalendar className="h-4 w-4" />
//           </div>
//           <p className="text-sm font-medium text-ink-700">No blocked slots</p>
//           <p className="mt-1 text-xs text-ink-500">
//             {provider
//               ? `${provider.name} has no blocked slots on this date.`
//               : "No exceptions found for this date."}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ==================== RENDER ====================
//   return (
//     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//       {/* ==================== HEADER ==================== */}
//       <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//         <div className="flex flex-wrap items-center justify-between gap-2">
//           <div className="flex items-center gap-2">
//             <FiLock className="h-4 w-4 text-danger-600" />
//             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//               Blocked Slots
//             </p>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
//               {stats.total} total
//             </span>
//             {stats.fullDay > 0 && (
//               <span className="rounded-md bg-warn-100 px-2 py-0.5 text-[10px] font-semibold text-warn-800">
//                 {stats.fullDay} full day
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Date + Provider subtitle */}
//         <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
//           <span className="font-medium">{formatDateFull(date)}</span>
//           {provider && (
//             <>
//               <span className="text-ink-300">•</span>
//               <span className="font-medium">{provider.name}</span>
//             </>
//           )}
//         </div>
//       </div>

//       {/* ==================== LIST ==================== */}
//       <div className="max-h-[480px] space-y-2 overflow-y-auto p-4">
//         {exceptions.map((ex) => (
//           <ExceptionItem
//             key={ex._key || ex.id}
//             ex={ex}
//             provider={provider}
//             onExceptionClick={onExceptionClick}
//           />
//         ))}
//       </div>

//       {/* ==================== FOOTER ==================== */}
//       <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-2.5">
//         <p className="text-[10px] text-ink-500">
//           Click any blocked slot to view full details
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ExceptionList;

import { useMemo } from "react";
import {
  FiLock,
  FiClock,
  FiCalendar,
  FiInfo,
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";
import { usePermission } from "../../../hooks/usePermission";
import {
  formatTime12,
  formatDateFull,
} from "../../../queries/exceptionManagement";
import { useSlotsForDate } from "../../../queries/providerAvailabilities";

// ==================== BOOKINGS FOR AN EXCEPTION ====================
// FIX: Sirf tabhi block maana jayega jab slot FULLY booked ho (booked >= capacity).
// Partially booked slot (jaise 2 me se 1 booked) block nahi hoga.
export const useExceptionBookings = (ex) => {
  const providerId = ex?.provider?.id || null;
  const typeId = ex?.appointment_type?.id || null;
  const date = ex?.exception_date || null;

  const { data, isLoading } = useSlotsForDate({
    admin_id: providerId,
    appointment_type_id: typeId,
    date,
    enabled: !!(providerId && typeId && date),
  });

  const slots = data?.slots;

  return useMemo(() => {
    const empty = {
      loading: isLoading,
      hasData: false,
      booked: 0,
      capacity: 0,
      available: 0,
      fullyBooked: false,
      partiallyBooked: false,
    };
    if (!ex || !Array.isArray(slots) || slots.length === 0) return empty;

    let relevant = slots;
    if (!ex.is_full_day && ex.start_time) {
      const st = String(ex.start_time).slice(0, 5);
      relevant = slots.filter((s) => s.start_time === st);
    }
    if (relevant.length === 0) return empty;

    const hasCounts = relevant.some(
      (s) => s.booked_count !== undefined || Array.isArray(s.appointments),
    );
    if (!hasCounts) return empty;

    let booked = 0;
    let capacity = 0;
    let fullyBooked = false;
    let partiallyBooked = false;

    for (const s of relevant) {
      const b =
        Number(s.booked_count) ||
        (Array.isArray(s.appointments) ? s.appointments.length : 0);
      const c = Number(s.capacity) || 1;

      booked += b;
      capacity += c;

      // Slot fully booked tabhi hai jab booked seats capacity ke barabar ya zyada ho
      if (b >= c) {
        fullyBooked = true;
      } else if (b > 0) {
        partiallyBooked = true;
      }
    }

    const available = Math.max(capacity - booked, 0);

    return {
      loading: false,
      hasData: true,
      booked,
      capacity,
      available,
      fullyBooked,
      partiallyBooked,
    };
  }, [ex, slots, isLoading]);
};

// ==================== SINGLE EXCEPTION ROW ====================
const ExceptionItem = ({ ex, provider, onExceptionClick }) => {
  const isFullDay = ex.is_full_day;
  const bookings = useExceptionBookings(ex);

  const renderBookingChip = () => {
    if (!bookings.hasData) return null;

    if (bookings.fullyBooked) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[9px] font-semibold text-warn-800 ring-1 ring-warn-200">
          <FiUsers className="h-2.5 w-2.5" />
          Fully booked ({bookings.booked}/{bookings.capacity})
        </span>
      );
    }

    if (bookings.partiallyBooked) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold text-accent-800 ring-1 ring-accent-200">
          <FiUsers className="h-2.5 w-2.5" />
          {bookings.booked}/{bookings.capacity} booked · {bookings.available}{" "}
          available
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-500 ring-1 ring-ink-200">
        <FiUsers className="h-2.5 w-2.5" />
        No bookings
      </span>
    );
  };

  return (
    <button
      type="button"
      onClick={() => onExceptionClick(ex)}
      title="Click for details"
      className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-left transition hover:border-danger-500/50 hover:bg-danger-100/70"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-500 text-surface">
        <FiLock className="h-3 w-3" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isFullDay ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-warn-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn-800">
              <FiAlertCircle className="h-2.5 w-2.5" />
              Full Day
              {ex.slot_count > 1 && ` · ${ex.slot_count} slots`}
            </span>
          ) : (
            <span className="text-[12px] font-semibold text-danger-700">
              {formatTime12(ex.start_time)}
              <span className="mx-1 font-normal text-danger-600">–</span>
              {formatTime12(ex.end_time)}
            </span>
          )}

          {!provider && ex.provider?.name && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-700 ring-1 ring-ink-200">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-400" />
              {ex.provider.name}
            </span>
          )}

          {ex.appointment_type?.name && (
            <span className="inline-flex rounded-md bg-surface/70 px-1.5 py-0.5 text-[9px] font-medium text-ink-600 ring-1 ring-ink-200">
              {ex.appointment_type.name}
            </span>
          )}

          {renderBookingChip()}
        </div>

        {ex.reason && (
          <p className="mt-1 truncate text-[11px] text-ink-600">
            <span className="font-medium text-ink-500">Reason:</span>{" "}
            {ex.reason}
          </p>
        )}

        {ex.created_at && (
          <p className="mt-1 text-[10px] text-ink-400">
            Created{" "}
            {new Date(ex.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center">
        <FiInfo className="h-3.5 w-3.5 text-danger-500" />
      </div>
    </button>
  );
};

// ==================== LIST ====================
const ExceptionList = ({
  date,
  exceptions = [],
  provider,
  isLoading = false,
  onExceptionClick,
}) => {
  const { can } = usePermission();
  const canView = can("availability", "view");

  const stats = useMemo(() => {
    const fullDay = exceptions.filter((e) => e.is_full_day).length;
    const total = exceptions.reduce((sum, e) => sum + (e.slot_count || 1), 0);
    return { total, fullDay };
  }, [exceptions]);

  if (!canView) {
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <FiLock className="h-5 w-5 text-ink-500" />
          </div>
          <p className="text-sm font-semibold text-ink-700">
            Permission Required
          </p>
          <p className="mt-1 text-xs text-ink-500">
            You don't have permission to view availability exceptions.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiLock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Blocked Slots
            </p>
          </div>
        </div>
        <div className="px-4 py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
            <p className="text-xs text-ink-500">Loading exceptions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (exceptions.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiLock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Blocked Slots
            </p>
          </div>
        </div>
        <div className="px-4 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <FiCalendar className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-ink-700">No blocked slots</p>
          <p className="mt-1 text-xs text-ink-500">
            {provider
              ? `${provider.name} has no blocked slots on this date.`
              : "No exceptions found for this date."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiLock className="h-4 w-4 text-danger-600" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Blocked Slots
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
              {stats.total} total
            </span>
            {stats.fullDay > 0 && (
              <span className="rounded-md bg-warn-100 px-2 py-0.5 text-[10px] font-semibold text-warn-800">
                {stats.fullDay} full day
              </span>
            )}
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-500">
          <span className="font-medium">{formatDateFull(date)}</span>
          {provider && (
            <>
              <span className="text-ink-300">•</span>
              <span className="font-medium">{provider.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-h-[480px] space-y-2 overflow-y-auto p-4">
        {exceptions.map((ex) => (
          <ExceptionItem
            key={ex._key || ex.id}
            ex={ex}
            provider={provider}
            onExceptionClick={onExceptionClick}
          />
        ))}
      </div>

      <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-2.5">
        <p className="text-[10px] text-ink-500">
          Click any blocked slot to view full details
        </p>
      </div>
    </div>
  );
};

export default ExceptionList;
