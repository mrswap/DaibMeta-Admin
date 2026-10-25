// src/features/patent/pages/patientApp/cms/CmsCardForm.jsx

import React, { useRef, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import FormButton from "../../../common/form/FormButton";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import { CMS_CARDS } from "./cmsData";

const MAX_IMAGE_SIZE_MB = 2;

const CmsCardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const existing = id ? CMS_CARDS.find((c) => c.id === Number(id)) : null;

  const [imagePreview, setImagePreview] = useState(existing?.image || "");
  const [imageError, setImageError] = useState("");

  const initialValues = {
    heading: existing?.heading || "",
    image: existing?.image || "",
    is_active: existing?.is_active ?? true,
  };

  // Heading ko Optional kar diya (Yup.string() me .required() nahi hai)
  const validationSchema = Yup.object({
    heading: Yup.string().max(150, "Maximum 150 characters allowed"),
  });

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
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

  const handleRemoveImage = (setFieldValue) => {
    setImagePreview("");
    setFieldValue("image", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Saving card:", values);
    setSubmitting(false);
    navigate("/cms/all-cards");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/cms/all-cards")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            {existing ? "Edit App Card" : "Add App Card"}
          </h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Configure card details for Patient App
          </p>
        </div>
      </div>

      <Formik
        key={id || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="space-y-5 p-5">
                {/* Heading (Optional) */}
                <TextInput
                  label="Heading (Optional)"
                  name="heading"
                  placeholder="Enter heading"
                  maxLength={150}
                />

                {/* Image Upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-form-label">
                    Card Image
                  </label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Card preview"
                        className="h-32 w-32 rounded-xl border border-ink-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(setFieldValue)}
                        className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm transition-colors hover:bg-danger-600"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 transition-colors hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-700"
                    >
                      <FiUpload className="h-6 w-6" />
                      <span className="text-xs font-medium">Upload Image</span>
                      <span className="text-[10px] text-ink-400">
                        Max {MAX_IMAGE_SIZE_MB}MB
                      </span>
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
                    <p className="mt-2 text-xs text-form-error">{imageError}</p>
                  )}
                </div>

                {/* Status */}
                <ToggleSwitch
                  name="is_active"
                  label="Active Status"
                  description="Inactive cards will be hidden on the app"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/cms/all-cards")}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
              >
                Cancel
              </button>
              <FormButton
                type="submit"
                text={existing ? "Update Card" : "Create Card"}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="!w-auto !px-4"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CmsCardForm;
