import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
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
  RadioGroup,
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

const PatientFormInner = ({
  onClose,
  isEdit,
  isPending,
  relationOptions,
  primaryPatientOptions,
}) => {
  const { values } = useFormikContext();
  const isFamilyMember = values.patient_type === "family";

  return (
    <Form className="px-5 py-5">
      {/* Patient type — only for new patient */}
      {!isEdit && (
        <div className="mb-4 rounded-lg border border-ink-200 bg-ink-50/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Patient Type
          </p>
          <RadioGroup name="patient_type" options={TYPE_OPTIONS} />
        </div>
      )}

      {/* Basic information */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
        Basic Information
      </p>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <TextInput
          label="Full Name"
          name="name"
          placeholder="e.g. Rahul Sharma"
          required
        />

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

        <TextInput
          label="Age"
          name="age"
          type="number"
          placeholder="e.g. 35"
          required
        />

        <TextInput label="Date of Birth (optional)" name="dob" type="date" />

        <div className="sm:col-span-2">
          <SelectField
            label="Sex"
            name="sex"
            options={SEX_OPTIONS}
            placeholder="Select sex..."
            required
          />
        </div>

        <div className="sm:col-span-2">
          <TextareaField
            label="Address (optional)"
            name="address"
            rows={3}
            placeholder="Full address..."
          />
        </div>

        <TextInput
          label="PIN (4 digits)"
          name="pin"
          type="password"
          placeholder="••••"
          maxLength={4}
          required={!isEdit}
        />
        {isEdit && (
          <p className="-mt-3 mb-3 self-end text-[11px] text-ink-500 sm:col-span-1">
            Leave blank to keep current PIN
          </p>
        )}
      </div>

      {/* Relationship — only for family member */}
      {isFamilyMember && (
        <>
          <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Relationship Details
          </p>
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
        </>
      )}

      {/* Status */}
      <div className="mt-4">
        <ToggleSwitch
          name="status"
          label="Status"
          description="Toggle to activate or deactivate this patient"
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <div className="w-40">
          <FormButton
            type="submit"
            text={
              isPending
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update"
                  : "Create"
            }
            disabled={isPending}
          />
        </div>
      </div>
    </Form>
  );
};

const PatientForm = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  // Relation types
  const { data: relationTypes = [] } = useRelationTypes();
  const relationOptions = relationTypes.map((r) => ({
    value: r.id,
    label: r.label,
  }));

  // Primary patients
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

    if (values.pin) {
      payload.pin = values.pin;
    }

    if (values.patient_type === "family") {
      payload.relation_type_id = values.relation_type_id?.value;
      payload.linked_primary_patient_id =
        values.linked_primary_patient_id?.value;
    }

    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: initialData.id, payload })
      : createMutation.mutateAsync(payload);

    mutation.then(() => onClose()).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-surface px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900">
            {isEdit ? "Edit Patient" : "Add Patient"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

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
  );
};

export default PatientForm;
