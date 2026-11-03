// // src/features/patent/pages/healthPackages/HealthPackagesForm.jsx

// import React, { useRef, useState, useEffect } from "react";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   FiArrowLeft,
//   FiGrid,
//   FiUpload,
//   FiX,
//   FiCheck,
//   FiPackage,
// } from "react-icons/fi";
// import TextInput from "../../common/form/TextInput";
// import TextareaField from "../../common/form/TextareaField";
// import ToggleSwitch from "../../common/form/ToggleSwitch";
// import Loader from "../../common/Loader";
// import {
//   useHealthPackage,
//   useCreateHealthPackage,
//   useUpdateHealthPackage,
//   useAllServicesForPackage,
// } from "../../queries/healthPackages";

// const MAX_IMAGE_SIZE_MB = 2;

// const HealthPackagesForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);
//   const isEdit = !!id && id !== "new";

//   // API Hooks
//   const { data: existing, isLoading: isFetching } = useHealthPackage(
//     isEdit ? id : null,
//   );
//   const { data: availableServices, isLoading: isServicesLoading } =
//     useAllServicesForPackage();

//   const createMutation = useCreateHealthPackage();
//   const updateMutation = useUpdateHealthPackage();

//   const [imagePreview, setImagePreview] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [removeImage, setRemoveImage] = useState(false);
//   const [imageError, setImageError] = useState("");

//   useEffect(() => {
//     if (existing?.image) {
//       setImagePreview(existing.image);
//     }
//   }, [existing]);

//   // Extract existing service IDs and offer prices
//   const existingServiceIds = existing?.services?.map((s) => s.id) || [];
//   const existingServicePrices = {};
//   existing?.services?.forEach((s) => {
//     existingServicePrices[s.id] = s.offer_price ? String(s.offer_price) : "";
//   });

//   const initialValues = {
//     name: existing?.name || "",
//     description: existing?.description || "",
//     success_message: existing?.success_message || "",
//     is_active: existing?.is_active ?? true,
//     service_ids: existingServiceIds,
//     service_prices: existingServicePrices,
//   };

//   const validationSchema = Yup.object({
//     name: Yup.string().required("Package name is required").max(150),
//     description: Yup.string().max(500),
//     success_message: Yup.string().max(250),
//   });

//   const handleImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (
//       !file.type.startsWith("image/") ||
//       file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
//     ) {
//       setImageError(`Invalid file or size exceeds ${MAX_IMAGE_SIZE_MB}MB`);
//       return;
//     }
//     setImageError("");
//     setImageFile(file);
//     setRemoveImage(false);
//     const reader = new FileReader();
//     reader.onloadend = () => setImagePreview(reader.result);
//     reader.readAsDataURL(file);
//   };

//   const handleRemoveImage = () => {
//     setImagePreview("");
//     setImageFile(null);
//     setRemoveImage(true);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleToggleService = (serviceId, values, setFieldValue) => {
//     const isSelected = values.service_ids.includes(serviceId);
//     let newServices;
//     let newPrices = { ...values.service_prices };

//     if (isSelected) {
//       newServices = values.service_ids.filter((sid) => sid !== serviceId);
//       delete newPrices[serviceId];
//     } else {
//       newServices = [...values.service_ids, serviceId];
//     }

//     setFieldValue("service_ids", newServices);
//     setFieldValue("service_prices", newPrices);
//   };

//   const handlePriceChange = (
//     serviceId,
//     price,
//     setFieldValue,
//     currentPrices,
//   ) => {
//     setFieldValue("service_prices", {
//       ...currentPrices,
//       [serviceId]: price,
//     });
//   };

//   const handleSubmit = (values, { setSubmitting }) => {
//     const formData = new FormData();

//     if (isEdit) formData.append("_method", "PUT");

//     formData.append("name", values.name);
//     formData.append("description", values.description || "");
//     formData.append("success_message", values.success_message || "");
//     formData.append("is_active", values.is_active ? "1" : "0");

