// src/features/patent/pages/healthPackages/HealthPackagesForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiGrid,
  FiUpload,
  FiX,
  FiTag,
  FiLock,
} from "react-icons/fi";
import TextInput from "../../common/form/TextInput";
import TextareaField from "../../common/form/TextareaField";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import FormikEditorField from "../../common/form/FormikEditorField";
import Loader from "../../common/Loader";
import {
  useHealthPackage,
  useCreateHealthPackage,
  useUpdateHealthPackage,
} from "../../queries/healthPackages";
import { usePermission } from "../../hooks/usePermission";

const MAX_IMAGE_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const HealthPackagesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = !!id && id !== "new";

  const { can, isLoading: permLoading } = usePermission();

  const canView = can("services", "view");
  const canManage = can("services", "manage");
  const { data: existing, isLoading: isFetching } = useHealthPackage(
    isEdit ? id : null,
    {
      enabled: canView,
    },
  );
  const createMutation = useCreateHealthPackage();
  const updateMutation = useUpdateHealthPackage();

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (existing?.image) setImagePreview(existing.image);
  }, [existing]);

  // Normal service ko is module me edit nahi karna
  useEffect(() => {
    if (existing && existing.is_health_package === false) {
      navigate("/health-packages", { replace: true });
    }
  }, [existing, navigate]);

  const initialValues = {
    name: existing?.name || "",
    description: existing?.description || "",
    success_message: existing?.success_message || "",
    content: existing?.content || "",
    service_price: existing?.service_price ?? "",
    offer_price: existing?.offer_price ?? "",
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Package name is required").max(150),
    description: Yup.string().max(500),
    success_message: Yup.string().max(250),
    service_price: Yup.number()
      .typeError("Package price is required")
      .required("Package price is required")
      .min(0, "Price cannot be negative"),
    offer_price: Yup.number()
      .typeError("Offer price is required")
      .required("Offer price is required")
      .min(0, "Price cannot be negative")
      .when("service_price", (servicePrice, schema) =>
        Number.isFinite(Number(servicePrice))
          ? schema.max(
              Number(servicePrice),
              "Offer price cannot exceed package price",
            )
          : schema,
      ),
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !ALLOWED_TYPES.includes(file.type) ||
      file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      setImageError(
        `Only JPG, PNG or WEBP up to ${MAX_IMAGE_SIZE_MB}MB allowed`,
      );
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

    // Quill empty state "<p><br></p>" hota hai
    const content =
      values.content && values.content !== "<p><br></p>" ? values.content : "";

    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("success_message", values.success_message || "");
    formData.append("content", content);
    formData.append("is_health_package", "1");
    formData.append("service_price", values.service_price); // Package Price
    formData.append("offer_price", values.offer_price);
    formData.append("display_mode", "direct"); // static
    formData.append("is_active", values.is_active ? "1" : "0");

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (removeImage && existing?.image) {
      // doc: nayi image aur remove_image ek saath nahi
      formData.append("remove_image", "1");
    }

    const onSuccess = () => navigate("/health-packages");

    if (isEdit) {
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
          You do not have permission to manage health packages.
        </p>

        <button
          onClick={() => navigate("/health-packages")}
          className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  if (isEdit && isFetching) return <Loader text="Loading package details..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/health-packages")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          {isEdit ? "Edit Health Package" : "Add Health Package"}
        </h1>
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
            {/* Package Details */}
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                <FiGrid className="h-5 w-5 text-brand-600" />
                <h2 className="font-jakarta text-base font-semibold text-ink-900">
                  Package Details
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <TextInput
                  label="Package Name"
                  name="name"
                  placeholder="Enter package name"
                  maxLength={150}
                  required
                />

                {/* --- IMAGE SECTION START --- */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink-900">
                    Package Image
                  </label>

                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* LEFT: Image Upload / Preview */}
                    <div className="shrink-0">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1 text-white shadow-sm hover:bg-danger-600 transition"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-[120px] w-[120px] flex-col items-center justify-center border border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 transition"
                        >
                          <FiUpload className="h-5 w-5 mb-1" />
                          <span className="text-xs text-center px-1 font-medium">
                            Upload Image
                          </span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imageError && (
                        <p className="text-danger-500 text-xs mt-1 max-w-[120px]">
                          {imageError}
                        </p>
                      )}
                    </div>

                    {/* RIGHT: Simple Text Guide */}
                    <div className="text-xs text-ink-600 space-y-1.5 mt-1">
                      <p>
                        <span className="font-medium text-ink-900">Size:</span>{" "}
                        216 x 216 px
                      </p>
                      <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
                    </div>
                  </div>
                </div>
                {/* --- IMAGE SECTION END --- */}

                <TextareaField
                  label="Description"
                  name="description"
                  placeholder="Enter description"
                  rows={3}
                  maxLength={500}
                />

                <TextareaField
                  label="Booking Success Message"
                  name="success_message"
                  placeholder="Message shown on app after booking"
                  rows={2}
                  maxLength={250}
                />

                <ToggleSwitch
                  name="is_active"
                  label="Active Status"
                  description="Inactive packages will not appear on the app"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                <FiTag className="h-5 w-5 text-brand-600" />
                <h2 className="font-jakarta text-base font-semibold text-ink-900">
                  Package Pricing
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                <TextInput
                  label="Package Price (₹)"
                  name="service_price"
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  required
                />
                <TextInput
                  label="Offer Price (₹)"
                  name="offer_price"
                  type="number"
                  min="0"
                  placeholder="e.g. 3999"
                  required
                />
              </div>
            </div>

            {/* Content */}
            <div className="rounded-card border border-ink-100 bg-surface p-5">
              <FormikEditorField
                name="content"
                label="Package Content"
                placeholder="Write package details..."
                minHeight={220}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/health-packages")}
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
                {isEdit ? "Update Package" : "Create Package"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default HealthPackagesForm;
