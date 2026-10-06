// import { Formik, Form, useFormikContext } from "formik";
// import * as Yup from "yup";
// import {
//   FiX,
//   FiUser,
//   FiPhone,
//   FiMail,
//   FiCalendar,
//   FiMapPin,
//   FiLock,
//   FiUsers,
//   FiFileText,
// } from "react-icons/fi";
// import {
//   useCreatePatient,
//   useUpdatePatient,
//   usePatients,
// } from "../../../queries/patients";
// import { useRelationTypes } from "../../../queries/relationTypes";
// import {
//   TextInput,
//   TextareaField,
//   SelectField,
//   FormButton,
// } from "../../../common/form";

// const SEX_OPTIONS = [
//   { value: "male", label: "Male" },
//   { value: "female", label: "Female" },
//   { value: "other", label: "Other" },
// ];

// const TYPE_OPTIONS = [
//   { value: "primary", label: "Primary Patient" },
//   { value: "family", label: "Family Member" },
// ];

// // ==================== SECTION HEADER ====================
// const SectionHeader = ({ icon: Icon, title, subtitle }) => (
//   <div className="mb-4 flex items-start gap-2.5">
//     <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
//       <Icon className="h-4 w-4" />
//     </div>
//     <div>
//       <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
//       {subtitle && <p className="text-[11px] text-ink-500">{subtitle}</p>}
//     </div>
//   </div>
// );

// // ==================== INNER FORM ====================
// const PatientFormInner = ({
//   onClose,
//   isEdit,
//   isPending,
//   relationOptions,
//   primaryPatientOptions,
// }) => {
//   const { values, setFieldValue } = useFormikContext();
//   const isFamily = values.patient_type === "family";

//   return (
//     <Form className="flex flex-col">
//       {/* Patient Type Selector — only for new patient */}
//       {!isEdit && (
//         <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-4 sm:px-6">
//           <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
//             Patient Type
//           </label>
//           <div className="grid grid-cols-2 gap-2">
//             {TYPE_OPTIONS.map((opt) => {
//               const isActive = values.patient_type === opt.value;
//               return (
//                 <button
//                   key={opt.value}
//                   type="button"
//                   onClick={() => setFieldValue("patient_type", opt.value)}
//                   className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-left transition ${
//                     isActive
//                       ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
//                       : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
//                   }`}
//                 >
//                   <div
//                     className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
//                       isActive
//                         ? "border-brand-600 bg-brand-600"
//                         : "border-ink-300"
//                     }`}
//                   >
//                     {isActive && (
//                       <div className="h-1.5 w-1.5 rounded-full bg-white" />
//                     )}
//                   </div>
//                   <div className="min-w-0">
//                     <p
//                       className={`text-xs font-semibold ${
//                         isActive ? "text-brand-800" : "text-ink-700"
//                       }`}
//                     >
//                       {opt.label}
//                     </p>
//                     <p className="text-[10px] text-ink-500">
//                       {opt.value === "primary"
//                         ? "Main patient"
//                         : "Linked to a primary patient"}
//                     </p>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Body */}
//       <div className="space-y-6 px-5 py-6 sm:px-6">
//         {/* ============ BASIC INFORMATION ============ */}
//         <div>
//           <SectionHeader
//             icon={FiUser}
//             title="Basic Information"
//             subtitle="Primary details of the patient"
//           />

//           <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
//             <div className="sm:col-span-2">
//               <TextInput
//                 label="Full Name"
//                 name="name"
//                 placeholder="e.g. Rahul Sharma"
//                 required
//               />
//             </div>

//             <TextInput
//               label="Age"
//               name="age"
//               type="number"
//               placeholder="e.g. 35"
//               required
//             />

//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-form-label">
//                 Sex <span className="text-form-required">*</span>
//               </label>
//               <SelectField
//                 name="sex"
//                 options={SEX_OPTIONS}
//                 placeholder="Select sex..."
//               />
//             </div>

//             <TextInput
//               label="Date of Birth (optional)"
//               name="dob"
//               type="date"
//             />

//             <div className="relative">
//               <TextInput
//                 label={isEdit ? "New PIN (leave blank to keep)" : "PIN"}
//                 name="pin"
//                 type="password"
//                 placeholder="••••"
//                 maxLength={4}
//                 required={!isEdit}
//               />
//             </div>
//           </div>
//         </div>

