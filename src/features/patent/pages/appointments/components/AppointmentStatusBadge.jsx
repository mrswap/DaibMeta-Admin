import { getStatusLabel } from "../../../queries/appointments";

const STATUS_STYLES = {
  booked: "bg-accent-50 text-accent-800",
  confirmed: "bg-brand-50 text-brand-700",
  checked_in: "bg-warn-100 text-warn-900",
  completed: "bg-brand-100 text-brand-800",
  cancelled: "bg-danger-50 text-danger-700",
  no_show: "bg-danger-100 text-danger-900",
};

const AppointmentStatusBadge = ({ status, size = "sm" }) => {
  const style = STATUS_STYLES[status] || "bg-ink-100 text-ink-600";

  const sizeCls =
    size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${style} ${sizeCls}`}
    >
      {getStatusLabel(status)}
    </span>
  );
};

export default AppointmentStatusBadge;
