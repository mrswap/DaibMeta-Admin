// // // src/features/patent/pages/bookingCalendar/components/SlotList.jsx

// // import { useMemo } from "react";
// // import {
// //   FiClock,
// //   FiPlus,
// //   FiInfo,
// //   FiCheck,
// //   FiLock,
// //   FiUser,
// //   FiCheckCircle,
// // } from "react-icons/fi";
// // import { useExceptionsForCalendar } from "../../../queries/bookingCalendar";

// // // ==================== HELPERS ====================
// // const timeToMinutes = (t) => {
// //   if (!t) return 0;
// //   const [h, m] = t.slice(0, 5).split(":").map(Number);
// //   return h * 60 + m;
// // };

// // const minutesToTime = (min) => {
// //   const h = Math.floor(min / 60);
// //   const m = min % 60;
// //   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// // };

// // const formatTime12 = (t) => {
// //   if (!t) return "";
// //   const [h, m] = t.slice(0, 5).split(":").map(Number);
// //   const period = h >= 12 ? "PM" : "AM";
// //   const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
// //   return `${hr}:${String(m).padStart(2, "0")} ${period}`;
// // };

// // const generateSlots = (startTime, endTime, duration) => {
// //   if (!startTime || !endTime || !duration) return [];
// //   const startMin = timeToMinutes(startTime);
// //   const endMin = timeToMinutes(endTime);
// //   const slots = [];
// //   for (let t = startMin; t + duration <= endMin; t += duration) {
// //     slots.push({
// //       start_time: minutesToTime(t),
// //       end_time: minutesToTime(t + duration),
// //     });
// //   }
// //   return slots;
// // };

// // const toShortTime = (val) => {
// //   if (!val) return "";
// //   if (typeof val === "string") return val.slice(0, 5);
// //   return "";
// // };

// // const toLocalDateString = (val) => {
// //   if (!val) return "";
// //   if (typeof val === "string" && val.length === 10 && !val.includes("T")) {
// //     return val;
// //   }
// //   const dt = new Date(val);
// //   if (isNaN(dt.getTime())) return "";
// //   const y = dt.getFullYear();
// //   const m = String(dt.getMonth() + 1).padStart(2, "0");
// //   const d = String(dt.getDate()).padStart(2, "0");
// //   return `${y}-${m}-${d}`;
// // };

// // // ==================== STATUS CLASSIFIER ====================
// // const BOOKED_ONLY_STATUS = "booked";

// // const classifySlotStatus = (apptStatus, hasVisit) => {
// //   if (hasVisit) return "checked_in";
// //   if (apptStatus === BOOKED_ONLY_STATUS) return "booked";
// //   return "checked_in";
// // };

// // // ==================== LABEL LOGIC ====================
// // const getSlotLabel = (status, visit, appointment) => {
// //   if (status === "available") return "Available";
// //   if (status === "blocked") return "Blocked";

// //   if (status === "checked_in") {
// //     return visit?.status_label || appointment?.status_label || "Checked In";
// //   }

// //   if (status === "booked") {
// //     return "Booked";
// //   }

// //   return status;
// // };

// // // ==================== SLOT STYLES ====================
// // const SLOT_STYLES = {
// //   available:
// //     "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
// //   booked:
// //     "cursor-pointer border-ink-200 bg-ink-100 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
// //   checked_in:
// //     "cursor-pointer border-accent-200 bg-accent-50 text-accent-800 hover:border-accent-400 hover:bg-accent-100",
// //   blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
// // };

// // const SLOT_ICONS = {
// //   available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
// //   booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
// //   checked_in: <FiCheckCircle className="h-3.5 w-3.5 text-surface" />,
// //   blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
// // };

// // const SLOT_ICON_BG = {
// //   available: "bg-brand-500",
// //   booked: "bg-ink-400",
// //   checked_in: "bg-accent-600",
// //   blocked: "bg-danger-500",
// // };

// // // ==================== COMPONENT ====================
// // const SlotList = ({
// //   availability,
// //   bookedAppointments = [],
// //   appointmentVisitMap = {},
// //   date,
// //   onSlotClick,
// //   onBookedSlotClick,
// //   onAddAvailability,
// // }) => {
// //   const { data: exceptions = [] } = useExceptionsForCalendar(availability?.id);

// //   const exceptionsList = Array.isArray(exceptions) ? exceptions : [];

// //   // ==================== SLOT COMPUTATION ====================
// //   const slots = useMemo(() => {
// //     if (!availability) return [];

