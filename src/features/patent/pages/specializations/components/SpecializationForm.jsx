import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
import {
  useCreateSpecialization,
  useUpdateSpecialization,
} from "../../../queries/specializations";
import {
  TextInput,
  TextareaField,
  FormButton,
  ToggleSwitch,
} from "../../../common/form";

const SpecializationForm = ({ open, onClose, initialData }) => {
  const isEdit = !!initialData;
  const createMutation = useCreateSpecialization();
  const updateMutation = useUpdateSpecialization();

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const initialValues = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    status: initialData?.status ?? true,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Specialization name is required")
      .max(150, "Max 150 characters"),
    description: Yup.string().nullable(),
    status: Yup.boolean(),
  });

  const handleSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
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

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-ink-200 bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-jakarta text-lg font-bold text-ink-900">
            {isEdit ? "Edit Specialization" : "Add Specialization"}
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
            <TextInput
              label="Specialization Name"
              name="name"
              placeholder="e.g. Internal Medicine"
              maxLength={150}
              required
            />

            <TextareaField
              label="Description"
              name="description"
              rows={4}
              placeholder="Short description..."
              maxLength={500}
            />

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
        </Formik>
      </div>
    </div>
  );
};

export default SpecializationForm;
