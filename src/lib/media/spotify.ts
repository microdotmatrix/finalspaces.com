import "server-only";

import { cache } from "react";

import { env } from "@/lib/env/server";

export type SpotifyLinkType = "track" | "playlist" | "album";

export interface SpotifyTrackItem {
  id: string;
  name: string;
  artists: string;
  albumName?: string;
  albumArtUrl?: string;
  previewUrl?: string | null;
  durationMs?: number;
}

export interface SpotifyMetadata {
  type: SpotifyLinkType;
  spotifyId: string;
  canonicalUrl: string;
  title: string;
  artist?: string;
  ownerName?: string;
  albumName?: string;
  albumArtUrl?: string;
  previewUrl?: string | null;
  durationMs?: number;
  tracks?: SpotifyTrackItem[];
}

interface SpotifyTokenState {
  accessToken: string;
  expiresAt: number;
}

const spotifyTokenState: SpotifyTokenState = {
  accessToken: "",
  expiresAt: 0,
};

const SPOTIFY_URL_HOST = "open.spotify.com";
const SPOTIFY_URI_REGEX = /^spotify:(track|playlist|album):([a-zA-Z0-9]+)$/;

export function parseSpotifyUrl(
  input: string
): { type: SpotifyLinkType; id: string; canonicalUrl: string } | null {
  if (!input) {
    return null;
  }

  const uriMatch = input.match(SPOTIFY_URI_REGEX);
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return {
      type: type as SpotifyLinkType,
      id,
      canonicalUrl: `https://${SPOTIFY_URL_HOST}/${type}/${id}`,
    };
  }

  try {
    const url = new URL(input);
    if (url.hostname !== SPOTIFY_URL_HOST) {
      return null;
    }
    const [type, id] = url.pathname.split("/").filter(Boolean);
    if (!(type && id)) {
      return null;
    }
    if (type !== "track" && type !== "playlist" && type !== "album") {
      return null;
    }
    return {
      type,
      id,
      canonicalUrl: `https://${SPOTIFY_URL_HOST}/${type}/${id}`,
    };
  } catch {
    return null;
  }
}

const getSpotifyAccessToken = cache(async (): Promise<string> => {
  const now = Date.now();
  if (spotifyTokenState.accessToken && spotifyTokenState.expiresAt > now) {
    return spotifyTokenState.accessToken;
  }

  if (!(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET)) {
    throw new Error("Spotify credentials are missing");
  }

  const credentials = `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`;
  const basic = Buffer.from(credentials).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Spotify auth failed");
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  spotifyTokenState.accessToken = payload.access_token;
  spotifyTokenState.expiresAt = now + payload.expires_in * 1000 - 10_000;

  return spotifyTokenState.accessToken;
});

async function fetchSpotifyJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Spotify API request failed");
  }

  return (await response.json()) as T;
}

function buildTrackItem(
  track: {
    id: string;
    name: string;
    preview_url: string | null;
    duration_ms: number;
    artists: { name: string }[];
    album?: { name?: string; images?: { url: string }[] };
  },
  fallbackAlbumName?: string,
  fallbackAlbumArt?: string
): SpotifyTrackItem {
  const albumArtUrl = track.album?.images?.[0]?.url ?? fallbackAlbumArt;
  const albumName = track.album?.name ?? fallbackAlbumName;

  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name).join(", "),
    albumName,
    albumArtUrl,
    previewUrl: track.preview_url,
    durationMs: track.duration_ms,
  };
}

export async function fetchSpotifyMetadata(parsed: {
  type: SpotifyLinkType;
  id: string;
  canonicalUrl: string;
}): Promise<SpotifyMetadata> {
  const token = await getSpotifyAccessToken();

  if (parsed.type === "track") {
    const track = await fetchSpotifyJson<{
      id: string;
      name: string;
      preview_url: string | null;
      duration_ms: number;
      artists: { name: string }[];
      album: { name: string; images: { url: string }[] };
    }>(`https://api.spotify.com/v1/tracks/${parsed.id}`, token);

    return {
      type: "track",
      spotifyId: track.id,
      canonicalUrl: parsed.canonicalUrl,
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      albumName: track.album.name,
      albumArtUrl: track.album.images?.[0]?.url,
      previewUrl: track.preview_url,
      durationMs: track.duration_ms,
    };
  }

  if (parsed.type === "playlist") {
    const playlist = await fetchSpotifyJson<{
      id: string;
      name: string;
      owner: { display_name: string };
      images: { url: string }[];
      tracks: {
        items: {
          track: {
            id: string;
            name: string;
            preview_url: string | null;
            duration_ms: number;
            artists: { name: string }[];
            album: { name: string; images: { url: string }[] };
          } | null;
        }[];
      };
    }>(
      `https://api.spotify.com/v1/playlists/${parsed.id}?fields=name,images,owner(display_name),tracks.items(track(id,name,preview_url,duration_ms,artists(name),album(name,images)))&limit=50`,
      token
    );

    const tracks = playlist.tracks.items
      .map((item) => item.track)
      .filter((track): track is NonNullable<typeof track> => Boolean(track))
      .map((track) => buildTrackItem(track));

    return {
      type: "playlist",
      spotifyId: playlist.id,
      canonicalUrl: parsed.canonicalUrl,
      title: playlist.name,
      ownerName: playlist.owner?.display_name,
      albumArtUrl: playlist.images?.[0]?.url,
      tracks,
    };
  }

  const album = await fetchSpotifyJson<{
    id: string;
    name: string;
    artists: { name: string }[];
    images: { url: string }[];
    tracks: {
      items: {
        id: string;
        name: string;
        preview_url: string | null;
        duration_ms: number;
        artists: { name: string }[];
      }[];
    };
  }>(
    `https://api.spotify.com/v1/albums/${parsed.id}?fields=name,images,artists(name),tracks.items(id,name,preview_url,duration_ms,artists(name))`,
    token
  );

  const albumArtUrl = album.images?.[0]?.url;
  const artist = album.artists.map((item) => item.name).join(", ");
  const tracks = album.tracks.items.map((track) =>
    buildTrackItem(track, album.name, albumArtUrl)
  );

  return {
    type: "album",
    spotifyId: album.id,
    canonicalUrl: parsed.canonicalUrl,
    title: album.name,
    artist,
    albumName: album.name,
    albumArtUrl,
    tracks,
  };
}
