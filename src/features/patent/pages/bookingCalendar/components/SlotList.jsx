// // src/features/patent/pages/bookingCalendar/components/SlotList.jsx

// import { useMemo, useState } from "react";
// import {
//   FiClock,
//   FiPlus,
//   FiInfo,
//   FiCheck,
//   FiLock,
//   FiUser,
//   FiGift,
//   FiUsers,
// } from "react-icons/fi";

// // ==================== HELPERS ====================
// const formatTime12 = (t) => {
//   if (!t) return "";
//   const [h, m] = t.slice(0, 5).split(":").map(Number);
//   const period = h >= 12 ? "PM" : "AM";
//   const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
//   return `${hr}:${String(m).padStart(2, "0")} ${period}`;
// };

// const formatDate = (d) => {
//   if (!d) return "";
//   try {
//     return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
//       weekday: "short",
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return d;
//   }
// };

// // ==================== STYLE VARIANTS ====================
// const SLOT_STYLES = {
//   available:
//     "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
//   available_free:
//     "cursor-pointer border-accent-300 bg-accent-50 text-accent-800 hover:border-accent-400 hover:bg-accent-100",
//   booked:
//     "cursor-pointer border-ink-200 bg-ink-100 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
//   blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
// };

// const SLOT_ICONS = {
//   available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
//   available_free: <FiGift className="h-3.5 w-3.5 text-surface" />,
//   booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
//   blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
// };

// const SLOT_ICON_BG = {
//   available: "bg-brand-500",
//   available_free: "bg-accent-600",
//   booked: "bg-ink-400",
//   blocked: "bg-danger-500",
// };

// // ==================== COMPONENT ====================
// const SlotList = ({
//   availability,
//   slots = [],
//   slotsLoading = false,
//   appointmentVisitMap = {},
//   date,
//   onSlotClick,
//   onBookedSlotClick,
//   onAddAvailability,
//   canManageAvailability = false,
//   canManageAppointment = false,
// }) => {
//   const [filter, setFilter] = useState("all");

//   // ==================== COMPUTED SLOTS ====================
//   const computedSlots = useMemo(() => {
//     return slots.map((s) => {
//       const rawStatus = s.status || (s.available ? "available" : "booked");
//       // partially_booked alag status nahi — capacity bachi hai to "available"
//       const status = rawStatus === "partially_booked" ? "available" : rawStatus;

//       // appointments array (multiple bookings per slot)
//       const appointments = Array.isArray(s.appointments) ? s.appointments : [];

//       // backward-compat: purani API se single `appointment` object
//       const legacyAppointment = s.appointment || null;
//       const finalAppointments =
//         appointments.length > 0
//           ? appointments
//           : legacyAppointment
//             ? [legacyAppointment]
//             : [];

//       // har appointment ke saath visit attach karo (booking details ke liye)
//       const enrichedAppointments = finalAppointments.map((a) => {
//         const apptId = a?.id || null;
//         return {
//           ...a,
//           visit: apptId ? appointmentVisitMap[apptId] || null : null,
//         };
//       });

//       const capacity = Number(s.capacity) || 1;
//       const bookedCount = Number(s.booked_count) || enrichedAppointments.length;
//       const availableCount = Math.max(capacity - bookedCount, 0);

//       const isAvailable = s.available === true && availableCount > 0;
//       const isFree = !!s.is_free;

//       let styleKey = status;
//       if (status === "available" && isFree) styleKey = "available_free";

//       return {
//         ...s,
//         status,
//         styleKey,
//         isFree,
//         isFreeMarked: !!s.free_marked,
//         isAvailable,
//         appointments: enrichedAppointments,
//         capacity,
//         bookedCount,
//         availableCount,
//         hasMultiple: enrichedAppointments.length > 1,
//         hasAnyAppointment: enrichedAppointments.length > 0,
//       };
//     });
//   }, [slots, appointmentVisitMap]);

//   // ==================== STATS ====================
//   const stats = useMemo(() => {
//     const total = computedSlots.length;
//     const available = computedSlots.filter(
//       (s) => s.status === "available",
//     ).length;
//     const availableFree = computedSlots.filter(
//       (s) => s.status === "available" && s.isFree,
//     ).length;
//     const booked = computedSlots.filter((s) => s.status === "booked").length;
//     const blocked = computedSlots.filter((s) => s.status === "blocked").length;
//     const freeMarked = computedSlots.filter((s) => s.isFree).length;

