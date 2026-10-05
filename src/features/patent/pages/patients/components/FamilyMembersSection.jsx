import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiPhone,
  FiUserPlus,
  FiEdit2,
  FiEye,
  FiAlertCircle,
} from "react-icons/fi";
import { useFamilyMembers } from "../../../queries/patients";
import Loader from "../../../common/Loader";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "F";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const FamilyMembersSection = ({ patientId, onAddNew, onViewMember }) => {
  const { data = [], isLoading } = useFamilyMembers(patientId);

  if (isLoading) {
    return <Loader text="Loading family members..." />;
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/30 px-6 py-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <FiUsers className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-ink-800">
          No family members linked
        </p>
        <p className="mt-1 text-xs text-ink-500">
          Family members of this patient will appear here once added.
        </p>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-surface hover:bg-brand-700"
          >
            <FiUserPlus className="h-3.5 w-3.5" />
            Add Family Member
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <FiUsers className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Family Members</p>
            <p className="text-[11px] text-ink-500">
              {data.length} member{data.length > 1 ? "s" : ""} linked
            </p>
          </div>
        </div>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-ink-200 bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
          >
            <FiUserPlus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {/* Member cards */}
      <div className="space-y-2">
        {data.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-lg border border-ink-100 bg-surface p-3 transition hover:border-ink-200 hover:bg-ink-50/30"
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-surface">
              {getInitials(member.name)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {member.name}
                </p>
                {member.relation_type?.label && (
                  <span className="inline-flex rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-medium text-accent-700">
                    {member.relation_type.label}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-600">
                  {member.patient_id}
                </code>
                {member.mobile && (
                  <span className="inline-flex items-center gap-1">
                    <FiPhone className="h-2.5 w-2.5" />
                    {member.mobile}
                  </span>
                )}
                {member.age && <span>{member.age} yrs</span>}
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex shrink-0 items-center gap-1">
              <span
                className={`hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline ${
                  member.status
                    ? "bg-brand-50 text-brand-700"
                    : "bg-ink-100 text-ink-600"
                }`}
              >
                {member.status ? "Active" : "Inactive"}
              </span>

              {onViewMember && (
                <button
                  onClick={() => onViewMember(member)}
                  title="View"
                  className="cursor-pointer rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                >
                  <FiEye className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2">
        <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
        <p className="text-[11px] text-ink-500">
          Each family member has their own patient ID and profile.
        </p>
      </div>
    </div>
  );
};

export default FamilyMembersSection;
