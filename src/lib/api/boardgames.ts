import {
  MAX_RESULTS,
  MIN_CUSTOM_QUERY_LENGTH,
  normalizeQuery,
  POPULAR_BOARD_GAMES,
  type SearchResult,
  toSlug,
} from "./shared";

export async function searchBoardGames(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const loweredQuery = normalizedQuery.toLowerCase();
    const results = await Promise.resolve(
      POPULAR_BOARD_GAMES.filter((game) =>
        game.title.toLowerCase().includes(loweredQuery)
      ).slice(0, MAX_RESULTS)
    );

    if (
      results.length === 0 &&
      normalizedQuery.length >= MIN_CUSTOM_QUERY_LENGTH
    ) {
      return [
        {
          id: `boardgame-custom-${toSlug(normalizedQuery)}`,
          title: normalizedQuery,
          subtitle: "Custom entry",
          imageUrl: null,
          externalUrl: null,
        },
      ];
    }

    return results;
  } catch (error) {
    console.error("Error searching board games:", error);
    return [];
  }
}
