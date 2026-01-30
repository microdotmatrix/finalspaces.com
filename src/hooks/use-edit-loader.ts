"use client";

import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";

import { getFinalSpace } from "@/lib/actions/final-space-actions";
import type { FinalSpace } from "@/lib/db/schema";
import {
  draftIdAtom,
  editModeAtom,
  initialDataSnapshotAtom,
  isPublishedAtom,
  type WizardData,
  wizardDataAtom,
} from "@/lib/stores/wizard-state";

/**
 * Maps FinalSpace database fields to WizardData structure
 */
function mapFinalSpaceToWizardData(space: FinalSpace): WizardData {
  return {
    // Step 1: Identity
    name: space.name,
    firstName: space.firstName ?? "",
    lastName: space.lastName ?? "",
    middleName: space.middleName ?? "",
    suffix: space.suffix ?? "",
    nickname: space.nickname ?? "",
    useNicknameOnly: space.useNicknameOnly,

    // Step 2: Dates
    birthDate: space.birthDate ?? "",
    deathDate: space.deathDate ?? "",
    age: space.age,
    inMemoriam: space.inMemoriam,

    // Step 3: Locations
    placeOfBirth: space.placeOfBirth ?? "",
    hometown: space.hometown ?? "",

    // Step 4: Bio
    bioText: space.bioText ?? "",
    lifeHighlights: space.lifeHighlights ?? "",
    quotesJson: (space.quotesJson as { text: string; author?: string }[]) ?? [],

    // Step 5: Photos
    profilePictureId: space.profilePictureId,

    // Step 8: Social
    youtubeLinks: (space.youtubeLinks as WizardData["youtubeLinks"]) ?? [],
    spotifyLinks: (space.spotifyLinks as WizardData["spotifyLinks"]) ?? [],
    socialLinks: (space.socialLinks as Record<string, string>) ?? {},
  };
}

interface UseEditLoaderResult {
  isLoading: boolean;
  error: string | null;
  finalSpace: FinalSpace | null;
}

/**
 * Hook to load FinalSpace data from database and initialize Jotai atoms for editing.
 * Sets edit mode flag, loads data into wizardDataAtom, and tracks initial state for change detection.
 */
export function useEditLoader(spaceId: string): UseEditLoaderResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalSpace, setFinalSpace] = useState<FinalSpace | null>(null);

  const setWizardData = useSetAtom(wizardDataAtom);
  const setDraftId = useSetAtom(draftIdAtom);
  const setIsPublished = useSetAtom(isPublishedAtom);
  const setEditMode = useSetAtom(editModeAtom);
  const setInitialDataSnapshot = useSetAtom(initialDataSnapshotAtom);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const space = await getFinalSpace(spaceId);

        if (cancelled) {
          return;
        }

        if (!space) {
          setError("FinalSpace not found or access denied");
          return;
        }

        setFinalSpace(space);

        // Map database fields to WizardData
        const wizardData = mapFinalSpaceToWizardData(space);

        // Set all atoms
        setEditMode(true);
        setWizardData(wizardData);
        setDraftId(space.id);
        setIsPublished(space.status === "published");
        setInitialDataSnapshot(JSON.stringify(wizardData));
      } catch {
        if (cancelled) {
          return;
        }
        setError("Failed to load data. Please try again.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    spaceId,
    setWizardData,
    setDraftId,
    setIsPublished,
    setEditMode,
    setInitialDataSnapshot,
  ]);

  return { isLoading, error, finalSpace };
}
