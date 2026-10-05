import { FiX } from "react-icons/fi";
import { useSpecialization } from "../../../queries/specializations";
import Loader from "../../../common/Loader";

const SpecializationView = ({ open, onClose, id }) => {
  const { data, isLoading } = useSpecialization(id);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900">
            Specialization Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {isLoading ? (
            <Loader text="Loading details..." />
          ) : (
            <div className="space-y-4">
              <Row label="Name" value={data?.name} />
              <Row label="Description" value={data?.description || "—"} />
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
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-ink-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4">
    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
      {label}
    </p>
    <div className="col-span-2 text-sm text-ink-800">{value}</div>
  </div>
);

export default SpecializationView;
