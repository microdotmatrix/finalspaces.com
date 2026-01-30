import { z } from "zod";

/**
 * Step 1: Identity validation
 */
export const identitySchema = z
  .object({
    name: z.string().min(1, "Memorial name is required"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    middleName: z.string().optional(),
    suffix: z.string().optional(),
    nickname: z.string().optional(),
    useNicknameOnly: z.boolean().default(false),
  })
  .refine((data) => data.firstName || data.nickname, {
    message: "First name or nickname is required",
    path: ["firstName"],
  });

/**
 * Step 2: Dates validation
 */
export const datesSchema = z.object({
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  age: z.number().nullable().optional(),
  inMemoriam: z.boolean().default(false),
});

/**
 * Step 3: Locations validation
 */
export const locationsSchema = z.object({
  placeOfBirth: z.string().optional(),
  hometown: z.string().optional(),
});

/**
 * Step 4: Bio validation
 */
export const bioSchema = z.object({
  bioText: z.string().max(10_000, "Bio is too long").optional(),
  lifeHighlights: z.string().max(5000, "Highlights are too long").optional(),
  quotesJson: z
    .array(
      z.object({
        text: z.string().min(1, "Quote text is required"),
        author: z.string().optional(),
      })
    )
    .default([]),
});

/**
 * Step 5: Photos validation (IDs only, actual upload in Phase 4)
 */
export const photosSchema = z.object({
  profilePictureId: z.string().nullable().optional(),
});

/**
 * Step 8: Social links validation
 */
export const socialSchema = z.object({
  youtubeLinks: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.url("Invalid YouTube URL"),
        title: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        channelName: z.string().optional(),
        fetchedAt: z.string().optional(),
        staleAt: z.string().optional(),
      })
    )
    .default([]),
  spotifyLinks: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.url("Invalid Spotify URL"),
        title: z.string().optional(),
        type: z.enum(["track", "playlist", "album"]).optional(),
        spotifyId: z.string().optional(),
        trackId: z.string().optional(),
        artist: z.string().optional(),
        ownerName: z.string().optional(),
        albumName: z.string().optional(),
        albumArtUrl: z.string().optional(),
        previewUrl: z.string().nullable().optional(),
        durationMs: z.number().optional(),
        tracks: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              artists: z.string(),
              albumName: z.string().optional(),
              albumArtUrl: z.string().optional(),
              previewUrl: z.string().nullable().optional(),
              durationMs: z.number().optional(),
            })
          )
          .optional(),
        fetchedAt: z.string().optional(),
        staleAt: z.string().optional(),
      })
    )
    .default([]),
  socialLinks: z.record(z.string(), z.string()).default({}),
});

/**
 * Complete wizard data schema
 */
export const wizardDataSchema = z.object({
  // Step 1
  name: z.string().min(1, "Memorial name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  nickname: z.string().optional(),
  useNicknameOnly: z.boolean().default(false),

  // Step 2
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  age: z.number().nullable().optional(),
  inMemoriam: z.boolean().default(false),

  // Step 3
  placeOfBirth: z.string().optional(),
  hometown: z.string().optional(),

  // Step 4
  bioText: z.string().optional(),
  lifeHighlights: z.string().optional(),
  quotesJson: z
    .array(
      z.object({
        text: z.string(),
        author: z.string().optional(),
      })
    )
    .default([]),

  // Step 5
  profilePictureId: z.string().nullable().optional(),

  // Step 8
  youtubeLinks: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string(),
        title: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        channelName: z.string().optional(),
        fetchedAt: z.string().optional(),
        staleAt: z.string().optional(),
      })
    )
    .default([]),
  spotifyLinks: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string(),
        title: z.string().optional(),
        type: z.enum(["track", "playlist", "album"]).optional(),
        spotifyId: z.string().optional(),
        trackId: z.string().optional(),
        artist: z.string().optional(),
        ownerName: z.string().optional(),
        albumName: z.string().optional(),
        albumArtUrl: z.string().optional(),
        previewUrl: z.string().nullable().optional(),
        durationMs: z.number().optional(),
        tracks: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              artists: z.string(),
              albumName: z.string().optional(),
              albumArtUrl: z.string().optional(),
              previewUrl: z.string().nullable().optional(),
              durationMs: z.number().optional(),
            })
          )
          .optional(),
        fetchedAt: z.string().optional(),
        staleAt: z.string().optional(),
      })
    )
    .default([]),
  socialLinks: z.record(z.string(), z.string()).default({}),
});

/**
 * Publish readiness schema - validates all required fields for publishing
 */
export const publishReadySchema = z
  .object({
    name: z.string().min(1, "Memorial name is required"),
    firstName: z.string().optional(),
    nickname: z.string().optional(),
  })
  .refine((data) => data.firstName || data.nickname, {
    message: "First name or nickname is required to publish",
  });

/**
 * Type exports
 */
export type IdentityFormData = z.infer<typeof identitySchema>;
export type DatesFormData = z.infer<typeof datesSchema>;
export type LocationsFormData = z.infer<typeof locationsSchema>;
export type BioFormData = z.infer<typeof bioSchema>;
export type PhotosFormData = z.infer<typeof photosSchema>;
export type SocialFormData = z.infer<typeof socialSchema>;
export type WizardFormData = z.infer<typeof wizardDataSchema>;
