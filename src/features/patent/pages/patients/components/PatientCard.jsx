import {
  FiUser,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUsers,
  FiPhone,
} from "react-icons/fi";
import { ActionToggle } from "../../../common/form";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Color based on name hash
const AVATAR_COLORS = [
  "bg-brand-600",
  "bg-accent-600",
  "bg-warn-700",
  "bg-danger-600",
  "bg-ink-700",
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const PatientCard = ({ patient, onView, onEdit, onToggle, onDelete }) => {
  const isFamily = !!patient.linked_primary_patient_id;
  const initials = getInitials(patient.name);
  const avatarColor = getAvatarColor(patient.name);

  const sexLabel = patient.sex
    ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)
    : "—";

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface transition hover:border-ink-200 hover:shadow-sm">
      {/* Top section — avatar + name */}
      <div className="flex items-start gap-3 p-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-surface ${avatarColor}`}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">
            {patient.name}
          </p>
          <code className="mt-0.5 inline-block rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
            {patient.patient_id || "—"}
          </code>
        </div>

        {/* Status dot */}
        <span
          className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${
            patient.status ? "bg-brand-500" : "bg-ink-300"
          }`}
          title={patient.status ? "Active" : "Inactive"}
        />
      </div>

      {/* Info rows */}
      <div className="space-y-2 border-t border-ink-100 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-ink-600">
          <FiPhone className="h-3 w-3 shrink-0 text-ink-400" />
          <span className="truncate">{patient.mobile || "—"}</span>
        </div>

        <div className="flex items-center gap-2 text-ink-600">
          <FiUser className="h-3 w-3 shrink-0 text-ink-400" />
          <span className="truncate">
            {sexLabel}
            {patient.age ? ` · ${patient.age} yrs` : ""}
          </span>
        </div>

        {/* Relation tag */}
        <div className="flex items-center gap-2">
          {isFamily ? (
            <>
              <FiUsers className="h-3 w-3 shrink-0 text-accent-500" />
              <span className="inline-flex rounded-md bg-accent-50 px-1.5 py-0.5 text-[10px] font-medium text-accent-700">
                {patient.relation_type?.label || "Family"}
              </span>
              {patient.primary_patient && (
                <span className="truncate text-[10px] text-ink-500">
                  of {patient.primary_patient.name}
                </span>
              )}
            </>
          ) : (
            <>
              <FiUser className="h-3 w-3 shrink-0 text-brand-500" />
              <span className="inline-flex rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                Primary
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/30 px-2 py-1.5">
        <div className="flex gap-0.5">
          <IconBtn title="View" onClick={() => onView(patient)}>
            <FiEye className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn title="Edit" onClick={() => onEdit(patient)}>
            <FiEdit2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>

        <div className="flex gap-0.5">
          <ActionToggle
            active={patient.status}
            onClick={() => onToggle(patient)}
          />
          <IconBtn title="Delete" onClick={() => onDelete(patient)} danger>
            <FiTrash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>
    </div>
  );
};

const IconBtn = ({ children, title, onClick, danger }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`cursor-pointer rounded-md p-1.5 transition ${
      danger
        ? "text-danger-500 hover:bg-danger-50"
        : "text-ink-500 hover:bg-ink-100 hover:text-ink-800"
    }`}
  >
    {children}
  </button>
);

export default PatientCard;