// //     const generated = generateSlots(
// //       availability.start_time,
// //       availability.end_time,
// //       availability.slot_duration,
// //     );

// //     const dateExceptions = exceptionsList.filter(
// //       (ex) =>
// //         toLocalDateString(ex.exception_date) === date && ex.status !== false,
// //     );

// //     const hasFullDay = dateExceptions.some(
// //       (ex) => !ex.start_time && !ex.end_time,
// //     );

// //     const blockedRanges = dateExceptions
// //       .filter((ex) => ex.start_time && ex.end_time)
// //       .map((ex) => ({
// //         start: timeToMinutes(toShortTime(ex.start_time)),
// //         end: timeToMinutes(toShortTime(ex.end_time)),
// //       }));

// //     return generated.map((slot) => {
// //       const slotStart = timeToMinutes(slot.start_time);
// //       const slotEnd = timeToMinutes(slot.end_time);

// //       const bookedAppointment = bookedAppointments.find(
// //         (a) => a.start_time?.slice(0, 5) === slot.start_time,
// //       );

// //       const isBooked = !!bookedAppointment;

// //       const isBlocked =
// //         !isBooked &&
// //         (hasFullDay ||
// //           blockedRanges.some((r) => slotStart < r.end && slotEnd > r.start));

// //       const visit = bookedAppointment?.id
// //         ? appointmentVisitMap[bookedAppointment.id] || null
// //         : null;

// //       let status = "available";
// //       if (isBooked) {
// //         status = classifySlotStatus(bookedAppointment.status, !!visit);
// //       } else if (isBlocked) {
// //         status = "blocked";
// //       }

// //       const bookingMeta = bookedAppointment
// //         ? {
// //             id: bookedAppointment.id,
// //             name: bookedAppointment.name || "—",
// //             mobile: bookedAppointment.mobile || "—",
// //             status: bookedAppointment.status,
// //             status_label: bookedAppointment.status_label,
// //             booking_source: bookedAppointment.booking_source,
// //             patient_id:
// //               bookedAppointment.patient?.id ||
// //               bookedAppointment.patient_id ||
// //               null,
// //           }
// //         : null;

// //       return {
// //         ...slot,
// //         status,
// //         isBooked,
// //         appointment: bookingMeta,
// //         rawAppointment: bookedAppointment,
// //         visit,
// //       };
// //     });
// //   }, [
// //     availability,
// //     bookedAppointments,
// //     exceptionsList,
// //     date,
// //     appointmentVisitMap,
// //   ]);

// //   // ==================== STATS ====================
// //   const stats = useMemo(() => {
// //     const available = slots.filter((s) => s.status === "available").length;
// //     const booked = slots.filter((s) => s.status === "booked").length;
// //     const checkedIn = slots.filter((s) => s.status === "checked_in").length;
// //     const blocked = slots.filter((s) => s.status === "blocked").length;
// //     return {
// //       available,
// //       booked,
// //       checkedIn,
// //       blocked,
// //       total: slots.length,
// //     };
// //   }, [slots]);

// //   // ==================== NO AVAILABILITY ====================
// //   if (!availability) {
// //     return (
// //       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// //         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// //           <div className="flex items-center gap-2">
// //             <FiClock className="h-4 w-4 text-ink-500" />
// //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// //               Slots for {date}
// //             </p>
// //           </div>
// //         </div>

// //         <div className="px-4 py-8 text-center">
// //           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warn-100 text-warn-700">
// //             <FiInfo className="h-4 w-4" />
// //           </div>
// //           <p className="text-sm font-medium text-ink-700">
// //             No availability configured
// //           </p>
// //           <p className="mt-1 text-xs text-ink-500">
// //             This provider has no availability for {date}.
// //           </p>

