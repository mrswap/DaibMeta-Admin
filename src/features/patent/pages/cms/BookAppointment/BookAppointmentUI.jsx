import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import { useBookingCard, useUpdateBookingCard } from "../../../queries/homeCms";

const MAX_IMAGE_SIZE_MB = 2;

const BookAppointmentUI = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: existing, isLoading } = useBookingCard();
  const updateMutation = useUpdateBookingCard();

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (existing?.image) setImagePreview(existing.image);
  }, [existing]);

  const initialValues = {
    h1: existing?.h1 || "Book Appointment", // H1 sirf backend ke liye bacha rahenge
    h2: existing?.h2 || "", // H2 khali rahega agar null hai
    button_text: existing?.button_text || "",
    sort_order: existing?.sort_order || 1,
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    // H2 ko optional rakha hai (No .required())
    h2: Yup.string().max(150, "Maximum 150 characters allowed"),
    button_text: Yup.string().max(50, "Maximum 50 characters allowed"),
    sort_order: Yup.number().required("Sort order is required").min(0),
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

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();

    formData.append("_method", "PUT");
    formData.append("h1", values.h1);
    formData.append("h2", values.h2); // Blank bhi jayega
    formData.append("button_text", values.button_text);
    formData.append("sort_order", values.sort_order);
    formData.append("is_active", values.is_active ? "1" : "0");

    if (imageFile) {
      formData.append("image", imageFile);
    }

    updateMutation.mutate(formData, {
      onSettled: () => {
        setSubmitting(false);
        setImageFile(null);
      },
    });
  };

  if (isLoading) return <Loader text="Loading..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          Book Appointment
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
              {/* Heading Optional */}
              <TextInput
                label="Heading (Optional)"
                name="h2"
                placeholder="Enter heading"
                maxLength={150}
              />

              <TextInput
                label="Button Text"
                name="button_text"
                placeholder="Enter button text"
                maxLength={50}
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
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      className="h-32 w-32 rounded-xl object-cover border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
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

              <ToggleSwitch
                name="is_active"
                label="Active Status"
                description="Inactive will be hidden"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="flex items-center justify-center gap-2 bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {(isSubmitting || updateMutation.isPending) && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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

export default BookAppointmentUI;
