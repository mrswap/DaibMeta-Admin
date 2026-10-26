import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiPhone,
  FiMail,
  FiPackage,
} from "react-icons/fi";
import Loader from "../../../common/Loader";
import { FilterSelect } from "../../../common/form";
import {
  useServiceLead,
  useUpdateLeadStatus,
  useUpdateLeadNotes,
  LEAD_STATUSES,
} from "../../../queries/serviceManager";

const STATUS_OPTIONS = LEAD_STATUSES.map((s) => ({
  value: s.value,
  label: s.label,
}));

const ServiceLeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: lead, isLoading } = useServiceLead(id);
  const statusMutation = useUpdateLeadStatus();
  const notesMutation = useUpdateLeadNotes();

  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (lead) {
      setStatus(
        STATUS_OPTIONS.find((s) => s.value === lead.status) ||
          STATUS_OPTIONS[0],
      );
      setNotes(lead.admin_notes || "");
    }
  }, [lead]);

  const handleUpdateStatus = () => {
    if (!status) return;
    statusMutation.mutate({ id, payload: { status: status.value } });
  };

  const handleSaveNotes = () => {
    notesMutation.mutate({ id, admin_notes: notes.trim() || null });
  };

  if (isLoading) return <Loader text="Loading lead details..." />;
  if (!lead)
    return <div className="p-10 text-center text-ink-500">Lead not found.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/service-manager/leads")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Lead #{lead.id}
          </h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Received on {new Date(lead.created_at).toLocaleString("en-GB")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="font-jakarta text-lg font-semibold mb-4 text-ink-900 flex items-center gap-2">
              <FiUser className="text-brand-600" /> Patient Info
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-ink-500 w-24 inline-block">
                  Name:
                </strong>{" "}
                {lead.patient?.name}
              </p>
              <p>
                <strong className="text-ink-500 w-24 inline-block">
                  Patient ID:
                </strong>{" "}
                {lead.patient?.patient_id || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <strong className="text-ink-500 w-24 inline-block">
                  Mobile:
                </strong>{" "}
                <FiPhone className="text-ink-400" /> {lead.patient?.mobile}
              </p>
              <p className="flex items-center gap-2">
                <strong className="text-ink-500 w-24 inline-block">
                  Email:
                </strong>{" "}
                <FiMail className="text-ink-400" />{" "}
                {lead.patient?.email || "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="font-jakarta text-lg font-semibold mb-4 text-ink-900 flex items-center gap-2">
              <FiPackage className="text-brand-600" /> Enquiry For
            </h2>
            <div className="text-sm">
              {lead.health_service_package ? (
                <p>
                  <strong className="text-ink-500">Package:</strong>{" "}
                  {lead.health_service_package.name}
                </p>
              ) : lead.service ? (
                <p>
                  <strong className="text-ink-500">Service:</strong>{" "}
                  {lead.service.name}
                </p>
              ) : (
                <p className="text-ink-500">
                  No specific package/service requested.
                </p>
              )}
              <div className="mt-4 p-3 bg-ink-50 rounded-lg border border-ink-100">
                <p className="text-xs font-semibold text-ink-500 uppercase mb-1">
                  Message
                </p>
                <p className="text-ink-700 italic">
                  "{lead.patient_message || "No message provided."}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="font-jakarta text-lg font-semibold mb-4 text-ink-900">
              Lead Status
            </h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <FilterSelect
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                  placeholder="Select status"
                />
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={
                  statusMutation.isPending || status?.value === lead.status
                }
                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
              >
                {statusMutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </div>

          <div className="rounded-card border border-ink-100 bg-surface p-5">
            <h2 className="font-jakarta text-lg font-semibold mb-4 text-ink-900">
              Admin Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes here..."
              className="w-full rounded-lg border border-form-border bg-form-bg p-3 text-sm focus:border-form-border-focus focus:outline-none"
              rows={5}
              maxLength={10000}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={notesMutation.isPending}
                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
              >
                <FiSave />{" "}
                {notesMutation.isPending ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLeadDetails;
