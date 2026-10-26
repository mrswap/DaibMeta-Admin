import React, { useRef, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiLink, FiUpload, FiX } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
} from "../../../queries/banners";

const MAX_IMAGE_SIZE_MB = 2;

const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const { data: banners = [], isLoading } = useBanners();
  const existing = isEdit ? banners.find((b) => b.id === Number(id)) : null;

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  const initialValues = {
    key: existing?.key || `banner_${banners.length + 1}`,
    // Note: Backend currently only supports 'value' (Image Path).
    // 'target_url' humne UI me add kiya hai, backend me add karwana padega.
    value: existing?.value || "",
    target_url: existing?.target_url || "",
    status: existing?.status === true || existing?.status === 1 || false,
  };

  const validationSchema = Yup.object({
    key: Yup.string().required("Key is required (e.g. banner_1)"),
    value: Yup.string().required("Image is required"), // Path ya URL
    target_url: Yup.string().url("Invalid URL format").nullable(),
  });

  const handleImageChange = (e, setFieldValue) => {
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

    // Backend ko bhejne ke liye fake path generate kar rahe hain
    const fakePath = `homepage/banners/${Date.now()}-${file.name}`;
    setFieldValue("value", fakePath);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (setFieldValue) => {
    setImagePreview("");
    setFieldValue("value", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      group: "homepage",
      key: values.key,
      value: values.value,
      type: "file",
      is_public: true,
      status: values.status,
      // Backend dev ko bolna padega is field ko accept karne ke liye:
      target_url: values.target_url,
    };

    const onSuccess = () => navigate("/cms/banners");

    if (isEdit) {
      updateMutation.mutate(
        { id, payload },
        { onSettled: () => setSubmitting(false), onSuccess },
      );
    } else {
      createMutation.mutate(payload, {
        onSettled: () => setSubmitting(false),
        onSuccess,
      });
    }
  };

  if (isEdit && isLoading) return <Loader text="Loading..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/cms/banners")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            {isEdit ? "Edit Banner" : "Add Banner"}
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface p-5 space-y-5">
              <TextInput
                label="Banner Key"
                name="key"
                placeholder="e.g. banner_1"
                required
              />

              {/* 1. IMAGE UPLOAD */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Banner Image
                </label>
                {imagePreview ? (
                  <div className="relative inline-block w-full max-w-sm">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="h-40 w-full rounded-xl object-cover border border-ink-200 bg-ink-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(setFieldValue)}
                      className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm hover:bg-danger-600"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-40 w-full max-w-sm flex-col items-center justify-center border-2 border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 transition-colors"
                  >
                    <FiUpload className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">
                      Click to Upload Image
                    </span>
                    <span className="text-xs text-ink-400 mt-1">
                      Max 2MB (JPG, PNG)
                    </span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                  className="hidden"
                />
                {imageError && (
                  <p className="text-danger-500 text-xs mt-1">{imageError}</p>
                )}
              </div>

              {/* 2. HYPERLINK / TARGET URL */}
              <div>
                <TextInput
                  label="Hyperlink / Target URL"
                  name="target_url"
                  placeholder="e.g. /appointment or https://example.com"
                />
                <p className="text-xs text-ink-500 mt-1 flex items-center gap-1">
                  <FiLink className="h-3 w-3" />
                  App me banner pe click karne se user is link par jayega.
                </p>
              </div>

              <ToggleSwitch
                name="status"
                label="Active Status"
                description="Inactive banners will not be shown on the app"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/cms/banners")}
                className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface hover:bg-ink-50 transition-colors"
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
                className="flex items-center gap-2 bg-btn-primary-bg hover:bg-btn-primary-bg-hover px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {(isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending) && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isEdit ? "Update Banner" : "Create Banner"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BannerForm;
