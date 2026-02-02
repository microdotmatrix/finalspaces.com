import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  type SearchResult,
} from "./shared";

interface SpotifyTokenResponse {
  access_token?: string;
}

interface SpotifySearchResponse {
  artists?: {
    items?: Array<{
      id?: string;
      name?: string;
      genres?: string[];
      images?: Array<{ url?: string }>;
      external_urls?: { spotify?: string };
    }>;
  };
}

export async function searchArtists(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!(clientId && clientSecret)) {
      throw new Error("Spotify client credentials not configured");
    }

    const encodedCredentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        ...NO_STORE,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodedCredentials}`,
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Spotify access token");
    }

    const tokenData = (await tokenResponse.json()) as SpotifyTokenResponse;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Spotify access token missing");
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodedQuery}&type=artist&limit=${MAX_RESULTS}`,
      {
        ...NO_STORE,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error("Spotify search failed");
    }

    const searchData = (await searchResponse.json()) as SpotifySearchResponse;
    return (searchData.artists?.items ?? []).map((artist, index) => ({
      id: artist.id ? `artist-${artist.id}` : `artist-${index}`,
      title: artist.name ?? "Unknown Artist",
      subtitle: artist.genres?.slice(0, 2).join(", ") || "",
      imageUrl: artist.images?.[0]?.url ?? null,
      externalUrl:
        artist.external_urls?.spotify ??
        (artist.id ? `https://open.spotify.com/artist/${artist.id}` : null),
    }));
  } catch (error) {
    console.error("Error searching artists:", error);
    return [];
  }
}
