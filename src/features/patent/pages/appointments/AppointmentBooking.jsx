import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import WizardStepper from "../providerAvailability/components/WizardStepper";
import Step1Patient from "./components/Step1Patient";
import Step2Provider from "./components/Step2Provider";
import Step3DateSlots from "./components/Step3DateSlots";
import Step4Confirm from "./components/Step4Confirm";
import { useCreateAppointment } from "../../queries/appointments";

const STEPS = [
  { label: "Patient", icon: FiUser },
  { label: "Provider & Type", icon: FiCalendar },
  { label: "Date & Slot", icon: FiClock },
  { label: "Confirm", icon: FiCheck },
];

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAppointment();

  const [currentStep, setCurrentStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);

  const [formData, setFormData] = useState({
    // Patient
    patient_type: "existing", // "existing" | "new"
    patient_id: null,
    name: "",
    mobile: "",
    // Provider
    provider_id: null,
    appointment_type_id: null,
    // Slot
    appointment_date: "",
    selected_slot: null, // { start_time, end_time }
    // Meta
    booking_source: "reception",
    notes: "",
  });

  const handleNext = () => {
    const next = Math.min(4, currentStep + 1);
    setCurrentStep(next);
    setMaxReached((m) => Math.max(m, next));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleStepClick = (stepNum) => {
    if (stepNum <= maxReached && stepNum !== currentStep) {
      setCurrentStep(stepNum);
    }
  };

  const handleClose = () => navigate("/appointments");

  const handleSave = (payload) => {
    createMutation.mutate(payload, {
      onSuccess: (response) => {
        navigate(`/appointments/${response.data.id}`);
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <button
            onClick={handleClose}
            className="mb-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-500 hover:text-ink-700"
          >
            ← Back to Appointments
          </button>
          <h1 className="font-jakarta text-xl font-bold text-ink-900 sm:text-2xl">
            Book Appointment
          </h1>
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            Select patient, provider, appointment type, and available slot
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

      {/* Stepper */}
      <div className="rounded-xl border border-ink-100 bg-surface p-4">
        <WizardStepper
          steps={STEPS}
          current={currentStep}
          onStepClick={handleStepClick}
          maxReached={maxReached}
        />
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-ink-100 bg-surface p-5 sm:p-6">
        {currentStep === 1 && (
          <Step1Patient
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2Provider
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <Step3DateSlots
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <Step4Confirm
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onSave={handleSave}
            isSaving={createMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