//     if (values.service_ids.length === 0) {
//       formData.append("service_ids", ""); // Clear all
//     } else {
//       values.service_ids.forEach((sid) => {
//         formData.append("service_ids[]", sid);
//         formData.append(
//           `service_prices[${sid}]`,
//           values.service_prices[sid] || "0",
//         );
//       });
//     }

//     if (imageFile) formData.append("image", imageFile);
//     if (removeImage) formData.append("remove_image", "1");

//     const onSuccess = () => navigate("/health-packages");

//     if (isEdit) {
//       updateMutation.mutate(
//         { id, formData },
//         { onSettled: () => setSubmitting(false), onSuccess },
//       );
//     } else {
//       createMutation.mutate(formData, {
//         onSettled: () => setSubmitting(false),
//         onSuccess,
//       });
//     }
//   };

//   if (isEdit && isFetching) return <Loader text="Loading package details..." />;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <button
//           type="button"
//           onClick={() => navigate("/health-packages")}
//           className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 hover:bg-ink-50"
//         >
//           <FiArrowLeft className="h-5 w-5" />
//         </button>
//         <div>
//           <h1 className="font-jakarta text-2xl font-bold text-ink-900">
//             {isEdit ? "Edit Health Package" : "Add Health Package"}
//           </h1>
//         </div>
//       </div>

//       <Formik
//         key={id || "new"}
//         initialValues={initialValues}
//         validationSchema={validationSchema}
//         enableReinitialize
//         onSubmit={handleSubmit}
//       >
//         {({ isSubmitting, setFieldValue, values }) => (
//           <Form className="space-y-6">
//             <div className="rounded-card border border-ink-100 bg-surface">
//               <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
//                 <FiGrid className="h-5 w-5 text-brand-600" />
//                 <h2 className="font-jakarta text-base font-semibold text-ink-900">
//                   Package Details
//                 </h2>
//               </div>

//               <div className="space-y-5 p-5">
//                 <TextInput
//                   label="Package Name"
//                   name="name"
//                   placeholder="Enter package name"
//                   maxLength={150}
//                   required
//                 />

//                 <TextareaField
//                   label="Description"
//                   name="description"
//                   placeholder="Enter description"
//                   rows={3}
//                   maxLength={500}
//                 />

//                 <TextareaField
//                   label="Booking Success Message"
//                   name="success_message"
//                   placeholder="Message shown on app after booking"
//                   rows={2}
//                   maxLength={250}
//                 />

//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-form-label">
//                     Package Image
//                   </label>

//                   {imagePreview ? (
//                     <div className="relative inline-block">
//                       <div className="flex h-40 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50 p-2">
//                         <img
//                           src={imagePreview}
//                           alt="Preview"
//                           className="h-full w-full object-contain"
//                         />
//                       </div>
//                       <button
//                         type="button"
//                         onClick={handleRemoveImage}
//                         className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm hover:bg-danger-600"
//                       >
//                         <FiX className="h-3.5 w-3.5" />
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => fileInputRef.current?.click()}
//                       className="flex h-40 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700"
//                     >
//                       <FiUpload className="h-6 w-6" />
//                       <span className="text-xs font-medium">Upload Image</span>
//                     </button>
//                   )}
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="hidden"
//                   />
//                   {imageError && (
//                     <p className="mt-2 text-xs text-form-error">{imageError}</p>
//                   )}
//                 </div>

//                 <ToggleSwitch
//                   name="is_active"
//                   label="Active Status"
//                   description="Inactive packages will not appear on the app"
//                 />
//               </div>
//             </div>

