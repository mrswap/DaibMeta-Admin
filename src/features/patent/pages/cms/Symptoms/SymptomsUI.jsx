import React, { useRef, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX, FiList } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import FormButton from "../../../common/form/FormButton";
import ToggleSwitch from "../../../common/form/ToggleSwitch";

const MAX_IMAGE_SIZE_MB = 2;

const SymptomsUI = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  const initialValues = {
    heading: "Know Your Symptoms",
    image: "",
    is_active: true,
  };

  const validationSchema = Yup.object({
    heading: Yup.string().max(150, "Maximum 150 characters allowed"),
  });

  const handleImageChange = (e, setFieldValue) => {
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
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFieldValue("image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Saved Card Settings:", values);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with View Symptoms Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Symptoms
          </h1>
        </div>
        <button
          onClick={() => navigate("/cms/symptoms/list")}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
        >
          <FiList className="h-4 w-4" />
          View Symptoms
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface p-5 space-y-5">
              <TextInput
                label="Heading (Optional)"
                name="heading"
                placeholder="Enter heading"
                maxLength={150}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-form-label">
                  Card Image
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      className="h-32 w-32 rounded-xl object-cover border border-ink-200"
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFieldValue("image", "");
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1.5 text-white shadow-sm transition-colors hover:bg-danger-600"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 w-32 flex-col items-center justify-center border-2 border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 transition-colors"
                  >
                    <FiUpload className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Upload Image</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                  className="hidden"
                />
                {imageError && (
                  <p className="text-danger-500 text-xs mt-1">{imageError}</p>
                )}
              </div>

              <div className="pt-2">
                <ToggleSwitch
                  name="is_active"
                  label="Active Status"
                  description="Inactive cards will be hidden on the app"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>
              <FormButton
                type="submit"
                text="Save Changes"
                isLoading={isSubmitting}
                className="!w-auto !px-4"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SymptomsUI;
