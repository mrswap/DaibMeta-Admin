// src/features/patent/pages/store/product/ProductForm.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiList,
  FiX,
  FiImage,
  FiTag,
  FiDollarSign,
  FiInfo,
  FiLink,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

import { api } from "../../../../../lib/axios";
import {
  useStoreProduct,
  useCreateStoreProduct,
  useUpdateStoreProduct,
} from "../../../queries/storeProducts";
import TextInput from "../../../common/form/TextInput";
import TextareaField from "../../../common/form/TextareaField";
import SelectField from "../../../common/form/SelectField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import FormikEditorField from "../../../common/form/FormikEditorField";
import Loader from "../../../common/Loader";

const MAX_IMAGES = 5;
const MAX_SPECS = 10;
const MAX_IMAGE_SIZE_MB = 2;

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [imageError, setImageError] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const createMutation = useCreateStoreProduct();
  const updateMutation = useUpdateStoreProduct();

  const { data: productData, isLoading: isProductLoading } = useStoreProduct(
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

  // Fetch Subcategories (dependent on Category)
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

  const categoryOptions = (categoriesData || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const subcategoryOptions = (subcategoriesData || []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  // Populate form on edit load
  useEffect(() => {
    if (productData) {
      setSelectedCategoryId(productData.category_id);
      setExistingImages(productData.images || []);
    }
  }, [productData]);

  // Prepare Initial Values
  const initialValues = {
    name: productData?.name || "",
    category_id: productData?.category_id
      ? {
          value: productData.category_id,
          label: productData.category?.name || "",
        }
      : null,
    subcategory_id: productData?.subcategory_id
      ? {
          value: productData.subcategory_id,
          label: productData.subcategory?.name || "",
        }
      : null,
    short_description: productData?.short_description || "",
    details: productData?.details || "",
    mrp: productData?.mrp || "",
    final_price: productData?.final_price || "",
    status: productData?.status ?? true,
    specifications:
      productData?.specifications &&
      Object.keys(productData.specifications).length > 0
        ? Object.entries(productData.specifications).map(([key, value]) => ({
            key,
            value,
          }))
        : [{ key: "", value: "" }],
  };

  // Validation
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").max(255),
    category_id: Yup.object().nullable().required("Category is required"),
    subcategory_id: Yup.object().nullable().required("Subcategory is required"),
    mrp: Yup.number()
      .typeError("Must be a number")
      .min(0, "Cannot be negative")
      .test(
        "is-greater",
        "MRP must be greater than or equal to Final Price",
        function (value) {
          const { final_price } = this.parent;
          if (!value || !final_price) return true;
          return Number(value) >= Number(final_price);
        },
      ),
    final_price: Yup.number()
      .typeError("Must be a number")
      .min(0.01, "Price must be greater than zero")
      .required("Selling price is required"),
    specifications: Yup.array().max(
      MAX_SPECS,
      `Maximum ${MAX_SPECS} specifications allowed`,
    ),
  });

  // Handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentTotal = existingImages.length + newImages.length;
    if (currentTotal + files.length > MAX_IMAGES) {
      setImageError(`You can only upload up to ${MAX_IMAGES} images total.`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setImageError("Only JPG, PNG, or WEBP allowed.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setImageError(`Max size is ${MAX_IMAGE_SIZE_MB}MB per image.`);
        return;
      }
      validFiles.push({ file, preview: URL.createObjectURL(file) });
    }

    setImageError("");
    setNewImages((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setRemovedImageIds((prev) => [...prev, imageId]);
  };

  // Submit Handler
  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("category_id", String(values.category_id.value));
    formData.append("subcategory_id", String(values.subcategory_id.value));
    formData.append("final_price", String(values.final_price));
    formData.append("status", values.status ? "1" : "0");

    if (values.mrp) formData.append("mrp", String(values.mrp));
    if (values.short_description)
      formData.append("short_description", values.short_description);
    if (values.details) formData.append("details", values.details);

    const specsObj = {};
    values.specifications.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        specsObj[item.key.trim()] = item.value.trim();
      }
    });
    formData.append("specifications", JSON.stringify(specsObj));

    newImages.forEach((img) => {
      formData.append("images[]", img.file);
    });

    if (isEdit) {
      if (removedImageIds.length > 0) {
        formData.append("remove_image_ids", JSON.stringify(removedImageIds));
      }
      updateMutation.mutate(
        { id, formData },
        {
          onSuccess: () => navigate("/store/products"),
          onSettled: () => setSubmitting(false),
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => navigate("/store/products"),
        onSettled: () => setSubmitting(false),
      });
    }
  };

  if (isEdit && isProductLoading) {
    return <Loader text="Loading product details..." />;
  }

  const totalImages = existingImages.length + newImages.length;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/products")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 transition-colors hover:bg-ink-50"
          title="Go back"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
            {isEdit
              ? "Update product details and inventory"
              : "Create a new product for your store"}
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
        {({ setFieldValue, values, isSubmitting }) => {
          // Bug Fix: Track category changes outside of render
          useEffect(() => {
            const currentCatId = values.category_id?.value || null;
            if (currentCatId !== selectedCategoryId) {
              setSelectedCategoryId(currentCatId);
              setFieldValue("subcategory_id", null);
            }
          }, [values.category_id, selectedCategoryId, setFieldValue]);

          return (
            <Form className="rounded-card border border-ink-100 bg-surface shadow-sm p-5 sm:p-6 space-y-8">
              {/* 1. Images (Top) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-form-label">
                    Product Images (Max {MAX_IMAGES})
                  </label>
                  <span className="text-xs font-medium bg-ink-50 border border-ink-200 px-2 py-0.5 rounded-full text-ink-600">
                    {totalImages} / {MAX_IMAGES} uploaded
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square w-full rounded-xl border border-ink-200 bg-ink-50/30 overflow-hidden group"
                    >
                      <img
                        src={img.image}
                        alt="Existing"
                        className="h-full w-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute top-2 right-2 rounded-full bg-danger-500/90 p-1.5 text-white opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-danger-600 hover:scale-110 group-hover:opacity-100 cursor-pointer"
                        title="Remove"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {newImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square w-full rounded-xl border border-ink-200 bg-ink-50/30 overflow-hidden group"
                    >
                      <img
                        src={img.preview}
                        alt="New"
                        className="h-full w-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 rounded-full bg-danger-500/90 p-1.5 text-white opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-danger-600 hover:scale-110 group-hover:opacity-100 cursor-pointer"
                        title="Remove"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add New Button */}
                  {totalImages < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/30 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-700 cursor-pointer"
                    >
                      <FiPlus size={24} className="mb-1" />
                      <span className="text-[11px] font-medium">Add Image</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {imageError && (
                  <p className="mt-3 text-xs text-danger-600 bg-danger-50 p-2 rounded border border-danger-100">
                    {imageError}
                  </p>
                )}
                <p className="mt-2 text-xs text-form-help">
                  Supported: JPG, PNG, WEBP. Max size: {MAX_IMAGE_SIZE_MB}MB per
                  image.
                </p>
              </div>

              {/* 2. Basic Info */}
              <div className="space-y-5 border-t border-ink-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 flex items-center gap-2">
                  <FiInfo className="text-brand-600" /> Basic Information
                </p>
                <TextInput
                  label="Product Name"
                  name="name"
                  required
                  placeholder="Enter product name"
                  maxLength={255}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Category"
                    name="category_id"
                    options={categoryOptions}
                    placeholder="Select category"
                    required
                  />
                  <SelectField
                    label="Subcategory"
                    name="subcategory_id"
                    options={subcategoryOptions}
                    placeholder={
                      values.category_id
                        ? "Select subcategory"
                        : "Select category first"
                    }
                    disabled={!values.category_id}
                    required
                  />
                </div>
                <TextareaField
                  label="Short Description"
                  name="short_description"
                  rows={2}
                  placeholder="Brief description (for card view)"
                />
              </div>

              {/* 3. Details */}
              <div className="space-y-5 border-t border-ink-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 flex items-center gap-2">
                  <FiList className="text-brand-600" /> Product Details
                </p>
                <FormikEditorField
                  name="details"
                  label="Detailed Description"
                  placeholder="Write product details here..."
                  minHeight={200}
                />
              </div>

              {/* 4. Specifications */}
              <div className="space-y-5 border-t border-ink-100 pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 flex items-center gap-2">
                    <FiTag className="text-brand-600" /> Specifications
                  </p>
                  <span className="text-xs font-medium bg-surface border border-ink-200 px-2 py-0.5 rounded-full text-ink-600">
                    {values.specifications.length} / {MAX_SPECS} items
                  </span>
                </div>

                <FieldArray name="specifications">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.specifications.map((spec, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start gap-3"
                        >
                          <div className="w-full sm:w-1/3">
                            <input
                              name={`specifications.${index}.key`}
                              value={spec.key}
                              onChange={(e) =>
                                setFieldValue(
                                  `specifications.${index}.key`,
                                  e.target.value,
                                )
                              }
                              placeholder="Key (e.g. Brand)"
                              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none focus:border-brand-500 transition-colors"
                            />
                          </div>
                          <div className="w-full sm:flex-1">
                            <input
                              name={`specifications.${index}.value`}
                              value={spec.value}
                              onChange={(e) =>
                                setFieldValue(
                                  `specifications.${index}.value`,
                                  e.target.value,
                                )
                              }
                              placeholder="Value (e.g. Cipla)"
                              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none focus:border-brand-500 transition-colors"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={values.specifications.length === 1}
                            className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-400 hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 disabled:opacity-50 cursor-pointer transition-colors"
                            title="Remove"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => push({ key: "", value: "" })}
                          disabled={values.specifications.length >= MAX_SPECS}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <FiPlus className="h-3.5 w-3.5" />
                          Add Specification
                        </button>
                      </div>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* 5. Pricing & Status */}
              <div className="space-y-5 border-t border-ink-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 flex items-center gap-2">
                  <FiDollarSign className="text-brand-600" /> Pricing & Status
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    label="MRP (₹)"
                    name="mrp"
                    type="number"
                    placeholder="Enter MRP"
                  />
                  <TextInput
                    label="Final Price (₹)"
                    name="final_price"
                    type="number"
                    required
                    placeholder="Enter selling price"
                  />
                </div>
                <div className="pt-2">
                  <ToggleSwitch
                    label="Product Status"
                    name="status"
                    description="Inactive products will be hidden from the patient app"
                  />
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-ink-100 bg-ink-50/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/store/products")}
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
                  {isEdit ? "Update Product" : "Create Product"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ProductForm;
