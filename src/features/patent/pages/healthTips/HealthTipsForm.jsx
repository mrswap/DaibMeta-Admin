// src/features/patent/pages/healthTips/HealthTipsForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiGrid, FiUpload, FiX, FiLock } from "react-icons/fi";
import TextInput from "../../common/form/TextInput";
import FormikEditorField from "../../common/form/FormikEditorField";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import Loader from "../../common/Loader";
import {
  useHealthTip,
  useCreateHealthTip,
  useUpdateHealthTip,
} from "../../queries/healthTips";
import { usePermission } from "../../hooks/usePermission";

const MAX_IMAGE_SIZE_MB = 2;
const MAX_CONTENT_LENGTH = 50000;

const stripHtml = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const HealthTipsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { can, isLoading: permLoading } = usePermission();

  const canView = can("health_tips", "view");
  const canManage = can("health_tips", "manage");

  const { data: existing, isLoading: isFetching } = useHealthTip(id);
  const createMutation = useCreateHealthTip();
  const updateMutation = useUpdateHealthTip();

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (existing?.image) setImagePreview(existing.image);
  }, [existing]);

  const initialValues = {
    heading: existing?.heading || "",
    tag: existing?.tag || "",
    content: existing?.content || "",
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    heading: Yup.string().required("Heading is required").max(150),
    tag: Yup.string().required("Tag is required").max(50),
    content: Yup.string()
      .required("Content is required")
      .test(
        "content-length",
        `Maximum ${MAX_CONTENT_LENGTH} characters allowed`,
        (val) => stripHtml(val).length <= MAX_CONTENT_LENGTH,
      )
      .test(
        "content-not-empty",
        "Content is required",
        (val) => stripHtml(val).length > 0,
      ),
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !file.type.startsWith("image/") ||
      file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      setImageError(`Invalid file or size exceeds ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }
    setImageError("");
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (values, { setSubmitting }) => {
    if (!canManage) {
      setSubmitting(false);
      return;
    }
    const formData = new FormData();
    formData.append("heading", values.heading);
    formData.append("tag", values.tag);
    formData.append("content", values.content);
    formData.append("is_active", values.is_active ? "1" : "0");

    if (imageFile) formData.append("image", imageFile);
    if (removeImage) formData.append("remove_image", "1");

    const onSuccess = () => navigate("/health-tips");

    if (id) {
      updateMutation.mutate(
        { id, formData },
        { onSettled: () => setSubmitting(false), onSuccess },
      );
    } else {
      createMutation.mutate(formData, {
        onSettled: () => setSubmitting(false),
        onSuccess,
      });
    }
  };

  if (permLoading) {
    return <Loader text="Checking permissions..." />;
  }

  if (id && isFetching) return <Loader text="Loading tip details..." />;

  if (!canView || !canManage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>

        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to manage health tips. Please contact your
          administrator.
        </p>

        <button
          onClick={() => navigate("/health-tips")}
          className="mt-5 rounded-lg bg-btn-primary-bg px-4 py-2 text-sm font-medium text-btn-primary-text hover:bg-btn-primary-bg-hover"
        >
          Back to Health Tips
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/health-tips")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            {id ? "Edit Health Tip" : "Add Health Tip"}
          </h1>
        </div>
      </div>

      <Formik
        key={id || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                <FiGrid className="h-5 w-5 text-brand-600" />
                <h2 className="font-jakarta text-base font-semibold text-ink-900">
                  Tip Details
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <TextInput
                  label="Heading"
                  name="heading"
                  placeholder="Enter heading"
                  maxLength={150}
                  required
                />
                <TextInput
                  label="Highlight Tag"
                  name="tag"
                  placeholder="Enter tag"
                  maxLength={50}
                  required
                />

                {/* --- IMAGE SECTION START --- */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink-900">
                    Image
                  </label>

                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* LEFT: Image Upload / Preview */}
                    <div className="shrink-0">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <div className="flex h-[160px] w-[128px] items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                            <img
                              src={imagePreview}
                              alt="Tip preview"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1 text-white shadow-sm hover:bg-danger-600 transition"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-[160px] w-[128px] flex-col items-center justify-center border border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 transition"
                        >
                          <FiUpload className="h-5 w-5 mb-1" />
                          <span className="text-xs text-center px-1">
                            Upload Image
                          </span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imageError && (
                        <p className="text-danger-500 text-xs mt-1 max-w-[128px]">
                          {imageError}
                        </p>
                      )}
                    </div>

                    {/* RIGHT: Simple Text Guide */}
                    <div className="text-xs text-ink-600 space-y-1.5 mt-1">
                      <p>
                        <span className="font-medium text-ink-900">Size:</span>{" "}
                        1080 x 1350 px
                      </p>
                      <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
                    </div>
                  </div>
                </div>
                {/* --- IMAGE SECTION END --- */}

                <FormikEditorField
                  name="content"
                  label="Content"
                  placeholder="Enter content"
                  required
                />

                <ToggleSwitch
                  name="is_active"
                  label="Active Status"
                  description="Inactive tips will not appear on the app"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/health-tips")}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="flex items-center justify-center gap-2 bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {(isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending) && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {id ? "Update Tip" : "Create Tip"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default HealthTipsForm;
