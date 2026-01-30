"use client";

import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import {
  createFinalSpace,
  updateFinalSpace,
} from "@/lib/actions/final-space-actions";
import {
  draftIdAtom,
  lastSavedAtom,
  saveStatusAtom,
  type WizardData,
  wizardDataAtom,
} from "@/lib/stores/wizard-state";

const DEBOUNCE_MS = 2000;

/**
 * Hook for debounced autosave of wizard data
 */
export function useAutosave() {
  const [draftId, setDraftId] = useAtom(draftIdAtom);
  const [wizardData] = useAtom(wizardDataAtom);
  const setSaveStatus = useSetAtom(saveStatusAtom);
  const setLastSaved = useSetAtom(lastSavedAtom);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<WizardData | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (isSavingRef.current) return;

    // Don't save if no name (required for creating draft)
    if (!wizardData.name.trim()) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      if (draftId) {
        // Update existing draft
        await updateFinalSpace(draftId, {
          name: wizardData.name,
          firstName: wizardData.firstName || undefined,
          lastName: wizardData.lastName || undefined,
          middleName: wizardData.middleName || undefined,
          suffix: wizardData.suffix || undefined,
          nickname: wizardData.nickname || undefined,
          useNicknameOnly: wizardData.useNicknameOnly,
          birthDate: wizardData.birthDate || undefined,
          deathDate: wizardData.deathDate || undefined,
          inMemoriam: wizardData.inMemoriam,
          placeOfBirth: wizardData.placeOfBirth || undefined,
          hometown: wizardData.hometown || undefined,
          bioText: wizardData.bioText || undefined,
          lifeHighlights: wizardData.lifeHighlights || undefined,
          quotesJson: wizardData.quotesJson,
          youtubeLinks: wizardData.youtubeLinks,
          spotifyLinks: wizardData.spotifyLinks,
          socialLinks: wizardData.socialLinks,
        });
      } else {
        // Create new draft
        const result = await createFinalSpace({
          name: wizardData.name,
          firstName: wizardData.firstName || undefined,
          lastName: wizardData.lastName || undefined,
          inMemoriam: wizardData.inMemoriam,
        });

        if (result.success && result.finalSpace) {
          setDraftId(result.finalSpace.id);
          // Now update with full data
          await updateFinalSpace(result.finalSpace.id, {
            middleName: wizardData.middleName || undefined,
            suffix: wizardData.suffix || undefined,
            nickname: wizardData.nickname || undefined,
            useNicknameOnly: wizardData.useNicknameOnly,
            birthDate: wizardData.birthDate || undefined,
            deathDate: wizardData.deathDate || undefined,
            placeOfBirth: wizardData.placeOfBirth || undefined,
            hometown: wizardData.hometown || undefined,
            bioText: wizardData.bioText || undefined,
            lifeHighlights: wizardData.lifeHighlights || undefined,
            quotesJson: wizardData.quotesJson,
            youtubeLinks: wizardData.youtubeLinks,
            spotifyLinks: wizardData.spotifyLinks,
            socialLinks: wizardData.socialLinks,
          });
        }
      }

      setSaveStatus("saved");
      setLastSaved(new Date());
    } catch (error) {
      console.error("Autosave failed:", error);
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [draftId, wizardData, setDraftId, setSaveStatus, setLastSaved]);

  // Debounced autosave on data changes
  useEffect(() => {
    // Skip if data hasn't changed
    if (
      previousDataRef.current &&
      JSON.stringify(previousDataRef.current) === JSON.stringify(wizardData)
    ) {
      return;
    }

    previousDataRef.current = wizardData;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(() => {
      save();
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [wizardData, save]);

  // Force save function (for manual save button)
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save();
  }, [save]);

  return { forceSave, draftId };
}
