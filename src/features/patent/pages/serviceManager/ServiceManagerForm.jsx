// import React, { useRef, useState, useEffect } from "react";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import { useNavigate, useParams } from "react-router-dom";
// import { FiArrowLeft, FiGrid, FiUpload, FiX } from "react-icons/fi";
// import TextInput from "../../common/form/TextInput";
// import TextareaField from "../../common/form/TextareaField";
// import ToggleSwitch from "../../common/form/ToggleSwitch";
// import Loader from "../../common/Loader";
// import {
//   useService,
//   useCreateService,
//   useUpdateService,
// } from "../../queries/serviceManager";

// const MAX_IMAGE_SIZE_MB = 2;

// const ServiceManagerForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);

//   const { data: existing, isLoading: isFetching } = useService(id);
//   const createMutation = useCreateService();
//   const updateMutation = useUpdateService();

//   const [imagePreview, setImagePreview] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [removeImage, setRemoveImage] = useState(false);
//   const [imageError, setImageError] = useState("");

//   useEffect(() => {
//     if (existing?.image) {
//       setImagePreview(existing.image);
//     }
//   }, [existing]);

//   const initialValues = {
//     name: existing?.name || "",
//     description: existing?.description || "",
//     success_message: existing?.success_message || "",
//     is_active: existing?.is_active ?? true,
//   };

//   const validationSchema = Yup.object({
//     name: Yup.string().required("Service name is required").max(150),
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

//   const handleSubmit = (values, { setSubmitting }) => {
//     const formData = new FormData();
//     formData.append("name", values.name);
//     formData.append("description", values.description || "");
//     formData.append("success_message", values.success_message || "");
//     formData.append("display_mode", "direct"); // static
//     formData.append("is_active", values.is_active ? "1" : "0");

//     if (imageFile) formData.append("image", imageFile);
//     if (removeImage) formData.append("remove_image", "1");

//     const onSuccess = () => navigate("/service-manager");

//     if (id) {
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

//   if (id && isFetching) return <Loader text="Loading service details..." />;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <button
//           type="button"
//           onClick={() => navigate("/service-manager")}
//           className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
//         >
//           <FiArrowLeft className="h-5 w-5" />
//         </button>
//         <div>
//           <h1 className="font-jakarta text-2xl font-bold text-ink-900">
//             {id ? "Edit Service" : "Add Service"}
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
//         {({ isSubmitting }) => (
//           <Form className="space-y-6">
//             <div className="rounded-card border border-ink-100 bg-surface">
//               <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
//                 <FiGrid className="h-5 w-5 text-brand-600" />
//                 <h2 className="font-jakarta text-base font-semibold text-ink-900">
//                   Service Details
//                 </h2>
//               </div>

//               <div className="space-y-5 p-5">
//                 <TextInput
//                   label="Service Name"
//                   name="name"
//                   placeholder="Enter service name"
//                   maxLength={150}
//                   required
//                 />

//                 <div>
//                   <label className="mb-1.5 block text-sm font-medium text-form-label">
//                     Service Image
//                   </label>

//                   {imagePreview ? (
//                     <div className="relative inline-block">
//                       <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
//                         <img
//                           src={imagePreview}
//                           alt="Service preview"
//                           className="h-full w-full object-contain p-2"
//                         />
//                       </div>
//                       <button
//                         type="button"
//                         onClick={handleRemoveImage}
//                         className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-danger-500 p-1.5 text-white shadow-sm transition-colors hover:bg-danger-600"
//                       >
//                         <FiX className="h-3.5 w-3.5" />
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       type="button"
//                       onClick={() => fileInputRef.current?.click()}
//                       className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 text-ink-500 transition-colors hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-700"
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

//                 <ToggleSwitch
//                   name="is_active"
//                   label="Active Status"
//                   description="Inactive services will not appear on the app"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => navigate("/service-manager")}
//                 className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
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
//                 {id ? "Update Service" : "Create Service"}
//               </button>
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default ServiceManagerForm;

// src/features/patent/pages/serviceManager/ServiceManagerForm.jsx

import React, { useRef, useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiGrid, FiUpload, FiX } from "react-icons/fi";
import TextInput from "../../common/form/TextInput";
import TextareaField from "../../common/form/TextareaField";
import ToggleSwitch from "../../common/form/ToggleSwitch";
import Loader from "../../common/Loader";
import {
  useService,
  useCreateService,
  useUpdateService,
} from "../../queries/serviceManager";

const MAX_IMAGE_SIZE_MB = 2;

const ServiceManagerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: existing, isLoading: isFetching } = useService(id);
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

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
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Service name is required").max(150),
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

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("success_message", values.success_message || "");
    formData.append("display_mode", "direct"); // static
    formData.append("is_active", values.is_active ? "1" : "0");

    if (imageFile) formData.append("image", imageFile);
    if (removeImage) formData.append("remove_image", "1");

    const onSuccess = () => navigate("/service-manager");

    if (id) {
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

  if (id && isFetching) return <Loader text="Loading service details..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/service-manager")}
          className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            {id ? "Edit Service" : "Add Service"}
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
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="rounded-card border border-ink-100 bg-surface">
              <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
                <FiGrid className="h-5 w-5 text-brand-600" />
                <h2 className="font-jakarta text-base font-semibold text-ink-900">
                  Service Details
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <TextInput
                  label="Service Name"
                  name="name"
                  placeholder="Enter service name"
                  maxLength={150}
                  required
                />

                {/* --- IMAGE SECTION START --- */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink-900">
                    Service Image
                  </label>

                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* LEFT: Image Upload / Preview */}
                    <div className="shrink-0">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                            <img
                              src={imagePreview}
                              alt="Service preview"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -right-2 -top-2 rounded-full bg-danger-500 p-1 text-white shadow-sm hover:bg-danger-600 transition"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-[120px] w-[120px] flex-col items-center justify-center border border-dashed rounded-xl bg-ink-50/40 text-ink-500 hover:border-brand-300 hover:text-brand-700 transition"
                        >
                          <FiUpload className="h-5 w-5 mb-1" />
                          <span className="text-xs text-center px-1">
                            Upload Image
                          </span>
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
                        <p className="text-danger-500 text-xs mt-1 max-w-[120px]">
                          {imageError}
                        </p>
                      )}
                    </div>

                    {/* RIGHT: Simple Text Guide */}
                    <div className="text-xs text-ink-600 space-y-1.5 mt-1">
                      <p>
                        <span className="font-medium text-ink-900">Size:</span>{" "}
                        216 x 216 px
                      </p>
                      <p className="pt-1">Max 2 MB. JPG / PNG / WebP.</p>
                    </div>
                  </div>
                </div>
                {/* --- IMAGE SECTION END --- */}

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
                  description="Inactive services will not appear on the app"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/service-manager")}
                className="cursor-pointer rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
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
                {id ? "Update Service" : "Create Service"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ServiceManagerForm;
