// src/features/patent/pages/cms/Disease/DiseaseForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiUpload, FiX, FiArrowLeft } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import FormikEditorField from "../../../common/form/FormikEditorField";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import {
  useKnowYourHealthSingle,
  useCreateKnowYourHealth,
  useUpdateKnowYourHealth,
} from "../../../queries/knowYourHealth";

const MAX_IMAGE_SIZE_MB = 2;
const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

const DiseaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // FIX: 'new' route handle kiya
  const isEdit = !!id && id !== "new";

  const { data: existing, isLoading } = useKnowYourHealthSingle(
    "disease",
    isEdit ? id : null,
  );
  const createMutation = useCreateKnowYourHealth();
  const updateMutation = useUpdateKnowYourHealth();

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (existing?.image_url) setImagePreview(existing.image_url);
  }, [existing]);

  const initialValues = {
    heading: existing?.name || "",
    description: existing?.content || "",
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    heading: Yup.string().required("Disease Name is required").max(150),
    description: Yup.string()
      .required("Description is required")
      .test(
        "not-empty",
        "Content cannot be empty",
        (val) => stripHtml(val).length > 0,
      ),
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
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    if (isEdit) formData.append("_method", "PUT");
    formData.append("name", values.heading);
    formData.append("content", values.description);
    formData.append("is_active", values.is_active ? "1" : "0");
    if (imageFile) formData.append("image", imageFile);

    const onSuccess = () => navigate("/cms/disease/list");

    if (isEdit) {
      updateMutation.mutate(
        { category: "disease", id, formData },
        { onSettled: () => setSubmitting(false), onSuccess },
      );
    } else {
      createMutation.mutate(
        { category: "disease", formData },
        { onSettled: () => setSubmitting(false), onSuccess },
      );
    }
  };

  if (isEdit && isLoading) return <Loader text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/cms/disease/list")}
          className="cursor-pointer rounded-lg border p-2 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-jakarta text-2xl font-bold">
          {isEdit ? "Edit Disease" : "Add New Disease"}
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface p-5 space-y-5">
              <TextInput
                label="Disease Name"
                name="heading"
                placeholder="Enter disease name"
                maxLength={150}
                required
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Disease Image (Optional)
                </label>

                {/* FIX: Image Rule apply kiya (object-contain + bg) */}
                {imagePreview ? (
                  <div className="relative inline-block">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50 p-2">
                      <img
                        src={imagePreview}
                        className="h-full w-full object-contain"
                        alt="Preview"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1.5 text-white"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 w-32 flex-col items-center justify-center border-2 border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700"
                  >
                    <FiUpload className="h-6 w-6 mb-1" />
                    <span className="text-xs">Upload Image</span>
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
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description <span className="text-danger-500">*</span>
                </label>
                <FormikEditorField
                  name="description"
                  placeholder="Enter description"
                  required
                />
              </div>
              <ToggleSwitch
                name="is_active"
                label="Active Status"
                description="Inactive diseases will be hidden inside the app"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/cms/disease/list")}
                className="border px-4 py-2.5 rounded-lg text-sm bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {(isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending) && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isEdit ? "Update Disease" : "Save Disease"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DiseaseForm;
