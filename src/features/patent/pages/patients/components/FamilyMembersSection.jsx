import { useFamilyMembers } from "../../../queries/patients";
import Loader from "../../../common/Loader";

const FamilyMembersSection = ({ patientId }) => {
  const { data = [], isLoading } = useFamilyMembers(patientId);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        Family Members
      </p>
      <div className="rounded-lg border border-ink-100 bg-ink-50/30 p-3">
        {isLoading ? (
          <Loader text="Loading..." />
        ) : data.length === 0 ? (
          <p className="text-sm text-ink-500">No family members linked</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-3 gap-3 py-2 first:pt-0 last:pb-0"
              >
                <code className="font-mono text-xs text-ink-600">
                  {member.patient_id}
                </code>
                <p className="text-sm font-medium text-ink-800">
                  {member.name}
                </p>
                <p className="text-sm text-ink-600">
                  {member.relation_type?.label || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyMembersSection;
