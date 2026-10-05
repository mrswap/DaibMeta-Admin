import { useState } from "react";
import {
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiEdit2,
  FiUsers,
  FiActivity,
  FiHash,
  FiClock,
} from "react-icons/fi";
import { usePatient } from "../../../queries/patients";
import Loader from "../../../common/Loader";
import FamilyMembersSection from "./FamilyMembersSection";

const TABS = [
  { key: "overview", label: "Overview", icon: FiUser },
  { key: "family", label: "Family Members", icon: FiUsers },
];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const PatientView = ({ open, onClose, id, onEdit }) => {
  const { data, isLoading } = usePatient(id);
  const [activeTab, setActiveTab] = useState("overview");

  if (!open) return null;

  const isFamilyMember = !!data?.linked_primary_patient_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 bg-surface px-5 py-3 sm:px-6">
          <h2 className="font-jakarta text-base font-bold text-ink-900">
            Patient Details
          </h2>
          <div className="flex items-center gap-2">
            {onEdit && data && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(data);
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                <FiEdit2 className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(95vh-53px)] overflow-y-auto">
          {isLoading ? (
            <div className="px-5 py-12 sm:px-6">
              <Loader text="Loading patient details..." />
            </div>
          ) : !data ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="text-sm text-ink-500">Patient not found.</p>
            </div>
          ) : (
            <>
              {/* Hero card */}
              <div className="bg-gradient-to-br from-brand-50/60 to-accent-50/40 px-5 py-6 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Avatar */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-surface shadow-md sm:h-20 sm:w-20 sm:text-xl">
                    {getInitials(data.name)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-jakarta text-lg font-bold text-ink-900 sm:text-xl">
                        {data.name}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          data.status
                            ? "bg-brand-100 text-brand-800"
                            : "bg-ink-200 text-ink-700"
                        }`}
                      >
                        {data.status ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-600">
                      <span className="inline-flex items-center gap-1.5">
                        <FiHash className="h-3 w-3 text-ink-400" />
                        <code className="rounded bg-surface/70 px-1.5 py-0.5 font-mono text-[10px] text-ink-700">
                          {data.patient_id}
                        </code>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FiPhone className="h-3 w-3 text-ink-400" />
                        {data.mobile}
                      </span>
                      {data.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <FiMail className="h-3 w-3 text-ink-400" />
                          {data.email}
                        </span>
                      )}
                    </div>

                    {/* Relation badge */}
                    {isFamilyMember && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent-100/70 px-2 py-1 text-[11px] font-medium text-accent-800">
                        <FiUsers className="h-3 w-3" />
                        {data.relation_type?.label || "Family Member"} of{" "}
                        {data.primary_patient?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-ink-100 px-5 sm:px-6">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;

                  // Hide family tab for family members
                  if (tab.key === "family" && isFamilyMember) return null;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 px-1 py-3 text-sm font-medium transition-colors sm:px-3 ${
                        isActive
                          ? "text-brand-700"
                          : "text-ink-500 hover:text-ink-700"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-t-full bg-brand-600 sm:left-3 sm:right-3" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="p-5 sm:p-6">
                {activeTab === "overview" && (
                  <OverviewTab data={data} isFamilyMember={isFamilyMember} />
                )}

                {activeTab === "family" && !isFamilyMember && (
                  <FamilyMembersSection patientId={data.id} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== OVERVIEW TAB ====================
const OverviewTab = ({ data, isFamilyMember }) => {
  return (
    <div className="space-y-5">
      {/* Personal Information */}
      <Section
        title="Personal Information"
        icon={FiUser}
        iconBg="bg-brand-50"
        iconColor="text-brand-600"
      >
        <InfoGrid>
          <InfoRow icon={FiUser} label="Full Name" value={data.name} />
          <InfoRow
            icon={FiUser}
            label="Sex"
            value={
              data.sex
                ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1)
                : "—"
            }
          />
          <InfoRow
            icon={FiActivity}
            label="Age"
            value={data.age ? `${data.age} years` : "—"}
          />
          <InfoRow
            icon={FiCalendar}
            label="Date of Birth"
            value={data.dob ? new Date(data.dob).toLocaleDateString() : "—"}
          />
        </InfoGrid>
      </Section>

      {/* Contact Information */}
      <Section
        title="Contact Information"
        icon={FiPhone}
        iconBg="bg-accent-50"
        iconColor="text-accent-600"
      >
        <InfoGrid>
          <InfoRow icon={FiPhone} label="Mobile" value={data.mobile} />
          <InfoRow icon={FiMail} label="Email" value={data.email || "—"} />
        </InfoGrid>

        {data.address && (
          <div className="mt-3 border-t border-ink-100 pt-3">
            <InfoRow
              icon={FiMapPin}
              label="Address"
              value={data.address}
              multiline
            />
          </div>
        )}
      </Section>

      {/* Relationship (for family member) */}
      {isFamilyMember && (
        <Section
          title="Relationship"
          icon={FiUsers}
          iconBg="bg-warn-50"
          iconColor="text-warn-700"
        >
          <InfoGrid>
            <InfoRow
              icon={FiUsers}
              label="Relation"
              value={data.relation_type?.label || "—"}
            />
            <InfoRow
              icon={FiUser}
              label="Primary Patient"
              value={
                data.primary_patient
                  ? `${data.primary_patient.name} (${data.primary_patient.patient_id})`
                  : "—"
              }
            />
          </InfoGrid>
        </Section>
      )}

      {/* Account */}
      <Section
        title="Account Information"
        icon={FiClock}
        iconBg="bg-ink-100"
        iconColor="text-ink-600"
      >
        <InfoGrid>
          <InfoRow
            icon={FiCalendar}
            label="Created"
            value={
              data.created_at ? new Date(data.created_at).toLocaleString() : "—"
            }
          />
          <InfoRow
            icon={FiClock}
            label="Last Updated"
            value={
              data.updated_at ? new Date(data.updated_at).toLocaleString() : "—"
            }
          />
        </InfoGrid>
      </Section>
    </div>
  );
};

// ==================== HELPERS ====================
const Section = ({ title, icon: Icon, iconBg, iconColor, children }) => (
  <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
    <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-md ${iconBg} ${iconColor}`}
      >
        <Icon className="h-3 w-3" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
        {title}
      </p>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const InfoGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, value, multiline }) => (
  <div className={multiline ? "sm:col-span-2" : ""}>
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-ink-800">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default PatientView;
