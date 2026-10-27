// src/features/patent/pages/cms/banners/BannerForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import TextInput from "../../../common/form/TextInput";
import ToggleSwitch from "../../../common/form/ToggleSwitch";
import Loader from "../../../common/Loader";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
} from "../../../queries/banners";

const MAX_IMAGE_SIZE_MB = 2;

const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = !!id && id !== "new";

  const { data: bannersData, isLoading } = useBanners({ per_page: 100 });
  const existing = isEdit
    ? bannersData?.list.find((b) => b.id === Number(id))
    : null;

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (existing?.image_url) setImagePreview(existing.image_url);
  }, [existing]);

  const initialValues = {
    title: existing?.title || "",
    navigation_path: existing?.target_url || "",
    sort_order: existing?.sort_order || 1,
    status: existing?.status ?? true,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required").max(150),
    navigation_path: Yup.string().max(250),
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
    if (!isEdit && !imageFile) {
      setImageError("Image is required");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("sort_order", values.sort_order);
    formData.append("status", values.status ? "1" : "0");
    formData.append("target_url", values.navigation_path);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const onSuccess = () => navigate("/cms/banners");

    if (isEdit) {
      updateMutation.mutate(
        { id, formData },
        { onSettled: () => setSubmitting(false), onSuccess },
      );
    } else {
      createMutation.mutate(formData, {
        onSettled: () => setSubmitting(false),
        onSuccess,
      });
    }
  };

  if (isEdit && isLoading) return <Loader text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/cms/banners")}
          className="cursor-pointer rounded-lg border p-2 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-jakarta text-2xl font-bold">
          {isEdit ? "Edit Banner" : "Add Banner"}
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
                label="Title"
                name="title"
                placeholder="Enter banner title"
                maxLength={150}
                required
              />

              <TextInput
                label="Navigation Link / Path"
                name="navigation_path"
                placeholder="e.g. /appointment"
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
                  Banner Image{" "}
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
                      className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1.5 text-white"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-40 w-full max-w-md flex-col items-center justify-center border-2 border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300"
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

              <ToggleSwitch
                name="status"
                label="Active Status"
                description="Inactive banners will be hidden on the app"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/cms/banners")}
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
                {isEdit ? "Update Banner" : "Create Banner"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BannerForm;
