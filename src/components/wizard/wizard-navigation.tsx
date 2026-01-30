"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type WizardNavigationProps = {
  canGoPrev: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function WizardNavigation({
  canGoPrev,
  canGoNext,
  isLastStep,
  onPrev,
  onNext,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t pt-6">
      <Button disabled={!canGoPrev} onClick={onPrev} variant="outline">
        <Icon className="mr-2 size-4" icon="mdi:arrow-left" />
        Previous
      </Button>

      {isLastStep ? (
        <Button disabled>
          <Icon className="mr-2 size-4" icon="mdi:rocket-launch-outline" />
          Publish
        </Button>
      ) : (
        <Button disabled={!canGoNext} onClick={onNext}>
          Next
          <Icon className="ml-2 size-4" icon="mdi:arrow-right" />
        </Button>
      )}
    </div>
  );
}
