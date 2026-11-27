// // src/features/patent/pages/patients/components/PatientForm.jsx

// import { useParams, useNavigate } from "react-router-dom";
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
//   FiArrowLeft,
// } from "react-icons/fi";
// import {
//   usePatient,
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
//   DatePicker,
//   PhoneInputField,
//   validatePhone,
// } from "../../../common/form";
// import { usePermission } from "../../../hooks/usePermission";
// import Loader from "../../../common/Loader";

// const SEX_OPTIONS = [
//   { value: "male", label: "Male" },
//   { value: "female", label: "Female" },
//   { value: "other", label: "Other" },
// ];

// const TYPE_OPTIONS = [
//   { value: "primary", label: "Primary Patient" },
//   { value: "family", label: "Family Member" },
// ];

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

// const PatientFormInner = ({
//   isEdit,
//   isPending,
//   relationOptions,
//   primaryPatientOptions,
//   onCancel,
// }) => {
//   const { values, setFieldValue } = useFormikContext();
//   const isFamily = values.patient_type === "family";

//   return (
//     <Form className="flex flex-col">
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

//       <div className="space-y-6 px-5 py-6 sm:px-6">
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
//                 placeholder="Enter full name"
//                 maxLength={150}
//                 required
//               />
//             </div>

//             <TextInput
//               label="Age"
//               name="age"
//               type="number"
//               placeholder="Enter age"
//               maxLength={3}
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

//             <DatePicker
//               label="Date of Birth (optional)"
//               name="dob"
//               placeholder="Select date of birth"
//               max={new Date().toISOString().slice(0, 10)}
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

//         <div>
//           <SectionHeader
//             icon={FiPhone}
//             title="Contact Information"
//             subtitle="Mobile is required, email is optional"
//           />

//           <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
//             <PhoneInputField
//               label="Mobile Number"
//               name="mobile"
//               placeholder="Enter phone number"
//               defaultCountry="IN"
//               required
//             />

//             <TextInput
//               label="Email (optional)"
//               name="email"
//               type="email"
//               placeholder="Enter email address"
//               maxLength={150}
//             />
//           </div>
//         </div>

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
//             placeholder="Enter full address"
//             maxLength={500}
//           />
//         </div>

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
//                   placeholder="Search primary patient..."
//                   required
//                 />
//               </div>
//             </div>
//           </div>
//         )}

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

//       <div className="sticky bottom-0 flex justify-end gap-3 border-t border-ink-100 bg-surface px-5 py-4 sm:px-6">
//         <button
//           type="button"
//           onClick={onCancel}
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

// const PatientForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEdit = !!id;

//   const createMutation = useCreatePatient();
//   const updateMutation = useUpdatePatient();
//   const { can, isLoading: permLoading } = usePermission();
//   const canManage = can("patients", "manage");

//   const { data: existing, isLoading: loadingPatient } = usePatient(id);

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

//   if (permLoading) return <Loader text="Checking permissions..." />;
//   if (!canManage) {
//     return (
//       <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
//         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
//           <FiLock className="h-7 w-7" />
//         </div>
//         <h2 className="mt-4 text-lg font-semibold text-ink-900">
//           Access Denied
//         </h2>
//         <p className="mt-1 max-w-md text-sm text-ink-500">
//           You do not have permission to manage patients.
//         </p>
//       </div>
//     );
//   }

//   if (isEdit && loadingPatient) return <Loader text="Loading patient..." />;

//   const isPending = createMutation.isPending || updateMutation.isPending;
//   const initialData = isEdit ? existing : null;
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
//       .required("Mobile number is required")
//       .test("phone", "Invalid mobile number", validatePhone),
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

//     mutation
//       .then(() => {
//         navigate("/patients");
//       })
//       .catch(() => {});
//   };

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center gap-3">
//         <button
//           type="button"
//           onClick={() => navigate("/patients")}
//           className="cursor-pointer rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50"
//         >
//           <FiArrowLeft className="h-4 w-4" />
//         </button>
//         <div>
//           <h1 className="font-jakarta text-2xl font-bold text-ink-900">
//             {isEdit ? "Edit Patient" : "Add New Patient"}
//           </h1>
//           <p className="mt-1 text-sm text-ink-500">
//             {isEdit
//               ? "Update patient information"
//               : "Fill in the patient details below"}
//           </p>
//         </div>
//       </div>

//       <div className="overflow-hidden rounded-xl border border-ink-200 bg-surface">
//         <Formik
//           key={initialData?.id || "new"}
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//           enableReinitialize
//         >
//           <PatientFormInner
//             isEdit={isEdit}
//             isPending={isPending}
//             relationOptions={relationOptions}
//             primaryPatientOptions={primaryPatientOptions}
//             onCancel={() => navigate("/patients")}
//           />
//         </Formik>
//       </div>
//     </div>
//   );
// };

// export default PatientForm;

// src/features/patent/pages/patients/components/PatientForm.jsx

