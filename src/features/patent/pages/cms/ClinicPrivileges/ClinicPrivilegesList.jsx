// src/features/patent/pages/cms/ClinicPrivileges/ClinicPrivilegesList.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiShield,
  FiSearch,
  FiMail,
  FiPhone,
  FiClock,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";

import Loader from "../../../common/Loader";
import {
  useClinicPrivilegeProviders,
  useClinicPrivilegeProviderDetails,
} from "../../../queries/clinicPrivileges";

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
// Single Provider Card
// ---------------------------------------------------------------
const ProviderCard = ({ provider, onManage }) => {
  const { data, isLoading, isError } = useClinicPrivilegeProviderDetails(
    provider?.id,
  );

  const details = data || {};
  const providerInfo = details.provider || provider || {};
  const role = details.role || provider?.role || null;
  const appointmentType = details.appointment_type || null;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-ink-100 bg-surface">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-card border border-danger-100 bg-danger-50 p-4 text-sm text-danger-600">
        Failed to load provider details.
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-card border border-ink-100 bg-surface p-4 transition-shadow hover:shadow-sm">
      {/* Top row: avatar + name + status */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-ink-100 bg-brand-50 text-brand-600">
          <FiUser className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-ink-900">
              {providerInfo.name || "—"}
            </h3>
            <StatusBadge
              status={providerInfo.status}
              label={providerInfo.status_label}
            />
          </div>
          {role?.label && (
            <p className="mt-0.5 truncate text-xs text-ink-500">{role.label}</p>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-3 space-y-1.5 text-xs text-ink-600">
        {providerInfo.email && (
          <div className="flex items-center gap-2">
            <FiMail className="h-3.5 w-3.5 shrink-0 text-ink-400" />
            <span className="truncate">{providerInfo.email}</span>
          </div>
        )}
        {providerInfo.phone && (
          <div className="flex items-center gap-2">
            <FiPhone className="h-3.5 w-3.5 shrink-0 text-ink-400" />
            <span className="truncate">{providerInfo.phone}</span>
          </div>
        )}
      </div>

      {/* Appointment Type */}
      <div className="mt-3 rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
          Appointment Type
        </p>
        {appointmentType ? (
          <div className="mt-1">
            <p className="truncate text-xs font-medium text-ink-800">
              {appointmentType.name}
            </p>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-ink-500">
              <span className="inline-flex items-center gap-1">
                <FiClock className="h-3 w-3" />
                {appointmentType.duration} min
              </span>
              <span>Capacity: {appointmentType.capacity}</span>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-ink-500">Not configured</p>
        )}
      </div>

      {/* Action */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onManage(provider)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
        >
          Manage Privileges
          <FiChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------
const ClinicPrivilegesList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useClinicPrivilegeProviders({
    per_page: 100,
    status: 1,
  });

  const providers = data?.list ?? [];

  const filteredProviders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const phone = (p.phone || "").toLowerCase();
      const roleLabel = (p.role?.label || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        roleLabel.includes(q)
      );
    });
  }, [providers, search]);

  const handleManage = (provider) => {
    if (!provider?.id) return;
    navigate(`/cms/clinical-privileges/${provider.id}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="sticky top-0 z-10 border-b border-ink-100 bg-surface px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FiShield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ink-900">
                Clinical Privileges
              </h1>
              <p className="text-xs text-ink-500">
                Manage clinical privileges for each provider.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters — raw input (no Formik context) */}
      <div className="border-b border-ink-100 bg-surface px-4 py-3 sm:px-6">
        <div className="flex w-full items-center gap-2 rounded-lg border border-form-border bg-form-bg px-3 sm:max-w-sm">
          <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            value={search}
            maxLength={150}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-form-placeholder"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 sm:px-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader />
          </div>
        ) : isError ? (
          <div className="rounded-card border border-danger-100 bg-danger-50 p-4 text-sm text-danger-600">
            Failed to load providers. Please try again.
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="rounded-card border border-ink-100 bg-surface p-12 text-center">
            <FiShield className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-700">
              No providers found
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onManage={handleManage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicPrivilegesList;
