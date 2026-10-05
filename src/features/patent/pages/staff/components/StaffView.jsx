import { FiX } from "react-icons/fi";
import { useStaffMember } from "../../../queries/staff";
import Loader from "../../../common/Loader";

const StaffView = ({ open, onClose, id }) => {
  const { data, isLoading } = useStaffMember(id);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900">
            Staff Details
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {isLoading ? (
            <Loader text="Loading details..." />
          ) : (
            <div className="space-y-5">
              {/* Basic Information */}
              <Section title="Basic Information">
                <Row label="Name" value={data?.name} />
                <Row label="Email" value={data?.email} />
                <Row label="Phone" value={data?.phone || "—"} />
                <Row
                  label="Role"
                  value={
                    data?.role ? (
                      <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
                        {data.role.label || data.role.name}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <Row
                  label="Super Admin"
                  value={
                    data?.is_super_admin ? (
                      <span className="inline-flex rounded-full bg-warn-100 px-2.5 py-0.5 text-xs font-medium text-warn-900">
                        Yes
                      </span>
                    ) : (
                      "No"
                    )
                  }
                />
                <Row
                  label="Status"
                  value={
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        data?.status
                          ? "bg-brand-50 text-brand-700"
                          : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {data?.status ? "Active" : "Inactive"}
                    </span>
                  }
                />
              </Section>

              {/* Specializations */}
              <Section title="Specializations">
                {data?.specializations && data.specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.specializations.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-500">
                    No specializations assigned
                  </p>
                )}
              </Section>

              {/* Account Information */}
              <Section title="Account Information">
                <Row
                  label="Last Login"
                  value={
                    data?.last_login_at
                      ? new Date(data.last_login_at).toLocaleString()
                      : "—"
                  }
                />
                <Row
                  label="Created At"
                  value={
                    data?.created_at
                      ? new Date(data.created_at).toLocaleString()
                      : "—"
                  }
                />
                <Row
                  label="Updated At"
                  value={
                    data?.updated_at
                      ? new Date(data.updated_at).toLocaleString()
                      : "—"
                  }
                />
              </Section>

              {/* Audit */}
              {(data?.created_by || data?.updated_by) && (
                <Section title="Audit Information">
                  <Row
                    label="Created By"
                    value={data?.created_by?.name || "—"}
                  />
                  <Row
                    label="Updated By"
                    value={data?.updated_by?.name || "—"}
                  />
                </Section>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-ink-100 bg-surface px-5 py-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
      {title}
    </p>
    <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50/30 p-3">
      {children}
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4">
    <p className="text-xs font-medium text-ink-500">{label}</p>
    <div className="col-span-2 text-sm text-ink-800">{value}</div>
  </div>
);

export default StaffView;
