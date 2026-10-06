import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiArrowLeft,
  FiEdit2,
  FiUser,
  FiCalendar,
  FiClock,
  FiFileText,
  FiPhone,
  FiHash,
  FiActivity,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import {
  useAppointment,
  useDeleteAppointment,
  getAllowedTransitions,
  BOOKING_SOURCES,
} from "../../queries/appointments";
import AppointmentStatusBadge from "./components/AppointmentStatusBadge";
import AppointmentStatusModal from "./components/AppointmentStatusModal";
import Loader from "../../common/Loader";
import ConfirmModal from "../../common/ConfirmModal";

const AppointmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useAppointment(id);
  const deleteMutation = useDeleteAppointment();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate("/appointments"),
    });
  };

  if (isLoading) return <Loader text="Loading appointment..." />;

  if (!data) {
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm text-ink-500">Appointment not found.</p>
      </div>
    );
  }

  const allowedTransitions = getAllowedTransitions(data.status);
  const sourceLabel =
    BOOKING_SOURCES.find((s) => s.value === data.booking_source)?.label ||
    data.booking_source ||
    "—";

  const appointmentDate = data.appointment_date
    ? new Date(data.appointment_date)
    : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <button
            onClick={() => navigate("/appointments")}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Appointments
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
              Appointment #{data.id}
            </h1>
            <AppointmentStatusBadge status={data.status} size="md" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {allowedTransitions.length > 0 && (
            <button
              onClick={() => setStatusModalOpen(true)}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:flex-none sm:text-sm"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              Change Status
            </button>
          )}
          <button
            onClick={() => navigate(`/appointments/${id}/edit`)}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-surface hover:bg-brand-700 sm:flex-none sm:text-sm"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs font-semibold text-danger-700 hover:bg-danger-100 sm:flex-none sm:text-sm"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Hero card — date + time */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-gradient-to-br from-brand-50/70 via-accent-50/40 to-surface">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-600 text-surface shadow-md sm:h-20 sm:w-20">
              <span className="text-[10px] font-bold uppercase tracking-wide leading-none sm:text-xs">
                {appointmentDate
                  ? appointmentDate.toLocaleDateString("en-GB", {
                      month: "short",
                    })
                  : "—"}
              </span>
              <span className="mt-1 text-2xl font-bold leading-none sm:text-3xl">
                {appointmentDate ? appointmentDate.getDate() : "—"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-jakarta text-base font-bold text-ink-900 sm:text-lg">
                {appointmentDate
                  ? appointmentDate.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 sm:text-base">
                <FiClock className="h-4 w-4" />
                {data.start_time} - {data.end_time}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Booking Source
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink-900">
              {sourceLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Patient */}
        <Section
          title="Patient"
          icon={FiUser}
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
        >
          <InfoGrid>
            <InfoRow icon={FiUser} label="Name" value={data.name || "—"} />
            <InfoRow icon={FiPhone} label="Mobile" value={data.mobile || "—"} />
            {data.patient_id ? (
              <InfoRow
                icon={FiHash}
                label="Patient ID"
                value={
                  <span className="inline-flex items-center gap-2">
                    <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">
                      {data.patient?.patient_id || data.patient_id}
                    </code>
                    <span className="text-[11px] text-brand-600">
                      Registered
                    </span>
                  </span>
                }
              />
            ) : (
              <InfoRow
                icon={FiActivity}
                label="Patient Type"
                value={
                  <span className="inline-flex rounded-full bg-warn-100 px-2 py-0.5 text-[11px] font-medium text-warn-800">
                    Unregistered / Walk-in
                  </span>
                }
              />
            )}
          </InfoGrid>
        </Section>

        {/* Provider & Type */}
        <Section
          title="Provider & Type"
          icon={FiUser}
          iconBg="bg-accent-50"
          iconColor="text-accent-600"
        >
          <InfoGrid>
            <InfoRow
              icon={FiUser}
              label="Provider"
              value={data.provider?.name || "—"}
            />
            <InfoRow
              icon={FiActivity}
              label="Role"
              value={data.provider?.role_label || "—"}
            />
            <InfoRow
              icon={FiFileText}
              label="Appointment Type"
              value={data.appointment_type?.name || "—"}
            />
            {data.appointment_type?.duration && (
              <InfoRow
                icon={FiClock}
                label="Duration"
                value={`${data.appointment_type.duration} minutes`}
              />
            )}
          </InfoGrid>
        </Section>
      </div>

      {/* Notes */}
      {data.notes && (
        <Section
          title="Notes"
          icon={FiFileText}
          iconBg="bg-warn-50"
          iconColor="text-warn-700"
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
            {data.notes}
          </p>
        </Section>
      )}

      {/* Audit */}
      <Section
        title="Account Information"
        icon={FiCalendar}
        iconBg="bg-ink-100"
        iconColor="text-ink-600"
      >
        <InfoGrid>
          {data.created_by && (
            <InfoRow
              icon={FiUser}
              label="Created By"
              value={data.created_by.name || "—"}
            />
          )}
          {data.updated_by && (
            <InfoRow
              icon={FiUser}
              label="Updated By"
              value={data.updated_by.name || "—"}
            />
          )}
          <InfoRow
            icon={FiCalendar}
            label="Created At"
            value={
              data.created_at ? new Date(data.created_at).toLocaleString() : "—"
            }
          />
          <InfoRow
            icon={FiClock}
            label="Updated At"
            value={
              data.updated_at ? new Date(data.updated_at).toLocaleString() : "—"
            }
          />
        </InfoGrid>
      </Section>

      {/* Status Modal */}
      <AppointmentStatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        appointmentId={id}
        currentStatus={data.status}
        allowedTransitions={allowedTransitions}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={confirmDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
        loading={deleteMutation.isPending}
      />
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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
        {title}
      </p>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
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

export default AppointmentView;
