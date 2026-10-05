import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
import { useCreateRole, useUpdateRole } from "../../../queries/roles";
import {
  TextInput,
  TextareaField,
  FormButton,
  ToggleSwitch,
} from "../../../common/form";

const RoleFormInner = ({ onClose, isEdit, isSystem, isPending }) => {
  const { values } = useFormikContext();

  return (
    <Form className="px-5 py-5">
      <TextInput
        label="Role Name"
        name="name"
        placeholder="e.g. receptionist"
        required
        isDisabled={isSystem}
      />
      <p className="-mt-3 mb-3 text-xs text-form-help">
        Lowercase, underscores allowed (e.g. <code>front_desk</code>)
      </p>

      <TextInput
        label="Display Label"
        name="label"
        placeholder="e.g. Receptionist"
        required
      />

      <TextareaField
        label="Description"
        name="description"
        rows={3}
        placeholder="Short description..."
      />

      <TextInput
        label="Sort Order"
        name="sort_order"
        type="number"
        placeholder="0"
      />

      <ToggleSwitch
        name="status"
        label="Status"
        isDisabled={isSystem}
        description={
          isSystem
            ? "System role — cannot be disabled"
            : values.status
              ? "Active"
              : "Inactive"
        }
      />

      <div className="mt-4 flex justify-end gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <div className="w-32">
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

const RoleForm = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;
  const isSystem = initialData?.is_system === true;

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const initialValues = {
    name: initialData?.name || "",
    label: initialData?.label || "",
    description: initialData?.description || "",
    status: initialData?.status ?? true,
    sort_order: initialData?.sort_order ?? 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Role name is required")
      .max(100, "Max 100 characters")
      .matches(
        /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
        "Only lowercase letters, numbers and underscores allowed",
      ),
    label: Yup.string()
      .trim()
      .required("Label is required")
      .max(150, "Max 150 characters"),
    description: Yup.string().nullable(),
    status: Yup.boolean(),
    sort_order: Yup.number()
      .typeError("Must be a number")
      .integer("Must be an integer")
      .min(0, "Cannot be negative"),
  });

  const handleSubmit = (values) => {
    const payload = {
      label: values.label.trim(),
      description: values.description?.trim() || null,
      sort_order: Number(values.sort_order) || 0,
    };

    if (!isSystem) {
      payload.name = values.name.trim();
      payload.status = values.status;
    }

    const mutation = isEdit
      ? updateMutation.mutateAsync({ id: initialData.id, payload })
      : createMutation.mutateAsync(payload);

    mutation.then(() => onClose()).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-ink-200 bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-jakarta text-lg font-bold text-ink-900">
              {isEdit ? "Edit Role" : "Add Role"}
            </h2>
            {isSystem && (
              <p className="mt-0.5 text-xs text-warn-800">
                System role — name &amp; status cannot be changed
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
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
          <RoleFormInner
            onClose={onClose}
            isEdit={isEdit}
            isSystem={isSystem}
            isPending={isPending}
          />
        </Formik>
      </div>
    </div>
  );
};

export default RoleForm;
