import { FiToggleLeft, FiToggleRight } from "react-icons/fi";

/**
 * ActionToggle — Minimal icon-based toggle for actions column
 *
 * Usage:
 *   import { ActionToggle } from "../../common/form";
 *
 *   <ActionToggle
 *     active={row.status}
 *     onClick={() => handleToggleClick(row)}
 *     loading={mutation.isPending && mutation.variables === row.id}
 *     disabled={row.is_system}
 *   />
 */
const ActionToggle = ({
  active = false,
  onClick,
  loading = false,
  disabled = false,
  title,
}) => {
  if (loading) {
    return (
      <span
        title="Updating..."
        className="inline-flex h-7 w-7 cursor-wait items-center justify-center"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </span>
    );
  }

  const defaultTitle = disabled
    ? "Protected"
    : active
      ? "Click to deactivate"
      : "Click to activate";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title || defaultTitle}
      aria-pressed={active}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${
        disabled
          ? "cursor-not-allowed text-ink-300"
          : active
            ? "cursor-pointer text-brand-600 hover:text-brand-700"
            : "cursor-pointer text-ink-400 hover:text-ink-700"
      }`}
    >
      {active ? (
        <FiToggleRight className="h-[18px] w-[18px]" />
      ) : (
        <FiToggleLeft className="h-[18px] w-[18px]" />
      )}
    </button>
  );
};

export default ActionToggle;