// //           <button
// //             type="button"
// //             onClick={onAddAvailability}
// //             className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
// //           >
// //             <FiPlus className="h-3.5 w-3.5" />
// //             Add Availability
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ==================== RENDER ====================
// //   return (
// //     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
// //       {/* Header */}
// //       <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
// //         <div className="flex flex-wrap items-center justify-between gap-2">
// //           <div className="flex items-center gap-2">
// //             <FiClock className="h-4 w-4 text-ink-500" />
// //             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
// //               Slots for {date}
// //             </p>
// //           </div>
// //           <div className="flex flex-wrap items-center gap-1.5">
// //             <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
// //               {stats.available} available
// //             </span>
// //             {stats.booked > 0 && (
// //               <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
// //                 {stats.booked} booked
// //               </span>
// //             )}
// //             {stats.checkedIn > 0 && (
// //               <span className="rounded-md bg-accent-100 px-2 py-0.5 text-[10px] font-semibold text-accent-800">
// //                 {stats.checkedIn} checked in
// //               </span>
// //             )}
// //             {stats.blocked > 0 && (
// //               <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
// //                 {stats.blocked} blocked
// //               </span>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Slot grid */}
// //       <div className="max-h-[480px] overflow-y-auto p-4">
// //         {slots.length === 0 ? (
// //           <div className="py-8 text-center">
// //             <p className="text-xs text-ink-500">No slots available.</p>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
// //             {slots.map((slot, idx) => {
// //               const status = slot.status;
// //               const isAvailable = status === "available";
// //               const isBooked = status === "booked";
// //               const isCheckedIn = status === "checked_in";
// //               const isBlocked = status === "blocked";

// //               const hasPatientId = !!slot.appointment?.patient_id;
// //               const isWalkIn = (isBooked || isCheckedIn) && !hasPatientId;

// //               const handleClick = () => {
// //                 if (isAvailable) {
// //                   onSlotClick(slot);
// //                 } else if ((isBooked || isCheckedIn) && onBookedSlotClick) {
// //                   onBookedSlotClick(slot);
// //                 }
// //               };

// //               const label = getSlotLabel(status, slot.visit, slot.appointment);

// //               let tooltip = "Click to book";
// //               if (isBooked) {
// //                 tooltip = hasPatientId
// //                   ? `Booked — ${slot.appointment?.name || "—"}`
// //                   : `Booked — ${slot.appointment?.name || "—"} (Patient ID NA)`;
// //               } else if (isCheckedIn) {
// //                 tooltip = slot.visit
// //                   ? `Visit #${slot.visit.id} (${label}) — click to view`
// //                   : `${label} — click for details`;
// //               } else if (isBlocked) {
// //                 tooltip = "Blocked by availability exception";
// //               }

// //               return (
// //                 <button
// //                   key={idx}
// //                   type="button"
// //                   disabled={isBlocked}
// //                   onClick={handleClick}
// //                   title={tooltip}
// //                   className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition ${SLOT_STYLES[status]}`}
// //                 >
// //                   {/* Left: time + label + sub-label */}
// //                   <div className="min-w-0 flex-1">
// //                     <p className="text-[12px] font-semibold leading-tight">
// //                       {formatTime12(slot.start_time)}
// //                     </p>
// //                     <p className="mt-0.5 truncate text-[10px] leading-tight opacity-80">
// //                       to {formatTime12(slot.end_time)}
// //                     </p>
// //                     <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-wide opacity-80">
// //                       {label}
// //                     </p>
// //                     {/* Sub-line: Patient ID NA */}
// //                     {isWalkIn && (
// //                       <p className="mt-0.5 break-words text-[8px] font-bold uppercase leading-tight tracking-wide text-warn-800">
// //                         Patient ID NA
// //                       </p>
// //                     )}
// //                   </div>

// //                   {/* Right: status icon */}
// //                   <div
// //                     className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SLOT_ICON_BG[status]}`}
// //                   >
// //                     {SLOT_ICONS[status]}
// //                   </div>
// //                 </button>
// //               );
// //             })}
// //           </div>
// //         )}
// //       </div>

// //       {/* Legend footer */}
// //       <div className="border-t border-ink-100 bg-ink-50/30 px-3 py-2.5">
// //         <div className="flex flex-wrap items-center gap-3">
// //           <div className="flex items-center gap-1.5">
// //             <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
// //             <span className="text-[10px] text-ink-600">Available</span>
// //           </div>
// //           <div className="flex items-center gap-1.5">
// //             <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink-400" />
// //             <span className="text-[10px] text-ink-600">Booked</span>
// //           </div>
// //           <div className="flex items-center gap-1.5">
// //             <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-600" />
// //             <span className="text-[10px] text-ink-600">Checked In</span>
// //           </div>
// //           <div className="flex items-center gap-1.5">
// //             <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger-500" />
// //             <span className="text-[10px] text-ink-600">Blocked</span>
// //           </div>
// //         </div>

// //         <button
// //           type="button"
// //           onClick={onAddAvailability}
// //           className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
// //         >
// //           <FiPlus className="h-3.5 w-3.5" />
// //           Add / Manage Availability
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SlotList;

// // src/features/patent/pages/bookingCalendar/components/SlotList.jsx

