import { FiX } from "react-icons/fi";
import { usePatient } from "../../../queries/patients";
import Loader from "../../../common/Loader";
import FamilyMembersSection from "./FamilyMembersSection";

const PatientView = ({ open, onClose, id }) => {
  const { data, isLoading } = usePatient(id);

  if (!open) return null;

  const isFamilyMember = !!data?.linked_primary_patient_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-surface px-5 py-4">
          <div>
            <h2 className="font-jakarta text-lg font-bold text-ink-900">
              Patient Details
            </h2>
            {data?.patient_id && (
              <p className="mt-0.5 font-mono text-[11px] text-ink-500">
                {data.patient_id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {isLoading ? (
            <Loader text="Loading patient details..." />
          ) : (
            <div className="space-y-5">
              {/* Basic Information */}
              <Section title="Basic Information">
                <Row
                  label="Patient ID"
                  value={
                    <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">
                      {data?.patient_id || "—"}
                    </code>
                  }
                />
                <Row label="Name" value={data?.name} />
                <Row label="Mobile" value={data?.mobile} />
                <Row label="Email" value={data?.email || "—"} />
                <Row
                  label="Age"
                  value={data?.age ? `${data.age} years` : "—"}
                />
                <Row
                  label="Date of Birth"
                  value={
                    data?.dob ? new Date(data.dob).toLocaleDateString() : "—"
                  }
                />
                <Row
                  label="Sex"
                  value={
                    data?.sex
                      ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1)
                      : "—"
                  }
                />
                <Row label="Address" value={data?.address || "—"} />
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

              {/* Relationship */}
              {isFamilyMember && (
                <Section title="Relationship">
                  <Row
                    label="Patient Type"
                    value={
                      <span className="inline-flex rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
                        Family Member
                      </span>
                    }
                  />
                  <Row
                    label="Relation"
                    value={data?.relation_type?.label || "—"}
                  />
                  <Row
                    label="Primary Patient"
                    value={
                      data?.primary_patient ? (
                        <span>
                          {data.primary_patient.name} —{" "}
                          <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] text-ink-700">
                            {data.primary_patient.patient_id}
                          </code>
                        </span>
                      ) : (
                        "—"
                      )
                    }
                  />
                </Section>
              )}

              {/* Family Members — only for primary patient */}
              {!isFamilyMember && data?.id && (
                <FamilyMembersSection patientId={data.id} />
              )}

              {/* Audit */}
              <Section title="Account Information">
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

export default PatientView;
