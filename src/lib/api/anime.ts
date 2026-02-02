import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  type SearchResult,
} from "./shared";

interface JikanSearchResponse {
  data?: Array<{
    mal_id?: number;
    title?: string;
    year?: number;
    aired?: { from?: string };
    images?: { jpg?: { image_url?: string } };
    url?: string;
  }>;
}

const parseYearFromAired = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : null;
};

export async function searchAnime(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodedQuery}&limit=${MAX_RESULTS}`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("Jikan API error");
    }

    const data = (await response.json()) as JikanSearchResponse;
    return (data.data ?? []).map((anime, index) => {
      const year = anime.year ?? parseYearFromAired(anime.aired?.from);
      return {
        id: anime.mal_id ? `anime-${anime.mal_id}` : `anime-${index}`,
        title: anime.title ?? "Untitled",
        subtitle: year ? `(${year})` : "",
        year,
        imageUrl: anime.images?.jpg?.image_url ?? null,
        externalUrl:
          anime.url ??
          (anime.mal_id
            ? `https://myanimelist.net/anime/${anime.mal_id}`
            : null),
      };
    });
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
}