// import { useMemo, useState } from "react";
// import {
//   FiClock,
//   FiPlus,
//   FiInfo,
//   FiCheck,
//   FiLock,
//   FiUser,
//   FiCheckCircle,
//   FiGift,
// } from "react-icons/fi";
// import { useExceptionsForCalendar } from "../../../queries/bookingCalendar";

// // ==================== HELPERS ====================
// const timeToMinutes = (t) => {
//   if (!t) return 0;
//   const [h, m] = t.slice(0, 5).split(":").map(Number);
//   return h * 60 + m;
// };

// const minutesToTime = (min) => {
//   const h = Math.floor(min / 60);
//   const m = min % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// };

// const formatTime12 = (t) => {
//   if (!t) return "";
//   const [h, m] = t.slice(0, 5).split(":").map(Number);
//   const period = h >= 12 ? "PM" : "AM";
//   const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
//   return `${hr}:${String(m).padStart(2, "0")} ${period}`;
// };

// const generateSlots = (startTime, endTime, duration) => {
//   if (!startTime || !endTime || !duration) return [];
//   const startMin = timeToMinutes(startTime);
//   const endMin = timeToMinutes(endTime);
//   const slots = [];
//   for (let t = startMin; t + duration <= endMin; t += duration) {
//     slots.push({
//       start_time: minutesToTime(t),
//       end_time: minutesToTime(t + duration),
//     });
//   }
//   return slots;
// };

// const toShortTime = (val) => {
//   if (!val) return "";
//   if (typeof val === "string") return val.slice(0, 5);
//   return "";
// };

// const toLocalDateString = (val) => {
//   if (!val) return "";
//   if (typeof val === "string" && val.length === 10 && !val.includes("T")) {
//     return val;
//   }
//   const dt = new Date(val);
//   if (isNaN(dt.getTime())) return "";
//   const y = dt.getFullYear();
//   const m = String(dt.getMonth() + 1).padStart(2, "0");
//   const d = String(dt.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

// // ==================== STATUS CLASSIFIER ====================
// const BOOKED_ONLY_STATUS = "booked";

// const classifySlotStatus = (apptStatus, hasVisit) => {
//   if (hasVisit) return "checked_in";
//   if (apptStatus === BOOKED_ONLY_STATUS) return "booked";
//   return "checked_in";
// };

// // ==================== LABEL LOGIC ====================
// const getSlotLabel = (status, visit, appointment, isFree) => {
//   if (status === "available") return isFree ? "Free" : "Available";
//   if (status === "blocked") return "Blocked";

//   if (status === "checked_in") {
//     return visit?.status_label || appointment?.status_label || "Checked In";
//   }

//   if (status === "booked") {
//     return "Booked";
//   }

//   return status;
// };

// // ==================== SLOT STYLES ====================
// const SLOT_STYLES = {
//   available:
//     "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
//   free: "cursor-pointer border-brand-400 bg-brand-100 text-brand-800 shadow-sm ring-1 ring-brand-300 hover:border-brand-500 hover:bg-brand-200",
//   booked:
//     "cursor-pointer border-ink-200 bg-ink-100 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
//   checked_in:
//     "cursor-pointer border-accent-200 bg-accent-50 text-accent-800 hover:border-accent-400 hover:bg-accent-100",
//   blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
// };

// const SLOT_ICONS = {
//   available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
//   free: <FiGift className="h-3.5 w-3.5 text-surface" />,
//   booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
//   checked_in: <FiCheckCircle className="h-3.5 w-3.5 text-surface" />,
//   blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
// };

// const SLOT_ICON_BG = {
//   available: "bg-brand-500",
//   free: "bg-brand-700",
//   booked: "bg-ink-400",
//   checked_in: "bg-accent-600",
//   blocked: "bg-danger-500",
// };

// // ==================== COMPONENT ====================
// const SlotList = ({
//   availability,
//   bookedAppointments = [],
//   appointmentVisitMap = {},
//   freeSlotTimes = [],
//   date,
//   onSlotClick,
//   onBookedSlotClick,
//   onAddAvailability,
// }) => {
//   const { data: exceptions = [] } = useExceptionsForCalendar(availability?.id);

//   const exceptionsList = Array.isArray(exceptions) ? exceptions : [];

//   // "all" | "free"
//   const [filter, setFilter] = useState("all");

//   // ==================== SLOT COMPUTATION ====================
//   const slots = useMemo(() => {
//     if (!availability) return [];

//     const generated = generateSlots(
//       availability.start_time,
//       availability.end_time,
//       availability.slot_duration,
//     );

