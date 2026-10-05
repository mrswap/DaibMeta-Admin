import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUser, FiCalendar, FiClock, FiEye } from "react-icons/fi";
import WizardStepper from "./components/WizardStepper";
import Step1Provider from "./components/Step1Provider";
import Step2AppointmentType from "./components/Step2AppointmentType";
import Step3Schedule from "./components/Step3Schedule";
import Step4Preview from "./components/Step4Preview";
import {
  useCreateAvailability,
  useUpdateAvailability,
  useProviderAvailability,
} from "../../queries/providerAvailabilities";
import { useRoles } from "../../queries/roles";
import Loader from "../../common/Loader";

const STEPS = [
  { label: "Provider", icon: FiUser },
  { label: "Appointment Type", icon: FiCalendar },
  { label: "Schedule", icon: FiClock },
  { label: "Preview", icon: FiEye },
];

const AvailabilityWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: existingData, isLoading: loadingExisting } =
    useProviderAvailability(id);

  const { data: rolesData } = useRoles({ per_page: 100 });
  const roles = rolesData?.list || [];

  const [currentStep, setCurrentStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [previewData, setPreviewData] = useState(null);
  const [prefilled, setPrefilled] = useState(!isEdit);

  // Store the selected appointment type's default values separately
  // so Step3 can enforce limits
  const [appointmentTypeDefaults, setAppointmentTypeDefaults] = useState({
    slot_duration: null,
    capacity: null,
  });

  const [formData, setFormData] = useState({
    role_id: null,
    provider_id: null,
    appointment_type_id: null,
    date_from: "",
    date_to: "",
    days_of_week: [1, 2, 3, 4, 5, 6],
    start_time: "10:00",
    end_time: "14:00",
    slot_duration: 15,
    capacity: 1,
  });

  const createMutation = useCreateAvailability();
  const updateMutation = useUpdateAvailability();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Prefill form when editing
  useEffect(() => {
    if (!isEdit) return;
    if (!existingData) return;
    if (roles.length === 0) return;
    if (prefilled) return;

    const providerRole = existingData.provider?.role;
    const roleObj = roles.find((r) => r.name === providerRole);

    setFormData({
      role_id: roleObj ? { value: roleObj.id, label: roleObj.label } : null,
      provider_id: existingData.provider
        ? {
            value: existingData.provider.id,
            label: `${existingData.provider.name} — ${existingData.provider.role_label || ""}`,
          }
        : null,
      appointment_type_id: existingData.appointment_type
        ? {
            value: existingData.appointment_type.id,
            label: `${existingData.appointment_type.name} — ${existingData.appointment_type.duration} min`,
          }
        : null,
      date_from: existingData.date_from || "",
      date_to: existingData.date_to || "",
      days_of_week: existingData.days_of_week || [1, 2, 3, 4, 5, 6],
      start_time: existingData.start_time?.slice(0, 5) || "10:00",
      end_time: existingData.end_time?.slice(0, 5) || "14:00",
      slot_duration: existingData.slot_duration || 15,
      capacity: existingData.capacity || 1,
    });

    // In edit mode — all steps reachable
    setMaxReached(4);
    setPrefilled(true);
  }, [isEdit, existingData, roles, prefilled]);

  const handleNext = () => {
    const next = Math.min(4, currentStep + 1);
    setCurrentStep(next);
    setMaxReached((m) => Math.max(m, next));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleStepClick = (stepNum) => {
    // Allow jumping to any step <= maxReached
    if (stepNum <= maxReached && stepNum !== currentStep) {
      setCurrentStep(stepNum);
    }
  };

  const handleClose = () => navigate("/provider-availabilities");

  const handleSave = (payload) => {
    const mutation = isEdit
      ? updateMutation.mutateAsync({ id, payload })
      : createMutation.mutateAsync(payload);

    mutation.then(() => navigate("/provider-availabilities"));
  };

  if (isEdit && (loadingExisting || !prefilled)) {
    return <Loader text="Loading availability..." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            {isEdit ? "Edit Availability" : "Set Availability"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Configure provider schedule and generate dynamic slots
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="cursor-pointer rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          Cancel
        </button>
      </div>

      <div className="rounded-xl border border-ink-100 bg-surface p-4">
        <WizardStepper
          steps={STEPS}
          current={currentStep}
          onStepClick={handleStepClick}
          maxReached={maxReached}
        />
      </div>

      <div className="rounded-xl border border-ink-100 bg-surface p-5 sm:p-6">
        {currentStep === 1 && (
          <Step1Provider
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            isEdit={isEdit}
          />
        )}

        {currentStep === 2 && (
          <Step2AppointmentType
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            setAppointmentTypeDefaults={setAppointmentTypeDefaults}
          />
        )}

        {currentStep === 3 && (
          <Step3Schedule
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            appointmentTypeDefaults={appointmentTypeDefaults}
          />
        )}

        {currentStep === 4 && (
          <Step4Preview
            formData={formData}
            previewData={previewData}
            setPreviewData={setPreviewData}
            onBack={handleBack}
            onSave={handleSave}
            isSaving={isSaving}
            isEdit={isEdit}
          />
        )}
      </div>
    </div>
  );
};

export default AvailabilityWizard;
