"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { publishFinalSpace } from "@/lib/actions/final-space-actions";
import {
  currentStepAtom,
  defaultWizardData,
  draftIdAtom,
  wizardDataAtom,
} from "@/lib/stores/wizard-state";
import { publishReadySchema } from "@/lib/validation/final-space";

type ReviewStepProps = {
  onNavigateToStep?: (stepKey: string) => void;
};

export function ReviewStep({ onNavigateToStep }: ReviewStepProps) {
  const [wizardData, setWizardData] = useAtom(wizardDataAtom);
  const [draftId, setDraftId] = useAtom(draftIdAtom);
  const [, setCurrentStep] = useAtom(currentStepAtom);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Validate readiness
  const validation = publishReadySchema.safeParse(wizardData);
  const isReady = validation.success;

  const handlePublish = () => {
    if (!draftId) {
      setError("No draft found. Please fill in the Identity step first.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await publishFinalSpace(draftId);

        if (result.success && result.finalSpace) {
          // Clear wizard state
          setWizardData(defaultWizardData);
          setDraftId(null);
          setCurrentStep(1);

          // Redirect to the published memorial
          router.push(`/m/${result.finalSpace.slug}`);
        } else {
          setError(result.error || "Failed to publish. Please try again.");
        }
      } catch (err) {
        console.error("Publish error:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  };

  const stepKeys = [
    "identity",
    "dates",
    "locations",
    "bio",
    "photos",
    "albums",
    "timeline",
    "social",
    "review",
  ];

  const handleEditClick = (stepIndex: number) => {
    if (onNavigateToStep) {
      onNavigateToStep(stepKeys[stepIndex]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Review &amp; Publish</h2>
        <p className="text-muted-foreground">
          Review the memorial details before publishing.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        {/* Identity */}
        <ReviewSection
          icon="mdi:account"
          onEdit={() => handleEditClick(0)}
          title="Identity"
        >
          <p className="font-medium">{wizardData.name || "—"}</p>
          {wizardData.firstName && (
            <p className="text-muted-foreground text-sm">
              {[
                wizardData.firstName,
                wizardData.middleName,
                wizardData.lastName,
                wizardData.suffix,
              ]
                .filter(Boolean)
                .join(" ")}
            </p>
          )}
          {wizardData.nickname && (
            <p className="text-muted-foreground text-sm">
              &quot;{wizardData.nickname}&quot;
              {wizardData.useNicknameOnly && " (displayed instead of name)"}
            </p>
          )}
        </ReviewSection>

        {/* Dates */}
        <ReviewSection
          icon="mdi:calendar"
          onEdit={() => handleEditClick(1)}
          title="Dates"
        >
          {wizardData.birthDate || wizardData.deathDate ? (
            <>
              {wizardData.birthDate && <p>Born: {wizardData.birthDate}</p>}
              {wizardData.deathDate && <p>Passed: {wizardData.deathDate}</p>}
              {wizardData.inMemoriam && (
                <span className="mt-1 inline-block rounded-full bg-black/80 px-3 py-0.5 text-white text-xs">
                  In Loving Memory
                </span>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">No dates added</p>
          )}
        </ReviewSection>

        {/* Locations */}
        <ReviewSection
          icon="mdi:map-marker"
          onEdit={() => handleEditClick(2)}
          title="Locations"
        >
          {wizardData.placeOfBirth || wizardData.hometown ? (
            <>
              {wizardData.placeOfBirth && (
                <p>Born in: {wizardData.placeOfBirth}</p>
              )}
              {wizardData.hometown && <p>Hometown: {wizardData.hometown}</p>}
            </>
          ) : (
            <p className="text-muted-foreground">No locations added</p>
          )}
        </ReviewSection>

        {/* Bio */}
        <ReviewSection
          icon="mdi:text-box"
          onEdit={() => handleEditClick(3)}
          title="Biography"
        >
          {wizardData.bioText ? (
            <p className="line-clamp-3">{wizardData.bioText}</p>
          ) : (
            <p className="text-muted-foreground">No biography added</p>
          )}
          {wizardData.quotesJson.length > 0 && (
            <p className="mt-1 text-muted-foreground text-sm">
              {wizardData.quotesJson.length} quote(s) added
            </p>
          )}
        </ReviewSection>

        {/* Social */}
        <ReviewSection
          icon="mdi:link-variant"
          onEdit={() => handleEditClick(7)}
          title="Social & Media"
        >
          <div className="flex flex-wrap gap-2 text-sm">
            {wizardData.youtubeLinks.length > 0 && (
              <span className="flex items-center gap-1">
                <Icon className="size-4 text-red-500" icon="mdi:youtube" />
                {wizardData.youtubeLinks.length} video(s)
              </span>
            )}
            {wizardData.spotifyLinks.length > 0 && (
              <span className="flex items-center gap-1">
                <Icon className="size-4 text-green-500" icon="mdi:spotify" />
                {wizardData.spotifyLinks.length} track(s)
              </span>
            )}
            {Object.values(wizardData.socialLinks).filter(Boolean).length >
              0 && (
              <span className="flex items-center gap-1">
                <Icon className="size-4" icon="mdi:account-group" />
                {Object.values(wizardData.socialLinks).filter(Boolean).length}{" "}
                profile(s)
              </span>
            )}
            {wizardData.youtubeLinks.length === 0 &&
              wizardData.spotifyLinks.length === 0 &&
              Object.values(wizardData.socialLinks).filter(Boolean).length ===
                0 && (
                <p className="text-muted-foreground">No social links added</p>
              )}
          </div>
        </ReviewSection>
      </div>

      {/* Validation Errors */}
      {!isReady && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
          <div className="flex gap-3">
            <Icon
              className="size-5 flex-shrink-0 text-red-500"
              icon="mdi:alert-circle"
            />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                Cannot publish yet
              </p>
              <ul className="mt-1 ml-4 list-disc text-red-600 text-sm dark:text-red-300">
                {!validation.success &&
                  validation.error.issues.map((err, i) => (
                    <li key={i}>{err.message}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error from publish */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
          <div className="flex gap-3">
            <Icon
              className="size-5 flex-shrink-0 text-red-500"
              icon="mdi:alert-circle"
            />
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Publish Button */}
      <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6 text-center">
        <Icon
          className="mx-auto mb-3 size-10 text-primary"
          icon="mdi:rocket-launch-outline"
        />
        <h3 className="mb-2 font-semibold text-lg">Ready to Publish?</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Once published, this memorial will be visible at its unique URL.
        </p>
        <Button
          disabled={!isReady || isPending || !draftId}
          onClick={handlePublish}
          size="lg"
        >
          {isPending ? (
            <>
              <Icon className="mr-2 size-4 animate-spin" icon="mdi:loading" />
              Publishing...
            </>
          ) : (
            <>
              <Icon className="mr-2 size-4" icon="mdi:rocket-launch" />
              Publish FinalSpace
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-muted-foreground" icon={icon} />
          <h3 className="font-medium">{title}</h3>
        </div>
        {onEdit && (
          <button
            className="text-primary text-sm hover:underline"
            onClick={onEdit}
            type="button"
          >
            Edit
          </button>
        )}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
