// src/features/patent/pages/visits/VisitEdit.jsx

import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiCheck,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import {
  useVisit,
  useUpdateVisit,
  VISIT_TYPES,
  PAYMENT_STATUSES,
} from "../../queries/visits";
import { useStaff } from "../../queries/staff";
import { SelectField, FormButton } from "../../common/form";
import Loader from "../../common/Loader";
import SlotSelector from "./components/SlotSelector";

// ==================== HELPERS ====================
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ==================== FORM INNER ====================
const VisitEditInner = ({
  visit,
  providerOptions,
  isPending,
  selectedProviderId,
  setSelectedProviderId,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
}) => {
  const { values, setFieldValue } = useFormikContext();

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setFieldValue("slot_start_time", slot.start_time);
    setFieldValue("slot_end_time", slot.end_time);
  };

  return (
    <Form className="space-y-5">
      {/* Locked info banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-accent-200 bg-accent-50/50 px-4 py-3">
        <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
        <div>
          <p className="text-xs font-semibold text-accent-900">
            Patient &amp; appointment are locked
          </p>
          <p className="mt-0.5 text-[11px] text-accent-800">
            To change patient or appointment, create a new visit instead.
          </p>
        </div>
      </div>

      {/* Locked info card — patient + appointment */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiUser className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Patient (Locked)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Name
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {visit.patient?.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Mobile
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {visit.patient?.mobile || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Patient ID
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {visit.patient?.patient_id || visit.patient_id || "—"}
            </p>
          </div>
        </div>

        {visit.appointment && (
          <div className="border-t border-ink-100 bg-ink-50/30 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              Linked Appointment
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink-800">
              #{visit.appointment.id}
              {visit.appointment.appointment_date && (
                <span className="ml-1.5 font-normal text-ink-500">
                  · {visit.appointment.appointment_date}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Editable: Provider & Slot */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiCheck className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Provider &amp; Slot
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <SelectField
            label="Provider"
            name="provider_id"
            options={providerOptions}
            placeholder="Select provider..."
            required
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-form-label">
              Select Slot <span className="text-form-required">*</span>
            </label>
            <SlotSelector
              providerId={selectedProviderId}
              date={selectedDate}
              onDateChange={setSelectedDate}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Visit Info */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-ink-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
              Visit Information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <SelectField
            label="Visit Type"
            name="visit_type"
            options={VISIT_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            placeholder="Select type..."
            required
          />
          <SelectField
            label="Payment Status"
            name="payment_status"
            options={PAYMENT_STATUSES.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
            placeholder="Select payment status..."
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <div className="w-full sm:w-48">
          <FormButton
            type="submit"
            text={isPending ? "Updating..." : "Update Visit"}
            disabled={isPending}
          />
        </div>
      </div>
    </Form>
  );
};

// ==================== MAIN ====================
const VisitEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: visit, isLoading } = useVisit(id);
  const updateVisit = useUpdateVisit();

  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Load providers
  const { data: staffData } = useStaff({ per_page: 100, status: 1 });

  const providerOptions = useMemo(
    () =>
      (staffData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.role?.label ? ` — ${p.role.label}` : ""}`,
      })),
    [staffData],
  );

  // Hydrate state from visit
  useEffect(() => {
    if (!visit) return;

    // Provider
    const providerId = visit.provider?.id || visit.provider_id;
    setSelectedProviderId(providerId);

    // Date
    const date = visit.visit_schedule?.date || visit.visit_date || todayStr();
    setSelectedDate(date);

    // Slot
    const startTime =
      visit.visit_schedule?.start_time?.slice(0, 5) ||
      visit.slot_start_time?.slice(0, 5);
    const endTime =
      visit.visit_schedule?.end_time?.slice(0, 5) ||
      visit.slot_end_time?.slice(0, 5);

    if (startTime && endTime) {
      setSelectedSlot({ start_time: startTime, end_time: endTime });
    }
  }, [visit]);

  // ==================== INITIAL VALUES ====================
  const initialValues = useMemo(() => {
    if (!visit) return null;

    const providerId = visit.provider?.id || visit.provider_id;
    const providerObj = providerId
      ? {
          value: providerId,
          label:
            visit.provider?.name ||
            providerOptions.find((p) => p.value === providerId)?.label ||
            "",
        }
      : null;

    const visitType = visit.visit_type
      ? {
          value: visit.visit_type,
          label:
            VISIT_TYPES.find((t) => t.value === visit.visit_type)?.label ||
            visit.visit_type,
        }
      : null;

    const paymentStatus = visit.payment_status
      ? {
          value: visit.payment_status,
          label:
            PAYMENT_STATUSES.find((p) => p.value === visit.payment_status)
              ?.label || visit.payment_status,
        }
      : null;

    const startTime =
      visit.visit_schedule?.start_time?.slice(0, 5) ||
      visit.slot_start_time?.slice(0, 5) ||
      "";
    const endTime =
      visit.visit_schedule?.end_time?.slice(0, 5) ||
      visit.slot_end_time?.slice(0, 5) ||
      "";
    const date = visit.visit_schedule?.date || visit.visit_date || todayStr();

    return {
      provider_id: providerObj,
      visit_date: date,
      visit_type: visitType,
      payment_status: paymentStatus,
      slot_start_time: startTime,
      slot_end_time: endTime,
    };
  }, [visit, providerOptions]);

  // ==================== VALIDATION ====================
  const validationSchema = Yup.object({
    provider_id: Yup.object().nullable().required("Provider is required"),
    visit_date: Yup.string().required("Date is required"),
    visit_type: Yup.object().nullable().required("Visit type is required"),
    payment_status: Yup.object()
      .nullable()
      .required("Payment status is required"),
    slot_start_time: Yup.string().required("Slot start time is required"),
    slot_end_time: Yup.string().required("Slot end time is required"),
  });

  // ==================== SUBMIT ====================
  const handleSubmit = (values) => {
    const payload = {
      provider_id: values.provider_id?.value,
      visit_date: values.visit_date,
      slot_start_time: values.slot_start_time,
      slot_end_time: values.slot_end_time,
      visit_type: values.visit_type?.value,
      payment_status: values.payment_status?.value,
    };

    updateVisit.mutate(
      { id, payload },
      {
        onSuccess: () => navigate(`/visits/${id}`),
      },
    );
  };

  // ==================== LOADING / NOT FOUND ====================
  if (isLoading) return <Loader text="Loading visit..." />;

  if (!visit) {
    return (
      <div className="rounded-xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm text-ink-500">Visit not found.</p>
      </div>
    );
  }

  // Guard: cannot edit completed/cancelled/no_show visits
  const isLocked = ["completed", "cancelled", "no_show"].includes(visit.status);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/visits/${id}`)}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Visit
          </button>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Edit Visit #{visit.id}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            Update provider, slot, or payment status
          </p>
        </div>
      </div>

      {/* Locked banner */}
      {isLocked && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warn-200 bg-warn-50/50 px-4 py-3">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
          <div>
            <p className="text-xs font-semibold text-warn-900">
              This visit cannot be edited
            </p>
            <p className="mt-0.5 text-[11px] text-warn-800">
              Visits with status{" "}
              <strong>{visit.status_label || visit.status}</strong> cannot be
              modified.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {!isLocked && initialValues && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <VisitEditInner
            visit={visit}
            providerOptions={providerOptions}
            isPending={updateVisit.isPending}
            selectedProviderId={selectedProviderId}
            setSelectedProviderId={setSelectedProviderId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
          />
        </Formik>
      )}
    </div>
  );
};

export default VisitEdit;