//     // capacity-based totals
//     const totalCapacity = computedSlots.reduce((acc, s) => acc + s.capacity, 0);
//     const totalBooked = computedSlots.reduce(
//       (acc, s) => acc + s.bookedCount,
//       0,
//     );
//     const totalAvailableCapacity = totalCapacity - totalBooked;

//     const open = available;
//     return {
//       total,
//       available,
//       availableFree,
//       booked,
//       blocked,
//       freeMarked,
//       open,
//       totalCapacity,
//       totalBooked,
//       totalAvailableCapacity,
//     };
//   }, [computedSlots]);

//   // ==================== FILTER ====================
//   const visibleSlots = useMemo(() => {
//     if (filter === "available") {
//       return computedSlots.filter((s) => s.isAvailable);
//     }
//     return computedSlots;
//   }, [computedSlots, filter]);

//   // ==================== NO AVAILABILITY ====================
//   if (!availability) {
//     return (
//       <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//         <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//           <div className="flex items-center gap-2">
//             <FiClock className="h-4 w-4 text-ink-500" />
//             <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//               Slots for {formatDate(date)}
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
//             This provider has no availability for {formatDate(date)}.
//           </p>

//           {canManageAvailability && (
//             <button
//               type="button"
//               onClick={onAddAvailability}
//               className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
//             >
//               <FiPlus className="h-3.5 w-3.5" />
//               Add Availability
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // ==================== RENDER ====================
//   return (
//     <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
//       {/* Header */}
//       <div className="space-y-2.5 border-b border-ink-100 bg-ink-50/40 px-4 py-3">
//         <div className="flex items-center gap-2">
//           <FiClock className="h-4 w-4 text-ink-500" />
//           <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
//             Slots for {formatDate(date)}
//           </p>
//         </div>

//         {/* Summary chips */}
//         <div className="flex flex-wrap items-center gap-1.5">
//           <span className="inline-flex items-center gap-1 rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-700">
//             <FiUsers className="h-2.5 w-2.5" />
//             {stats.totalAvailableCapacity} / {stats.totalCapacity} capacity
//             available
//           </span>

//           <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
//             {stats.available} available
//           </span>
//           {stats.availableFree > 0 && (
//             <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
//               <FiGift className="h-2.5 w-2.5" />
//               {stats.availableFree} free
//             </span>
//           )}
//           {stats.booked > 0 && (
//             <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
//               {stats.booked} booked
//             </span>
//           )}
//           {stats.blocked > 0 && (
//             <span className="rounded-md bg-danger-50 px-2 py-0.5 text-[10px] font-semibold text-danger-700">
//               {stats.blocked} blocked
//             </span>
//           )}
//         </div>

//         {/* Filter tabs */}
//         {stats.open > 0 && (
//           <div className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-surface p-1">
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
//               onClick={() => setFilter("available")}
//               className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
//                 filter === "available"
//                   ? "bg-brand-50 text-brand-700"
//                   : "text-ink-500 hover:bg-ink-50"
//               }`}
//             >
//               <FiCheck className="h-3 w-3" />
//               Available Only
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Slot grid */}
//       <div className="max-h-[480px] overflow-y-auto p-4">
//         {slotsLoading ? (
//           <div className="py-8 text-center">
//             <p className="text-xs text-ink-500">Loading slots...</p>
//           </div>
//         ) : visibleSlots.length === 0 ? (
//           <div className="py-8 text-center">
//             <p className="text-xs text-ink-500">
//               {filter === "available"
//                 ? "No available slots."
//                 : "No slots available."}
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
//             {visibleSlots.map((slot, idx) => {
//               const status = slot.status;
//               const styleKey = slot.styleKey;
//               const isAvailable = slot.isAvailable;
//               const isBlocked = status === "blocked";

//               // Click logic:
//               //  - capacity available + canManageAppointment → QuickBookingModal
//               //  - fully booked + appointments hain → BookedSlotDetailsModal
//               const canClickAvailable =
//                 isAvailable && !!onSlotClick && canManageAppointment;
//               const canClickBooked =
//                 !isAvailable && slot.hasAnyAppointment && !!onBookedSlotClick;

