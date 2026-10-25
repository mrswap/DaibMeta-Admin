import React, { useRef, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiUpload, FiX, FiArrowLeft } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import FormikEditorField from "../../../common/form/FormikEditorField";
import FormButton from "../../../common/form/FormButton";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import { PERIOD_CARDS_LIST } from "./periodData";

const MAX_IMAGE_SIZE_MB = 2;
const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

const PeriodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  // Sirf static cards hi edit honge
  const existingCard = PERIOD_CARDS_LIST.find((c) => c.id === Number(id));

  if (!existingCard) {
    return <div className="p-10 text-center text-ink-500">Card not found</div>;
  }

  const initialValues = {
    heading: existingCard.title, // Locked title
    image: "",
    content: existingCard.content || "",
    is_active: existingCard.status ?? true,
  };

  const validationSchema = Yup.object({
    content: Yup.string()
      .required("Content is required")
      .test("desc-length", "Maximum 10000 characters allowed", (val) => {
        return stripHtml(val).length <= 10000;
      }),
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
    console.log("Saved:", values);
    setSubmitting(false);
    navigate("/cms/period/health-guide");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/cms/period/health-guide")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            Edit: {existingCard.title}
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface p-5 space-y-5">
              {/* Title (Locked / Disabled) */}
              <TextInput label="Title (Locked)" name="heading" disabled />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-form-label">
                  Card Image (Optional)
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      className="h-32 w-32 rounded-xl object-cover border border-ink-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFieldValue("image", "");
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-form-label">
                  Content / Details{" "}
                  <span className="text-form-required">*</span>
                </label>
                <FormikEditorField
                  name="content"
                  placeholder="Enter guide content here..."
                  required
                />
              </div>

              <div className="pt-2">
                <ToggleSwitch
                  name="is_active"
                  label="Active Status"
                  description="Inactive content will be hidden inside the app"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/cms/period/health-guide")}
                className="border border-ink-200 px-4 py-2.5 rounded-lg text-sm bg-surface text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
              <FormButton
                type="submit"
                text="Update Details"
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

export default PeriodForm;
