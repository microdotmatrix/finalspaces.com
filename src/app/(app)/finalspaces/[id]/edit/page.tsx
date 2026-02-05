"use client";

import { useAtom, useSetAtom } from "jotai";
import Link from "next/link";
import { Suspense, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { EditTabs } from "@/components/edit/edit-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SaveStatusIndicator } from "@/components/wizard/save-status-indicator";
import { useAutosave } from "@/hooks/use-autosave";
import { useEditLoader } from "@/hooks/use-edit-loader";
import { useUnpublishOnEdit } from "@/hooks/use-unpublish-on-edit";
import { publishFinalSpace } from "@/lib/actions/final-space-actions";
import {
  defaultWizardData,
  draftIdAtom,
  editModeAtom,
  initialDataSnapshotAtom,
  isPublishedAtom,
  wizardDataAtom,
} from "@/lib/stores/wizard-state";

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Icon className="size-8 animate-spin text-primary" icon="mdi:loading" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <div className="flex gap-3">
          <Icon
            className="size-5 flex-shrink-0 text-destructive"
            icon="mdi:alert-circle"
          />
          <div>
            <p className="font-medium text-destructive">
              Error Loading FinalSpace
            </p>
            <p className="mt-1 text-muted-foreground text-sm">{message}</p>
            <Link
              className="mt-4 inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline"
              href="/dashboard"
            >
              <Icon className="size-4" icon="mdi:arrow-left" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditPageContent({ spaceId }: { spaceId: string }) {
  const { isLoading, error, finalSpace } = useEditLoader(spaceId);
  const [isPublished] = useAtom(isPublishedAtom);
  const setEditMode = useSetAtom(editModeAtom);
  const setWizardData = useSetAtom(wizardDataAtom);
  const setDraftId = useSetAtom(draftIdAtom);
  const setInitialDataSnapshot = useSetAtom(initialDataSnapshotAtom);

  const [isPending, startTransition] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);

  // Initialize autosave - reuses existing wizard autosave mechanism
  useAutosave();

  // Handle unpublish on first edit
  useUnpublishOnEdit(spaceId, finalSpace?.status === "published");

  // Cleanup on unmount - reset edit mode and clear state
  useEffect(() => {
    return () => {
      setEditMode(false);
      // Clear the state when leaving edit mode to avoid conflicts with wizard
      setWizardData(defaultWizardData);
      setDraftId(null);
      setInitialDataSnapshot(null);
    };
  }, [setEditMode, setWizardData, setDraftId, setInitialDataSnapshot]);

  const handlePublish = () => {
    setPublishError(null);
    startTransition(async () => {
      try {
        const result = await publishFinalSpace(spaceId);

        if (result.success && result.finalSpace) {
          toast.success("FinalSpace published successfully!", {
            description: "Your memorial is now live and visible to the public.",
            action: {
              label: "View",
              onClick: () => {
                window.open(`/m/${result.finalSpace.slug}`, "_blank");
              },
            },
          });
        } else if ("errors" in result && result.errors) {
          setPublishError(result.errors.join(", "));
        } else {
          setPublishError(result.error || "Failed to publish");
        }
      } catch {
        setPublishError("Something went wrong. Please try again.");
      }
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !finalSpace) {
    return <ErrorState message={error || "FinalSpace not found"} />;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="/dashboard"
              >
                <Icon className="size-5" icon="mdi:arrow-left" />
              </Link>
              <div>
                <h1 className="font-semibold text-lg">Edit FinalSpace</h1>
                <p className="text-muted-foreground text-sm">
                  {finalSpace.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SaveStatusIndicator />
              {finalSpace.status === "published" && isPublished && (
                <Link href={`/m/${finalSpace.slug}`}>
                  <Button size="sm" variant="outline">
                    <Icon className="mr-2 size-4" icon="mdi:eye-outline" />
                    View
                  </Button>
                </Link>
              )}
              {!isPublished && (
                <Button disabled={isPending} onClick={handlePublish} size="sm">
                  {isPending ? (
                    <>
                      <Icon
                        className="mr-2 size-4 animate-spin"
                        icon="mdi:loading"
                      />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Icon
                        className="mr-2 size-4"
                        icon="mdi:rocket-launch-outline"
                      />
                      Publish
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Publish Error */}
      {publishError && (
        <div className="container mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-center gap-2">
              <Icon
                className="size-4 text-destructive"
                icon="mdi:alert-circle"
              />
              <p className="text-destructive text-sm">{publishError}</p>
              <button
                className="ml-auto text-muted-foreground hover:text-foreground"
                onClick={() => setPublishError(null)}
                type="button"
              >
                <Icon className="size-4" icon="mdi:close" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unpublished Notice */}
      {finalSpace.status === "published" && !isPublished && (
        <div className="container mx-auto max-w-4xl px-4 pt-4">
          <Alert>
            <Icon className="size-4" icon="mdi:information" />
            <AlertTitle>Space Unpublished</AlertTitle>
            <AlertDescription>
              This FinalSpace has been unpublished while you make edits. Click
              &quot;Publish&quot; when ready to make it public again.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <EditTabs />
      </main>
    </div>
  );
}

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [spaceId, setSpaceId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSpaceId(p.id));
  }, [params]);

  if (!spaceId) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <EditPageContent spaceId={spaceId} />
    </Suspense>
  );
}
