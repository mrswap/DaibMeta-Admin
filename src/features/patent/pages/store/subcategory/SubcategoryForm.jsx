// src/features/patent/pages/store/subcategory/SubcategoryForm.jsx

import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "../../../../../lib/axios";
import {
  useStoreSubcategory,
  useCreateStoreSubcategory,
  useUpdateStoreSubcategory,
} from "../../../queries/storeSubcategories";
import TextInput from "../../../common/form/TextInput";
import TextareaField from "../../../common/form/TextareaField";
import SelectField from "../../../common/form/SelectField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";

const MAX_IMAGE_SIZE_MB = 2;

const SubcategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const createMutation = useCreateStoreSubcategory();
  const updateMutation = useUpdateStoreSubcategory();

  // Fetch existing subcategory if editing
  const { data: subcategoryData, isLoading: isSubcategoryLoading } =
    useStoreSubcategory(isEdit ? id : null);

  // Fetch Categories for Dropdown
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories-dropdown"],
    queryFn: () =>
      api
        .get("/admin/store/categories", {
          params: { per_page: 100, status: 1 },
        })
        .then((r) => {
          const list = r.data.data?.data || r.data.data || [];
          return Array.isArray(list) ? list : [];
        }),
  });

  const categoryOptions = (categoriesData || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Set initial image preview if editing
  useEffect(() => {
    if (subcategoryData?.image) {
      setImagePreview(subcategoryData.image);
    }
  }, [subcategoryData]);

  // Initial Values
  const initialValues = {
    category_id: subcategoryData?.category_id
      ? {
          value: subcategoryData.category_id,
          label: subcategoryData.category?.name || "Selected Category",
        }
      : null,
    name: subcategoryData?.name || "",
    description: subcategoryData?.description || "",
    status: subcategoryData?.status ?? true,
  };

  // Validation
  const validationSchema = Yup.object({
    category_id: Yup.object().nullable().required("Category is required"),
    name: Yup.string().required("Name is required").max(150),
    description: Yup.string().max(500),
    status: Yup.boolean(),
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
    formData.append("category_id", String(values.category_id.value));
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
          onSuccess: () => navigate("/store/subcategories"),
          onSettled: () => setSubmitting(false),
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => navigate("/store/subcategories"),
        onSettled: () => setSubmitting(false),
      });
    }
  };

  if ((isEdit && isSubcategoryLoading) || isCategoriesLoading) {
    return <Loader text="Loading form details..." />;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/subcategories")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          {isEdit ? "Edit Subcategory" : "Add Subcategory"}
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
          <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-5">
            <SelectField
              label="Parent Category"
              name="category_id"
              options={categoryOptions}
              placeholder="Select category"
              required
            />
            <TextInput
              label="Subcategory Name"
              name="name"
              required
              placeholder="Enter name"
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
                Subcategory Image (Optional)
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

            <ToggleSwitch
              label="Status"
              name="status"
              description="Active or inactive"
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
              <button
                type="button"
                onClick={() => navigate("/store/subcategories")}
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
                {isEdit ? "Update Subcategory" : "Create Subcategory"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SubcategoryForm;
