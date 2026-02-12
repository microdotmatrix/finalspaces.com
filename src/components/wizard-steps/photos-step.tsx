"use client";

import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

import { HeaderCarouselEditor } from "@/components/albums/header-carousel-editor";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  deleteMediaAsset,
  getMediaAsset,
  setProfilePicture,
} from "@/lib/actions/media-actions";
import {
  draftIdAtom,
  saveStatusAtom,
  wizardDataAtom,
} from "@/lib/stores/wizard-state";

type UploadedFile = {
  id: string;
  url: string;
  key: string;
  name: string;
};

export function PhotosStep() {
  const draftId = useAtomValue(draftIdAtom);
  const [wizardData, setWizardData] = useAtom(wizardDataAtom);
  const [, setSaveStatus] = useAtom(saveStatusAtom);
  const [isPending, startTransition] = useTransition();

  // Profile picture state
  const [profilePicture, setProfilePictureState] =
    useState<UploadedFile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    const profilePictureId = wizardData.profilePictureId;

    if (!profilePictureId) {
      setProfilePictureState(null);
      return;
    }

    let isCancelled = false;

    const loadProfilePicture = async () => {
      setIsLoadingProfile(true);
      try {
        const media = await getMediaAsset(profilePictureId);
        if (media && !isCancelled) {
          setProfilePictureState({
            id: media.id,
            url: `https://utfs.io/f/${media.storageKey}`,
            key: media.storageKey,
            name: media.originalName,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load profile picture:", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfilePicture();

    return () => {
      isCancelled = true;
    };
  }, [wizardData.profilePictureId]);

  const handleProfileUpload = (files: UploadedFile[]) => {
    if (!draftId || files.length === 0) {
      return;
    }

    const file = files[0];
    setProfilePictureState(file);

    // Update wizard data
    setWizardData((prev) => ({
      ...prev,
      profilePictureId: file.id,
    }));

    // Save to database
    startTransition(async () => {
      setSaveStatus("saving");
      try {
        await setProfilePicture(draftId, file.id);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    });
  };

  const handleProfileRemove = () => {
    if (!(draftId && profilePicture)) {
      return;
    }

    const mediaId = profilePicture.id;
    setProfilePictureState(null);

    // Update wizard data
    setWizardData((prev) => ({
      ...prev,
      profilePictureId: null,
    }));

    // Delete from database
    startTransition(async () => {
      setSaveStatus("saving");
      try {
        await setProfilePicture(draftId, null);
        await deleteMediaAsset(mediaId);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    });
  };

  if (!draftId) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-bold text-2xl">Photos</h2>
          <p className="text-muted-foreground">
            Add a profile picture and header images.
          </p>
        </div>
        <div className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex gap-3">
            <Icon className="size-5 flex-shrink-0" icon="mdi:alert" />
            <div>
              <p className="font-medium">No draft found</p>
              <p className="text-sm">
                Please start from the Identity step to create a new FinalSpace.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Photos</h2>
        <p className="text-muted-foreground">
          Add a profile picture and header images.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Picture Section */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 font-semibold text-lg">Profile Picture</h3>
            <p className="text-muted-foreground text-sm">
              This photo will be prominently displayed on the memorial page.
            </p>
          </div>

          {isLoadingProfile ? (
            <div className="size-32 animate-pulse rounded-full bg-muted" />
          ) : profilePicture ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative size-64 overflow-hidden rounded-full border-4 border-border bg-muted shadow-lg">
                <Image
                  alt="Profile"
                  className="object-cover"
                  fill
                  src={profilePicture.url}
                />
              </div>
              <div className="pt-4">
                <Button
                  disabled={isPending}
                  onClick={handleProfileRemove}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Icon className="mr-2 size-4" icon="mdi:delete" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <ImageUploader
              className="inline-flex items-center justify-center"
              endpoint="profileImage"
              finalSpaceId={draftId}
              maxFiles={1}
              onUploadComplete={handleProfileUpload}
              variant="avatar"
            />
          )}
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Header Carousel Section */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 font-semibold text-lg">Header Carousel</h3>
            <p className="text-muted-foreground text-sm">
              Add up to 5 images that will display in a carousel at the top of
              the memorial page.
            </p>
          </div>

          <HeaderCarouselEditor finalSpaceId={draftId} />
        </div>
      </div>

      {/* Help text */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex gap-3">
          <Icon
            className="size-5 flex-shrink-0 text-primary"
            icon="mdi:lightbulb-outline"
          />
          <div className="text-muted-foreground text-sm">
            <p className="mb-1 font-medium text-foreground">Photo Tips</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Use high-quality photos for the best display</li>
              <li>Portrait orientation works best for profile pictures</li>
              <li>Landscape images are ideal for the header carousel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
