import { useState } from "react";
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
import TextInput from "../../../common/form/TextInput";
import TextareaField from "../../../common/form/TextareaField";
import SelectField from "../../../common/form/SelectField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import FormikEditorField from "../../../common/form/FormikEditorField";

const CATEGORIES = [
  { value: "1", label: "Medicines" },
  { value: "2", label: "Supplements" },
];
const SUBCATEGORIES = [
  { value: "1", label: "Painkillers" },
  { value: "2", label: "Vitamins" },
];
const MAX_IMAGES = 5;
const MAX_SPECS = 10; // NAYA: Max 10 specs

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [imageError, setImageError] = useState("");

  const initialValues = {
    name: "",
    category_id: null,
    subcategory_id: null,
    description: "",
    short_desc: "",
    mrp: "",
    price: "",
    status: true,
    images: [],
    specifications: [{ key: "", value: "" }],
  };

  const validation = Yup.object({
    name: Yup.string().required("Name is required").max(150),
    category_id: Yup.object().nullable().required("Category is required"),
    subcategory_id: Yup.object().nullable().required("Subcategory is required"),
    mrp: Yup.number().typeError("Must be a number").min(0),
    price: Yup.number()
      .typeError("Must be a number")
      .min(0)
      .required("Selling price is required"),
    images: Yup.array().max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images allowed`),
    specifications: Yup.array().max(
      MAX_SPECS,
      `Maximum ${MAX_SPECS} specifications allowed`,
    ), // Validation add ki
  });

  const handleSubmit = (values) => {
    console.log("Saving Product:", values);
    navigate("/store/products");
  };

  const handleImageSelect = (e, setFieldValue, currentImages) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (currentImages.length + files.length > MAX_IMAGES) {
      setImageError(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    setImageError("");
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFieldValue("images", [...currentImages, ...newImages]);
  };

  const handleRemoveImage = (index, setFieldValue, currentImages) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    setFieldValue("images", newImages);
    setImageError("");
  };

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
        initialValues={initialValues}
        validationSchema={validation}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values }) => (
          <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-5">
            <TextInput
              label="Product Name"
              name="name"
              required
              placeholder="Enter product name"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Category"
                name="category_id"
                options={CATEGORIES}
                required
              />
              <SelectField
                label="Subcategory"
                name="subcategory_id"
                options={SUBCATEGORIES}
                required
              />
            </div>

            <TextareaField
              label="Short Description"
              name="short_desc"
              rows={2}
              placeholder="Brief description (for card view)"
            />

            <FormikEditorField
              name="description"
              label="Details"
              placeholder="Detailed product details..."
              minHeight={250}
            />

            {/* Multiple Image Upload Section */}
            <div className="rounded-xl border border-ink-100 bg-ink-50/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiUpload className="text-brand-600" />
                  <h3 className="text-sm font-semibold text-ink-900">
                    Product Images (Max {MAX_IMAGES})
                  </h3>
                </div>
                <span className="text-xs font-medium text-ink-500">
                  {values.images.length} / {MAX_IMAGES} uploaded
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {values.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative h-28 w-full rounded-lg border border-ink-200 bg-surface overflow-hidden group"
                  >
                    <img
                      src={img.preview}
                      alt={`Preview ${index}`}
                      className="h-full w-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveImage(index, setFieldValue, values.images)
                      }
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-danger-500 cursor-pointer"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}

                {values.images.length < MAX_IMAGES && (
                  <div className="relative flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-surface text-ink-400 hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
                    <FiPlus size={24} className="mb-1" />
                    <span className="text-[10px] font-medium">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) =>
                        handleImageSelect(e, setFieldValue, values.images)
                      }
                    />
                  </div>
                )}
              </div>
              {imageError && (
                <p className="mt-2 text-xs text-danger-600">{imageError}</p>
              )}
            </div>

            {/* Specifications Section */}
            <div className="rounded-xl border border-ink-100 bg-ink-50/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiList className="text-brand-600" />
                  <h3 className="text-sm font-semibold text-ink-900">
                    Specifications
                  </h3>
                </div>
                {/* NAYA: Counter for specs */}
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

                    {/* NAYA: Button disabled jab 10 ho jayein */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="MRP (₹)"
                name="mrp"
                type="number"
                placeholder="Enter MRP"
              />
              <TextInput
                label="Final Price (₹)"
                name="price"
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

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => navigate("/store/products")}
                className="px-4 py-2 border rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProductForm;