//             <div className="rounded-card border border-ink-100 bg-surface">
//               <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
//                 <div className="flex items-center gap-2">
//                   <FiPackage className="h-5 w-5 text-brand-600" />
//                   <h2 className="font-jakarta text-base font-semibold text-ink-900">
//                     Select Services & Offer Prices
//                   </h2>
//                 </div>
//                 <span className="text-xs font-medium text-ink-500">
//                   {values.service_ids.length} selected
//                 </span>
//               </div>

//               <div className="p-5">
//                 {isServicesLoading ? (
//                   <div className="py-8 text-center text-sm text-ink-500">
//                     Loading services...
//                   </div>
//                 ) : !availableServices || availableServices.length === 0 ? (
//                   <div className="py-8 text-center text-sm text-ink-500">
//                     No services available.
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
//                     {availableServices.map((service) => {
//                       const isSelected = values.service_ids.includes(
//                         service.id,
//                       );
//                       const isDirect = service.display_mode === "direct";

//                       return (
//                         <div
//                           key={service.id}
//                           className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
//                             isSelected
//                               ? "border-brand-500 bg-brand-50/50"
//                               : "border-ink-200 bg-surface hover:bg-ink-50"
//                           }`}
//                         >
//                           <div
//                             className="flex items-start gap-3 cursor-pointer"
//                             onClick={() =>
//                               handleToggleService(
//                                 service.id,
//                                 values,
//                                 setFieldValue,
//                               )
//                             }
//                           >
//                             <div
//                               className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
//                                 isSelected
//                                   ? "border-brand-600 bg-brand-600 text-white"
//                                   : "border-ink-300 bg-white"
//                               }`}
//                             >
//                               {isSelected && (
//                                 <FiCheck className="h-3.5 w-3.5" />
//                               )}
//                             </div>

//                             <div className="flex flex-col flex-1">
//                               <span
//                                 className={`text-sm font-semibold leading-tight ${isSelected ? "text-brand-900" : "text-ink-900"}`}
//                               >
//                                 {service.name}
//                               </span>

//                               <div className="flex flex-wrap items-center gap-2 mt-1">
//                                 {service.is_active === false && (
//                                   <span className="text-[10px] font-semibold text-danger-600">
//                                     Inactive
//                                   </span>
//                                 )}
//                                 <span
//                                   className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
//                                     isDirect
//                                       ? "bg-ink-100 text-ink-600"
//                                       : "bg-warn-100 text-warn-800"
//                                   }`}
//                                 >
//                                   {isDirect ? "Direct" : "Package Only"}
//                                 </span>
//                                 {service.starting_price && (
//                                   <span className="text-[10px] font-medium text-ink-600">
//                                     Starting: ₹{service.starting_price}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           {/* Price Input for Selected Service */}
//                           {isSelected && (
//                             <div className="mt-2 pl-8">
//                               <label className="text-[11px] font-medium text-ink-600 block mb-1">
//                                 Package Offer Price (₹)
//                               </label>
//                               <input
//                                 type="number"
//                                 min="0"
//                                 value={values.service_prices[service.id] || ""}
//                                 onChange={(e) =>
//                                   handlePriceChange(
//                                     service.id,
//                                     e.target.value,
//                                     setFieldValue,
//                                     values.service_prices,
//                                   )
//                                 }
//                                 placeholder="Enter offer price"
//                                 className="w-full rounded-lg border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
//                               />
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => navigate("/health-packages")}
//                 className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={
//                   isSubmitting ||
//                   createMutation.isPending ||
//                   updateMutation.isPending
//                 }
//                 className="flex items-center justify-center gap-2 bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
//               >
//                 {(isSubmitting ||
//                   createMutation.isPending ||
//                   updateMutation.isPending) && (
//                   <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                 )}
//                 {isEdit ? "Update Package" : "Create Package"}
//               </button>
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default HealthPackagesForm;

