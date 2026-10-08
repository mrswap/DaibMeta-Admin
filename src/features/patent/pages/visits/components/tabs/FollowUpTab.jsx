// src/features/patent/pages/visits/components/tabs/FollowUpTab.jsx

import { useState, useMemo, useEffect } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import {
  FiCalendar,
  FiInfo,
  FiCheck,
  FiUser,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import { useCreateFollowUp } from "../../../../queries/visits";
import { useStaff } from "../../../../queries/staff";
import { useAppointmentTypes } from "../../../../queries/appointmentTypes";
import {
  TextInput,
  TextareaField,
  SelectField,
  FormButton,
  DatePicker,
  ToggleSwitch,
} from "../../../../common/form";

// ==================== HELPERS ====================
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, "0");
  const nd = String(dt.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
};

// ==================== FORM INNER ====================
const FollowUpFormInner = ({
  isPending,
  providerOptions,
  appointmentTypeOptions,
  setAutoDate,
}) => {
  const { values, setFieldValue } = useFormikContext();
  const showAppointment = values.book_appointment === true;

  // Auto-set follow_up_date when follow_up_days changes
  useEffect(() => {
    const days = Number(values.follow_up_days);
    if (!Number.isFinite(days) || days < 1) return;
    const newDate = addDays(todayStr(), days);
    if (values.follow_up_date !== newDate) {
      setFieldValue("follow_up_date", newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.follow_up_days]);

  return (
    <Form className="space-y-5 px-4 py-5">
      {/* Follow-up details */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          Follow-up Details
        </p>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <TextInput
            label="Follow-up Days"
            name="follow_up_days"
            type="number"
            placeholder="e.g. 7"
            required
          />

          <DatePicker
            label="Follow-up Date"
            name="follow_up_date"
            placeholder="Select date"
            min={todayStr()}
            required
          />

          <div className="sm:col-span-2">
            <TextareaField
              label="Notes"
              name="notes"
              rows={3}
              placeholder="Follow-up notes..."
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Book appointment toggle */}
      <ToggleSwitch
        name="book_appointment"
        label="Book Next Appointment"
        description={
          showAppointment
            ? "Appointment will be booked along with follow-up"
            : "Only follow-up will be created"
        }
      />

      {/* Appointment section */}
      {showAppointment && (
        <div className="rounded-xl border border-accent-200 bg-accent-50/40 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-accent-800">
            Next Appointment
          </p>

          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <SelectField
              label="Provider"
              name="provider_id"
              options={providerOptions}
              placeholder="Select provider..."
              required
            />

            <SelectField
              label="Appointment Type"
              name="appointment_type_id"
              options={appointmentTypeOptions}
              placeholder="Select type..."
              required
            />

            {/* Auto-filled date display */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Appointment Date
              </label>
              <div className="flex h-10 items-center rounded-lg border border-ink-200 bg-ink-50/50 px-3 text-sm text-ink-700">
                {values.follow_up_date || "Set follow-up date first"}
              </div>
              <p className="mt-1 text-[11px] text-ink-500">
                Appointment date is same as follow-up date
              </p>
            </div>

            <TextInput
              label="Start Time"
              name="start_time"
              type="time"
              required
            />

            <TextInput label="End Time" name="end_time" type="time" required />

            <div className="sm:col-span-2">
              <TextareaField
                label="Appointment Notes"
                name="appointment_notes"
                rows={2}
                placeholder="Notes for the appointment..."
                maxLength={500}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-accent-200 bg-accent-50/50 px-4 py-3">
        <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
        <p className="text-[11px] leading-relaxed text-accent-800">
          Provider availability, slot validation, and double-booking will be
          validated by the backend. No manual validation required.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
        <div className="w-52">
          <FormButton
            type="submit"
            text={isPending ? "Creating..." : "Save Follow-up"}
            disabled={isPending}
          />
        </div>
      </div>
    </Form>
  );
};

// ==================== MAIN ====================
const FollowUpTab = ({ visitId }) => {
  const createMutation = useCreateFollowUp();

  const { data: staffData } = useStaff({ per_page: 100, status: 1 });
  const { data: typesData } = useAppointmentTypes({ per_page: 100, status: 1 });

  const providerOptions = useMemo(
    () =>
      (staffData?.list || []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.role?.label ? ` — ${p.role.label}` : ""}`,
      })),
    [staffData],
  );

  const appointmentTypeOptions = useMemo(
    () =>
      (typesData?.list || []).map((t) => ({
        value: t.id,
        label: `${t.name}${t.duration ? ` — ${t.duration} min` : ""}`,
      })),
    [typesData],
  );

  // Initial values
  const initialValues = {
    follow_up_days: 7,
    follow_up_date: addDays(todayStr(), 7),
    notes: "",
    book_appointment: false,
    provider_id: null,
    appointment_type_id: null,
    start_time: "",
    end_time: "",
    appointment_notes: "",
  };

  // Validation
  const validationSchema = Yup.object({
    follow_up_days: Yup.number()
      .typeError("Must be a number")
      .integer("Must be a whole number")
      .min(1, "Min 1 day")
      .required("Follow-up days required"),
    follow_up_date: Yup.string().required("Follow-up date is required"),
    notes: Yup.string().nullable(),
    book_appointment: Yup.boolean(),
    provider_id: Yup.object().when("book_appointment", {
      is: true,
      then: (s) => s.nullable().required("Provider is required"),
      otherwise: (s) => s.nullable(),
    }),
    appointment_type_id: Yup.object().when("book_appointment", {
      is: true,
      then: (s) => s.nullable().required("Appointment type is required"),
      otherwise: (s) => s.nullable(),
    }),
    start_time: Yup.string().when("book_appointment", {
      is: true,
      then: (s) => s.required("Start time is required"),
      otherwise: (s) => s.nullable(),
    }),
    end_time: Yup.string().when("book_appointment", {
      is: true,
      then: (s) =>
        s
          .required("End time is required")
          .test(
            "after-start",
            "End time must be after start time",
            function (value) {
              const { start_time } = this.parent;
              if (!start_time || !value) return true;
              return value > start_time;
            },
          ),
      otherwise: (s) => s.nullable(),
    }),
    appointment_notes: Yup.string().nullable(),
  });

  // Submit
  const handleSubmit = (values, { resetForm }) => {
    const payload = {
      follow_up_days: Number(values.follow_up_days),
      follow_up_date: values.follow_up_date,
      notes: values.notes?.trim() || null,
      book_appointment: !!values.book_appointment,
    };

    if (values.book_appointment) {
      payload.provider_id = values.provider_id?.value;
      payload.appointment_type_id = values.appointment_type_id?.value;
      payload.start_time = values.start_time;
      payload.end_time = values.end_time;
      payload.appointment_notes = values.appointment_notes?.trim() || null;
    }

    createMutation.mutate(
      { visitId, payload },
      {
        onSuccess: () => resetForm(),
      },
    );
  };

  const isPending = createMutation.isPending;

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
      {/* Header */}
      <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <FiCalendar className="h-4 w-4 text-ink-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
            Create Follow-up
          </p>
        </div>
      </div>

      {/* Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <FollowUpFormInner
          isPending={isPending}
          providerOptions={providerOptions}
          appointmentTypeOptions={appointmentTypeOptions}
        />
      </Formik>
    </div>
  );
};

export default FollowUpTab;