//     const dateExceptions = exceptionsList.filter(
//       (ex) =>
//         toLocalDateString(ex.exception_date) === date && ex.status !== false,
//     );

//     const hasFullDay = dateExceptions.some(
//       (ex) => !ex.start_time && !ex.end_time,
//     );

//     const blockedRanges = dateExceptions
//       .filter((ex) => ex.start_time && ex.end_time)
//       .map((ex) => ({
//         start: timeToMinutes(toShortTime(ex.start_time)),
//         end: timeToMinutes(toShortTime(ex.end_time)),
//       }));

//     const freeSet = new Set(freeSlotTimes);

//     return generated.map((slot) => {
//       const slotStart = timeToMinutes(slot.start_time);
//       const slotEnd = timeToMinutes(slot.end_time);

//       const bookedAppointment = bookedAppointments.find(
//         (a) => a.start_time?.slice(0, 5) === slot.start_time,
//       );

//       const isBooked = !!bookedAppointment;

//       const isBlocked =
//         !isBooked &&
//         (hasFullDay ||
//           blockedRanges.some((r) => slotStart < r.end && slotEnd > r.start));

//       const visit = bookedAppointment?.id
//         ? appointmentVisitMap[bookedAppointment.id] || null
//         : null;

//       let status = "available";
//       if (isBooked) {
//         status = classifySlotStatus(bookedAppointment.status, !!visit);
//       } else if (isBlocked) {
//         status = "blocked";
//       }

//       // Free sirf tab maane jab slot abhi available ho
//       const isFree = status === "available" && freeSet.has(slot.start_time);

//       const bookingMeta = bookedAppointment
//         ? {
//             id: bookedAppointment.id,
//             name: bookedAppointment.name || "—",
//             mobile: bookedAppointment.mobile || "—",
//             status: bookedAppointment.status,
//             status_label: bookedAppointment.status_label,
//             booking_source: bookedAppointment.booking_source,
//             patient_id:
//               bookedAppointment.patient?.id ||
//               bookedAppointment.patient_id ||
//               null,
//           }
//         : null;

//       return {
//         ...slot,
//         status,
//         isFree,
//         isBooked,
//         appointment: bookingMeta,
//         rawAppointment: bookedAppointment,
//         visit,
//       };
//     });
//   }, [
//     availability,
//     bookedAppointments,
//     exceptionsList,
//     date,
//     appointmentVisitMap,
//     freeSlotTimes,
//   ]);

//   // ==================== STATS ====================
//   const stats = useMemo(() => {
//     const available = slots.filter((s) => s.status === "available").length;
//     const free = slots.filter((s) => s.isFree).length;
//     const booked = slots.filter((s) => s.status === "booked").length;
//     const checkedIn = slots.filter((s) => s.status === "checked_in").length;
//     const blocked = slots.filter((s) => s.status === "blocked").length;
//     return {
//       available,
//       free,
//       booked,
//       checkedIn,
//       blocked,
//       total: slots.length,
//     };
//   }, [slots]);

//   // Filter apply
//   const visibleSlots = useMemo(() => {
//     if (filter === "free") return slots.filter((s) => s.isFree);
//     return slots;
//   }, [slots, filter]);

//   // ==================== NO AVAILABILITY ====================
//   if (!availability) {
//     return (
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//           <div className="flex items-center gap-2">
//             <FiClock className="h-4 w-4 text-ink-500" />
//             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//               Slots for {date}
//             </p>
//           </div>
//         </div>

//         <div className="px-4 py-8 text-center">
//           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warn-100 text-warn-700">
//             <FiInfo className="h-4 w-4" />
//           </div>
//           <p className="text-sm font-medium text-ink-700">
//             No availability configured
//           </p>
//           <p className="mt-1 text-xs text-ink-500">
//             This provider has no availability for {date}.
//           </p>

