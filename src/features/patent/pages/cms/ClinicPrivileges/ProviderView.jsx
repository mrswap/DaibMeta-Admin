// src/features/patent/pages/cms/ClinicPrivileges/ProviderView.jsx

import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiClock,
  FiUser,
  FiBriefcase,
  FiShield,
  FiAlertCircle,
  FiPlus,
} from "react-icons/fi";

import Loader from "../../../common/Loader";
import ClinicPrivilegeSectionsPanel from "./components/ClinicPrivilegeSectionsPanel";
import { useClinicPrivilegeProviderDetails } from "../../../queries/clinicPrivileges";

// ---------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------
const StatusBadge = ({ status, label }) => {
  const active = !!status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-brand-600" : "bg-ink-400"
        }`}
      />
      {label || (active ? "Active" : "Inactive")}
    </span>
  );
};

// ---------------------------------------------------------------
// Info Row
// ---------------------------------------------------------------
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm text-ink-800">{value || "—"}</p>
    </div>
  </div>
);

// ---------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------
const ProviderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [isMaxReached, setIsMaxReached] = useState(false);

  const { data, isLoading, isError } = useClinicPrivilegeProviderDetails(id);

  const provider = data?.provider || null;
  const role = data?.role || null;
  const appointmentType = data?.appointment_type || null;

  // ---------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------
  if (isLoading) {
    return <Loader text="Loading provider details..." />;
  }

  // ---------------------------------------------------------------
  // Error / Not Found
  // ---------------------------------------------------------------
  if (isError || !provider) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/clinical-privileges")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-900">Provider Not Found</h1>
        </div>
        <div className="rounded-card border border-ink-100 bg-surface p-10 text-center">
          <FiAlertCircle className="mx-auto h-8 w-8 text-danger-500" />
          <p className="mt-3 text-sm text-ink-600">
            The provider you are looking for does not exist or failed to load.
          </p>
          <button
            onClick={() => navigate("/cms/clinical-privileges")}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Clinical Privileges
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------
  // Provider Info
  // ---------------------------------------------------------------
  // Fallback: Agar backend is_provider nahi bhej raha, toh hum assume karenge
  // ki yeh provider hai (kyunki user list se provider click karke aaya hai).
  // Agar explicitly false hai, tabhi non-provider manenge.
  const isProvider = role?.is_provider !== false;

  const handleAddSection = () => {
    panelRef.current?.openAddForm?.();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/cms/clinical-privileges")}
            className="mt-1 cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-ink-100 bg-brand-50 text-brand-600">
              <FiShield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-ink-900">
                {provider.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {role?.label && (
                  <span className="inline-flex rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-800">
                    {role.label}
                  </span>
                )}
                <StatusBadge
                  status={provider.status}
                  label={provider.status_label}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: Basic Info + Appointment Type */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-card border border-ink-100 bg-surface p-4 sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Basic Information
          </p>
          <div className="space-y-3">
            <InfoRow icon={FiUser} label="Name" value={provider.name} />
            <InfoRow icon={FiMail} label="Email" value={provider.email} />
            <InfoRow icon={FiPhone} label="Phone" value={provider.phone} />
          </div>
        </div>

        {/* Appointment Type */}
        <div className="rounded-card border border-ink-100 bg-surface p-4 sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Appointment Type
          </p>
          {appointmentType ? (
            <div className="space-y-3">
              <InfoRow
                icon={FiBriefcase}
                label="Name"
                value={appointmentType.name}
              />
              <div className="grid grid-cols-2 gap-3">
                <InfoRow
                  icon={FiClock}
                  label="Duration"
                  value={
                    appointmentType.duration
                      ? `${appointmentType.duration} min`
                      : "—"
                  }
                />
                <InfoRow
                  icon={FiUser}
                  label="Capacity"
                  value={
                    appointmentType.capacity != null
                      ? String(appointmentType.capacity)
                      : "—"
                  }
                />
              </div>
              <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="text-xs text-ink-500">Status</span>
                <StatusBadge
                  status={appointmentType.status}
                  label={appointmentType.status_label}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-warn-100 bg-warn-50 px-3 py-2 text-xs text-warn-900">
              <FiAlertCircle className="h-4 w-4 shrink-0" />
              Appointment type not configured for this provider.
            </div>
          )}
        </div>
      </div>

      {/* Professional Profile Sections — dedicated panel */}
      <div className="rounded-card border border-ink-100 bg-surface p-4 sm:p-6">
        {/* Heading row with Add Section button on right */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink-900">
              Professional Profile
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Manage professional profile sections for this provider.
            </p>
          </div>
          {isProvider && (
            <button
              type="button"
              onClick={handleAddSection}
              disabled={isMaxReached}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-surface hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPlus className="h-3.5 w-3.5" />
              Add Section
            </button>
          )}
        </div>

        {isProvider ? (
          <ClinicPrivilegeSectionsPanel
            ref={panelRef}
            providerId={provider.id}
            onMaxReachedChange={setIsMaxReached}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-6 text-center text-xs text-ink-500">
            This staff member is not a provider. Profile sections are only
            available for provider roles.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderView;
