import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { finalSpaces } from "@/lib/db/schema";
import {
  fetchSpotifyMetadata,
  parseSpotifyUrl,
  type SpotifyMetadata,
} from "@/lib/media/spotify";
import { fetchYouTubeMetadata, parseYouTubeUrl } from "@/lib/media/youtube";
import {
  type SpotifyLink,
  spotifyLinksSchema,
  type YouTubeLink,
  youtubeLinksSchema,
} from "@/lib/validation/external-links";

const DAY_MS = 24 * 60 * 60 * 1000;
const SPOTIFY_TRACK_TTL_DAYS = 30;
const SPOTIFY_COLLECTION_TTL_DAYS = 7;
const YOUTUBE_TTL_DAYS = 30;

const toIso = (date: Date) => date.toISOString();

const isStale = (staleAt?: string) => {
  if (!staleAt) {
    return true;
  }
  return new Date(staleAt).getTime() <= Date.now();
};

const needsSpotifyRefresh = (link: SpotifyLink) => {
  if (!(link.type && link.spotifyId)) {
    return true;
  }

  if (link.type === "track") {
    return link.previewUrl === undefined || isStale(link.staleAt);
  }

  return link.tracks === undefined || isStale(link.staleAt);
};

const needsYouTubeRefresh = (link: YouTubeLink) => {
  if (!(link.title || link.thumbnailUrl)) {
    return true;
  }

  return isStale(link.staleAt);
};

const getSpotifyStaleAt = (metadata: SpotifyMetadata, now: Date) => {
  const ttlDays =
    metadata.type === "track"
      ? SPOTIFY_TRACK_TTL_DAYS
      : SPOTIFY_COLLECTION_TTL_DAYS;
  return new Date(now.getTime() + ttlDays * DAY_MS);
};

const getYouTubeStaleAt = (now: Date) =>
  new Date(now.getTime() + YOUTUBE_TTL_DAYS * DAY_MS);

const mergeSpotifyMetadata = (
  link: SpotifyLink,
  metadata: SpotifyMetadata,
  now: Date
): SpotifyLink => {
  const updated: SpotifyLink = {
    ...link,
    type: metadata.type,
    spotifyId: metadata.spotifyId,
    trackId: metadata.type === "track" ? metadata.spotifyId : link.trackId,
    artist: metadata.artist ?? link.artist,
    ownerName: metadata.ownerName ?? link.ownerName,
    albumName: metadata.albumName ?? link.albumName,
    albumArtUrl: metadata.albumArtUrl ?? link.albumArtUrl,
    previewUrl:
      metadata.previewUrl !== undefined ? metadata.previewUrl : link.previewUrl,
    durationMs: metadata.durationMs ?? link.durationMs,
    tracks: metadata.tracks ?? link.tracks,
    fetchedAt: toIso(now),
    staleAt: toIso(getSpotifyStaleAt(metadata, now)),
  };

  if (!link.title) {
    updated.title = metadata.title;
  }

  return updated;
};

const mergeYouTubeMetadata = (
  link: YouTubeLink,
  metadata: { title: string; thumbnailUrl?: string; channelName?: string },
  now: Date
): YouTubeLink => ({
  ...link,
  title: link.title || metadata.title,
  thumbnailUrl: metadata.thumbnailUrl ?? link.thumbnailUrl,
  channelName: metadata.channelName ?? link.channelName,
  fetchedAt: toIso(now),
  staleAt: toIso(getYouTubeStaleAt(now)),
});

const hydrateSpotifyLinks = async (links: SpotifyLink[]) => {
  const now = new Date();

  const results = await Promise.all(
    links.map(async (link) => {
      const parsed = parseSpotifyUrl(link.url);
      if (!parsed) {
        return { link, changed: false };
      }

      if (!needsSpotifyRefresh(link)) {
        return { link, changed: false };
      }

      try {
        const metadata = await fetchSpotifyMetadata(parsed);
        return {
          link: mergeSpotifyMetadata(link, metadata, now),
          changed: true,
        };
      } catch {
        return { link, changed: false };
      }
    })
  );

  const updatedLinks = results.map((result) => result.link);
  const changed = results.some((result) => result.changed);

  return { links: updatedLinks, changed };
};

const hydrateYouTubeLinks = async (links: YouTubeLink[]) => {
  const now = new Date();

  const results = await Promise.all(
    links.map(async (link) => {
      const parsed = parseYouTubeUrl(link.url);
      if (!parsed) {
        return { link, changed: false };
      }

      if (!needsYouTubeRefresh(link)) {
        return { link, changed: false };
      }

      try {
        const metadata = await fetchYouTubeMetadata(parsed.canonicalUrl);
        return {
          link: mergeYouTubeMetadata(link, metadata, now),
          changed: true,
        };
      } catch {
        return { link, changed: false };
      }
    })
  );

  const updatedLinks = results.map((result) => result.link);
  const changed = results.some((result) => result.changed);

  return { links: updatedLinks, changed };
};

export async function getEnrichedFinalSpaceMediaLinks(finalSpaceId: string) {
  const [space] = await db
    .select({
      spotifyLinks: finalSpaces.spotifyLinks,
      youtubeLinks: finalSpaces.youtubeLinks,
    })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, finalSpaceId))
    .limit(1);

  if (!space) {
    return { spotifyLinks: [], youtubeLinks: [] };
  }

  const parsedSpotify = spotifyLinksSchema.safeParse(space.spotifyLinks ?? []);
  const parsedYouTube = youtubeLinksSchema.safeParse(space.youtubeLinks ?? []);

  const spotifyLinks = parsedSpotify.success ? parsedSpotify.data : [];
  const youtubeLinks = parsedYouTube.success ? parsedYouTube.data : [];

  const [spotifyResult, youtubeResult] = await Promise.all([
    hydrateSpotifyLinks(spotifyLinks),
    hydrateYouTubeLinks(youtubeLinks),
  ]);

  if (spotifyResult.changed || youtubeResult.changed) {
    await db
      .update(finalSpaces)
      .set({
        spotifyLinks: spotifyResult.links,
        youtubeLinks: youtubeResult.links,
        updatedAt: new Date(),
      })
      .where(eq(finalSpaces.id, finalSpaceId));
  }

  return {
    spotifyLinks: spotifyResult.links,
    youtubeLinks: youtubeResult.links,
  };
}
