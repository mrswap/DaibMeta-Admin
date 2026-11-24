// src/features/patent/pages/visits/components/tabs/OverviewTab.jsx

import {
  FiUser,
  FiCalendar,
  FiClock,
  FiFileText,
  FiActivity,
  FiCheckCircle,
  FiCreditCard,
  FiTag,
  FiInfo,
} from "react-icons/fi";
import { getConsultationEndSourceLabel } from "../../../../queries/visits";

// ==================== HELPERS ====================
const formatTime12 = (t) => {
  if (!t) return null;
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDateTime = (d) => {
  if (!d) return null;
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

// Human readable booking source
const getBookingSourceLabel = (source) => {
  if (!source) return null;
  const map = {
    walk_in: "Walk-in",
    reception: "Reception",
    patient_app: "Patient App",
  };
  return map[source] || String(source).replace(/_/g, " ");
};

// ==================== MAIN ====================
const OverviewTab = ({ visit }) => {
  if (!visit) return null;

  const timing = visit.timing || {};
  const schedule = visit.visit_schedule || {};
  const appointment = visit.appointment;

  // Calculate values
  const bookingSource = getBookingSourceLabel(appointment?.booking_source);
  const startTime = formatTime12(schedule.start_time);
  const endTime = formatTime12(schedule.end_time);
  const checkedInAt = formatDateTime(timing.check_in_at);
  const startedAt = formatDateTime(timing.consultation_started_at);
  const endedAt = formatDateTime(timing.consultation_ended_at);
  const endSource = timing.consultation_end_source
    ? getConsultationEndSourceLabel(timing.consultation_end_source)
    : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. VISIT DETAILS */}
      <Section
        title="Visit Details"
        icon={FiInfo}
        iconBg="bg-brand-50"
        iconColor="text-brand-600"
      >
        <InfoGrid>
          <InfoRow
            icon={FiTag}
            label="Visit Type"
            value={visit.visit_type_label || visit.visit_type}
          />
          <InfoRow
            icon={FiActivity}
            label="Visit Status"
            value={visit.status_label || visit.status}
          />
          <InfoRow
            icon={FiCreditCard}
            label="Payment Status"
            value={visit.payment_status_label || visit.payment_status}
          />
          <InfoRow icon={FiCalendar} label="Visit Date" value={schedule.date} />
        </InfoGrid>
      </Section>

      {/* 2. LINKED APPOINTMENT (Only shows if appointment exists) */}
      {appointment && (
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
              value={`#${appointment.id}`}
            />
            <InfoRow
              icon={FiTag}
              label="Booking Source"
              value={bookingSource}
            />
            <InfoRow
              icon={FiCalendar}
              label="Appointment Date"
              value={appointment.appointment_date}
            />
            <InfoRow
              icon={FiClock}
              label="Time Slot"
              value={
                appointment.start_time && appointment.end_time
                  ? `${formatTime12(appointment.start_time)} – ${formatTime12(appointment.end_time)}`
                  : null
              }
            />
          </InfoGrid>
        </Section>
      )}

      {/* 3. VISIT SCHEDULE */}
      <Section
        title="Visit Schedule"
        icon={FiCalendar}
        iconBg="bg-brand-50"
        iconColor="text-brand-600"
      >
        <InfoGrid>
          <InfoRow icon={FiCalendar} label="Date" value={schedule.date} />
          <InfoRow icon={FiClock} label="Start Time" value={startTime} />
          <InfoRow icon={FiClock} label="End Time" value={endTime} />
        </InfoGrid>
      </Section>

      {/* 4. CONSULTATION TIMING (Only shows available timings) */}
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
            value={checkedInAt}
          />
          <InfoRow icon={FiClock} label="Started At" value={startedAt} />
          <InfoRow icon={FiClock} label="Ended At" value={endedAt} />
          <InfoRow icon={FiActivity} label="End Source" value={endSource} />
        </InfoGrid>
      </Section>

      {/* 5. AUDIT */}
      <Section
        title="Audit Information"
        icon={FiFileText}
        iconBg="bg-ink-100"
        iconColor="text-ink-600"
      >
        <InfoGrid>
          <InfoRow
            icon={FiUser}
            label="Created By"
            value={visit.created_by?.name}
          />
          <InfoRow
            icon={FiUser}
            label="Updated By"
            value={visit.updated_by?.name}
          />
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

const InfoGrid = ({ children }) => {
  // Filter out empty/null children so grid doesn't break
  const validChildren = Array.isArray(children)
    ? children.filter(Boolean)
    : children;

  if (
    !validChildren ||
    (Array.isArray(validChildren) && validChildren.length === 0)
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
      {validChildren}
    </div>
  );
};

// ✅ InfoRow returns null if value is empty/null
const InfoRow = ({ icon: Icon, label, value }) => {
  if (value === null || value === undefined || value === "" || value === "—") {
    return null;
  }

  return (
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
};

export default OverviewTab;
