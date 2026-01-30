import { z } from "zod";

export const spotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.string(),
  albumName: z.string().optional(),
  albumArtUrl: z.string().optional(),
  previewUrl: z.string().nullable().optional(),
  durationMs: z.number().optional(),
});

export const spotifyLinkSchema = z
  .object({
    id: z.string().optional(),
    url: z.string().url(),
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
    tracks: z.array(spotifyTrackSchema).optional(),
    fetchedAt: z.string().optional(),
    staleAt: z.string().optional(),
  })
  .passthrough();

export const youtubeLinkSchema = z
  .object({
    id: z.string().optional(),
    url: z.string().url(),
    title: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    channelName: z.string().optional(),
    fetchedAt: z.string().optional(),
    staleAt: z.string().optional(),
  })
  .passthrough();

export const spotifyLinksSchema = z.array(spotifyLinkSchema).default([]);
export const youtubeLinksSchema = z.array(youtubeLinkSchema).default([]);

export type SpotifyTrack = z.infer<typeof spotifyTrackSchema>;
export type SpotifyLink = z.infer<typeof spotifyLinkSchema>;
export type YouTubeLink = z.infer<typeof youtubeLinkSchema>;