//               const isClickable = canClickAvailable || canClickBooked;

//               const handleClick = () => {
//                 if (!isClickable) return;
//                 if (canClickAvailable) {
//                   onSlotClick?.(slot);
//                 } else if (canClickBooked) {
//                   onBookedSlotClick?.(slot);
//                 }
//               };

//               let tooltip = "";
//               if (isAvailable) {
//                 tooltip = canManageAppointment
//                   ? `Click to book · ${slot.availableCount} / ${slot.capacity} capacity available`
//                   : `Available · ${slot.availableCount} / ${slot.capacity} capacity available (permission required to book)`;
//               } else if (status === "booked") {
//                 tooltip = `Fully booked · ${slot.bookedCount} / ${slot.capacity} — click for details`;
//               } else if (isBlocked) {
//                 tooltip = slot.reason || "Blocked";
//               }

//               return (
//                 <button
//                   key={`${slot.start_time}-${idx}`}
//                   type="button"
//                   disabled={isBlocked || !isClickable}
//                   onClick={handleClick}
//                   title={tooltip}
//                   className={`flex w-full flex-col gap-2 rounded-lg border p-2.5 text-left transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${SLOT_STYLES[styleKey]}`}
//                 >
//                   {/* Row 1: time (left) + icon & Free (right) */}
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="min-w-0">
//                       <p className="whitespace-nowrap text-[13px] font-semibold leading-tight">
//                         {formatTime12(slot.start_time)}
//                       </p>
//                       <p className="mt-0.5 whitespace-nowrap text-[10px] leading-tight opacity-70">
//                         to {formatTime12(slot.end_time)}
//                       </p>
//                     </div>

//                     <div className="flex shrink-0 flex-col items-center gap-1">
//                       <div
//                         className={`flex h-6 w-6 items-center justify-center rounded-full ${SLOT_ICON_BG[styleKey]}`}
//                       >
//                         {SLOT_ICONS[styleKey]}
//                       </div>
//                       {slot.isFree && (
//                         <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-wide text-accent-700">
//                           Free
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {/* Row 2: capacity */}
//                   <span className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-md bg-accent-100 px-1.5 py-0.5 text-[10px] font-semibold text-accent-800 ring-1 ring-accent-200">
//                     <FiUsers className="h-2.5 w-2.5 shrink-0" />
//                     {slot.availableCount}/{slot.capacity} capacity
//                   </span>

//                   {/* Row 3: available + booked (alag-alag light chips, ek line me) */}
//                   <div className="flex flex-nowrap items-center gap-1">
//                     <span
//                       className={`min-w-0 truncate whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${
//                         slot.availableCount > 0
//                           ? "bg-brand-100 text-brand-800 ring-brand-200"
//                           : "bg-surface/60 text-ink-500 ring-ink-200"
//                       }`}
//                     >
//                       {slot.availableCount} available
//                     </span>
//                     {slot.bookedCount > 0 && (
//                       <span className="min-w-0 truncate whitespace-nowrap rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 ring-1 ring-ink-300">
//                         {slot.bookedCount} booked
//                       </span>
//                     )}
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
//           {[
//             ["bg-brand-500", "Available"],
//             ["bg-accent-600", "Free"],
//             ["bg-ink-400", "Booked"],
//             ["bg-danger-500", "Blocked"],
//           ].map(([dot, text]) => (
//             <div key={text} className="flex items-center gap-1.5">
//               <span
//                 className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`}
//               />
//               <span className="text-[10px] text-ink-600">{text}</span>
//             </div>
//           ))}
//         </div>

//         {canManageAvailability && (
//           <button
//             type="button"
//             onClick={onAddAvailability}
//             className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
//           >
//             <FiPlus className="h-3.5 w-3.5" />
//             Add / Manage Availability
//           </button>
//         )}
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

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

