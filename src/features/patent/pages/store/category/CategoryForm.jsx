// src/features/patent/pages/store/category/CategoryForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiX, FiImage, FiLock } from "react-icons/fi";

import TextInput from "../../../common/form/TextInput";
import TextareaField from "../../../common/form/TextareaField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import {
  useStoreCategory,
  useCreateStoreCategory,
  useUpdateStoreCategory,
} from "../../../queries/storeCategories";
import { usePermission } from "../../../hooks/usePermission";

const MAX_IMAGE_SIZE_MB = 2;

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const { can, isLoading: permLoading } = usePermission();

  const canView = can("store_categories", "view");
  const canManage = can("store_categories", "manage");

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const createMutation = useCreateStoreCategory();
  const updateMutation = useUpdateStoreCategory();

  const { data: categoryData, isLoading: isCategoryLoading } = useStoreCategory(
    isEdit ? id : null,
    {
      enabled: canView,
    },
  );

  useEffect(() => {
    if (categoryData?.image) {
      setImagePreview(categoryData.image);
    }
  }, [categoryData]);

  const initialValues = {
    name: categoryData?.name || "",
    description: categoryData?.description || "",
    status: categoryData?.status ?? true,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Name is required")
      .max(150, "Max 150 characters"),
    description: Yup.string().trim().max(500, "Max 500 characters"),
    status: Yup.boolean(),
  });

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

  const handleSubmit = (values, { setSubmitting }) => {
    if (!canManage) {
      setSubmitting(false);
      return;
    }
    const formData = new FormData();
    formData.append("name", values.name.trim());
    if (values.description) {
      formData.append("description", values.description.trim());
    }
    formData.append("status", values.status ? "1" : "0");

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

  if (permLoading && !canView) {
    return <Loader text="Checking permissions..." />;
  }

  if (!canManage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>

        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to manage store categories. Please contact
          your administrator.
        </p>

        <button
          onClick={() => navigate("/store/categories")}
          className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-700"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/categories")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            {isEdit ? "Edit Category" : "Add Category"}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {isEdit
              ? "Update details for this category"
              : "Create a new product category"}
          </p>
        </div>
      </div>

      <Formik
        key={id || "new"}
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
                Category Image{" "}
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
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1 text-white shadow-sm hover:bg-danger-600 transition"
                        title="Remove image"
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
                      <FiImage className="h-5 w-5 mb-1 text-ink-400" />
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
                    <span className="font-medium text-ink-900">Size:</span> 204
                    x 204 px
                  </p>
                  <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
                </div>
              </div>
            </div>

            {/* Form Fields (Below Image) */}
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
                rows={4}
                placeholder="Enter description"
                maxLength={500}
              />
              <div className="pt-2">
                <ToggleSwitch
                  label="Status"
                  name="status"
                  description="Inactive categories will be hidden on the app"
                />
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 mt-6">
              <button
                type="button"
                onClick={() => navigate("/store/categories")}
                disabled={isPending || isSubmitting}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isSubmitting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-5 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
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
