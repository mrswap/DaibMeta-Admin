// src/features/patent/pages/visits/components/tabs/ConsultationTab.jsx

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiLock, FiInfo, FiEdit3, FiX, FiAlertCircle } from "react-icons/fi";
import {
  useVisitConsultation,
  useUpdateConsultation,
} from "../../../../queries/visits";
import { TextareaField, FormButton } from "../../../../common/form";
import Loader from "../../../../common/Loader";

// ==================== HELPERS ====================
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
const ConsultationTab = ({ visitId, visitStatus }) => {
  const {
    data: consultation,
    isLoading,
    isError,
    error,
  } = useVisitConsultation(visitId);

  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateConsultation();

  // Consultation is editable only when visit is in_consultation
  const canEdit = visitStatus === "in_consultation";
  const isEditable = canEdit && isEditing;

  // 404 → not started
  const isNotStarted = isError && error?.response?.status === 404;

  // Reset editing when consultation changes
  useEffect(() => {
    setIsEditing(false);
  }, [consultation?.id]);

  // ==================== LOADING ====================
  if (isLoading) return <Loader text="Loading consultation..." />;

  // ==================== NOT STARTED ====================
  if (isNotStarted) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
          <FiInfo className="h-5 w-5 text-ink-500" />
        </div>
        <p className="text-sm font-medium text-ink-700">
          Consultation not started
        </p>
        <p className="mt-1 text-xs text-ink-500">
          {visitStatus === "waiting"
            ? "Start consultation from Overview tab to record clinical data."
            : "No consultation data available for this visit."}
        </p>
      </div>
    );
  }

  // ==================== INITIAL VALUES ====================
  const initialValues = {
    symptoms: consultation?.symptoms || "",
    clinical_details: consultation?.clinical_details || "",
    doctor_notes: consultation?.doctor_notes || "",
    advice: consultation?.advice || "",
  };

  const validationSchema = Yup.object({
    symptoms: Yup.string().nullable(),
    clinical_details: Yup.string().nullable(),
    doctor_notes: Yup.string().nullable(),
    advice: Yup.string().nullable(),
  });

  // ==================== SUBMIT ====================
  const handleSubmit = (values) => {
    const payload = {
      symptoms: values.symptoms?.trim() || null,
      clinical_details: values.clinical_details?.trim() || null,
      doctor_notes: values.doctor_notes?.trim() || null,
      advice: values.advice?.trim() || null,
    };

    updateMutation.mutate(
      { visitId, payload },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const isPending = updateMutation.isPending;

  // ==================== RENDER ====================
  return (
    <div className="space-y-4">
      {/* Status notices */}
      {!canEdit && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warn-200 bg-warn-50/50 px-4 py-3">
          <FiLock className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" />
          <div>
            <p className="text-xs font-semibold text-warn-900">
              Consultation is read-only
            </p>
            <p className="mt-0.5 text-[11px] text-warn-800">
              Consultation data can only be edited while the visit is in
              consultation. Current status: <strong>{visitStatus}</strong>.
            </p>
          </div>
        </div>
      )}

      {canEdit && !isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-200 bg-accent-50/50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
            <div>
              <p className="text-xs font-semibold text-accent-900">
                Consultation in progress
              </p>
              <p className="mt-0.5 text-[11px] text-accent-800">
                Click Edit to record clinical information.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-surface hover:bg-brand-700"
          >
            <FiEdit3 className="h-3.5 w-3.5" />
            Edit Consultation
          </button>
        </div>
      )}

      {/* Consultation form */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-surface">
        {/* Header */}
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FiEdit3 className="h-4 w-4 text-ink-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Clinical Information
              </p>
            </div>

            {consultation && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-500">
                {consultation.consultation_started_at && (
                  <span>
                    Started:{" "}
                    <strong className="text-ink-700">
                      {formatDateTime(consultation.consultation_started_at)}
                    </strong>
                  </span>
                )}
                {consultation.consultation_completed_at && (
                  <span>
                    Completed:{" "}
                    <strong className="text-ink-700">
                      {formatDateTime(consultation.consultation_completed_at)}
                    </strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <Formik
          key={consultation?.id || "new"}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {() => (
            <Form className="space-y-4 px-4 py-5">
              <TextareaField
                label="Symptoms"
                name="symptoms"
                rows={3}
                placeholder="Patient reported symptoms..."
                maxLength={500}
                isDisabled={!isEditable}
              />

              <TextareaField
                label="Clinical Details"
                name="clinical_details"
                rows={4}
                placeholder="Clinical examination details..."
                maxLength={500}
                isDisabled={!isEditable}
              />

              <TextareaField
                label="Doctor Notes"
                name="doctor_notes"
                rows={3}
                placeholder="Internal notes (not shown to patient)..."
                maxLength={500}
                isDisabled={!isEditable}
              />

              <TextareaField
                label="Advice"
                name="advice"
                rows={3}
                placeholder="Advice for the patient..."
                maxLength={500}
                isDisabled={!isEditable}
              />

              {/* Save/Cancel — only when editing */}
              {isEditable && (
                <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isPending}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiX className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  <div className="w-40">
                    <FormButton
                      type="submit"
                      text={isPending ? "Saving..." : "Save Consultation"}
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      {/* Consultation completed notice */}
      {consultation?.consultation_completed_at && (
        <div className="flex items-start gap-2.5 rounded-lg border border-brand-200 bg-brand-50/50 px-4 py-3">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
          <div>
            <p className="text-xs font-semibold text-brand-900">
              Consultation completed
            </p>
            <p className="mt-0.5 text-[11px] text-brand-800">
              This consultation was completed on{" "}
              {formatDateTime(consultation.consultation_completed_at)}. Editing
              is no longer allowed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationTab;
