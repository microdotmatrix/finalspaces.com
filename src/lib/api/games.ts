import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  parseYearFromDate,
  type SearchResult,
} from "./shared";

interface RawgSearchResponse {
  results?: Array<{
    id?: number;
    name?: string;
    released?: string;
    background_image?: string;
    slug?: string;
  }>;
}

export async function searchGames(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new Error("RAWG API key not configured");
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&search=${encodedQuery}&page_size=${MAX_RESULTS}`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("RAWG API error");
    }

    const data = (await response.json()) as RawgSearchResponse;
    return (data.results ?? []).map((game, index) => {
      const year = parseYearFromDate(game.released);
      return {
        id: game.id ? `game-${game.id}` : `game-${index}`,
        title: game.name ?? "Untitled",
        subtitle: year ? `(${year})` : "",
        year,
        imageUrl: game.background_image ?? null,
        externalUrl: game.slug ? `https://rawg.io/games/${game.slug}` : null,
      };
    });
  } catch (error) {
    console.error("Error searching video games:", error);
    return [];
  }
}
