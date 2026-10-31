// src/features/patent/pages/store/category/CategoryForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";

import TextInput from "../../../common/form/TextInput";
import TextareaField from "../../../common/form/TextareaField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import {
  useStoreCategory,
  useCreateStoreCategory,
  useUpdateStoreCategory,
} from "../../../queries/storeCategories";

const MAX_IMAGE_SIZE_MB = 2;

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const createMutation = useCreateStoreCategory();
  const updateMutation = useUpdateStoreCategory();

  // Fetch existing category if editing
  const { data: categoryData, isLoading: isCategoryLoading } = useStoreCategory(
    isEdit ? id : null,
  );

  // Set initial image preview if editing
  useEffect(() => {
    if (categoryData?.image) {
      setImagePreview(categoryData.image);
    }
  }, [categoryData]);

  // Initial Values
  const initialValues = {
    name: categoryData?.name || "",
    description: categoryData?.description || "",
    status: categoryData?.status ?? true,
  };

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Name is required")
      .max(150, "Max 150 characters"),
    description: Yup.string().trim().max(500, "Max 500 characters"),
    status: Yup.boolean(),
  });

  // Image Handlers
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size
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
    formData.append("name", values.name.trim());
    if (values.description) {
      formData.append("description", values.description.trim());
    }
    formData.append("status", values.status ? "1" : "0");

    // Image is optional. Append only if a new file was selected.
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEdit) {
      updateMutation.mutate(
        { id, formData },
        {
          onSuccess: () => navigate("/store/categories"),
          onSettled: () => setSubmitting(false),
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => navigate("/store/categories"),
        onSettled: () => setSubmitting(false),
      });
    }
  };

  if (isEdit && isCategoryLoading) {
    return <Loader text="Loading category details..." />;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/categories")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          {isEdit ? "Edit Category" : "Add Category"}
        </h1>
      </div>

      <Formik
        key={id || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-6">
            {/* Form Fields */}
            <div className="space-y-5">
              <TextInput
                label="Category Name"
                name="name"
                required
                placeholder="Enter category name"
                maxLength={150}
              />
              <TextareaField
                label="Description"
                name="description"
                rows={3}
                placeholder="Enter description"
                maxLength={500}
              />

              {/* Image Upload Section */}
              <div>
                <label className="mb-2 block text-sm font-medium text-form-label">
                  Category Image (Optional)
                </label>

                {imagePreview ? (
                  <div className="relative inline-block">
                    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50 p-2">
                      <img
                        src={imagePreview}
                        className="h-full w-full object-contain"
                        alt="Preview"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white hover:bg-danger-600"
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
                    <FiUpload className="mb-1 h-6 w-6" />
                    <span className="text-xs">Upload Image</span>
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

              <ToggleSwitch
                label="Status"
                name="status"
                description="Active or inactive"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
              <button
                type="button"
                onClick={() => navigate("/store/categories")}
                disabled={isPending || isSubmitting}
                className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isSubmitting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-4 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isPending || isSubmitting) && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isEdit ? "Update Category" : "Create Category"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CategoryForm;
