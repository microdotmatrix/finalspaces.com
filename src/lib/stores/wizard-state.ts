"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * Wizard data structure matching FinalSpace fields
 */
export interface WizardData {
  // Step 1: Identity
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  nickname: string;
  useNicknameOnly: boolean;

  // Step 2: Dates
  birthDate: string;
  deathDate: string;
  age: number | null;
  inMemoriam: boolean;

  // Step 3: Locations
  placeOfBirth: string;
  hometown: string;

  // Step 4: Bio
  bioText: string;
  lifeHighlights: string;
  quotesJson: { text: string; author?: string }[];

  // Step 5: Photos (IDs, actual upload in Phase 4)
  profilePictureId: string | null;

  // Step 6: Albums (Phase 4)
  // albums managed separately

  // Step 7: Timeline (Phase 8)
  // timeline managed separately

  // Step 8: Social
  youtubeLinks: {
    id?: string;
    url: string;
    title?: string;
    thumbnailUrl?: string;
    channelName?: string;
    fetchedAt?: string;
    staleAt?: string;
  }[];
  spotifyLinks: {
    id?: string;
    url: string;
    title?: string;
    type?: "track" | "playlist" | "album";
    spotifyId?: string;
    trackId?: string;
    artist?: string;
    ownerName?: string;
    albumName?: string;
    albumArtUrl?: string;
    previewUrl?: string | null;
    durationMs?: number;
    tracks?: {
      id: string;
      name: string;
      artists: string;
      albumName?: string;
      albumArtUrl?: string;
      previewUrl?: string | null;
      durationMs?: number;
    }[];
    fetchedAt?: string;
    staleAt?: string;
  }[];
  socialLinks: Record<string, string>;

  // Step 9: Review - no additional fields
}

/**
 * Default empty wizard data
 */
export const defaultWizardData: WizardData = {
  // Step 1
  name: "",
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  nickname: "",
  useNicknameOnly: false,

  // Step 2
  birthDate: "",
  deathDate: "",
  age: null,
  inMemoriam: false,

  // Step 3
  placeOfBirth: "",
  hometown: "",

  // Step 4
  bioText: "",
  lifeHighlights: "",
  quotesJson: [],

  // Step 5
  profilePictureId: null,

  // Step 8
  youtubeLinks: [],
  spotifyLinks: [],
  socialLinks: {},
};

/**
 * Save status for autosave indicator
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Wizard state atoms
 */

// The draft FinalSpace ID (null = creating new)
export const draftIdAtom = atomWithStorage<string | null>(
  "wizard-draft-id",
  null
);

// Current step (1-9)
export const currentStepAtom = atomWithStorage<number>("wizard-step", 1);

// All wizard form data
export const wizardDataAtom = atomWithStorage<WizardData>(
  "wizard-data",
  defaultWizardData
);

// Save status indicator
export const saveStatusAtom = atom<SaveStatus>("idle");

// Last save timestamp
export const lastSavedAtom = atom<Date | null>(null);

/**
 * Step definitions
 */
export const WIZARD_STEPS = [
  {
    id: 1,
    key: "identity",
    label: "Identity",
    path: "/finalspaces/new/identity",
  },
  { id: 2, key: "dates", label: "Dates", path: "/finalspaces/new/dates" },
  {
    id: 3,
    key: "locations",
    label: "Locations",
    path: "/finalspaces/new/locations",
  },
  { id: 4, key: "bio", label: "Bio", path: "/finalspaces/new/bio" },
  { id: 5, key: "photos", label: "Photos", path: "/finalspaces/new/photos" },
  { id: 6, key: "albums", label: "Albums", path: "/finalspaces/new/albums" },
  {
    id: 7,
    key: "timeline",
    label: "Timeline",
    path: "/finalspaces/new/timeline",
  },
  { id: 8, key: "social", label: "Social", path: "/finalspaces/new/social" },
  { id: 9, key: "review", label: "Review", path: "/finalspaces/new/review" },
] as const;

/**
 * Helper to reset wizard state
 */
export function getResetWizardData(): WizardData {
  return { ...defaultWizardData };
}