//         {/* ============ CONTACT INFORMATION ============ */}
//         <div>
//           <SectionHeader
//             icon={FiPhone}
//             title="Contact Information"
//             subtitle="Mobile is required, email is optional"
//           />

//           <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
//             <TextInput
//               label="Mobile Number"
//               name="mobile"
//               placeholder="e.g. 9876543210"
//               required
//             />

//             <TextInput
//               label="Email (optional)"
//               name="email"
//               type="email"
//               placeholder="e.g. rahul@example.com"
//             />
//           </div>
//         </div>

//         {/* ============ ADDRESS ============ */}
//         <div>
//           <SectionHeader
//             icon={FiMapPin}
//             title="Address"
//             subtitle="Optional — residential address"
//           />

//           <TextareaField
//             label="Full Address"
//             name="address"
//             rows={3}
//             placeholder="e.g. 123 Main Street, Indore, Madhya Pradesh"
//           />
//         </div>

//         {/* ============ RELATIONSHIP (Family Member only) ============ */}
//         {isFamily && (
//           <div className="rounded-xl border border-accent-200 bg-accent-50/40 p-4 sm:p-5">
//             <SectionHeader
//               icon={FiUsers}
//               title="Relationship Details"
//               subtitle="Link this patient to a primary patient"
//             />

//             <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
//               <div className="sm:col-span-2">
//                 <SelectField
//                   label="Relation"
//                   name="relation_type_id"
//                   options={relationOptions}
//                   placeholder="Select relation..."
//                   required
//                 />
//               </div>

//               <div className="sm:col-span-2">
//                 <SelectField
//                   label="Primary Patient"
//                   name="linked_primary_patient_id"
//                   options={primaryPatientOptions}
//                   placeholder="Search and select primary patient..."
//                   required
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ============ STATUS ============ */}
//         <div>
//           <SectionHeader
//             icon={FiLock}
//             title="Status"
//             subtitle="Control patient account access"
//           />

//           <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-surface px-4 py-3">
//             <div>
//               <p className="text-[13px] font-medium text-ink-800">
//                 {values.status ? "Active" : "Inactive"}
//               </p>
//               <p className="mt-0.5 text-[11px] text-ink-500">
//                 {values.status
//                   ? "Patient can be booked for appointments"
//                   : "Patient is hidden from booking"}
//               </p>
//             </div>
//             <button
//               type="button"
//               role="switch"
//               aria-checked={values.status}
//               onClick={() => setFieldValue("status", !values.status)}
//               className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
//                 values.status ? "bg-brand-600" : "bg-ink-300"
//               }`}
//             >
//               <span
//                 className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
//                   values.status ? "translate-x-5" : "translate-x-0.5"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Sticky Footer */}
//       <div className="sticky bottom-0 flex justify-end gap-3 border-t border-ink-100 bg-surface px-5 py-4 sm:px-6">
//         <button
//           type="button"
//           onClick={onClose}
//           disabled={isPending}
//           className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           Cancel
//         </button>
//         <div className="w-36">
//           <FormButton
//             type="submit"
//             text={
//               isPending
//                 ? isEdit
//                   ? "Updating..."
//                   : "Creating..."
//                 : isEdit
//                   ? "Update Patient"
//                   : "Create Patient"
//             }
//             disabled={isPending}
//           />
//         </div>
//       </div>
//     </Form>
//   );
// };

// // ==================== MAIN ====================
// const PatientForm = ({ open, onClose, initialData }) => {
//   const isEdit = !!initialData;
//   const createMutation = useCreatePatient();
//   const updateMutation = useUpdatePatient();

//   const { data: relationTypes = [] } = useRelationTypes();
//   const relationOptions = relationTypes.map((r) => ({
//     value: r.id,
//     label: r.label,
//   }));

//   const { data: primaryData } = usePatients({ per_page: 100 });
//   const primaryPatients = (primaryData?.list || []).filter(
//     (p) => !p.linked_primary_patient_id,
//   );
//   const primaryPatientOptions = primaryPatients.map((p) => ({
//     value: p.id,
//     label: `${p.name} — ${p.patient_id || p.id}`,
//   }));

//   if (!open) return null;

//   const isPending = createMutation.isPending || updateMutation.isPending;

//   const isFamilyMemberExisting =
//     isEdit && !!initialData?.linked_primary_patient_id;

