// import { FiCheck, FiLock, FiUser } from "react-icons/fi";
// import Loader from "../../../common/Loader";

// const SLOT_STYLES = {
//   available:
//     "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
//   booked: "cursor-not-allowed border-ink-200 bg-ink-100 text-ink-500",
//   blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
// };

// const SLOT_ICONS = {
//   available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
//   booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
//   blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
// };

// const SLOT_ICON_BG = {
//   available: "bg-brand-500",
//   booked: "bg-ink-400",
//   blocked: "bg-danger-500",
// };

// const SlotGrid = ({
//   slots = [],
//   selectedSlot,
//   onSelect,
//   loading = false,
//   emptyText = "No slots available for this date.",
// }) => {
//   if (loading) {
//     return <Loader text="Loading slots..." />;
//   }

//   if (!slots || slots.length === 0) {
//     return (
//       <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 py-10 text-center">
//         <p className="text-sm font-medium text-ink-700">{emptyText}</p>
//         <p className="mt-1 text-xs text-ink-500">
//           Try a different date or provider.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
//       {slots.map((slot, idx) => {
//         const status = slot.available
//           ? "available"
//           : slot.status === "blocked"
//             ? "blocked"
//             : "booked";
//         const isSelected =
//           selectedSlot &&
//           selectedSlot.start_time === slot.start_time &&
//           selectedSlot.end_time === slot.end_time;

//         const isSelectable = slot.available === true;

//         const styleCls = isSelected
//           ? "cursor-pointer border-brand-600 bg-brand-600 text-surface ring-2 ring-brand-500/30"
//           : SLOT_STYLES[status] || SLOT_STYLES.blocked;

//         const subLabel =
//           status === "booked"
//             ? "Booked"
//             : status === "blocked"
//               ? "Blocked"
//               : "Available";

//         return (
//           <button
//             key={idx}
//             type="button"
//             disabled={!isSelectable}
//             onClick={() => isSelectable && onSelect(slot)}
//             className={`flex flex-col gap-1 rounded-lg border p-2.5 text-left transition sm:p-3 ${styleCls}`}
//           >
//             <div className="flex items-center justify-between gap-1">
//               <span className="text-[11px] font-semibold">
//                 {slot.start_time}
//               </span>
//               <div
//                 className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full sm:h-4 sm:w-4 ${
//                   isSelected
//                     ? "bg-surface"
//                     : SLOT_ICON_BG[status] || "bg-ink-400"
//                 }`}
//               >
//                 {isSelected ? (
//                   <FiCheck className="h-2.5 w-2.5 text-brand-600" />
//                 ) : (
//                   SLOT_ICONS[status]
//                 )}
//               </div>
//             </div>
//             <p
//               className={`truncate text-[10px] ${
//                 isSelected ? "text-surface/90" : "opacity-80"
//               }`}
//             >
//               to {slot.end_time}
//             </p>
//             <p
//               className={`text-[9px] font-semibold uppercase ${
//                 isSelected ? "text-surface/80" : "opacity-60"
//               }`}
//             >
//               {isSelected ? "Selected" : subLabel}
//             </p>
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// export default SlotGrid;

// src/features/patent/pages/providerAvailability/components/SlotGrid.jsx

import { FiCheck, FiLock, FiUser, FiGift, FiUsers } from "react-icons/fi";
import Loader from "../../../common/Loader";

// ==================== STYLE VARIANTS ====================
const SLOT_STYLES = {
  available:
    "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
  available_free:
    "cursor-pointer border-accent-300 bg-accent-50 text-accent-800 hover:border-accent-400 hover:bg-accent-100",
  partially_booked:
    "cursor-pointer border-warn-200 bg-warn-50 text-warn-700 hover:border-warn-400 hover:bg-warn-100",
  booked: "cursor-not-allowed border-ink-200 bg-ink-100 text-ink-500",
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

const SlotGrid = ({
  slots = [],
  selectedSlot,
  onSelect,
  loading = false,
  emptyText = "No slots available for this date.",
}) => {
  if (loading) {
    return <Loader text="Loading slots..." />;
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 py-10 text-center">
        <p className="text-sm font-medium text-ink-700">{emptyText}</p>
        <p className="mt-1 text-xs text-ink-500">
          Try a different date or provider.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {slots.map((slot, idx) => {
        const status = slot.status || (slot.available ? "available" : "booked");
        const isFree = !!slot.is_free;
        const isAvailable = slot.available === true;

        // Free available ka alag styleKey
        let styleKey = status;
        if (status === "available" && isFree) styleKey = "available_free";

        const isSelected =
          selectedSlot &&
          selectedSlot.start_time === slot.start_time &&
          selectedSlot.end_time === slot.end_time;

        const styleCls = isSelected
          ? "cursor-pointer border-brand-600 bg-brand-600 text-surface ring-2 ring-brand-500/30"
          : SLOT_STYLES[styleKey] || SLOT_STYLES.blocked;

        let subLabel = "Available";
        if (status === "booked") subLabel = "Booked";
        else if (status === "partially_booked") subLabel = "Partial";
        else if (status === "blocked") subLabel = "Blocked";

        return (
          <button
            key={idx}
            type="button"
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect(slot)}
            className={`relative flex min-h-[82px] flex-col gap-1 rounded-lg border p-2.5 text-left transition ${styleCls}`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="whitespace-nowrap text-[11px] font-semibold">
                {slot.start_time}
              </span>
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-surface"
                    : SLOT_ICON_BG[styleKey] || "bg-ink-400"
                }`}
              >
                {isSelected ? (
                  <FiCheck className="h-2.5 w-2.5 text-brand-600" />
                ) : (
                  SLOT_ICONS[styleKey] || SLOT_ICONS.booked
                )}
              </div>
            </div>

            <p
              className={`truncate text-[10px] ${
                isSelected ? "text-surface/90" : "opacity-80"
              }`}
            >
              to {slot.end_time}
            </p>

            <p
              className={`text-[9px] font-semibold uppercase ${
                isSelected ? "text-surface/80" : "opacity-60"
              }`}
            >
              {isSelected ? "Selected" : subLabel}
            </p>

            {/* Free Badge - absolute top-right */}
            {isFree && !isSelected && (
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-accent-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-accent-800">
                <FiGift className="h-2 w-2" />
                Free
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SlotGrid;
