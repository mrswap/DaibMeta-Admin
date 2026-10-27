// src/features/patent/pages/cms/ScanFood/ScanFoodUI.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import {
  useFeatureCards,
  useUpdateFeatureCard,
} from "../../../queries/homeCms";

const ScanFoodUI = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { data: cards = [], isLoading } = useFeatureCards();

  // Key: scan-your-food
  const existing = cards?.find(
    (c) => String(c.key).trim() === "scan-your-food",
  );

  const updateMutation = useUpdateFeatureCard();
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (existing?.image) setImagePreview(existing.image);
  }, [existing]);

  const initialValues = {
    h1: existing?.h1 || "Scan Your Food",
    h2: existing?.h2 || "",
    sort_order: existing?.sort_order || 1,
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    h2: Yup.string().max(150),
    sort_order: Yup.number().required().min(0),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    if (!existing) return;
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("h1", values.h1);
    formData.append("h2", values.h2);
    formData.append("sort_order", values.sort_order);
    formData.append("is_active", values.is_active ? "1" : "0");
    if (imageFile) formData.append("image", imageFile);

    updateMutation.mutate(
      { id: existing.id, formData },
      {
        onSettled: () => {
          setSubmitting(false);
          setImageFile(null);
        },
      },
    );
  };

  if (isLoading) return <Loader text="Loading..." />;
  if (!existing)
    return <div className="p-10 text-center text-ink-500">Card not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          Scan Food
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
                label="Heading (Optional)"
                name="h2"
                placeholder="Enter heading"
                maxLength={150}
              />
              <TextInput
                label="Sort Order"
                name="sort_order"
                type="number"
                placeholder="e.g. 1"
                required
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Card Image
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
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setImageFile(f);
                      const r = new FileReader();
                      r.onloadend = () => setImagePreview(r.result);
                      r.readAsDataURL(f);
                    }
                  }}
                  className="hidden"
                />
              </div>
              <ToggleSwitch name="is_active" label="Active Status" />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="flex items-center gap-2 bg-btn-primary-bg px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              >
                {(isSubmitting || updateMutation.isPending) && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isSubmitting || updateMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
export default ScanFoodUI;
