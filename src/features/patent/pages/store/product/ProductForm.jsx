// src/features/patent/pages/store/product/ProductForm.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiUpload,
  FiPlus,
  FiTrash2,
  FiList,
  FiX,
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

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

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
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/products")}
          className="p-2 border rounded-lg bg-surface cursor-pointer"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-jakarta">
          {isEdit ? "Edit Product" : "Add Product"}
        </h1>
      </div>

      <Formik
        key={id || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue, values, isSubmitting }) => {
          // Yahan hum Formik ki category_id value ko track kar rahe hain
          // taaki API call trigger ho sake
          useEffect(() => {
            if (values.category_id?.value !== selectedCategoryId) {
              setSelectedCategoryId(values.category_id?.value || null);
              // Reset subcategory on category change
              setFieldValue("subcategory_id", null);
            }
          }, [values.category_id, selectedCategoryId, setFieldValue]);

          return (
            <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-6">
              {/* Basic Info */}
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

              {/* Rich Text Editor */}
              <FormikEditorField
                name="details"
                label="Details"
                placeholder="Detailed product details..."
                minHeight={250}
              />

              {/* Images Section */}
              <div className="rounded-xl border border-ink-100 bg-ink-50/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiUpload className="text-brand-600" />
                    <h3 className="text-sm font-semibold text-ink-900">
                      Product Images (Max {MAX_IMAGES})
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-ink-500">
                    {totalImages} / {MAX_IMAGES}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-28 w-full rounded-lg border border-ink-200 bg-surface overflow-hidden group"
                    >
                      <img
                        src={img.image}
                        alt="Existing"
                        className="h-full w-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-danger-500 cursor-pointer"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}

                  {/* New Images (Previews) */}
                  {newImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative h-28 w-full rounded-lg border border-ink-200 bg-surface overflow-hidden group"
                    >
                      <img
                        src={img.preview}
                        alt="New Preview"
                        className="h-full w-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-danger-500 cursor-pointer"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add Button */}
                  {totalImages < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative flex h-28 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-surface text-ink-400 hover:border-brand-400 hover:bg-brand-50/30 transition-colors cursor-pointer"
                    >
                      <FiPlus size={24} className="mb-1" />
                      <span className="text-[10px] font-medium">Add Image</span>
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
                  <p className="mt-2 text-xs text-danger-600">{imageError}</p>
                )}
              </div>

              {/* Specifications */}
              <div className="rounded-xl border border-ink-100 bg-ink-50/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiList className="text-brand-600" />
                    <h3 className="text-sm font-semibold text-ink-900">
                      Specifications
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-ink-500">
                    {values.specifications.length} / {MAX_SPECS}
                  </span>
                </div>

                <FieldArray name="specifications">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.specifications.map((spec, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-1">
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
                              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none focus:border-brand-500"
                            />
                          </div>
                          <div className="flex-1">
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
                              className="h-10 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm outline-none focus:border-brand-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={values.specifications.length === 1}
                            className="mt-0.5 rounded-lg p-2.5 text-ink-400 hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50 cursor-pointer"
                            title="Remove Specification"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => push({ key: "", value: "" })}
                        disabled={values.specifications.length >= MAX_SPECS}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                        Add More
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Pricing */}
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

              <ToggleSwitch
                label="Status"
                name="status"
                description="Active or inactive"
              />

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => navigate("/store/products")}
                  disabled={isPending || isSubmitting}
                  className="px-4 py-2 border rounded-lg cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isSubmitting}
                  className="flex items-center gap-2 bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