// src/features/patent/pages/healthPackages/HealthPackagesForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiGrid, FiUpload, FiX, FiTag } from "react-icons/fi";
import TextInput from "../../common/form/TextInput";
import TextareaField from "../../common/form/TextareaField";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import FormikEditorField from "../../common/form/FormikEditorField";
import Loader from "../../common/Loader";
import {
  useHealthPackage,
  useCreateHealthPackage,
  useUpdateHealthPackage,
} from "../../queries/healthPackages";

const MAX_IMAGE_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const HealthPackagesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = !!id && id !== "new";

  const { data: existing, isLoading: isFetching } = useHealthPackage(
    isEdit ? id : null,
  );
  const createMutation = useCreateHealthPackage();
  const updateMutation = useUpdateHealthPackage();

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (existing?.image) setImagePreview(existing.image);
  }, [existing]);

  // Normal service ko is module me edit nahi karna
  useEffect(() => {
    if (existing && existing.is_health_package === false) {
      navigate("/health-packages", { replace: true });
    }
  }, [existing, navigate]);

  const initialValues = {
    name: existing?.name || "",
    description: existing?.description || "",
    success_message: existing?.success_message || "",
    content: existing?.content || "",
    service_price: existing?.service_price ?? "",
    offer_price: existing?.offer_price ?? "",
    is_active: existing?.is_active ?? true,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Package name is required").max(150),
    description: Yup.string().max(500),
    success_message: Yup.string().max(250),
    service_price: Yup.number()
      .typeError("Package price is required")
      .required("Package price is required")
      .min(0, "Price cannot be negative"),
    offer_price: Yup.number()
      .typeError("Offer price is required")
      .required("Offer price is required")
      .min(0, "Price cannot be negative")
      .when("service_price", (servicePrice, schema) =>
        Number.isFinite(Number(servicePrice))
          ? schema.max(
              Number(servicePrice),
              "Offer price cannot exceed package price",
            )
          : schema,
      ),
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !ALLOWED_TYPES.includes(file.type) ||
      file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024
    ) {
      setImageError(
        `Only JPG, PNG or WEBP up to ${MAX_IMAGE_SIZE_MB}MB allowed`,
      );
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

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();

    // Quill empty state "<p><br></p>" hota hai
    const content =
      values.content && values.content !== "<p><br></p>" ? values.content : "";

    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("success_message", values.success_message || "");
    formData.append("content", content);
    formData.append("is_health_package", "1");
    formData.append("service_price", values.service_price); // Package Price
    formData.append("offer_price", values.offer_price);
    formData.append("display_mode", "direct"); // static
    formData.append("is_active", values.is_active ? "1" : "0");

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (removeImage && existing?.image) {
      // doc: nayi image aur remove_image ek saath nahi
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
        <h1 className="font-jakarta text-2xl font-bold text-ink-900">
          {isEdit ? "Edit Health Package" : "Add Health Package"}
        </h1>
      </div>

      <Formik
        key={id || "new"}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            {/* Package Details */}
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

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-form-label">
                    Package Image
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
                      className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700"
                    >
                      <FiUpload className="h-6 w-6" />
                      <span className="text-xs font-medium">Upload Image</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imageError && (
                    <p className="mt-2 text-xs text-form-error">{imageError}</p>
                  )}
                </div>

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

                <ToggleSwitch
                  name="is_active"
                  label="Active Status"
                  description="Inactive packages will not appear on the app"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                <FiTag className="h-5 w-5 text-brand-600" />
                <h2 className="font-jakarta text-base font-semibold text-ink-900">
                  Package Pricing
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                <TextInput
                  label="Package Price (₹)"
                  name="service_price"
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  required
                />
                <TextInput
                  label="Offer Price (₹)"
                  name="offer_price"
                  type="number"
                  min="0"
                  placeholder="e.g. 3999"
                  required
                />
              </div>
            </div>

            {/* Content */}
            <div className="rounded-card border border-ink-100 bg-surface p-5">
              <FormikEditorField
                name="content"
                label="Package Content"
                placeholder="Write package details..."
                minHeight={220}
              />
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
