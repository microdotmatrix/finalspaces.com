"use client";

import { Icon } from "@/components/ui/icon";
import { WIZARD_STEPS } from "@/lib/stores/wizard-state";
import { cn } from "@/lib/utils";

type WizardProgressBarProps = {
  currentStepKey: string;
  onStepClick?: (stepKey: string) => void;
};

export function WizardProgressBar({
  currentStepKey,
  onStepClick,
}: WizardProgressBarProps) {
  const currentStepId =
    WIZARD_STEPS.find((s) => s.key === currentStepKey)?.id || 1;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => (
          <div
            className="flex flex-1 items-center last:flex-none"
            key={step.id}
          >
            <button
              className={cn(
                "flex size-8 items-center justify-center rounded-full font-medium text-sm transition-colors",
                step.id < currentStepId &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                step.id === currentStepId &&
                  "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                step.id > currentStepId &&
                  "bg-muted text-muted-foreground hover:bg-muted/80",
                !onStepClick && "cursor-default"
              )}
              disabled={!onStepClick}
              onClick={() => onStepClick?.(step.key)}
              type="button"
            >
              {step.id < currentStepId ? (
                <Icon className="size-4" icon="mdi:check" />
              ) : (
                step.id
              )}
            </button>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  step.id < currentStepId ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="hidden items-center justify-between text-muted-foreground text-xs sm:flex">
        {WIZARD_STEPS.map((step) => (
          <span className="w-8 truncate text-center" key={step.id}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
