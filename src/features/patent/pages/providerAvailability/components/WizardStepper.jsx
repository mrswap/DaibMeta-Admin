import { FiCheck } from "react-icons/fi";

const WizardStepper = ({ steps = [], current = 1, onStepClick }) => {
  const isClickable = typeof onStepClick === "function";

  return (
    <div className="flex items-center">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < current;
        const isActive = stepNum === current;
        const isLast = idx === steps.length - 1;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => isClickable && onStepClick(stepNum)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1.5 ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "border-brand-600 bg-brand-600 text-surface"
                    : isActive
                      ? "border-brand-600 bg-surface text-brand-700"
                      : "border-ink-200 bg-surface text-ink-400"
                } ${isClickable && !isActive ? "hover:border-brand-400" : ""}`}
              >
                {isCompleted ? (
                  <FiCheck className="h-4 w-4" />
                ) : Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`whitespace-nowrap text-[11px] font-medium sm:text-xs ${
                  isActive
                    ? "text-brand-700"
                    : isCompleted
                      ? "text-ink-700"
                      : "text-ink-400"
                }`}
              >
                {step.label}
              </span>
            </button>

            {!isLast && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors sm:mx-4 ${
                  isCompleted ? "bg-brand-600" : "bg-ink-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WizardStepper;
