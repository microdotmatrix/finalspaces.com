import "server-only";

import { cache } from "react";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export interface YouTubeMetadata {
  title: string;
  thumbnailUrl?: string;
  channelName?: string;
}

export function parseYouTubeUrl(
  input: string
): { id: string; canonicalUrl: string } | null {
  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);
    if (!YOUTUBE_HOSTS.has(url.hostname)) {
      return null;
    }

    let id: string | null = null;

    if (url.hostname === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/").filter(Boolean)[1] ?? null;
    } else if (url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/").filter(Boolean)[1] ?? null;
    }

    if (!id) {
      return null;
    }

    return {
      id,
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  } catch {
    return null;
  }
}

export const fetchYouTubeMetadata = cache(
  async (canonicalUrl: string): Promise<YouTubeMetadata> => {
    const response = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(
        canonicalUrl
      )}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("YouTube oEmbed request failed");
    }

    const payload = (await response.json()) as {
      title: string;
      author_name?: string;
      thumbnail_url?: string;
    };

    return {
      title: payload.title,
      channelName: payload.author_name,
      thumbnailUrl: payload.thumbnail_url,
    };
  }
);
