import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiGrid, FiUpload, FiX } from "react-icons/fi";
import TextInput from "../../common/form/TextInput";
import FormikEditorField from "../../common/form/FormikEditorField";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import Loader from "../../common/Loader";
import {
  useHealthTip,
  useCreateHealthTip,
  useUpdateHealthTip,
} from "../../queries/healthTips";

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

  if (id && isFetching) return <Loader text="Loading tip details..." />;

  return (
    // FIX: mx-auto max-w-4xl hataya
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

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-form-label">
                    Image
                  </label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Tip preview"
                        className="h-40 w-40 rounded-xl border border-ink-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm hover:bg-danger-600"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-700"
                    >
                      <FiUpload className="h-6 w-6" />
                      <span className="text-xs font-medium">Upload Image</span>
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
                    <p className="mt-2 text-xs text-form-error">{imageError}</p>
                  )}
                </div>

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
