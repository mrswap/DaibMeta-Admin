import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import { useState } from "react";
import TextInput from "../../../common/form/TextInput";
import TextareaField from "../../../common/form/TextareaField";
import SelectField from "../../../common/form/SelectField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";

const CATEGORIES = [
  { value: "1", label: "Medicines" },
  { value: "2", label: "Supplements" },
];

const SubcategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [imagePreview, setImagePreview] = useState("");

  const initialValues = {
    category_id: null,
    name: "",
    description: "",
    status: true,
    image: null,
  };

  const validation = Yup.object({
    category_id: Yup.object().nullable().required("Category is required"),
    name: Yup.string().required("Name is required").max(150),
    description: Yup.string().max(500),
  });

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFieldValue("image", file);
  };

  const handleRemoveImage = (setFieldValue) => {
    setImagePreview("");
    setFieldValue("image", null);
  };

  const handleSubmit = (values) => {
    console.log("Saving Subcategory:", values);
    navigate("/store/subcategories");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store/subcategories")}
          className="p-2 border rounded-lg bg-surface cursor-pointer"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold font-jakarta">
          {isEdit ? "Edit Subcategory" : "Add Subcategory"}
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validation}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-5">
            <SelectField
              label="Parent Category"
              name="category_id"
              options={CATEGORIES}
              required
            />
            <TextInput
              label="Subcategory Name"
              name="name"
              required
              placeholder="Enter name"
            />
            <TextareaField
              label="Description"
              name="description"
              rows={3}
              placeholder="Enter description"
            />

            {/* NAYA: Image Upload Section */}
            <div>
              <label className="block mb-2 text-sm font-medium text-form-label">
                Subcategory Image
              </label>

              {imagePreview ? (
                <div className="relative inline-block">
                  <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(setFieldValue)}
                    className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm hover:bg-danger-600"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 transition-colors">
                  <FiUpload className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                  />
                </div>
              )}
            </div>

            <ToggleSwitch
              label="Status"
              name="status"
              description="Active or inactive"
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => navigate("/store/subcategories")}
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

export default SubcategoryForm;