// ==================== STYLE VARIANTS ====================
const SLOT_STYLES = {
  available:
    "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
  available_free:
    "cursor-pointer border-accent-300 bg-accent-50 text-accent-800 hover:border-accent-400 hover:bg-accent-100",
  // ✅ selectedSlot prop se match hone par
  selected:
    "cursor-pointer border-brand-600 bg-brand-100 text-brand-800 ring-2 ring-brand-500",
  booked:
    "cursor-pointer border-ink-200 bg-ink-100 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
  blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
};

const SLOT_ICONS = {
  available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
  available_free: <FiGift className="h-3.5 w-3.5 text-surface" />,
  selected: <FiCheck className="h-3.5 w-3.5 text-surface" />,
  booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
  blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
};

const SLOT_ICON_BG = {
  available: "bg-brand-500",
  available_free: "bg-accent-600",
  selected: "bg-brand-600",
  booked: "bg-ink-400",
  blocked: "bg-danger-500",
};

// ==================== COMPONENT ====================
const SlotList = ({
  availability,
  slots = [],
  slotsLoading = false,
  appointmentVisitMap = {},
  date,
  selectedSlot = null, // ✅ optional: { start_time, ... } — match hone wala slot highlight hoga
  onSlotClick,
  onBookedSlotClick,
  onAddAvailability,
  canManageAvailability = false,
  canManageAppointment = false,
}) => {
  const [filter, setFilter] = useState("all");

  // ==================== COMPUTED SLOTS ====================
  const computedSlots = useMemo(() => {
    return slots.map((s) => {
      const rawStatus = s.status || (s.available ? "available" : "booked");
      // partially_booked alag status nahi — capacity bachi hai to "available"
      const status = rawStatus === "partially_booked" ? "available" : rawStatus;

      // appointments array (multiple bookings per slot)
      const appointments = Array.isArray(s.appointments) ? s.appointments : [];

      // backward-compat: purani API se single `appointment` object
      const legacyAppointment = s.appointment || null;
      const finalAppointments =
        appointments.length > 0
          ? appointments
          : legacyAppointment
            ? [legacyAppointment]
            : [];

      // har appointment ke saath visit attach karo (booking details ke liye)
      const enrichedAppointments = finalAppointments.map((a) => {
        const apptId = a?.id || null;
        return {
          ...a,
          visit: apptId ? appointmentVisitMap[apptId] || null : null,
        };
      });

      const capacity = Number(s.capacity) || 1;
      const bookedCount = Number(s.booked_count) || enrichedAppointments.length;
      const availableCount = Math.max(capacity - bookedCount, 0);

      const isAvailable = s.available === true && availableCount > 0;
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
        appointments: enrichedAppointments,
        capacity,
        bookedCount,
        availableCount,
        hasMultiple: enrichedAppointments.length > 1,
        hasAnyAppointment: enrichedAppointments.length > 0,
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
    const booked = computedSlots.filter((s) => s.status === "booked").length;
    const blocked = computedSlots.filter((s) => s.status === "blocked").length;
    const freeMarked = computedSlots.filter((s) => s.isFree).length;

    // capacity-based totals
    const totalCapacity = computedSlots.reduce((acc, s) => acc + s.capacity, 0);
    const totalBooked = computedSlots.reduce(
      (acc, s) => acc + s.bookedCount,
      0,
    );
    const totalAvailableCapacity = totalCapacity - totalBooked;

    const open = available;
    return {
      total,
      available,
      availableFree,
      booked,
      blocked,
      freeMarked,
      open,
      totalCapacity,
      totalBooked,
      totalAvailableCapacity,
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
              Slots for {formatDate(date)}
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
            This provider has no availability for {formatDate(date)}.
          </p>

          {canManageAvailability && (
            <button
              type="button"
              onClick={onAddAvailability}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
            >
              <FiPlus className="h-3.5 w-3.5" />
              Add Availability
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* Header */}
      <div className="space-y-2.5 border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <FiClock className="h-4 w-4 text-ink-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
            Slots for {formatDate(date)}
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-700">
            <FiUsers className="h-2.5 w-2.5" />
            {stats.totalAvailableCapacity} / {stats.totalCapacity} capacity
            available
          </span>

          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            {stats.available} available
          </span>
          {stats.availableFree > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
              <FiGift className="h-2.5 w-2.5" />
              {stats.availableFree} free
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

        {/* Filter tabs */}
        {stats.open > 0 && (
          <div className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-surface p-1">
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
              const isAvailable = slot.isAvailable;
              const isBlocked = status === "blocked";

              // ✅ selected slot highlight (sirf jab selectedSlot prop diya ho)
              const isSelected =
                !!selectedSlot?.start_time &&
                selectedSlot.start_time === slot.start_time;
              const styleKey = isSelected ? "selected" : slot.styleKey;

              // Click logic:
              //  - capacity available + canManageAppointment → QuickBookingModal
              //  - fully booked + appointments hain → BookedSlotDetailsModal
              const canClickAvailable =
                isAvailable && !!onSlotClick && canManageAppointment;
              const canClickBooked =
                !isAvailable && slot.hasAnyAppointment && !!onBookedSlotClick;

              const isClickable = canClickAvailable || canClickBooked;

              const handleClick = () => {
                if (!isClickable) return;
                if (canClickAvailable) {
                  onSlotClick?.(slot);
                } else if (canClickBooked) {
                  onBookedSlotClick?.(slot);
                }
              };

              let tooltip = "";
              if (isAvailable) {
                tooltip = canManageAppointment
                  ? `Click to book · ${slot.availableCount} / ${slot.capacity} capacity available`
                  : `Available · ${slot.availableCount} / ${slot.capacity} capacity available (permission required to book)`;
              } else if (status === "booked") {
                tooltip = `Fully booked · ${slot.bookedCount} / ${slot.capacity} — click for details`;
              } else if (isBlocked) {
                tooltip = slot.reason || "Blocked";
              }

              return (
                <button
                  key={`${slot.start_time}-${idx}`}
                  type="button"
                  disabled={isBlocked || !isClickable}
                  onClick={handleClick}
                  title={tooltip}
                  className={`flex w-full flex-col gap-2 rounded-lg border p-2.5 text-left transition hover:shadow-sm disabled:cursor-not-allowed ${
                    isSelected ? "" : "disabled:opacity-60"
                  } ${SLOT_STYLES[styleKey]}`}
                >
                  {/* Row 1: time (left) + icon & Free (right) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="whitespace-nowrap text-[13px] font-semibold leading-tight">
                        {formatTime12(slot.start_time)}
                      </p>
                      <p className="mt-0.5 whitespace-nowrap text-[10px] leading-tight opacity-70">
                        to {formatTime12(slot.end_time)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${SLOT_ICON_BG[styleKey]}`}
                      >
                        {SLOT_ICONS[styleKey]}
                      </div>
                      {slot.isFree && (
                        <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-wide text-accent-700">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: capacity */}
                  <span className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-md bg-accent-100 px-1.5 py-0.5 text-[10px] font-semibold text-accent-800 ring-1 ring-accent-200">
                    <FiUsers className="h-2.5 w-2.5 shrink-0" />
                    {slot.availableCount}/{slot.capacity} capacity
                  </span>

                  {/* Row 3: available + booked (alag-alag light chips, ek line me) */}
                  <div className="flex flex-nowrap items-center gap-1">
                    <span
                      className={`min-w-0 truncate whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${
                        slot.availableCount > 0
                          ? "bg-brand-100 text-brand-800 ring-brand-200"
                          : "bg-surface/60 text-ink-500 ring-ink-200"
                      }`}
                    >
                      {slot.availableCount} available
                    </span>
                    {slot.bookedCount > 0 && (
                      <span className="min-w-0 truncate whitespace-nowrap rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 ring-1 ring-ink-300">
                        {slot.bookedCount} booked
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend footer */}
      <div className="border-t border-ink-100 bg-ink-50/30 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          {[
            ["bg-brand-500", "Available"],
            ["bg-accent-600", "Free"],
            ["bg-ink-400", "Booked"],
            ["bg-danger-500", "Blocked"],
          ].map(([dot, text]) => (
            <div key={text} className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`}
              />
              <span className="text-[10px] text-ink-600">{text}</span>
            </div>
          ))}
        </div>

        {canManageAvailability && (
          <button
            type="button"
            onClick={onAddAvailability}
            className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
          >
            <FiPlus className="h-3.5 w-3.5" />
            Add / Manage Availability
          </button>
        )}
      </div>
    </div>
  );
};

export default SlotList;
