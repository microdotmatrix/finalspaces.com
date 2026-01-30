"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";

import { unpublishFinalSpace } from "@/lib/actions/final-space-actions";
import {
  initialDataSnapshotAtom,
  isPublishedAtom,
  wizardDataAtom,
} from "@/lib/stores/wizard-state";

/**
 * Hook to monitor wizard data for changes and auto-unpublish on first edit.
 * Only triggers unpublish once when:
 * 1. The entry was initially published
 * 2. The data has changed from the initial snapshot
 *
 * @param spaceId - The FinalSpace ID to unpublish
 * @param initiallyPublished - Whether the entry was published when editing started
 */
export function useUnpublishOnEdit(
  spaceId: string,
  initiallyPublished: boolean
): void {
  const wizardData = useAtomValue(wizardDataAtom);
  const initialDataSnapshot = useAtomValue(initialDataSnapshotAtom);
  const setIsPublished = useSetAtom(isPublishedAtom);

  // Track whether we've already triggered unpublish
  const hasUnpublishedRef = useRef(false);
  // Track if unpublish is in progress to prevent duplicate calls
  const isUnpublishingRef = useRef(false);
  // Track if data is ready (snapshot exists)
  const isReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // Skip if:
    // - Already unpublished in this session
    // - Unpublish currently in progress
    // - Wasn't published initially
    // - No initial snapshot yet (still loading)
    if (
      hasUnpublishedRef.current ||
      isUnpublishingRef.current ||
      !initiallyPublished ||
      !initialDataSnapshot
    ) {
      return;
    }

    // Mark as ready once we have a snapshot
    if (!isReadyRef.current) {
      isReadyRef.current = true;
      return; // Skip the first run after snapshot is set
    }

    // Check if data has changed
    const currentSnapshot = JSON.stringify(wizardData);
    const hasChanged = currentSnapshot !== initialDataSnapshot;

    if (hasChanged) {
      // Mark as in progress to prevent duplicate calls
      isUnpublishingRef.current = true;

      unpublishFinalSpace(spaceId)
        .then(() => {
          if (!cancelled) {
            hasUnpublishedRef.current = true;
            setIsPublished(false);
          }
        })
        .catch(() => {
          // Allow retry on failure
          isUnpublishingRef.current = false;
        })
        .finally(() => {
          if (!cancelled) {
            isUnpublishingRef.current = false;
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [
    wizardData,
    spaceId,
    initiallyPublished,
    initialDataSnapshot,
    setIsPublished,
  ]);
}
