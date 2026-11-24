// src/features/patent/pages/visits/components/tabs/ConsultationTab.jsx

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  FiLock,
  FiInfo,
  FiEdit3,
  FiX,
  FiCheckCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";
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
const ConsultationTab = ({ visitId, visitStatus, canManage = false }) => {
  const {
    data: consultation,
    isLoading,
    isError,
    error,
  } = useVisitConsultation(visitId);

  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateConsultation();

  const isStatusEditable = visitStatus === "in_consultation";
  const canEdit = canManage && isStatusEditable;
  const isEditable = canEdit && isEditing;

  const isNotStarted = isError && error?.response?.status === 404;

  useEffect(() => {
    setIsEditing(false);
  }, [consultation?.id]);

  // ==================== LOADING ====================
  if (isLoading) return <Loader text="Loading consultation details..." />;

  // ==================== NOT STARTED ====================
  if (isNotStarted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/30 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-sm border border-ink-100">
          <FiInfo className="h-6 w-6 text-ink-400" />
        </div>
        <h3 className="text-base font-bold text-ink-900">
          Consultation not started
        </h3>
        <p className="mt-1 max-w-sm text-sm text-ink-500">
          {visitStatus === "waiting"
            ? canManage
              ? "Start the consultation from the Overview tab to record clinical data."
              : "Consultation has not started yet."
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
    if (!canManage) return;

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
    <div className="space-y-4 sm:space-y-5">
      {/* 1. STATUS ALERTS */}
      {canManage && !isStatusEditable && (
        <div className="flex items-start gap-3 rounded-xl border border-warn-200 bg-warn-50/60 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warn-100 text-warn-700">
            <FiLock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-warn-900">
              Consultation is read-only
            </p>
            <p className="mt-0.5 text-xs text-warn-800">
              Data can only be edited while the visit is in consultation.
              Current status:{" "}
              <strong className="capitalize">
                {visitStatus?.replace("_", " ")}
              </strong>
              .
            </p>
          </div>
        </div>
      )}

      {canEdit && !isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-accent-200 bg-accent-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
              <FiActivity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-accent-900">
                Consultation in progress
              </p>
              <p className="mt-0.5 text-xs text-accent-800">
                Click Edit to record clinical information.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface shadow-sm transition hover:bg-brand-700"
          >
            <FiEdit3 className="h-4 w-4" />
            Edit Consultation
          </button>
        </div>
      )}

      {/* 2. MAIN CONSULTATION CARD */}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-sm">
        {/* Header & Timeline */}
        <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FiEdit3 className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-bold text-ink-900">
                Clinical Information
              </h3>
            </div>

            {/* Consultation Timeline */}
            {consultation &&
              (consultation.consultation_started_at ||
                consultation.consultation_completed_at) && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {consultation.consultation_started_at && (
                    <div className="flex items-center gap-1.5 text-ink-600">
                      <FiClock className="h-3.5 w-3.5 text-ink-400" />
                      <span>Started:</span>
                      <strong className="font-semibold text-ink-800">
                        {formatDateTime(consultation.consultation_started_at)}
                      </strong>
                    </div>
                  )}
                  {consultation.consultation_completed_at && (
                    <div className="flex items-center gap-1.5 text-brand-700">
                      <FiCheckCircle className="h-3.5 w-3.5" />
                      <span>Completed:</span>
                      <strong className="font-semibold">
                        {formatDateTime(consultation.consultation_completed_at)}
                      </strong>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Form Body */}
        <Formik
          key={consultation?.id || "new"}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {() => (
            <Form className="px-5 py-6 sm:px-6">
              <div className="space-y-5">
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
              </div>

              {/* Action Buttons */}
              {isEditable && (
                <div className="mt-6 flex justify-end gap-3 border-t border-ink-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isPending}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiX className="h-4 w-4" />
                    Cancel
                  </button>
                  <div className="w-40">
                    <FormButton
                      type="submit"
                      text={isPending ? "Saving..." : "Save Changes"}
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      {/* 3. COMPLETED NOTICE */}
      {consultation?.consultation_completed_at && (
        <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <FiCheckCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-900">
              Consultation completed
            </p>
            <p className="mt-0.5 text-xs text-brand-800">
              This consultation was completed on{" "}
              <strong className="font-semibold">
                {formatDateTime(consultation.consultation_completed_at)}
              </strong>
              . Editing is no longer allowed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationTab;
