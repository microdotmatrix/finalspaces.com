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
    title?: string;
    release_date?: string;
    poster_path?: string;
  }>;
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
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
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodedQuery}&page=1`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("TMDB API error");
    }

    const data = (await response.json()) as TmdbSearchResponse;
    return (data.results ?? []).slice(0, MAX_RESULTS).map((movie, index) => {
      const year = parseYearFromDate(movie.release_date);
      return {
        id: movie.id ? `movie-${movie.id}` : `movie-${index}`,
        title: movie.title ?? "Untitled",
        subtitle: year ? `(${year})` : "",
        year,
        imageUrl: movie.poster_path
          ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
          : null,
        externalUrl: movie.id
          ? `https://www.themoviedb.org/movie/${movie.id}`
          : null,
      };
    });
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}