//   const initialValues = {
//     patient_type: isFamilyMemberExisting ? "family" : "primary",
//     name: initialData?.name || "",
//     mobile: initialData?.mobile || "",
//     email: initialData?.email || "",
//     age: initialData?.age ?? "",
//     dob: initialData?.dob || "",
//     sex: initialData?.sex
//       ? {
//           value: initialData.sex,
//           label:
//             initialData.sex.charAt(0).toUpperCase() + initialData.sex.slice(1),
//         }
//       : null,
//     address: initialData?.address || "",
//     pin: "",
//     relation_type_id: initialData?.relation_type_id
//       ? {
//           value: initialData.relation_type_id,
//           label: initialData.relation_type?.label || "",
//         }
//       : null,
//     linked_primary_patient_id: initialData?.linked_primary_patient_id
//       ? {
//           value: initialData.linked_primary_patient_id,
//           label: `${initialData.primary_patient?.name || ""} — ${
//             initialData.primary_patient?.patient_id || ""
//           }`,
//         }
//       : null,
//     status: initialData?.status ?? true,
//   };

//   const validationSchema = Yup.object({
//     patient_type: Yup.string().required(),
//     name: Yup.string()
//       .trim()
//       .required("Name is required")
//       .max(150, "Max 150 characters"),
//     mobile: Yup.string()
//       .trim()
//       .required("Mobile number is required")
//       .matches(/^[0-9+\-\s()]*$/, "Invalid mobile number")
//       .max(20, "Max 20 characters"),
//     email: Yup.string().trim().email("Invalid email address").nullable(),
//     age: Yup.number()
//       .typeError("Age must be a number")
//       .required("Age is required")
//       .integer("Must be a whole number")
//       .min(0, "Must be 0 or more")
//       .max(150, "Invalid age"),
//     dob: Yup.string().nullable(),
//     sex: Yup.object().nullable().required("Sex is required"),
//     address: Yup.string().nullable(),
//     pin: isEdit
//       ? Yup.string()
//           .nullable()
//           .test(
//             "pin-format",
//             "PIN must be 4 digits",
//             (v) => !v || /^[0-9]{4}$/.test(v),
//           )
//       : Yup.string()
//           .required("PIN is required")
//           .matches(/^[0-9]{4}$/, "PIN must be exactly 4 digits"),
//     relation_type_id: Yup.object().when("patient_type", {
//       is: "family",
//       then: (schema) => schema.nullable().required("Relation is required"),
//       otherwise: (schema) => schema.nullable(),
//     }),
//     linked_primary_patient_id: Yup.object().when("patient_type", {
//       is: "family",
//       then: (schema) =>
//         schema.nullable().required("Primary patient is required"),
//       otherwise: (schema) => schema.nullable(),
//     }),
//     status: Yup.boolean(),
//   });

//   const handleSubmit = (values) => {
//     const payload = {
//       name: values.name.trim(),
//       mobile: values.mobile.trim(),
//       email: values.email?.trim() || null,
//       age: Number(values.age),
//       dob: values.dob || null,
//       sex: values.sex?.value,
//       address: values.address?.trim() || null,
//       status: values.status,
//     };

//     if (values.pin) payload.pin = values.pin;

//     if (values.patient_type === "family") {
//       payload.relation_type_id = values.relation_type_id?.value;
//       payload.linked_primary_patient_id =
//         values.linked_primary_patient_id?.value;
//     }

//     const mutation = isEdit
//       ? updateMutation.mutateAsync({ id: initialData.id, payload })
//       : createMutation.mutateAsync(payload);

//     mutation.then(() => onClose()).catch(() => {});
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50" onClick={onClose} />

//       <div className="relative z-10 max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
//         {/* Sticky Header */}
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-surface px-5 py-4 sm:px-6">
//           <div>
//             <h2 className="font-jakarta text-lg font-bold text-ink-900">
//               {isEdit ? "Edit Patient" : "Add New Patient"}
//             </h2>
//             <p className="mt-0.5 text-xs text-ink-500">
//               {isEdit
//                 ? "Update patient information"
//                 : "Fill in the patient details below"}
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
//           >
//             <FiX className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Scrollable body */}
//         <div className="max-h-[calc(95vh-73px)] overflow-y-auto">
//           <Formik
//             key={initialData?.id || "new"}
//             initialValues={initialValues}
//             validationSchema={validationSchema}
//             onSubmit={handleSubmit}
//             enableReinitialize
//           >
//             <PatientFormInner
//               onClose={onClose}
//               isEdit={isEdit}
//               isPending={isPending}
//               relationOptions={relationOptions}
//               primaryPatientOptions={primaryPatientOptions}
//             />
//           </Formik>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PatientForm;

