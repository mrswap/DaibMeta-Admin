// src/features/patent/pages/cms/Records/RecordsUI.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX, FiLock } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import {
  useFeatureCards,
  useUpdateFeatureCard,
} from "../../../queries/homeCms";
import { usePermission } from "../../../hooks/usePermission";

const RecordsUI = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { can, isLoading: permLoading } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("cms", "view");
  const canManage = can("cms", "manage");

  // API gated by view permission
  const { data: cards = [], isLoading } = useFeatureCards({
    enabled: canView,
  });

  // Key: health-records
  const existing = cards?.find(
    (c) => String(c.key).trim() === "health-records",
  );

  const updateMutation = useUpdateFeatureCard();
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (existing?.image) setImagePreview(existing.image);
  }, [existing]);

  const initialValues = {
    h1: existing?.h1 || "Save Your Health Record",
    h2: existing?.h2 || "",
    sort_order: existing?.sort_order || 1,
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    h2: Yup.string().max(150),
    sort_order: Yup.number().required().min(0),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    if (!canManage || !existing) {
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("h1", values.h1);
    formData.append("h2", values.h2);
    formData.append("sort_order", values.sort_order);
    formData.append("is_active", values.is_active ? "1" : "0");
    if (imageFile) formData.append("image", imageFile);

    updateMutation.mutate(
      { id: existing.id, formData },
      {
        onSettled: () => {
          setSubmitting(false);
          setImageFile(null);
        },
      },
    );
  };

  // ==================== PAGE ACCESS GUARD ====================
  if (permLoading && !canView) {
    return <Loader text="Checking permissions..." />;
  }

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
          You do not have permission to view this setting. Please contact your
          administrator.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading..." />;

  if (!existing)
    return <div className="p-10 text-center text-ink-500">Card not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          Records
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {canManage ? "Manage Records card" : "View Records card (Read-only)"}
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface p-5 space-y-5">
              {/* Text Fields - Strict Read-only */}
              <div
                className={`space-y-5 ${!canManage ? "pointer-events-none opacity-70" : ""}`}
              >
                <TextInput
                  label="Heading (Optional)"
                  name="h2"
                  placeholder="Enter heading"
                  maxLength={150}
                  disabled={!canManage}
                />
                <TextInput
                  label="Sort Order"
                  name="sort_order"
                  type="number"
                  placeholder="e.g. 1"
                  required
                  disabled={!canManage}
                />
              </div>

              {/* --- CARD IMAGE SECTION START --- */}
              <div
                className={`${!canManage ? "pointer-events-none opacity-70" : ""}`}
              >
                <label className="mb-2 block text-sm font-medium text-ink-900">
                  Card Image
                </label>

                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* LEFT: Image Upload / Preview */}
                  <div className="shrink-0">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <div className="flex h-[160px] w-[110px] items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                          <img
                            src={imagePreview}
                            className="h-full w-full object-contain"
                            alt="Preview"
                          />
                        </div>
                        {/* X Button only if canManage */}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setImageFile(null);
                            }}
                            className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1 text-white shadow-sm hover:bg-danger-600 transition"
                          >
                            <FiX size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-[160px] w-[110px] flex-col items-center justify-center border border-dashed rounded-xl bg-ink-50/40 text-ink-500">
                        <FiUpload className="h-5 w-5 mb-1" />
                        <span className="text-xs text-center px-1">
                          No Image
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (!canManage) return;
                        const f = e.target.files?.[0];
                        if (f) {
                          setImageFile(f);
                          const r = new FileReader();
                          r.onloadend = () => setImagePreview(r.result);
                          r.readAsDataURL(f);
                        }
                      }}
                      disabled={!canManage}
                      className="hidden"
                    />
                  </div>

                  {/* RIGHT: Simple Text Guide */}
                  <div className="text-xs text-ink-600 space-y-1.5 mt-1">
                    <p>
                      <span className="font-medium text-ink-900">
                        Without heading:
                      </span>{" "}
                      240 x 324 px
                    </p>
                    <p>
                      <span className="font-medium text-ink-900">
                        With heading:
                      </span>{" "}
                      240 x 252 px
                    </p>
                    <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
                  </div>
                </div>
              </div>
              {/* --- CARD IMAGE SECTION END --- */}

              {/* Toggle Switch - Only if canManage */}
              <div className="border-t border-ink-100 pt-5">
                {canManage ? (
                  <ToggleSwitch name="is_active" label="Active Status" />
                ) : (
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-ink-200 bg-ink-50/30 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink-800">
                        Active Status
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-500">
                        {initialValues.is_active
                          ? "This card is visible to users"
                          : "This card is hidden from users"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${initialValues.is_active ? "bg-brand-50 text-brand-700" : "bg-ink-200 text-ink-600"}`}
                    >
                      {initialValues.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions - Only if canManage */}
            {canManage && (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="flex items-center gap-2 bg-btn-primary-bg px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                >
                  {(isSubmitting || updateMutation.isPending) && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {isSubmitting || updateMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RecordsUI;
