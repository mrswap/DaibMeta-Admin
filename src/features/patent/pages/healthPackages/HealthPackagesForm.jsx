// src/features/patent/pages/healthPackages/HealthPackagesForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiGrid,
  FiUpload,
  FiX,
  FiCheck,
  FiPackage,
} from "react-icons/fi";
import TextInput from "../../common/form/TextInput";
import TextareaField from "../../common/form/TextareaField";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import Loader from "../../common/Loader";
import {
  useHealthPackage,
  useCreateHealthPackage,
  useUpdateHealthPackage,
  useAllServicesForPackage,
} from "../../queries/healthPackages";

const MAX_IMAGE_SIZE_MB = 2;

const HealthPackagesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = !!id && id !== "new";

  // API Hooks
  const { data: existing, isLoading: isFetching } = useHealthPackage(
    isEdit ? id : null,
  );
  const { data: availableServices, isLoading: isServicesLoading } =
    useAllServicesForPackage();

  const createMutation = useCreateHealthPackage();
  const updateMutation = useUpdateHealthPackage();

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (existing?.image) {
      setImagePreview(existing.image);
    }
  }, [existing]);

  const initialValues = {
    name: existing?.name || "",
    description: existing?.description || "",
    success_message: existing?.success_message || "",
    is_active: existing?.is_active ?? true,
    service_ids: existing?.services?.map((s) => s.id) || [],
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Package name is required").max(150),
    description: Yup.string().max(500),
    success_message: Yup.string().max(250),
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !file.type.startsWith("image/") ||
      file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      setImageError(`Invalid file or size exceeds ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }
    setImageError("");
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleToggleService = (serviceId, currentServices, setFieldValue) => {
    const isSelected = currentServices.includes(serviceId);
    let newServices;
    if (isSelected) {
      newServices = currentServices.filter((sid) => sid !== serviceId);
    } else {
      newServices = [...currentServices, serviceId];
    }
    setFieldValue("service_ids", newServices);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();

    // FIX: Method spoofing for image update
    if (isEdit) formData.append("_method", "PUT");

    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("success_message", values.success_message || "");
    formData.append("is_active", values.is_active ? "1" : "0");

    // Append service IDs as array
    values.service_ids.forEach((sid) => {
      formData.append("service_ids[]", sid);
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (removeImage) {
      formData.append("remove_image", "1");
    }

    const onSuccess = () => navigate("/health-packages");

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

  if (isEdit && isFetching) return <Loader text="Loading package details..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/health-packages")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            {isEdit ? "Edit Health Package" : "Add Health Package"}
          </h1>
        </div>
      </div>

      <Formik
        key={id || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                <FiGrid className="h-5 w-5 text-brand-600" />
                <h2 className="font-jakarta text-base font-semibold text-ink-900">
                  Package Details
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <TextInput
                  label="Package Name"
                  name="name"
                  placeholder="Enter package name"
                  maxLength={150}
                  required
                />

                <TextareaField
                  label="Description"
                  name="description"
                  placeholder="Enter description"
                  rows={3}
                  maxLength={500}
                />

                <TextareaField
                  label="Booking Success Message"
                  name="success_message"
                  placeholder="Message shown on app after booking"
                  rows={2}
                  maxLength={250}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-form-label">
                    Package Image
                  </label>

                  {/* FIX: Image Rule apply kiya (object-contain with bg) */}
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <div className="flex h-40 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50 p-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm hover:bg-danger-600"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-40 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700"
                    >
                      <FiUpload className="h-6 w-6" />
                      <span className="text-xs font-medium">Upload Image</span>
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
                    <p className="mt-2 text-xs text-form-error">{imageError}</p>
                  )}
                </div>

                <ToggleSwitch
                  name="is_active"
                  label="Active Status"
                  description="Inactive packages will not appear on the app"
                />
              </div>
            </div>

            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FiPackage className="h-5 w-5 text-brand-600" />
                  <h2 className="font-jakarta text-base font-semibold text-ink-900">
                    Select Services
                  </h2>
                </div>
                <span className="text-xs font-medium text-ink-500">
                  {values.service_ids.length} selected
                </span>
              </div>

              <div className="p-5">
                {isServicesLoading ? (
                  <div className="py-8 text-center text-sm text-ink-500">
                    Loading services...
                  </div>
                ) : !availableServices || availableServices.length === 0 ? (
                  <div className="py-8 text-center text-sm text-ink-500">
                    No services available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {availableServices.map((service) => {
                      const isSelected = values.service_ids.includes(
                        service.id,
                      );
                      return (
                        <div
                          key={service.id}
                          onClick={() =>
                            handleToggleService(
                              service.id,
                              values.service_ids,
                              setFieldValue,
                            )
                          }
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                            isSelected
                              ? "border-brand-500 bg-brand-50 text-brand-900"
                              : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                              isSelected
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-ink-300 bg-white"
                            }`}
                          >
                            {isSelected && <FiCheck className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-tight">
                              {service.name}
                            </span>
                            {service.is_active === false && (
                              <span className="text-[10px] text-danger-600 font-semibold mt-0.5">
                                (Inactive)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/health-packages")}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
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
                className="flex items-center justify-center gap-2 bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {(isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending) && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isEdit ? "Update Package" : "Create Package"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default HealthPackagesForm;
