import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  parseYearFromDate,
  type SearchResult,
} from "./shared";

interface TmdbSearchResponse {
  results?: Array<{
    id?: number;
    name?: string;
    first_air_date?: string;
    poster_path?: string;
  }>;
}

export async function searchTv(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodedQuery}&page=1`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("TMDB API error");
    }

    const data = (await response.json()) as TmdbSearchResponse;
    return (data.results ?? []).slice(0, MAX_RESULTS).map((show, index) => {
      const year = parseYearFromDate(show.first_air_date);
      return {
        id: show.id ? `tv-${show.id}` : `tv-${index}`,
        title: show.name ?? "Untitled",
        subtitle: year ? `(${year})` : "",
        year,
        imageUrl: show.poster_path
          ? `https://image.tmdb.org/t/p/w185${show.poster_path}`
          : null,
        externalUrl: show.id
          ? `https://www.themoviedb.org/tv/${show.id}`
          : null,
      };
    });
  } catch (error) {
    console.error("Error searching TV shows:", error);
    return [];
  }
}
