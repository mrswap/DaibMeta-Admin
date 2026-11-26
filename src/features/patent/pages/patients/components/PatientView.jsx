// src/features/patent/pages/patients/components/PatientView.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
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
  FiLock,
  FiArrowLeft,
} from "react-icons/fi";
import { usePatient } from "../../../queries/patients";
import Loader from "../../../common/Loader";
import FamilyMembersSection from "./FamilyMembersSection";
import { usePermission } from "../../../hooks/usePermission";
import { PatientAvatar } from "../PatientList"; // importing avatar from PatientList

const TABS = [
  { key: "overview", label: "Overview", icon: FiUser },
  { key: "family", label: "Family Members", icon: FiUsers },
];

const PatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can, isLoading: permLoading } = usePermission();

  const canView = can("patients", "view");
  const canManage = can("patients", "manage");

  const { data, isLoading } = usePatient(id, { enabled: canView });
  const [activeTab, setActiveTab] = useState("overview");

  if (permLoading) return <Loader text="Checking permissions..." />;
  if (!canView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to view patients.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading patient details..." />;

  if (!data) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-surface py-16 text-center">
        <p className="text-sm font-medium text-ink-700">Patient not found.</p>
        <button
          onClick={() => navigate("/patients")}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Patients
        </button>
      </div>
    );
  }

  const isFamilyMember = !!data.linked_primary_patient_id;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="cursor-pointer rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              Patient Details
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              View profile and family members
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => navigate(`/patients/${data.id}/edit`)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-700"
          >
            <FiEdit2 className="h-4 w-4" />
            Edit Patient
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-surface">
        <div className="bg-gradient-to-br from-brand-50/60 to-accent-50/40 px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <PatientAvatar name={data.name} image={data.image} size="lg" />

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
                    {data.patient_id || "—"}
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

        <div className="flex overflow-x-auto border-b border-ink-100 px-5 sm:px-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

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

        <div className="p-5 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab data={data} isFamilyMember={isFamilyMember} />
          )}

          {activeTab === "family" && !isFamilyMember && (
            <FamilyMembersSection
              patientId={data.id}
              canManage={canManage}
              onViewMember={(member) => navigate(`/patients/${member.id}`)}
              onAddNew={
                canManage
                  ? () => navigate("/patients/new?type=family")
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ data, isFamilyMember }) => {
  return (
    <div className="space-y-5">
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
