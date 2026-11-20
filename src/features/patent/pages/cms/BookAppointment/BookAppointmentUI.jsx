// src/features/patent/pages/cms/BookAppointment/BookAppointmentUI.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX, FiLock } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import { useBookingCard, useUpdateBookingCard } from "../../../queries/homeCms";
import { usePermission } from "../../../hooks/usePermission";

const MAX_IMAGE_SIZE_MB = 2;

const BookAppointmentUI = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { can, isLoading: permLoading } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("cms", "view");
  const canManage = can("cms", "manage");

  const { data: existing, isLoading } = useBookingCard({
    enabled: canView,
  });
  const updateMutation = useUpdateBookingCard();

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (existing?.image) setImagePreview(existing.image);
  }, [existing]);

  const initialValues = {
    h1: existing?.h1 || "Book Appointment",
    h2: existing?.h2 || "",
    button_text: existing?.button_text || "",
    sort_order: existing?.sort_order || 1,
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    h2: Yup.string().max(150, "Maximum 150 characters allowed"),
    button_text: Yup.string().max(50, "Maximum 50 characters allowed"),
    sort_order: Yup.number().required("Sort order is required").min(0),
  });

  const handleImageChange = (e) => {
    if (!canManage) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !file.type.startsWith("image/") ||
      file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      setImageError("Invalid file or size exceeds 2MB");
      return;
    }
    setImageError("");
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (!canManage) return;
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (values, { setSubmitting }) => {
    if (!canManage) {
      setSubmitting(false);
      return;
    }

    const formData = new FormData();

    formData.append("_method", "PUT");
    formData.append("h1", values.h1);
    formData.append("h2", values.h2);
    formData.append("button_text", values.button_text);
    formData.append("sort_order", values.sort_order);
    formData.append("is_active", values.is_active ? "1" : "0");

    if (imageFile) {
      formData.append("image", imageFile);
    }

    updateMutation.mutate(formData, {
      onSettled: () => {
        setSubmitting(false);
        setImageFile(null);
      },
    });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          Book Appointment
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {canManage
            ? "Manage Book Appointment card content and images"
            : "View Book Appointment card content and images (Read-only)"}
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
              {/* Text Fields - pointer-events-none for strict read-only */}
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
                  label="Button Text"
                  name="button_text"
                  placeholder="Enter button text"
                  maxLength={50}
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
                            onClick={handleRemoveImage}
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
                      onChange={handleImageChange}
                      disabled={!canManage}
                      className="hidden"
                    />
                    {imageError && (
                      <p className="text-danger-500 text-xs mt-1 max-w-[110px]">
                        {imageError}
                      </p>
                    )}
                  </div>

                  {/* RIGHT: Simple Text Guide */}
                  <div className="text-xs text-ink-600 space-y-1.5 mt-1">
                    <p>
                      <span className="font-medium text-ink-900">
                        Without heading:
                      </span>{" "}
                      336 x 594 px
                    </p>
                    <p>
                      <span className="font-medium text-ink-900">
                        With heading:
                      </span>{" "}
                      336 x 448 px
                    </p>
                    <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
                  </div>
                </div>
              </div>
              {/* --- CARD IMAGE SECTION END --- */}

              {/* Toggle Switch - Only if canManage */}
              <div className="border-t border-ink-100 pt-5">
                {canManage ? (
                  <ToggleSwitch
                    name="is_active"
                    label="Active Status"
                    description="Inactive will be hidden"
                  />
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
                  className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface text-ink-700 hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="flex items-center justify-center gap-2 bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {(isSubmitting || updateMutation.isPending) && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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

export default BookAppointmentUI;
