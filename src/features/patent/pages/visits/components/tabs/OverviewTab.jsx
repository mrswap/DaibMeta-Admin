// src/features/patent/pages/visits/components/tabs/OverviewTab.jsx

import {
  FiUser,
  FiCalendar,
  FiClock,
  FiFileText,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";
import { getConsultationEndSourceLabel } from "../../../../queries/visits";

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

// ==================== MAIN ====================
const OverviewTab = ({ visit }) => {
  const timing = visit.timing || {};
  const schedule = visit.visit_schedule || {};

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Linked Appointment */}
      {visit.appointment && (
        <Section
          title="Linked Appointment"
          icon={FiFileText}
          iconBg="bg-warn-50"
          iconColor="text-warn-700"
        >
          <InfoGrid>
            <InfoRow
              icon={FiFileText}
              label="Appointment ID"
              value={`#${visit.appointment.id}`}
            />
            {visit.appointment.appointment_date && (
              <InfoRow
                icon={FiCalendar}
                label="Date"
                value={visit.appointment.appointment_date}
              />
            )}
            {visit.appointment.start_time && (
              <InfoRow
                icon={FiClock}
                label="Time"
                value={`${formatTime12(visit.appointment.start_time)} – ${formatTime12(visit.appointment.end_time)}`}
              />
            )}
          </InfoGrid>
        </Section>
      )}

      {/* Visit Schedule */}
      <Section
        title="Visit Schedule"
        icon={FiCalendar}
        iconBg="bg-brand-50"
        iconColor="text-brand-600"
      >
        <InfoGrid>
          <InfoRow
            icon={FiCalendar}
            label="Date"
            value={schedule.date || visit.visit_date || "—"}
          />
          <InfoRow
            icon={FiFileText}
            label="Type"
            value={visit.visit_type_label || visit.visit_type || "—"}
          />
          <InfoRow
            icon={FiClock}
            label="Start Time"
            value={formatTime12(schedule.start_time || visit.slot_start_time)}
          />
          <InfoRow
            icon={FiClock}
            label="End Time"
            value={formatTime12(schedule.end_time || visit.slot_end_time)}
          />
        </InfoGrid>
      </Section>

      {/* Consultation Timing */}
      <Section
        title="Consultation Timing"
        icon={FiClock}
        iconBg="bg-accent-50"
        iconColor="text-accent-600"
      >
        <InfoGrid>
          <InfoRow
            icon={FiCheckCircle}
            label="Checked In At"
            value={formatDateTime(timing.check_in_at)}
          />
          <InfoRow
            icon={FiClock}
            label="Consultation Started"
            value={formatDateTime(timing.consultation_started_at)}
          />
          <InfoRow
            icon={FiClock}
            label="Consultation Ended"
            value={formatDateTime(timing.consultation_ended_at)}
          />
          <InfoRow
            icon={FiActivity}
            label="End Source"
            value={
              timing.consultation_end_source
                ? getConsultationEndSourceLabel(timing.consultation_end_source)
                : "—"
            }
          />
        </InfoGrid>
      </Section>

      {/* Audit */}
      <Section
        title="Audit Information"
        icon={FiFileText}
        iconBg="bg-ink-100"
        iconColor="text-ink-600"
      >
        <InfoGrid>
          {visit.created_by && (
            <InfoRow
              icon={FiUser}
              label="Created By"
              value={visit.created_by.name || "—"}
            />
          )}
          {visit.updated_by && (
            <InfoRow
              icon={FiUser}
              label="Updated By"
              value={visit.updated_by.name || "—"}
            />
          )}
          <InfoRow
            icon={FiCalendar}
            label="Created At"
            value={formatDateTime(visit.created_at)}
          />
          <InfoRow
            icon={FiClock}
            label="Updated At"
            value={formatDateTime(visit.updated_at)}
          />
        </InfoGrid>
      </Section>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================
const Section = ({ title, icon: Icon, iconBg, iconColor, children }) => (
  <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
    <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-md ${iconBg} ${iconColor}`}
      >
        <Icon className="h-3 w-3" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
        {title}
      </p>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const InfoGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div>
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

export default OverviewTab;