import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import {
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiLock,
  FiUsers,
} from "react-icons/fi";
import {
  useCreatePatient,
  useUpdatePatient,
  usePatients,
} from "../../../queries/patients";
import { useRelationTypes } from "../../../queries/relationTypes";
import {
  TextInput,
  TextareaField,
  SelectField,
  FormButton,
  ToggleSwitch,
} from "../../../common/form";

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const TYPE_OPTIONS = [
  { value: "primary", label: "Primary Patient" },
  { value: "family", label: "Family Member" },
];

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-4 flex items-start gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      {subtitle && <p className="text-[11px] text-ink-500">{subtitle}</p>}
    </div>
  </div>
);

const PatientFormInner = ({
  onClose,
  isEdit,
  isPending,
  relationOptions,
  primaryPatientOptions,
}) => {
  const { values, setFieldValue } = useFormikContext();
  const isFamily = values.patient_type === "family";

  return (
    <Form className="flex flex-col">
      {!isEdit && (
        <div className="border-b border-ink-100 bg-ink-50/40 px-5 py-4 sm:px-6">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Patient Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((opt) => {
              const isActive = values.patient_type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFieldValue("patient_type", opt.value)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-left transition ${
                    isActive
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-50"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? "border-brand-600 bg-brand-600"
                        : "border-ink-300"
                    }`}
                  >
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        isActive ? "text-brand-800" : "text-ink-700"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-ink-500">
                      {opt.value === "primary"
                        ? "Main patient"
                        : "Linked to a primary patient"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-6 px-5 py-6 sm:px-6">
        <div>
          <SectionHeader
            icon={FiUser}
            title="Basic Information"
            subtitle="Primary details of the patient"
          />

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextInput
                label="Full Name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>

            <TextInput
              label="Age"
              name="age"
              type="number"
              placeholder="e.g. 35"
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-form-label">
                Sex <span className="text-form-required">*</span>
              </label>
              <SelectField
                name="sex"
                options={SEX_OPTIONS}
                placeholder="Select sex..."
              />
            </div>

            <TextInput
              label="Date of Birth (optional)"
              name="dob"
              type="date"
            />

            <div className="relative">
              <TextInput
                label={isEdit ? "New PIN (leave blank to keep)" : "PIN"}
                name="pin"
                type="password"
                placeholder="••••"
                maxLength={4}
                required={!isEdit}
              />
            </div>
          </div>
        </div>

        <div>
          <SectionHeader
            icon={FiPhone}
            title="Contact Information"
            subtitle="Mobile is required, email is optional"
          />

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <TextInput
              label="Mobile Number"
              name="mobile"
              placeholder="e.g. 9876543210"
              required
            />

            <TextInput
              label="Email (optional)"
              name="email"
              type="email"
              placeholder="e.g. rahul@example.com"
            />
          </div>
        </div>

        <div>
          <SectionHeader
            icon={FiMapPin}
            title="Address"
            subtitle="Optional — residential address"
          />

          <TextareaField
            label="Full Address"
            name="address"
            rows={3}
            placeholder="e.g. 123 Main Street, Indore, Madhya Pradesh"
          />
        </div>

        {isFamily && (
          <div className="rounded-xl border border-accent-200 bg-accent-50/40 p-4 sm:p-5">
            <SectionHeader
              icon={FiUsers}
              title="Relationship Details"
              subtitle="Link this patient to a primary patient"
            />

            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <SelectField
                  label="Relation"
                  name="relation_type_id"
                  options={relationOptions}
                  placeholder="Select relation..."
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <SelectField
                  label="Primary Patient"
                  name="linked_primary_patient_id"
                  options={primaryPatientOptions}
                  placeholder="Search and select primary patient..."
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <SectionHeader
            icon={FiLock}
            title="Status"
            subtitle="Control patient account access"
          />

          <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-surface px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-ink-800">
                {values.status ? "Active" : "Inactive"}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-500">
                {values.status
                  ? "Patient can be booked for appointments"
                  : "Patient is hidden from booking"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values.status}
              onClick={() => setFieldValue("status", !values.status)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
                values.status ? "bg-brand-600" : "bg-ink-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                  values.status ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-ink-100 bg-surface px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <div className="w-36">
          <FormButton
            type="submit"
            text={
              isPending
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Patient"
                  : "Create Patient"
            }
            disabled={isPending}
          />
        </div>
      </div>
    </Form>
  );
};

const PatientForm = ({ open, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const { data: relationTypes = [] } = useRelationTypes();
  const relationOptions = relationTypes.map((r) => ({
    value: r.id,
    label: r.label,
  }));

  const { data: primaryData } = usePatients({ per_page: 100 });
  const primaryPatients = (primaryData?.list || []).filter(
    (p) => !p.linked_primary_patient_id,
  );
  const primaryPatientOptions = primaryPatients.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.patient_id || p.id}`,
  }));

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const isFamilyMemberExisting =
    isEdit && !!initialData?.linked_primary_patient_id;

  const initialValues = {
    patient_type: isFamilyMemberExisting ? "family" : "primary",
    name: initialData?.name || "",
    mobile: initialData?.mobile || "",
    email: initialData?.email || "",
    age: initialData?.age ?? "",
    dob: initialData?.dob || "",
    sex: initialData?.sex
      ? {
          value: initialData.sex,
          label:
            initialData.sex.charAt(0).toUpperCase() + initialData.sex.slice(1),
        }
      : null,
    address: initialData?.address || "",
    pin: "",
    relation_type_id: initialData?.relation_type_id
      ? {
          value: initialData.relation_type_id,
          label: initialData.relation_type?.label || "",
        }
      : null,
    linked_primary_patient_id: initialData?.linked_primary_patient_id
      ? {
          value: initialData.linked_primary_patient_id,
          label: `${initialData.primary_patient?.name || ""} — ${
            initialData.primary_patient?.patient_id || ""
          }`,
        }
      : null,
    status: initialData?.status ?? true,
  };

  const validationSchema = Yup.object({
    patient_type: Yup.string().required(),
    name: Yup.string()
      .trim()
      .required("Name is required")
      .max(150, "Max 150 characters"),
    mobile: Yup.string()
      .trim()
      .required("Mobile number is required")
      .matches(/^[0-9+\-\s()]*$/, "Invalid mobile number")
      .max(20, "Max 20 characters"),
    email: Yup.string().trim().email("Invalid email address").nullable(),
    age: Yup.number()
      .typeError("Age must be a number")
      .required("Age is required")
      .integer("Must be a whole number")
      .min(0, "Must be 0 or more")
      .max(150, "Invalid age"),
    dob: Yup.string().nullable(),
    sex: Yup.object().nullable().required("Sex is required"),
    address: Yup.string().nullable(),
    pin: isEdit
      ? Yup.string()
          .nullable()
          .test(
            "pin-format",
            "PIN must be 4 digits",
            (v) => !v || /^[0-9]{4}$/.test(v),
          )
      : Yup.string()
          .required("PIN is required")
          .matches(/^[0-9]{4}$/, "PIN must be exactly 4 digits"),
    relation_type_id: Yup.object().when("patient_type", {
      is: "family",
      then: (schema) => schema.nullable().required("Relation is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    linked_primary_patient_id: Yup.object().when("patient_type", {
      is: "family",
      then: (schema) =>
        schema.nullable().required("Primary patient is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    status: Yup.boolean(),
  });

  const handleSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      mobile: values.mobile.trim(),
      email: values.email?.trim() || null,
      age: Number(values.age),
      dob: values.dob || null,
      sex: values.sex?.value,
      address: values.address?.trim() || null,
      status: values.status,
    };

    if (values.pin) payload.pin = values.pin;

    if (values.patient_type === "family") {
      payload.relation_type_id = values.relation_type_id?.value;
      payload.linked_primary_patient_id =
        values.linked_primary_patient_id?.value;
    }

    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: initialData.id, payload })
      : createMutation.mutateAsync(payload);

    mutation
      .then((response) => {
        // ✅ NEW: Call onSuccess with the created/updated patient
        if (onSuccess) {
          const patientData =
            response?.data?.data || response?.data || response;
          onSuccess(patientData);
        }
        onClose();
      })
      .catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-surface px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-jakarta text-lg font-bold text-ink-900">
              {isEdit ? "Edit Patient" : "Add New Patient"}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {isEdit
                ? "Update patient information"
                : "Fill in the patient details below"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(95vh-73px)] overflow-y-auto">
          <Formik
            key={initialData?.id || "new"}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            <PatientFormInner
              onClose={onClose}
              isEdit={isEdit}
              isPending={isPending}
              relationOptions={relationOptions}
              primaryPatientOptions={primaryPatientOptions}
            />
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