//           <button
//             type="button"
//             onClick={onAddAvailability}
//             className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
//           >
//             <FiPlus className="h-3.5 w-3.5" />
//             Add Availability
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ==================== RENDER ====================
//   return (
//     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//       {/* Header */}
//       <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//         <div className="flex flex-wrap items-center justify-between gap-2">
//           <div className="flex items-center gap-2">
//             <FiClock className="h-4 w-4 text-ink-500" />
//             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//               Slots for {date}
//             </p>
//           </div>
//           <div className="flex flex-wrap items-center gap-1.5">
//             <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
//               {stats.available} available
//             </span>
//             {stats.free > 0 && (
//               <span className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
//                 <FiGift className="h-2.5 w-2.5" />
//                 {stats.free} free
//               </span>
//             )}
//             {stats.booked > 0 && (
//               <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
//                 {stats.booked} booked
//               </span>
//             )}
//             {stats.checkedIn > 0 && (
//               <span className="rounded-md bg-accent-100 px-2 py-0.5 text-[10px] font-semibold text-accent-800">
//                 {stats.checkedIn} checked in
//               </span>
//             )}
//             {stats.blocked > 0 && (
//               <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
//                 {stats.blocked} blocked
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Filter tabs: sirf tab dikhao jab free slots ho */}
//         {stats.free > 0 && (
//           <div className="mt-2.5 inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-surface p-1">
//             <button
//               type="button"
//               onClick={() => setFilter("all")}
//               className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
//                 filter === "all"
//                   ? "bg-ink-100 text-ink-900"
//                   : "text-ink-500 hover:bg-ink-50"
//               }`}
//             >
//               All Slots
//             </button>
//             <button
//               type="button"
//               onClick={() => setFilter("free")}
//               className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
//                 filter === "free"
//                   ? "bg-brand-50 text-brand-700"
//                   : "text-ink-500 hover:bg-ink-50"
//               }`}
//             >
//               <FiGift className="h-3 w-3" />
//               Free Only
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Slot grid */}
//       <div className="max-h-[480px] overflow-y-auto p-4">
//         {visibleSlots.length === 0 ? (
//           <div className="py-8 text-center">
//             <p className="text-xs text-ink-500">
//               {filter === "free" ? "No free slots." : "No slots available."}
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
//             {visibleSlots.map((slot, idx) => {
//               const status = slot.status;
//               const isAvailable = status === "available";
//               const isBooked = status === "booked";
//               const isCheckedIn = status === "checked_in";
//               const isBlocked = status === "blocked";
//               const isFree = slot.isFree;

//               // style key: free slot ka apna style
//               const styleKey = isFree ? "free" : status;

//               const hasPatientId = !!slot.appointment?.patient_id;
//               const isWalkIn = (isBooked || isCheckedIn) && !hasPatientId;

//               const handleClick = () => {
//                 if (isAvailable) {
//                   onSlotClick(slot);
//                 } else if ((isBooked || isCheckedIn) && onBookedSlotClick) {
//                   onBookedSlotClick(slot);
//                 }
//               };

//               const label = getSlotLabel(
//                 status,
//                 slot.visit,
//                 slot.appointment,
//                 isFree,
//               );

//               let tooltip = isFree
//                 ? "Free slot — click to book"
//                 : "Click to book";
//               if (isBooked) {
//                 tooltip = hasPatientId
//                   ? `Booked — ${slot.appointment?.name || "—"}`
//                   : `Booked — ${slot.appointment?.name || "—"} (Patient ID NA)`;
//               } else if (isCheckedIn) {
//                 tooltip = slot.visit
//                   ? `Visit #${slot.visit.id} (${label}) — click to view`
//                   : `${label} — click for details`;
//               } else if (isBlocked) {
//                 tooltip = "Blocked by availability exception";
//               }

//               return (
//                 <button
//                   key={`${slot.start_time}-${idx}`}
//                   type="button"
//                   disabled={isBlocked}
//                   onClick={handleClick}
//                   title={tooltip}
//                   className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition ${SLOT_STYLES[styleKey]}`}
//                 >
//                   {/* Left: time + label + sub-label */}
//                   <div className="min-w-0 flex-1">
//                     <p className="text-[12px] font-semibold leading-tight">
//                       {formatTime12(slot.start_time)}
//                     </p>
//                     <p className="mt-0.5 truncate text-[10px] leading-tight opacity-80">
//                       to {formatTime12(slot.end_time)}
//                     </p>
//                     <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-wide opacity-80">
//                       {label}
//                     </p>
//                     {/* Sub-line: Patient ID NA */}
//                     {isWalkIn && (
//                       <p className="mt-0.5 break-words text-[8px] font-bold uppercase leading-tight tracking-wide text-warn-800">
//                         Patient ID NA
//                       </p>
//                     )}
//                   </div>

