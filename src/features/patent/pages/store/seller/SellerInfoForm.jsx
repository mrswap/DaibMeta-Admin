// src/features/patent/pages/store/seller/SellerInfoForm.jsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUpload, FiUserCheck, FiX } from "react-icons/fi";

import {
  useStoreSeller,
  useSaveStoreSeller,
} from "../../../queries/storeSeller";
import TextInput from "../../../common/form/TextInput";
import FormikEditorField from "../../../common/form/FormikEditorField";
import Loader from "../../../common/Loader";

const MAX_IMAGE_SIZE_MB = 2;

const SellerInfoForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const { data: sellerData, isLoading } = useStoreSeller();
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
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Handler
  const handleSubmit = (values, { setSubmitting }) => {
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
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Seller Information
          </h1>
          <p className="text-sm text-ink-500">
            Manage store details and seller description
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
          <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-3 mb-2">
              <FiUserCheck className="text-brand-600 h-5 w-5" />
              <h2 className="font-semibold text-ink-900">Store Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextInput
                label="Store Title"
                name="store_title"
                required
                placeholder="Enter store title"
                maxLength={150}
              />
              <TextInput
                label="Tagline / Tag"
                name="tagline"
                placeholder="Enter tagline"
                maxLength={50}
              />
            </div>

            <FormikEditorField
              name="description"
              label="Description"
              placeholder="Describe the seller, policies, etc..."
              minHeight={250}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-form-label">
                Seller Logo / Image (Optional)
              </label>

              {imagePreview ? (
                <div className="relative inline-block">
                  <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50 p-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm hover:bg-danger-600"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-40 w-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700 cursor-pointer"
                >
                  <FiUpload className="mb-2 h-6 w-6" />
                  <span className="text-xs font-medium">Upload Image</span>
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
                <p className="mt-1 text-xs text-danger-500">{imageError}</p>
              )}
              <p className="mt-2 text-xs text-form-help">
                JPG, PNG or WEBP. Max 2 MB.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-ink-100">
              <button
                type="submit"
                disabled={isPending || isSubmitting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-6 py-2.5 font-semibold text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isPending || isSubmitting) && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                Save Info
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SellerInfoForm;
