import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUpload, FiX, FiLink } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import { FilterSelect } from "../../../common/form"; // FilterSelect import kiya

const MAX_IMAGE_SIZE_MB = 2;

// --- STATIC DATA ---
const STATIC_CATEGORIES = [
  { value: "1", label: "Medicines" },
  { value: "2", label: "Supplements" },
];

const STATIC_SUBCATEGORIES = {
  1: [
    { value: "1", label: "Painkillers" },
    { value: "2", label: "Antibiotics" },
  ],
  2: [
    { value: "3", label: "Vitamins" },
    { value: "4", label: "Proteins" },
  ],
};

const STATIC_PRODUCTS = {
  1: [
    { value: "1", label: "Paracetamol 500mg" },
    { value: "2", label: "Crocin Advance" },
  ],
  2: [{ value: "3", label: "Amoxicillin 250mg" }],
  3: [
    { value: "4", label: "Vitamin C 1000mg" },
    { value: "5", label: "Multivitamin Daily" },
  ],
  4: [{ value: "6", label: "Whey Protein 1kg" }],
};

const StoreFlashCardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = !!id && id !== "new";

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  // State for cascading dropdowns
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  const initialValues = {
    title: isEdit ? "Monsoon Sale" : "",
    sort_order: isEdit ? 1 : 1,
    status: true,
    category_id: null,
    subcategory_id: null,
    product_id: null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required").max(150),
    sort_order: Yup.number().required("Sort order is required").min(0),
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
      setImageError("Invalid file or size exceeds 2MB");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (values) => {
    console.log("Saving Flash Card:", values);
    navigate("/store/flash-cards");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/flash-cards")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 hover:bg-ink-50 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5 text-ink-700" />
        </button>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          {isEdit ? "Edit Flash Card" : "Add Flash Card"}
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface p-5 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  placeholder="e.g. 1"
                  required
                />
              </div>

              {/* Linking Section (FilterSelects) */}
              <div className="rounded-lg border border-brand-100 bg-brand-50/30 p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiLink className="text-brand-600 h-4 w-4" />
                  <h3 className="text-sm font-semibold text-ink-900">
                    Link to Product
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category Select */}
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
                        setProductOptions([]);
                        setSubCategoryOptions(
                          val ? STATIC_SUBCATEGORIES[val.value] || [] : [],
                        );
                      }}
                      options={STATIC_CATEGORIES}
                      placeholder="Select Category"
                      isClearable
                    />
                  </div>

                  {/* Subcategory Select */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-form-label">
                      Subcategory <span className="text-form-required">*</span>
                    </label>
                    <FilterSelect
                      value={values.subcategory_id}
                      onChange={(val) => {
                        setFieldValue("subcategory_id", val);
                        setFieldValue("product_id", null);
                        setProductOptions(
                          val ? STATIC_PRODUCTS[val.value] || [] : [],
                        );
                      }}
                      options={subCategoryOptions}
                      placeholder={
                        values.category_id
                          ? "Select Subcategory"
                          : "Select Category first"
                      }
                      isDisabled={!values.category_id}
                      isClearable
                    />
                  </div>

                  {/* Product Select */}
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

              {/* Image Upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-form-label">
                  Flash Card Image{" "}
                  {!isEdit && <span className="text-danger-500">*</span>}
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <div className="flex h-40 w-full max-w-md items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50 p-2">
                      <img
                        src={imagePreview}
                        className="h-full w-full object-contain"
                        alt="Preview"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1.5 text-white cursor-pointer hover:bg-danger-600"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-40 w-full max-w-md flex-col items-center justify-center border-2 border-dashed border-ink-200 rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 cursor-pointer transition-colors"
                  >
                    <FiUpload className="h-6 w-6 mb-1" />
                    <span className="text-xs">Upload Image File</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imageError && (
                  <p className="text-danger-500 text-xs mt-1">{imageError}</p>
                )}
              </div>

              {/* Status */}
              <ToggleSwitch
                name="status"
                label="Active Status"
                description="Inactive flash cards will be hidden on the app"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/store/flash-cards")}
                className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface text-ink-700 hover:bg-ink-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer hover:bg-brand-700 transition-colors"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
