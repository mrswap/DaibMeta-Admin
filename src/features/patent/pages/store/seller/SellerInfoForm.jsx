// src/features/patent/pages/store/seller/SellerInfoForm.jsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiX, FiImage, FiLock } from "react-icons/fi";

import {
  useStoreSeller,
  useSaveStoreSeller,
} from "../../../queries/storeSeller";
import TextInput from "../../../common/form/TextInput";
import FormikEditorField from "../../../common/form/FormikEditorField";
import Loader from "../../../common/Loader";
import { usePermission } from "../../../hooks/usePermission";

const MAX_IMAGE_SIZE_MB = 2;

const SellerInfoForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { can, isLoading: permLoading } = usePermission();

  // ==================== PERMISSIONS ====================
  const canView = can("store", "view");
  const canManage = can("store", "manage");

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const { data: sellerData, isLoading } = useStoreSeller({
    enabled: canView,
  });
  const saveMutation = useSaveStoreSeller();

  // Set initial image preview if data exists
  useEffect(() => {
    if (sellerData?.image) {
      setImagePreview(sellerData.image);
    }
  }, [sellerData]);

  // Initial Values
  const initialValues = {
    store_title: sellerData?.store_title || "",
    tagline: sellerData?.tagline || "",
    description: sellerData?.description || "",
  };

  // Validation
  const validationSchema = Yup.object({
    store_title: Yup.string().required("Title is required").max(150),
    tagline: Yup.string().max(50, "Tag should be short"),
    description: Yup.string().required("Description is required"),
  });

  // Image Handlers
  const handleImageChange = (e) => {
    if (!canManage) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, PNG, or WEBP allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Max size is ${MAX_IMAGE_SIZE_MB}MB.`);
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

  // Submit Handler
  const handleSubmit = (values, { setSubmitting }) => {
    if (!canManage) {
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("store_title", values.store_title.trim());
    if (values.tagline) {
      formData.append("tagline", values.tagline.trim());
    }
    formData.append("description", values.description || "");

    if (imageFile) {
      formData.append("image", imageFile);
    }

    saveMutation.mutate(formData, {
      onSettled: () => setSubmitting(false),
    });
  };

  // ==================== PAGE ACCESS GUARD ====================
  if (permLoading) {
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
          You do not have permission to view seller information. Please contact
          your administrator.
        </p>
        <button
          onClick={() => navigate("/store")}
          className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          Back to Store
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <Loader text="Loading seller information..." />;
  }

  const isPending = saveMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Seller Information
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {canManage
              ? "Manage store details and public seller description"
              : "View store details and public seller description (Read-only)"}
          </p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="rounded-card border border-ink-100 bg-surface shadow-sm p-5 sm:p-6 space-y-6">
            {/* Image Upload Box */}
            <div>
              <label className="mb-2 block text-sm font-medium text-form-label">
                Seller Logo / Image{" "}
                <span className="text-xs text-ink-400 font-normal">
                  (Optional)
                </span>
              </label>

              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* LEFT: Image Upload / Preview */}
                <div className="shrink-0">
                  {imagePreview ? (
                    <div className="group relative inline-block">
                      <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                        <img
                          src={imagePreview}
                          className="h-full w-full object-contain"
                          alt="Preview"
                        />
                      </div>
                      {canManage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1 text-white shadow-sm hover:bg-danger-600 transition"
                          title="Remove image"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => canManage && fileInputRef.current?.click()}
                      disabled={!canManage}
                      className="flex h-[120px] w-[120px] flex-col items-center justify-center border border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiImage className="h-5 w-5 mb-1 text-ink-400" />
                      <span className="text-xs text-center px-1 font-medium">
                        {canManage ? "Upload Image" : "No Image"}
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={!canManage}
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
                    <span className="font-medium text-ink-900">Size:</span> 240
                    x 240 px
                  </p>
                  <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
                </div>
              </div>
            </div>

            {/* Form Fields (Below Image) */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextInput
                  label="Store Title"
                  name="store_title"
                  required
                  placeholder="Enter store title"
                  maxLength={150}
                  disabled={!canManage}
                />
                <TextInput
                  label="Tagline / Tag"
                  name="tagline"
                  placeholder="Enter tagline"
                  maxLength={50}
                  disabled={!canManage}
                />
              </div>

              <FormikEditorField
                name="description"
                label="Description"
                placeholder="Describe the seller, policies, etc..."
                minHeight={250}
                required
                disabled={!canManage}
              />
            </div>

            {/* Form Actions Footer - Only if Manager */}
            {canManage && (
              <div className="flex flex-col-reverse gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 mt-6">
                <button
                  type="submit"
                  disabled={isPending || isSubmitting}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-6 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {(isPending || isSubmitting) && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  Save Information
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SellerInfoForm;
