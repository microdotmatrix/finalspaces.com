import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  type SearchResult,
} from "./shared";

interface CocktailSearchResponse {
  drinks?: Array<{
    idDrink?: string;
    strDrink?: string;
    strCategory?: string;
    strDrinkThumb?: string;
  }>;
}

export async function searchDrinks(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodedQuery}`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("TheCocktailDB API error");
    }

    const data = (await response.json()) as CocktailSearchResponse;
    return (data.drinks ?? []).slice(0, MAX_RESULTS).map((drink, index) => ({
      id: drink.idDrink ? `drink-${drink.idDrink}` : `drink-${index}`,
      title: drink.strDrink ?? "Untitled",
      subtitle: drink.strCategory ?? "",
      imageUrl: drink.strDrinkThumb ?? null,
      externalUrl: drink.idDrink
        ? `https://www.thecocktaildb.com/drink/${drink.idDrink}`
        : null,
    }));
  } catch (error) {
    console.error("Error searching drinks:", error);
    return [];
  }
}
