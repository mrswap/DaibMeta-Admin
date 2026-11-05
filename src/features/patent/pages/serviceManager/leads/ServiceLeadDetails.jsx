// src/features/patent/pages/serviceManager/leads/ServiceLeadDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiPhone,
  FiMail,
  FiPackage,
  FiMessageSquare,
  FiCheckCircle,
  FiFileText,
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
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-10 text-center text-sm text-ink-500">
        Lead not found.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink-100 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/service-manager/leads")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
            title="Go back"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
                Lead #{lead.id}
              </h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-1 text-xs text-ink-500 sm:text-sm">
              Received on{" "}
              {lead.created_at
                ? new Date(lead.created_at).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Patient & Enquiry Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Patient Info */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-50 text-ink-600">
                <FiUser className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-ink-900">
                Patient Information
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Name
                </p>
                <p className="mt-0.5 font-medium text-ink-900">
                  {lead.patient?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Patient ID
                </p>
                <p className="mt-0.5 text-ink-700">
                  {lead.patient?.patient_id || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Mobile
                </p>
                <a
                  href={`tel:${lead.patient?.mobile}`}
                  className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
                >
                  <FiPhone className="h-3.5 w-3.5" />
                  {lead.patient?.mobile || "—"}
                </a>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Email
                </p>
                {lead.patient?.email ? (
                  <a
                    href={`mailto:${lead.patient.email}`}
                    className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
                  >
                    <FiMail className="h-3.5 w-3.5" />
                    {lead.patient.email}
                  </a>
                ) : (
                  <p className="mt-0.5 text-ink-400 italic">Not provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Enquiry Info */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-50 text-ink-600">
                <FiPackage className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-ink-900">
                Enquiry Details
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Enquired For
                </p>
                {lead.health_service_package ? (
                  <p className="mt-0.5 text-sm font-medium text-ink-900">
                    Package: {lead.health_service_package.name}
                  </p>
                ) : lead.service ? (
                  <p className="mt-0.5 text-sm font-medium text-ink-900">
                    Service: {lead.service.name}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-ink-500">
                    No specific package/service requested.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500 flex items-center gap-1.5 mb-1">
                  <FiMessageSquare className="h-3 w-3" /> Patient Message
                </p>
                <p className="text-sm text-ink-700 italic leading-relaxed">
                  {lead.patient_message
                    ? `"${lead.patient_message}"`
                    : "No message provided."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Action & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status Update */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-50 text-ink-600">
                <FiCheckCircle className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-ink-900">
                Update Status
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <FilterSelect
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
                placeholder="Select status"
              />
              <button
                onClick={handleUpdateStatus}
                disabled={
                  statusMutation.isPending || status?.value === lead.status
                }
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusMutation.isPending ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-ink-100 px-5 py-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-50 text-ink-600">
                <FiFileText className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-ink-900">
                Admin Notes
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes here..."
                className="w-full rounded-lg border border-form-border bg-form-bg p-3 text-sm outline-none transition-colors focus:border-form-border-focus focus:ring-1 focus:ring-form-ring"
                rows={6}
                maxLength={500}
              />
              <button
                onClick={handleSaveNotes}
                disabled={notesMutation.isPending}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
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

// ==================== SUB-COMPONENTS ====================

const StatusBadge = ({ status }) => {
  const found = LEAD_STATUSES.find((s) => s.value === status);
  const label = found?.label || status;

  let cls = "bg-ink-100 text-ink-600";

  switch (status) {
    case "new":
      cls = "bg-accent-50 text-accent-700 ring-1 ring-accent-200";
      break;
    case "contacted":
    case "in_progress":
      cls = "bg-warn-50 text-warn-700 ring-1 ring-warn-200";
      break;
    case "converted":
    case "completed":
      cls = "bg-brand-50 text-brand-700 ring-1 ring-brand-200";
      break;
    case "cancelled":
    case "lost":
      cls = "bg-danger-50 text-danger-700 ring-1 ring-danger-200";
      break;
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
};

export default ServiceLeadDetails;