//                   {/* Right: status icon */}
//                   <div
//                     className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SLOT_ICON_BG[styleKey]}`}
//                   >
//                     {SLOT_ICONS[styleKey]}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Legend footer */}
//       <div className="border-t border-ink-100 bg-ink-50/30 px-3 py-2.5">
//         <div className="flex flex-wrap items-center gap-3">
//           <div className="flex items-center gap-1.5">
//             <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
//             <span className="text-[10px] text-ink-600">Available</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-700" />
//             <span className="text-[10px] text-ink-600">Free</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink-400" />
//             <span className="text-[10px] text-ink-600">Booked</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-600" />
//             <span className="text-[10px] text-ink-600">Checked In</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger-500" />
//             <span className="text-[10px] text-ink-600">Blocked</span>
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={onAddAvailability}
//           className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
//         >
//           <FiPlus className="h-3.5 w-3.5" />
//           Add / Manage Availability
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SlotList;

// src/features/patent/pages/bookingCalendar/components/SlotList.jsx

import { useMemo, useState } from "react";
import {
  FiClock,
  FiPlus,
  FiInfo,
  FiCheck,
  FiLock,
  FiUser,
  FiGift,
  FiUsers,
} from "react-icons/fi";

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

// ==================== STYLE VARIANTS ====================
const SLOT_STYLES = {
  available:
    "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
  available_free:
    "cursor-pointer border-accent-300 bg-accent-50 text-accent-800 hover:border-accent-400 hover:bg-accent-100",
  partially_booked:
    "cursor-pointer border-warn-200 bg-warn-50 text-warn-700 hover:border-warn-400 hover:bg-warn-100",
  booked:
    "cursor-pointer border-ink-200 bg-ink-100 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
  blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
};

const SLOT_ICONS = {
  available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
  available_free: <FiGift className="h-3.5 w-3.5 text-surface" />,
  partially_booked: <FiUsers className="h-3.5 w-3.5 text-surface" />,
  booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
  blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
};

const SLOT_ICON_BG = {
  available: "bg-brand-500",
  available_free: "bg-accent-600",
  partially_booked: "bg-warn-500",
  booked: "bg-ink-400",
  blocked: "bg-danger-500",
};

const STATUS_LABEL = {
  available: "Available",
  partially_booked: "Partially Booked",
  booked: "Booked",
  blocked: "Blocked",
};

