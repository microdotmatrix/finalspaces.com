"use client";

import { useAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

import { Icon } from "@/components/ui/icon";
import { SaveStatusIndicator } from "@/components/wizard/save-status-indicator";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { WizardProgressBar } from "@/components/wizard/wizard-progress-bar";
import { AlbumsStep } from "@/components/wizard-steps/albums-step";
import { BioStep } from "@/components/wizard-steps/bio-step";
import { DatesStep } from "@/components/wizard-steps/dates-step";
import { IdentityStep } from "@/components/wizard-steps/identity-step";
import { LocationsStep } from "@/components/wizard-steps/locations-step";
import { PhotosStep } from "@/components/wizard-steps/photos-step";
import { ReviewStep } from "@/components/wizard-steps/review-step";
import { SocialStep } from "@/components/wizard-steps/social-step";
import { TimelineStep } from "@/components/wizard-steps/timeline-step";
import { useAutosave } from "@/hooks/use-autosave";
import { currentStepAtom, WIZARD_STEPS } from "@/lib/stores/wizard-state";

const STEP_COMPONENTS = {
  identity: IdentityStep,
  dates: DatesStep,
  locations: LocationsStep,
  bio: BioStep,
  photos: PhotosStep,
  albums: AlbumsStep,
  timeline: TimelineStep,
  social: SocialStep,
  review: ReviewStep,
} as const;

type StepKey = keyof typeof STEP_COMPONENTS;

function WizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, setCurrentStep] = useAtom(currentStepAtom);

  // Initialize autosave
  useAutosave();

  // Get current step from URL, default to first step
  const currentStepKey = (searchParams.get("step") || "identity") as StepKey;
  const currentStepIndex = WIZARD_STEPS.findIndex(
    (s) => s.key === currentStepKey
  );
  const validStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const currentStep = WIZARD_STEPS[validStepIndex];

  // Navigation handlers
  const navigateToStep = useCallback(
    (stepKey: string) => {
      const step = WIZARD_STEPS.find((s) => s.key === stepKey);
      if (step) {
        setCurrentStep(step.id);
        router.push(`/finalspaces/new?step=${stepKey}`);
      }
    },
    [router, setCurrentStep]
  );

  const handlePrev = useCallback(() => {
    if (validStepIndex > 0) {
      navigateToStep(WIZARD_STEPS[validStepIndex - 1].key);
    }
  }, [validStepIndex, navigateToStep]);

  const handleNext = useCallback(() => {
    if (validStepIndex < WIZARD_STEPS.length - 1) {
      navigateToStep(WIZARD_STEPS[validStepIndex + 1].key);
    }
  }, [validStepIndex, navigateToStep]);

  // Render current step component
  const StepComponent =
    STEP_COMPONENTS[currentStep.key as StepKey] || IdentityStep;
  const isReviewStep = currentStep.key === "review";

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="/dashboard"
              >
                <Icon className="size-5" icon="mdi:arrow-left" />
              </Link>
              <h1 className="font-semibold text-lg">Create FinalSpace</h1>
            </div>
            <SaveStatusIndicator />
          </div>
          <WizardProgressBar
            currentStepKey={currentStep.key}
            onStepClick={navigateToStep}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            initial={{ opacity: 0, x: 20 }}
            key={currentStep.key}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {isReviewStep ? (
              <ReviewStep onNavigateToStep={navigateToStep} />
            ) : (
              <StepComponent />
            )}
          </motion.div>
        </AnimatePresence>
        <WizardNavigation
          canGoNext={validStepIndex < WIZARD_STEPS.length - 1}
          canGoPrev={validStepIndex > 0}
          isLastStep={validStepIndex === WIZARD_STEPS.length - 1}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </main>
    </div>
  );
}

function WizardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Icon className="size-8 animate-spin text-primary" icon="mdi:loading" />
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<WizardFallback />}>
      <WizardContent />
    </Suspense>
  );
}