import { useParams, useNavigate } from "react-router-dom";
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
  FiArrowLeft,
} from "react-icons/fi";
import {
  usePatient,
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
  DatePicker,
  PhoneInputField,
  validatePhone,
} from "../../../common/form";
import { usePermission } from "../../../hooks/usePermission";
import Loader from "../../../common/Loader";

// PIN field UI me nahi dikhti, backend ko required hai isliye hamesha ye jayega
const DEFAULT_PIN = "0000";

// API kabhi "9586555666" deta hai, kabhi "+919586555666".
// PhoneInput ko hamesha "+91XXXXXXXXXX" format chahiye, tabhi flag + code dikhta hai.
const normalizeIndianMobile = (mobile) => {
  if (!mobile) return "";
  const raw = String(mobile).trim().replace(/\s/g, "");

  // Pehle se +91 (ya koi aur country code) hai to as-is
  if (raw.startsWith("+")) return raw;

  const digits = raw.replace(/\D/g, "");

  // "919586555666" -> "+919586555666"
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;

  // "09586555666" -> leading 0 hata do
  const national =
    digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;

  return `+91${national}`;
};

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
  isEdit,
  isPending,
  relationOptions,
  primaryPatientOptions,
  onCancel,
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
                  onClick={() => {
                    setFieldValue("patient_type", opt.value);
                    // Family me email nahi hota, switch pe clear kar do
                    if (opt.value === "family") setFieldValue("email", "");
                  }}
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
                placeholder="Enter full name"
                maxLength={150}
                required
              />
            </div>

            <TextInput
              label="Age"
              name="age"
              type="number"
              placeholder="Enter age"
              maxLength={3}
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

            <DatePicker
              label="Date of Birth (optional)"
              name="dob"
              placeholder="Select date of birth"
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </div>

        <div>
          <SectionHeader
            icon={FiPhone}
            title="Contact Information"
            subtitle={
              isFamily
                ? "Mobile number is required"
                : "Mobile is required, email is optional"
            }
          />

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <PhoneInputField
              label="Mobile Number"
              name="mobile"
              placeholder="Enter phone number"
              defaultCountry="IN"
              required
            />

            {/* Family member ke liye email field nahi dikhegi */}
            {!isFamily && (
              <TextInput
                label="Email (optional)"
                name="email"
                type="email"
                placeholder="Enter email address"
                maxLength={150}
              />
            )}
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
            placeholder="Enter full address"
            maxLength={500}
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
                  placeholder="Search primary patient..."
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
          onClick={onCancel}
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

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const { can, isLoading: permLoading } = usePermission();
  const canManage = can("patients", "manage");

  const { data: existing, isLoading: loadingPatient } = usePatient(id);

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

  if (permLoading) return <Loader text="Checking permissions..." />;
  if (!canManage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <FiLock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">
          Access Denied
        </h2>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          You do not have permission to manage patients.
        </p>
      </div>
    );
  }

  if (isEdit && loadingPatient) return <Loader text="Loading patient..." />;

  const isPending = createMutation.isPending || updateMutation.isPending;
  const initialData = isEdit ? existing : null;
  const isFamilyMemberExisting =
    isEdit && !!initialData?.linked_primary_patient_id;

  const initialValues = {
    patient_type: isFamilyMemberExisting ? "family" : "primary",
    name: initialData?.name || "",
    // Edit me "9586555666" -> "+919586555666" taki flag + +91 dikhe
    mobile: normalizeIndianMobile(initialData?.mobile),
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
      .required("Mobile number is required")
      .test("phone", "Invalid mobile number", validatePhone),
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
    const isFamily = values.patient_type === "family";

    const payload = {
      name: values.name.trim(),
      mobile: values.mobile.trim(),
      // Family member ke liye email hamesha null
      email: isFamily ? null : values.email?.trim() || null,
      age: Number(values.age),
      dob: values.dob || null,
      sex: values.sex?.value,
      address: values.address?.trim() || null,
      status: values.status,
      // PIN UI me nahi hai, add + edit dono me 0000 jayega
      pin: DEFAULT_PIN,
    };

    if (isFamily) {
      payload.relation_type_id = values.relation_type_id?.value;
      payload.linked_primary_patient_id =
        values.linked_primary_patient_id?.value;
    }

    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: initialData.id, payload })
      : createMutation.mutateAsync(payload);

    mutation
      .then(() => {
        navigate("/patients");
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="cursor-pointer rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50"
        >
          <FiArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-ink-900">
            {isEdit ? "Edit Patient" : "Add New Patient"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isEdit
              ? "Update patient information"
              : "Fill in the patient details below"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-surface">
        <Formik
          key={initialData?.id || "new"}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <PatientFormInner
            isEdit={isEdit}
            isPending={isPending}
            relationOptions={relationOptions}
            primaryPatientOptions={primaryPatientOptions}
            onCancel={() => navigate("/patients")}
          />
        </Formik>
      </div>
    </div>
  );
};

export default PatientForm;
