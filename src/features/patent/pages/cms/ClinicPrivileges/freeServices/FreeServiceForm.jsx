// src/features/patent/pages/cms/ClinicPrivileges/freeServices/FreeServiceForm.jsx

import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  FiArrowLeft,
  FiCheck,
  FiLoader,
  FiMail,
  FiPhone,
} from "react-icons/fi";

import {
  useFreeService,
  useCreateFreeService,
  useUpdateFreeService,
  useProviderList,
} from "../../../../queries/clinicPrivileges";
import { useAppointmentTypes } from "../../../../queries/appointmentTypes";
import { TextInput, ToggleSwitch } from "../../../../common/form";
import Loader from "../../../../common/Loader";

const FreeServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const createMutation = useCreateFreeService();
  const updateMutation = useUpdateFreeService();

  // Fetch existing service details for edit
  const { data: serviceData, isLoading: isServiceLoading } = useFreeService(
    isEdit ? id : null,
  );

  // Fetch all providers directly
  const { data: providersData, isLoading: isProvidersLoading } =
    useProviderList();
  const providers = providersData || [];

  // Fetch appointment types only to grab the default ID for backend requirement
  const { data: aptData, isLoading: isAptLoading } = useAppointmentTypes({
    per_page: 100,
    status: 1,
  });
  const defaultAppointmentTypeId = aptData?.list?.[0]?.id || null;

  // Form Initial Values
  const initialValues = {
    title: serviceData?.title || "",
    button_text: serviceData?.button_text || "",
    appointment_type_id:
      serviceData?.appointment_type_id || defaultAppointmentTypeId,
    provider_id: serviceData?.providers?.[0]?.provider_id || null,
    status: serviceData?.status ?? true,
  };

  // Validation
  const validationSchema = Yup.object({
    title: Yup.string()
      .trim()
      .required("Title is required")
      .max(150, "Max 150 characters"),
    button_text: Yup.string().trim().nullable().max(50, "Max 50 characters"),
    appointment_type_id: Yup.number().required(
      "Internal Error: Appointment type missing",
    ),
    provider_id: Yup.number()
      .nullable()
      .required("Provider selection is required"),
    status: Yup.boolean(),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      title: values.title.trim(),
      button_text: values.button_text?.trim() || undefined,
      appointment_type_id: values.appointment_type_id,
      provider_ids: values.provider_id ? [values.provider_id] : [],
      status: values.status,
    };

    if (isEdit) {
      updateMutation
        .mutateAsync({ id, payload })
        .then(() => navigate("/cms/clinical-privileges"))
        .catch(() => setSubmitting(false));
    } else {
      createMutation
        .mutateAsync(payload)
        .then(() => navigate("/cms/clinical-privileges"))
        .catch(() => setSubmitting(false));
    }
  };

  if ((isEdit && isServiceLoading) || isAptLoading) {
    return <Loader text="Loading form details..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cms/clinical-privileges")}
            className="cursor-pointer rounded-lg border border-ink-200 bg-surface p-2 text-ink-600 transition-colors hover:bg-ink-50"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-ink-900">
              {isEdit ? "Edit Clinical Privilege" : "Add Clinical Privilege"}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {isEdit
                ? "Update details for this clinical privilege"
                : "Create a new clinical privilege offering"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-ink-100 bg-surface p-6">
        <Formik
          key={id || "new"}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form className="space-y-6">
              {/* Step 1: Basic Info */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Privilege Information
                </p>
                <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <TextInput
                      label="Privilege Title"
                      name="title"
                      placeholder="Enter privilege title"
                      maxLength={150}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <TextInput
                      label="Button Text (Optional)"
                      name="button_text"
                      placeholder="Enter button text"
                      maxLength={50}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <ToggleSwitch
                      name="status"
                      label="Status"
                      description="Toggle to activate or deactivate this privilege"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Providers (Single Selection) */}
              <div className="border-t border-ink-100 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Assign Provider
                </p>

                {isProvidersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-ink-500 py-3">
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Loading providers...
                  </div>
                ) : providers.length === 0 ? (
                  <div className="text-sm text-ink-500">
                    No providers available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {providers.map((item) => {
                      const pId = item.provider.id;
                      const isSelected = values.provider_id === pId;

                      const selectProvider = () => {
                        setFieldValue("provider_id", isSelected ? null : pId);
                      };

                      return (
                        <div
                          key={pId}
                          onClick={selectProvider}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                            isSelected
                              ? "border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500"
                              : "border-ink-200 bg-surface hover:border-brand-300 hover:bg-ink-50/50"
                          }`}
                        >
                          {/* Radio Button Icon */}
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-brand-600 bg-brand-600 text-surface"
                                : "border-ink-300 bg-surface"
                            }`}
                          >
                            {isSelected && <FiCheck className="h-3 w-3" />}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink-900">
                              {item.provider.name}
                            </p>
                            <p className="truncate text-[11px] font-medium text-brand-600 mb-1">
                              {item.role.label || item.role.name}
                            </p>
                            <div className="flex flex-col gap-1 text-[11px] text-ink-500">
                              {item.provider.email && (
                                <span className="flex items-center gap-1.5 truncate">
                                  <FiMail className="h-3 w-3 shrink-0" />
                                  {item.provider.email}
                                </span>
                              )}
                              {item.provider.phone && (
                                <span className="flex items-center gap-1.5 truncate">
                                  <FiPhone className="h-3 w-3 shrink-0" />
                                  {item.provider.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-end gap-3 border-t border-ink-100 pt-5">
                <button
                  type="button"
                  onClick={() => navigate("/cms/clinical-privileges")}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !values.appointment_type_id ||
                    !values.provider_id
                  }
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-btn-primary-bg px-4 py-2.5 text-sm font-medium text-btn-primary-text transition-colors duration-200 hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {isEdit ? "Update Privilege" : "Create Privilege"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FreeServiceForm;
