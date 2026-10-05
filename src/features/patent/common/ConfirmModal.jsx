import { FiAlertTriangle, FiX } from "react-icons/fi";

/**
 * ConfirmModal — reusable confirmation dialog
 *
 * Usage:
 *   <ConfirmModal
 *     open={open}
 *     title="Delete Role"
 *     message="Are you sure? This cannot be undone."
 *     confirmText="Delete"
 *     cancelText="Cancel"
 *     variant="danger"   // "danger" | "warn" | "info"
 *     onConfirm={handleConfirm}
 *     onCancel={handleCancel}
 *     loading={mutation.isPending}
 *   />
 */
const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  // Variant-based colors
  const variants = {
    danger: {
      iconBg: "bg-danger-50",
      iconColor: "text-danger-500",
      btnBg: "bg-danger-500 hover:bg-danger-600",
    },
    warn: {
      iconBg: "bg-warn-100",
      iconColor: "text-warn-800",
      btnBg: "bg-warn-800 hover:bg-warn-900",
    },
    info: {
      iconBg: "bg-accent-50",
      iconColor: "text-accent-600",
      btnBg: "bg-accent-600 hover:bg-accent-700",
    },
  };

  const style = variants[variant] || variants.danger;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={loading ? undefined : onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-3 top-3 rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-40"
        >
          <FiX className="h-4 w-4" />
        </button>

        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
            >
              <FiAlertTriangle className={`h-5 w-5 ${style.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <h3 className="font-jakarta text-base font-bold text-ink-900">
                {title}
              </h3>
              {message && (
                <p className="mt-1.5 text-sm text-ink-600">{message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-ink-100 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-surface transition disabled:cursor-not-allowed disabled:opacity-70 ${style.btnBg}`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
