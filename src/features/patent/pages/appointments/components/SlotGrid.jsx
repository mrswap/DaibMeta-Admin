import { FiCheck, FiLock, FiUser } from "react-icons/fi";
import Loader from "../../../common/Loader";

const SLOT_STYLES = {
  available:
    "cursor-pointer border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100",
  booked: "cursor-not-allowed border-ink-200 bg-ink-100 text-ink-500",
  blocked: "cursor-not-allowed border-danger-200 bg-danger-50 text-danger-700",
};

const SLOT_ICONS = {
  available: <FiCheck className="h-3.5 w-3.5 text-surface" />,
  booked: <FiUser className="h-3.5 w-3.5 text-surface" />,
  blocked: <FiLock className="h-3.5 w-3.5 text-surface" />,
};

const SLOT_ICON_BG = {
  available: "bg-brand-500",
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {slots.map((slot, idx) => {
        const status = slot.available
          ? "available"
          : slot.status === "blocked"
            ? "blocked"
            : "booked";
        const isSelected =
          selectedSlot &&
          selectedSlot.start_time === slot.start_time &&
          selectedSlot.end_time === slot.end_time;

        const isSelectable = slot.available === true;

        const styleCls = isSelected
          ? "cursor-pointer border-brand-600 bg-brand-600 text-surface ring-2 ring-brand-500/30"
          : SLOT_STYLES[status] || SLOT_STYLES.blocked;

        const subLabel =
          status === "booked"
            ? "Booked"
            : status === "blocked"
              ? "Blocked"
              : "Available";

        return (
          <button
            key={idx}
            type="button"
            disabled={!isSelectable}
            onClick={() => isSelectable && onSelect(slot)}
            className={`flex flex-col gap-1 rounded-lg border p-2.5 text-left transition sm:p-3 ${styleCls}`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold">
                {slot.start_time}
              </span>
              <div
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full sm:h-4 sm:w-4 ${
                  isSelected
                    ? "bg-surface"
                    : SLOT_ICON_BG[status] || "bg-ink-400"
                }`}
              >
                {isSelected ? (
                  <FiCheck className="h-2.5 w-2.5 text-brand-600" />
                ) : (
                  SLOT_ICONS[status]
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
          </button>
        );
      })}
    </div>
  );
};

export default SlotGrid;
