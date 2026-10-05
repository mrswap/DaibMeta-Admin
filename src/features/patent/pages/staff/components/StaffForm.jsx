import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
import { useCreateStaff, useUpdateStaff } from "../../../queries/staff";
import { useRoles } from "../../../queries/roles";
import { useActiveSpecializations } from "../../../queries/specializations";
import {
  TextInput,
  SelectField,
  MultiSelectField,
  FormButton,
  ToggleSwitch,
} from "../../../common/form";

const StaffForm = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();

  // Roles dropdown
  const { data: rolesData } = useRoles({ per_page: 100 });
  const roles = rolesData?.list || [];

  // Specializations dropdown (only active)
  const { data: specializationsData } = useActiveSpecializations();
  const specializations = specializationsData || [];

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: `${r.label} (${r.name})`,
  }));

  const specializationOptions = specializations.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Edit mode: role object
  const getRoleObject = () => {
    const roleId = initialData?.role_id || initialData?.role?.id;
    if (!roleId) return null;
    const roleObj = roles.find((r) => r.id === roleId);
    return roleObj
      ? { value: roleObj.id, label: `${roleObj.label} (${roleObj.name})` }
      : null;
  };

  // Edit mode: specializations array of objects
  const getSpecializationObjects = () => {
    if (
      !initialData?.specializations ||
      !Array.isArray(initialData.specializations)
    )
      return [];
    return initialData.specializations.map((s) => ({
      value: s.id,
      label: s.name,
    }));
  };

  const initialValues = {
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    password: "",
    password_confirmation: "",
    role_id: getRoleObject(),
    specializations: getSpecializationObjects(),
    status: initialData?.status ?? true,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Name is required")
      .max(150, "Max 150 characters"),
    email: Yup.string()
      .trim()
      .email("Invalid email address")
      .required("Email is required")
      .max(150, "Max 150 characters"),
    phone: Yup.string()
      .trim()
      .required("Phone is required")
      .matches(/^[0-9+\-\s()]*$/, "Invalid phone number")
      .max(20, "Max 20 characters"),
    password: isEdit
      ? Yup.string().nullable().min(8, "Min 8 characters")
      : Yup.string()
          .required("Password is required")
          .min(8, "Min 8 characters"),
    password_confirmation: isEdit
      ? Yup.string()
          .nullable()
          .oneOf([Yup.ref("password")], "Passwords must match")
      : Yup.string()
          .required("Confirm password is required")
          .oneOf([Yup.ref("password")], "Passwords must match"),
    role_id: Yup.object().nullable().required("Role is required"),
    specializations: Yup.array().nullable(),
    status: Yup.boolean(),
  });

  const handleSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role_id: values.role_id?.value,
      status: values.status,
      specializations: (values.specializations || []).map((s) => s.value),
    };

    // Password only if provided (edit mode mein optional)
    if (values.password) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

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
            {isEdit ? "Edit Staff" : "Add Staff"}
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
          <Form className="px-5 py-5">
            {/* Basic Information */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Basic Information
            </p>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextInput
                  label="Full Name"
                  name="name"
                  placeholder="e.g. Dr. Rakesh Gupta"
                  required
                />
              </div>

              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="staff@example.com"
                required
              />

              <TextInput
                label="Phone"
                name="phone"
                placeholder="+91 98765 43210"
                required
              />

              <div className="sm:col-span-2">
                <SelectField
                  label="Role"
                  name="role_id"
                  options={roleOptions}
                  placeholder="Select role..."
                  required
                />
              </div>

              <TextInput
                label={
                  isEdit ? "New Password (leave blank to keep)" : "Password"
                }
                name="password"
                type="password"
                placeholder={isEdit ? "Leave blank" : "Min 8 characters"}
                required={!isEdit}
              />

              <TextInput
                label="Confirm Password"
                name="password_confirmation"
                type="password"
                placeholder="Re-enter password"
                required={!isEdit}
              />
            </div>

            {/* Specializations */}
            <p className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Specializations (Optional)
            </p>
            <MultiSelectField
              label="Assigned Specializations"
              name="specializations"
              options={specializationOptions}
              placeholder="Select specializations..."
            />
            <p className="-mt-3 mb-4 text-xs text-form-help">
              Optional — any staff member can have 0, 1 or multiple
              specializations
            </p>

            {/* Status */}
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

export default StaffForm;
