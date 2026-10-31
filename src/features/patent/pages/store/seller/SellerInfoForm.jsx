import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiUpload, FiUserCheck, FiX } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import FormikEditorField from "../../../common/form/FormikEditorField";

const SellerInfoForm = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState("");

  const initialValues = {
    title: "DaibMeta Official Store",
    tag: "Trusted Seller",
    description:
      "<p>We provide authentic medicines and health supplements directly from the manufacturer.</p>",
    image: null,
  };

  const validation = Yup.object({
    title: Yup.string().required("Title is required").max(150),
    tag: Yup.string().max(50, "Tag should be short"),
    description: Yup.string().required("Description is required"),
  });

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFieldValue("image", file);
  };

  const handleRemoveImage = (setFieldValue) => {
    setImagePreview("");
    setFieldValue("image", null);
  };

  const handleSubmit = (values) => {
    console.log("Saving Seller Info:", values);
    // API call baad mein
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/store")}
          className="p-2 border rounded-lg bg-surface cursor-pointer"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-jakarta text-ink-900">
            Seller Information
          </h1>
          <p className="text-sm text-ink-500">
            Manage store details and seller description
          </p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validation}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="rounded-card border border-ink-100 bg-surface p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-3 mb-2">
              <FiUserCheck className="text-brand-600 h-5 w-5" />
              <h2 className="font-semibold text-ink-900">Store Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextInput
                label="Store Title"
                name="title"
                required
                placeholder="e.g. DaibMeta Official Store"
              />
              <TextInput
                label="Tagline / Tag"
                name="tag"
                placeholder="e.g. Trusted Seller"
              />
            </div>

            <FormikEditorField
              name="description"
              label="Description"
              placeholder="Describe the seller, policies, etc..."
              minHeight={250}
              required
            />

            <div>
              <label className="block mb-2 text-sm font-medium text-form-label">
                Seller Logo / Image
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

            <div className="flex justify-end pt-4 border-t border-ink-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-brand-700 transition-colors"
              >
                Save Info
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SellerInfoForm;
