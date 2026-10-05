import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
import {
  useCreateAppointmentType,
  useUpdateAppointmentType,
} from "../../../queries/appointmentTypes";
import { useRoles } from "../../../queries/roles";
import {
  TextInput,
  TextareaField,
  SelectField,
  FormButton,
  ToggleSwitch,
} from "../../../common/form";

// Backend allowed roles (Doc point 3)
const ALLOWED_ROLE_NAMES = ["doctor", "dietitian", "pathologist", "guest"];

const AppointmentTypeForm = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;
  const createMutation = useCreateAppointmentType();
  const updateMutation = useUpdateAppointmentType();

  // Roles dropdown
  const { data: rolesData } = useRoles({ per_page: 100 });
  const allRoles = rolesData?.list || [];

  // Filter only allowed roles
  const allowedRoles = allRoles.filter((r) =>
    ALLOWED_ROLE_NAMES.includes(r.name),
  );

  const roleOptions = allowedRoles.map((r) => ({
    value: r.id,
    label: `${r.label} (${r.name})`,
  }));

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Edit mode ke liye role object nikaalo
  const getRoleObject = () => {
    const roleId = initialData?.role_id || initialData?.role?.id;
    if (!roleId) return null;
    const roleObj = allowedRoles.find((r) => r.id === roleId);
    return roleObj
      ? { value: roleObj.id, label: `${roleObj.label} (${roleObj.name})` }
      : null;
  };

  const initialValues = {
    role_id: getRoleObject(),
    name: initialData?.name || "",
    description: initialData?.description || "",
    duration: initialData?.duration || 15,
    capacity: initialData?.capacity || 1,
    status: initialData?.status ?? true,
  };

  const validationSchema = Yup.object({
    role_id: Yup.object().nullable().required("Role is required"),
    name: Yup.string()
      .trim()
      .required("Appointment type name is required")
      .max(255, "Max 255 characters"),
    description: Yup.string().nullable(),
    duration: Yup.number()
      .typeError("Duration must be a number")
      .required("Duration is required")
      .integer("Must be a whole number")
      .min(1, "Minimum 1 minute"),
    capacity: Yup.number()
      .typeError("Capacity must be a number")
      .required("Capacity is required")
      .integer("Must be a whole number")
      .min(1, "Minimum 1"),
    status: Yup.boolean(),
  });

  const handleSubmit = (values) => {
    const payload = {
      role_id: values.role_id?.value,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      duration: Number(values.duration),
      capacity: Number(values.capacity),
      status: values.status,
    };

    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: initialData.id, payload })
      : createMutation.mutateAsync(payload);

    mutation.then(() => onClose()).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900">
            {isEdit ? "Edit Appointment Type" : "Add Appointment Type"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <Formik
          key={initialData?.id || "new"}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <Form className="px-5 py-5">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              {/* Role */}
              <div className="sm:col-span-2">
                <SelectField
                  label="Provider Role"
                  name="role_id"
                  options={roleOptions}
                  placeholder="Select role..."
                  required
                />
                <p className="-mt-2 mb-3 text-xs text-form-help">
                  Only Doctor, Dietitian, Pathologist & Guest roles allowed
                </p>
              </div>

              {/* Name */}
              <div className="sm:col-span-2">
                <TextInput
                  label="Appointment Type Name"
                  name="name"
                  placeholder="e.g. General Physician Appointment"
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <TextareaField
                  label="Description"
                  name="description"
                  rows={3}
                  placeholder="Short description..."
                />
              </div>

              {/* Duration */}
              <TextInput
                label="Duration (minutes)"
                name="duration"
                type="number"
                placeholder="e.g. 15"
                required
              />

              {/* Capacity */}
              <TextInput
                label="Capacity (patients per slot)"
                name="capacity"
                type="number"
                placeholder="e.g. 1"
                required
              />
            </div>

            <ToggleSwitch
              name="status"
              label="Status"
              description="Toggle to activate or deactivate"
            />

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
        </Formik>
      </div>
    </div>
  );
};

export default AppointmentTypeForm;
