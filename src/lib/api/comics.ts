import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  type SearchResult,
} from "./shared";

interface ComicVineSearchResponse {
  results?: Array<{
    id?: number;
    name?: string;
    publisher?: { name?: string };
    start_year?: string;
    image?: { small_url?: string; thumb_url?: string };
    site_detail_url?: string;
  }>;
}

export async function searchComics(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const apiKey = process.env.COMICVINE_API_KEY;
    if (!apiKey) {
      throw new Error("Comic Vine API key not configured");
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&query=${encodedQuery}&resources=volume&limit=${MAX_RESULTS}`,
      {
        ...NO_STORE,
        headers: {
          "User-Agent": "FinalSpaces/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Comic Vine API error");
    }

    const data = (await response.json()) as ComicVineSearchResponse;
    return (data.results ?? []).map((comic, index) => {
      const year = comic.start_year ? Number(comic.start_year) : null;
      const parsedYear = Number.isFinite(year ?? Number.NaN) ? year : null;
      let externalUrl: string | null = null;

      if (comic.site_detail_url) {
        externalUrl = comic.site_detail_url;
      } else if (comic.id) {
        externalUrl = `https://comicvine.gamespot.com/volume/${comic.id}`;
      }

      return {
        id: comic.id ? `comic-${comic.id}` : `comic-${index}`,
        title: comic.name ?? "Untitled",
        subtitle: comic.publisher?.name
          ? `${comic.publisher.name}${parsedYear ? ` (${parsedYear})` : ""}`
          : "",
        year: parsedYear,
        imageUrl: comic.image?.small_url ?? comic.image?.thumb_url ?? null,
        externalUrl,
      };
    });
  } catch (error) {
    console.error("Error searching comics:", error);
    return [];
  }
}
