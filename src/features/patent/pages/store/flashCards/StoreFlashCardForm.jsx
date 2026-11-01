// src/features/patent/pages/store/flashCards/StoreFlashCardForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiUpload,
  FiX,
  FiLink,
  FiImage,
  FiInfo,
} from "react-icons/fi";

import { api } from "../../../../../lib/axios";
import {
  useStoreFlashCard,
  useCreateStoreFlashCard,
  useUpdateStoreFlashCard,
} from "../../../queries/storeFlashCards";
import { FilterSelect } from "../../../common/form";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";

const MAX_IMAGE_SIZE_MB = 2;

const StoreFlashCardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = !!id && id !== "new";

  const createMutation = useCreateStoreFlashCard();
  const updateMutation = useUpdateStoreFlashCard();

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Fetch existing card if editing
  const { data: flashCardData, isLoading: isCardLoading } = useStoreFlashCard(
    isEdit ? id : null,
  );

  // Fetch Categories
  const { data: categoriesData } = useQuery({
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

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);

  useEffect(() => {
    if (flashCardData) {
      setSelectedCategoryId(flashCardData.category_id);
      setSelectedSubcategoryId(flashCardData.subcategory_id);
      if (flashCardData.image) {
        setImagePreview(flashCardData.image);
      }
    }
  }, [flashCardData]);

  // Fetch Subcategories
  const { data: subcategoriesData } = useQuery({
    queryKey: ["subcategories-dropdown", selectedCategoryId],
    queryFn: () =>
      api
        .get("/admin/store/subcategories", {
          params: { category_id: selectedCategoryId, per_page: 100, status: 1 },
        })
        .then((r) => {
          const list = r.data.data?.data || r.data.data || [];
          return Array.isArray(list) ? list : [];
        }),
    enabled: !!selectedCategoryId,
  });

  // Fetch Products
  const { data: productsData } = useQuery({
    queryKey: ["products-dropdown", selectedCategoryId, selectedSubcategoryId],
    queryFn: () =>
      api
        .get("/admin/store/products", {
          params: {
            category_id: selectedCategoryId,
            subcategory_id: selectedSubcategoryId,
            per_page: 100,
            status: 1,
          },
        })
        .then((r) => {
          const list = r.data.data?.data || r.data.data || [];
          return Array.isArray(list) ? list : [];
        }),
    enabled: !!selectedCategoryId && !!selectedSubcategoryId,
  });

  const categoryOptions = (categoriesData || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const subcategoryOptions = (subcategoriesData || []).map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const productOptions = (productsData || []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const initialValues = {
    title: flashCardData?.title || "",
    sort_order: flashCardData?.sort_order || 1,
    status: flashCardData?.status ?? true,
    category_id: flashCardData?.category_id
      ? {
          value: flashCardData.category_id,
          label: flashCardData.category?.name,
        }
      : null,
    subcategory_id: flashCardData?.subcategory_id
      ? {
          value: flashCardData.subcategory_id,
          label: flashCardData.subcategory?.name,
        }
      : null,
    product_id: flashCardData?.product_id
      ? { value: flashCardData.product_id, label: flashCardData.product?.name }
      : null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required").max(150),
    sort_order: Yup.number().required("Sort order is required").min(1),
    category_id: Yup.object().nullable().required("Category is required"),
    subcategory_id: Yup.object().nullable().required("Subcategory is required"),
    product_id: Yup.object().nullable().required("Product is required"),
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
    if (!isEdit && !imageFile) {
      setImageError("Image is required for new flash card");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("sort_order", String(values.sort_order));
    formData.append("category_id", String(values.category_id.value));
    formData.append("subcategory_id", String(values.subcategory_id.value));
    formData.append("product_id", String(values.product_id.value));
    formData.append("status", values.status ? "1" : "0");

    if (imageFile) formData.append("image", imageFile);

    if (isEdit) {
      formData.append("_method", "PUT");
      updateMutation.mutate(
        { id, formData },
        {
          onSuccess: () => navigate("/store/flash-cards"),
          onSettled: () => setSubmitting(false),
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => navigate("/store/flash-cards"),
        onSettled: () => setSubmitting(false),
      });
    }
  };

  if (isEdit && isCardLoading) {
    return <Loader text="Loading flash card details..." />;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/flash-cards")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            {isEdit ? "Edit Flash Card" : "Add Flash Card"}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {isEdit
              ? "Update details for this promotional banner"
              : "Create a new promotional banner for the store"}
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
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-6">
            {/* SECTION 1: Basic Info */}
            <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
              <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
                <FiInfo className="text-brand-600 h-4 w-4" />
                <h2 className="text-sm font-semibold text-ink-900">
                  Basic Information
                </h2>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextInput
                  label="Title"
                  name="title"
                  placeholder="Enter flash card title"
                  maxLength={150}
                  required
                />
                <TextInput
                  label="Sort Order"
                  name="sort_order"
                  type="number"
                  placeholder="Enter sort order"
                  required
                />
              </div>
            </div>

            {/* SECTION 2: Link to Product */}
            <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
              <div className="bg-brand-50/50 px-5 py-3 border-b border-brand-100 flex items-center gap-2">
                <FiLink className="text-brand-600 h-4 w-4" />
                <h2 className="text-sm font-semibold text-brand-900">
                  Link to Product
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-form-label">
                      Category <span className="text-form-required">*</span>
                    </label>
                    <FilterSelect
                      value={values.category_id}
                      onChange={(val) => {
                        setFieldValue("category_id", val);
                        setFieldValue("subcategory_id", null);
                        setFieldValue("product_id", null);
                        setSelectedCategoryId(val?.value || null);
                        setSelectedSubcategoryId(null);
                      }}
                      options={categoryOptions}
                      placeholder="Select Category"
                      isClearable
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-form-label">
                      Subcategory <span className="text-form-required">*</span>
                    </label>
                    <FilterSelect
                      value={values.subcategory_id}
                      onChange={(val) => {
                        setFieldValue("subcategory_id", val);
                        setFieldValue("product_id", null);
                        setSelectedSubcategoryId(val?.value || null);
                      }}
                      options={subcategoryOptions}
                      placeholder={
                        values.category_id
                          ? "Select Subcategory"
                          : "Select Category first"
                      }
                      isDisabled={!values.category_id}
                      isClearable
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-form-label">
                      Product <span className="text-form-required">*</span>
                    </label>
                    <FilterSelect
                      value={values.product_id}
                      onChange={(val) => setFieldValue("product_id", val)}
                      options={productOptions}
                      placeholder={
                        values.subcategory_id
                          ? "Select Product"
                          : "Select Subcategory first"
                      }
                      isDisabled={!values.subcategory_id}
                      isClearable
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Image & Status */}
            <div className="rounded-xl border border-ink-100 bg-surface shadow-sm overflow-hidden">
              <div className="bg-ink-50/50 px-5 py-3 border-b border-ink-100 flex items-center gap-2">
                <FiImage className="text-brand-600 h-4 w-4" />
                <h2 className="text-sm font-semibold text-ink-900">
                  Media & Status
                </h2>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-form-label">
                    Flash Card Image{" "}
                    {!isEdit && <span className="text-danger-500">*</span>}
                  </label>

                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    {imagePreview ? (
                      <div className="relative inline-block w-full max-w-sm">
                        <div className="flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50/50 p-2">
                          <img
                            src={imagePreview}
                            className="h-full w-full object-contain"
                            alt="Preview"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm hover:bg-danger-600"
                          title="Remove"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-[2/1] w-full max-w-sm flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/30 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-700 cursor-pointer"
                      >
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm">
                          <FiUpload className="h-4 w-4 text-ink-400" />
                        </div>
                        <span className="text-sm font-medium">
                          Upload Image
                        </span>
                        <span className="mt-1 text-[11px] text-ink-400">
                          JPG, PNG, WEBP
                        </span>
                      </button>
                    )}

                    <div className="flex-1 text-xs text-ink-500">
                      <p>Recommended size: 600x300 px.</p>
                      <p className="mt-1">
                        Max file size: {MAX_IMAGE_SIZE_MB}MB.
                      </p>
                      <p className="mt-1 text-ink-400">
                        Upload a landscape banner for best results.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imageError && (
                    <p className="text-danger-500 text-xs mt-2 bg-danger-50 p-2 rounded border border-danger-100">
                      {imageError}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-ink-100">
                  <ToggleSwitch
                    name="status"
                    label="Active Status"
                    description="Inactive flash cards will be hidden on the patient app"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border border-ink-100 bg-surface/90 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => navigate("/store/flash-cards")}
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
                {isEdit ? "Update Flash Card" : "Create Flash Card"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default StoreFlashCardForm;
