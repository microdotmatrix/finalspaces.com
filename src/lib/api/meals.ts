import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  type SearchResult,
} from "./shared";

interface MealSearchResponse {
  meals?: Array<{
    idMeal?: string;
    strMeal?: string;
    strCategory?: string;
    strArea?: string;
    strMealThumb?: string;
  }>;
}

export async function searchMeals(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodedQuery}`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("TheMealDB API error");
    }

    const data = (await response.json()) as MealSearchResponse;
    return (data.meals ?? []).slice(0, MAX_RESULTS).map((meal, index) => {
      const subtitle = [meal.strCategory, meal.strArea]
        .filter(Boolean)
        .join(" • ");

      return {
        id: meal.idMeal ? `meal-${meal.idMeal}` : `meal-${index}`,
        title: meal.strMeal ?? "Untitled",
        subtitle,
        imageUrl: meal.strMealThumb ?? null,
        externalUrl: meal.idMeal
          ? `https://www.themealdb.com/meal/${meal.idMeal}`
          : null,
      };
    });
  } catch (error) {
    console.error("Error searching meals:", error);
    return [];
  }
}