// ==================== COMPONENT ====================
const SlotList = ({
  availability,
  slots = [],
  slotsLoading = false,
  appointmentVisitMap = {},
  date,
  onSlotClick,
  onBookedSlotClick,
  onAddAvailability,
}) => {
  const [filter, setFilter] = useState("all");

  // ==================== COMPUTED SLOTS ====================
  const computedSlots = useMemo(() => {
    return slots.map((s) => {
      const status = s.status || (s.available ? "available" : "booked");
      const appointmentId = s.appointment?.id || s.appointment_id || null;
      const visit = appointmentId
        ? appointmentVisitMap[appointmentId] || null
        : null;

      const isAvailable = s.available === true;
      const isFree = !!s.is_free;

      let styleKey = status;
      if (status === "available" && isFree) styleKey = "available_free";

      return {
        ...s,
        status,
        styleKey,
        isFree,
        isFreeMarked: !!s.free_marked,
        isAvailable,
        appointmentId,
        visit,
      };
    });
  }, [slots, appointmentVisitMap]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const total = computedSlots.length;
    const available = computedSlots.filter(
      (s) => s.status === "available",
    ).length;
    const availableFree = computedSlots.filter(
      (s) => s.status === "available" && s.isFree,
    ).length;
    const partiallyBooked = computedSlots.filter(
      (s) => s.status === "partially_booked",
    ).length;
    const booked = computedSlots.filter((s) => s.status === "booked").length;
    const blocked = computedSlots.filter((s) => s.status === "blocked").length;
    const freeMarked = computedSlots.filter((s) => s.isFree).length;
    const open = available + partiallyBooked;
    return {
      total,
      available,
      availableFree,
      partiallyBooked,
      booked,
      blocked,
      freeMarked,
      open,
    };
  }, [computedSlots]);

  // ==================== FILTER ====================
  const visibleSlots = useMemo(() => {
    if (filter === "available") {
      return computedSlots.filter((s) => s.isAvailable);
    }
    return computedSlots;
  }, [computedSlots, filter]);

  // ==================== NO AVAILABILITY ====================
  if (!availability) {
    return (
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Slots for {date}
            </p>
          </div>
        </div>

        <div className="px-4 py-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warn-100 text-warn-700">
            <FiInfo className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-ink-700">
            No availability configured
          </p>
          <p className="mt-1 text-xs text-ink-500">
            This provider has no availability for {date}.
          </p>

          <button
            type="button"
            onClick={onAddAvailability}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
          >
            <FiPlus className="h-3.5 w-3.5" />
            Add Availability
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* Header */}
      <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Slots for {date}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
              {stats.available} available
            </span>
            {stats.availableFree > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                <FiGift className="h-2.5 w-2.5" />
                {stats.availableFree} free
              </span>
            )}
            {stats.partiallyBooked > 0 && (
              <span className="rounded-md bg-warn-50 px-2 py-0.5 text-[10px] font-semibold text-warn-700">
                {stats.partiallyBooked} partial
              </span>
            )}
            {stats.booked > 0 && (
              <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                {stats.booked} booked
              </span>
            )}
            {stats.blocked > 0 && (
              <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
                {stats.blocked} blocked
              </span>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {stats.open > 0 && (
          <div className="mt-2.5 inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-surface p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                filter === "all"
                  ? "bg-ink-100 text-ink-900"
                  : "text-ink-500 hover:bg-ink-50"
              }`}
            >
              All Slots
            </button>
            <button
              type="button"
              onClick={() => setFilter("available")}
              className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                filter === "available"
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-500 hover:bg-ink-50"
              }`}
            >
              <FiCheck className="h-3 w-3" />
              Available Only
            </button>
          </div>
        )}
      </div>

      {/* Slot grid */}
      <div className="max-h-[480px] overflow-y-auto p-4">
        {slotsLoading ? (
          <div className="py-8 text-center">
            <p className="text-xs text-ink-500">Loading slots...</p>
          </div>
        ) : visibleSlots.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-ink-500">
              {filter === "available"
                ? "No available slots."
                : "No slots available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleSlots.map((slot, idx) => {
              const status = slot.status;
              const styleKey = slot.styleKey;
              const isAvailable = slot.isAvailable;
              const isBooked = status === "booked";
              const isPartiallyBooked = status === "partially_booked";
              const isBlocked = status === "blocked";

              const hasPatientId = !!slot.appointmentId;
              const isWalkIn = isBooked && !hasPatientId;

              const handleClick = () => {
                if (isAvailable) {
                  onSlotClick(slot);
                } else if (
                  (isBooked || isPartiallyBooked) &&
                  onBookedSlotClick
                ) {
                  onBookedSlotClick(slot);
                }
              };

              const label = STATUS_LABEL[status] || status;

              let tooltip = isAvailable ? "Click to book" : "";
              if (isBooked) {
                tooltip = hasPatientId
                  ? `Booked — ${slot.appointment?.name || "—"}`
                  : `Booked — ${slot.appointment?.name || "—"} (Patient ID NA)`;
              } else if (isPartiallyBooked) {
                tooltip = `Partially booked (${slot.booked_count}/${slot.capacity}) — click for details`;
              } else if (isBlocked) {
                tooltip = slot.reason || "Blocked";
              }

              return (
                <button
                  key={`${slot.start_time}-${idx}`}
                  type="button"
                  disabled={isBlocked}
                  onClick={handleClick}
                  title={tooltip}
                  className={`relative flex min-h-[72px] w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition ${SLOT_STYLES[styleKey]}`}
                >
                  {/* Left: time + label */}
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="whitespace-nowrap text-[12px] font-semibold leading-tight">
                      {formatTime12(slot.start_time)}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] leading-tight opacity-80">
                      to {formatTime12(slot.end_time)}
                    </p>
                    <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-wide opacity-80">
                      {label}
                    </p>
                    {isWalkIn && (
                      <p className="mt-0.5 break-words text-[8px] font-bold uppercase leading-tight tracking-wide text-warn-800">
                        Patient ID NA
                      </p>
                    )}
                  </div>

                  {/* Right: icon */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SLOT_ICON_BG[styleKey]}`}
                  >
                    {SLOT_ICONS[styleKey]}
                  </div>

                  {/* Free Badge - Top Right Positioned */}
                  {slot.isFree && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-accent-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-accent-800">
                      <FiGift className="h-2 w-2" />
                      Free
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend footer */}
      <div className="border-t border-ink-100 bg-ink-50/30 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
            <span className="text-[10px] text-ink-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-600" />
            <span className="text-[10px] text-ink-600">Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-warn-500" />
            <span className="text-[10px] text-ink-600">Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink-400" />
            <span className="text-[10px] text-ink-600">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger-500" />
            <span className="text-[10px] text-ink-600">Blocked</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddAvailability}
          className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Add / Manage Availability
        </button>
      </div>
    </div>
  );
};

export default SlotList;
