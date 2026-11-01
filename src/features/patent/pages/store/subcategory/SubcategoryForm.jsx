// src/features/patent/pages/store/subcategory/SubcategoryForm.jsx

import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUpload, FiX, FiImage } from "react-icons/fi";
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

  const { data: subcategoryData, isLoading: isSubcategoryLoading } =
    useStoreSubcategory(isEdit ? id : null);

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

  useEffect(() => {
    if (subcategoryData?.image) {
      setImagePreview(subcategoryData.image);
    }
  }, [subcategoryData]);

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

  const validationSchema = Yup.object({
    category_id: Yup.object().nullable().required("Category is required"),
    name: Yup.string().required("Name is required").max(150),
    description: Yup.string().max(500),
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
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            {isEdit ? "Edit Subcategory" : "Add Subcategory"}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {isEdit
              ? "Update details for this subcategory"
              : "Create a new subcategory under a parent category"}
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
          <Form className="rounded-card border border-ink-100 bg-surface shadow-sm">
            {/* Split Layout: Form Fields vs Image */}
            <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-3">
              {/* Left Side: Text Fields */}
              <div className="space-y-5 lg:col-span-2">
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
                  placeholder="Enter subcategory name"
                  maxLength={150}
                />
                <TextareaField
                  label="Description"
                  name="description"
                  rows={5}
                  placeholder="Enter description"
                  maxLength={500}
                />
                <div className="pt-2">
                  <ToggleSwitch
                    label="Status"
                    name="status"
                    description="Inactive subcategories will be hidden on the app"
                  />
                </div>
              </div>

              {/* Right Side: Image Upload */}
              <div className="lg:col-span-1">
                <label className="mb-2 block text-sm font-medium text-form-label">
                  Subcategory Image{" "}
                  <span className="text-xs text-ink-400 font-normal">
                    (Optional)
                  </span>
                </label>

                <div className="flex flex-col items-start gap-3">
                  {imagePreview ? (
                    <div className="group relative inline-block w-full max-w-[240px]">
                      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50/50 p-3">
                        <img
                          src={imagePreview}
                          className="h-full w-full object-contain"
                          alt="Preview"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-md transition-transform hover:scale-110 hover:bg-danger-600"
                        title="Remove image"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square w-full max-w-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/30 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-700 cursor-pointer"
                    >
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm">
                        <FiImage className="h-5 w-5 text-ink-400" />
                      </div>
                      <span className="text-sm font-medium">Upload Image</span>
                      <span className="mt-1 text-[11px] text-ink-400">
                        JPG, PNG, WEBP
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
                    <p className="text-xs text-danger-500">{imageError}</p>
                  )}
                  <p className="text-xs text-form-help">Max size: 2 MB.</p>
                </div>
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => navigate("/store/subcategories")}
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
