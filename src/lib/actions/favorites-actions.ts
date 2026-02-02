"use server";

import { and, asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
// Import all search functions
import { searchAnime } from "@/lib/api/anime";
import { searchArtists } from "@/lib/api/artists";
import { searchArtworks } from "@/lib/api/artworks";
import { searchBooks } from "@/lib/api/books";
import { searchComics } from "@/lib/api/comics";
import { searchDrinks } from "@/lib/api/drinks";
import { searchGames } from "@/lib/api/games";
import { searchMeals } from "@/lib/api/meals";
import { searchMovies } from "@/lib/api/movies";
import {
  POPULAR_BOARD_GAMES,
  POPULAR_TEAMS,
  type SearchResult,
} from "@/lib/api/shared";
import { searchTv } from "@/lib/api/tv";
import { canEditFinalSpace, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  type FavoriteType,
  favoriteTypes,
  finalSpaces,
  type MemorialFavorite,
  memorialFavorites,
} from "@/lib/db/schema";

// ==========================================
// TYPES
// ==========================================

export type FavoriteCategory =
  | "books"
  | "movies"
  | "tv"
  | "games"
  | "artists"
  | "anime"
  | "meals"
  | "artworks"
  | "boardgames"
  | "comics"
  | "drinks"
  | "teams";

export type AddFavoriteInput = {
  finalSpaceId: string;
  favoriteTypeId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  externalUrl?: string | null;
  apiId?: string;
  notes?: string;
};

export type UpdateFavoriteInput = {
  notes?: string;
  sortOrder?: number;
};

// Maximum favorites per category
const MAX_FAVORITES_PER_CATEGORY = 10;

// ==========================================
// ACCESS CONTROL
// ==========================================

async function requireFavoritesAccess(
  userId: string,
  finalSpaceId: string
): Promise<void> {
  const hasAccess = await canEditFinalSpace(userId, finalSpaceId);
  if (!hasAccess) {
    throw new Error("Not authorized to manage favorites for this FinalSpace");
  }
}

// ==========================================
// SEARCH
// ==========================================

/**
 * Search for items in a specific category
 */
export async function searchFavorites(
  category: FavoriteCategory,
  query: string
): Promise<SearchResult[]> {
  const trimmedQuery = query.trim();

  // For static lists, filter locally
  if (category === "boardgames") {
    if (!trimmedQuery) return POPULAR_BOARD_GAMES.slice(0, 10);
    const lower = trimmedQuery.toLowerCase();
    return POPULAR_BOARD_GAMES.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.subtitle.toLowerCase().includes(lower)
    ).slice(0, 10);
  }

  if (category === "teams") {
    if (!trimmedQuery) return POPULAR_TEAMS.slice(0, 10);
    const lower = trimmedQuery.toLowerCase();
    return POPULAR_TEAMS.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.subtitle.toLowerCase().includes(lower)
    ).slice(0, 10);
  }

  // Require query for API-based searches
  if (!trimmedQuery) {
    return [];
  }

  // Route to appropriate API
  switch (category) {
    case "books":
      return searchBooks(trimmedQuery);
    case "movies":
      return searchMovies(trimmedQuery);
    case "tv":
      return searchTv(trimmedQuery);
    case "games":
      return searchGames(trimmedQuery);
    case "artists":
      return searchArtists(trimmedQuery);
    case "anime":
      return searchAnime(trimmedQuery);
    case "meals":
      return searchMeals(trimmedQuery);
    case "artworks":
      return searchArtworks(trimmedQuery);
    case "comics":
      return searchComics(trimmedQuery);
    case "drinks":
      return searchDrinks(trimmedQuery);
    default:
      return [];
  }
}

// ==========================================
// CRUD OPERATIONS
// ==========================================

/**
 * Add a favorite to a FinalSpace
 */
export async function addFavorite(input: AddFavoriteInput): Promise<{
  success: boolean;
  favorite?: MemorialFavorite;
  error?: string;
}> {
  const user = await requireUser();
  await requireFavoritesAccess(user.id, input.finalSpaceId);

  // Check category limit
  const existingCount = await db
    .select({ id: memorialFavorites.id })
    .from(memorialFavorites)
    .where(
      and(
        eq(memorialFavorites.finalSpaceId, input.finalSpaceId),
        eq(memorialFavorites.favoriteTypeId, input.favoriteTypeId)
      )
    );

  if (existingCount.length >= MAX_FAVORITES_PER_CATEGORY) {
    return {
      success: false,
      error: `Maximum of ${MAX_FAVORITES_PER_CATEGORY} favorites per category`,
    };
  }

  // Check for duplicate (same apiId in same category)
  if (input.apiId) {
    const [existing] = await db
      .select({ id: memorialFavorites.id })
      .from(memorialFavorites)
      .where(
        and(
          eq(memorialFavorites.finalSpaceId, input.finalSpaceId),
          eq(memorialFavorites.favoriteTypeId, input.favoriteTypeId),
          eq(memorialFavorites.apiId, input.apiId)
        )
      )
      .limit(1);

    if (existing) {
      return {
        success: false,
        error: "This item is already in your favorites",
      };
    }
  }

  // Get next sort order
  const [lastFavorite] = await db
    .select({ sortOrder: memorialFavorites.sortOrder })
    .from(memorialFavorites)
    .where(
      and(
        eq(memorialFavorites.finalSpaceId, input.finalSpaceId),
        eq(memorialFavorites.favoriteTypeId, input.favoriteTypeId)
      )
    )
    .orderBy(desc(memorialFavorites.sortOrder))
    .limit(1);

  const sortOrder = (lastFavorite?.sortOrder ?? 0) + 1;

  const [favorite] = await db
    .insert(memorialFavorites)
    .values({
      finalSpaceId: input.finalSpaceId,
      favoriteTypeId: input.favoriteTypeId,
      title: input.title,
      subtitle: input.subtitle ?? null,
      imageUrl: input.imageUrl ?? null,
      externalUrl: input.externalUrl ?? null,
      apiId: input.apiId ?? null,
      notes: input.notes ?? null,
      sortOrder,
    })
    .returning();

  // Revalidate memorial page
  const [space] = await db
    .select({ slug: finalSpaces.slug })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, input.finalSpaceId))
    .limit(1);

  if (space?.slug) {
    revalidatePath(`/m/${space.slug}`);
  }

  return { success: true, favorite };
}

/**
 * Remove a favorite
 */
export async function removeFavorite(favoriteId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await requireUser();

  // Get the favorite to check access
  const [favorite] = await db
    .select({
      id: memorialFavorites.id,
      finalSpaceId: memorialFavorites.finalSpaceId,
    })
    .from(memorialFavorites)
    .where(eq(memorialFavorites.id, favoriteId))
    .limit(1);

  if (!favorite) {
    return { success: false, error: "Favorite not found" };
  }

  await requireFavoritesAccess(user.id, favorite.finalSpaceId);

  await db
    .delete(memorialFavorites)
    .where(eq(memorialFavorites.id, favoriteId));

  // Revalidate memorial page
  const [space] = await db
    .select({ slug: finalSpaces.slug })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, favorite.finalSpaceId))
    .limit(1);

  if (space?.slug) {
    revalidatePath(`/m/${space.slug}`);
  }

  return { success: true };
}

/**
 * Update a favorite (notes or sort order)
 */
export async function updateFavorite(
  favoriteId: string,
  input: UpdateFavoriteInput
): Promise<{
  success: boolean;
  favorite?: MemorialFavorite;
  error?: string;
}> {
  const user = await requireUser();

  const [existing] = await db
    .select({
      id: memorialFavorites.id,
      finalSpaceId: memorialFavorites.finalSpaceId,
    })
    .from(memorialFavorites)
    .where(eq(memorialFavorites.id, favoriteId))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Favorite not found" };
  }

  await requireFavoritesAccess(user.id, existing.finalSpaceId);

  const [favorite] = await db
    .update(memorialFavorites)
    .set({
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    })
    .where(eq(memorialFavorites.id, favoriteId))
    .returning();

  return { success: true, favorite };
}

/**
 * Reorder favorites within a category
 */
export async function reorderFavorites(
  finalSpaceId: string,
  favoriteTypeId: string,
  favoriteIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();
  await requireFavoritesAccess(user.id, finalSpaceId);

  // Update sort order for each favorite
  await Promise.all(
    favoriteIds.map((id, index) =>
      db
        .update(memorialFavorites)
        .set({ sortOrder: index })
        .where(
          and(
            eq(memorialFavorites.id, id),
            eq(memorialFavorites.finalSpaceId, finalSpaceId),
            eq(memorialFavorites.favoriteTypeId, favoriteTypeId)
          )
        )
    )
  );

  return { success: true };
}

// ==========================================
// READ OPERATIONS
// ==========================================

/**
 * Get all favorites for a FinalSpace, grouped by type
 */
export async function getFavorites(finalSpaceId: string): Promise<{
  favorites: MemorialFavorite[];
  types: FavoriteType[];
}> {
  const [favorites, types] = await Promise.all([
    db
      .select()
      .from(memorialFavorites)
      .where(eq(memorialFavorites.finalSpaceId, finalSpaceId))
      .orderBy(
        asc(memorialFavorites.favoriteTypeId),
        asc(memorialFavorites.sortOrder)
      ),
    db
      .select()
      .from(favoriteTypes)
      .where(eq(favoriteTypes.isActive, true))
      .orderBy(asc(favoriteTypes.sortOrder)),
  ]);

  return { favorites, types };
}

/**
 * Get all active favorite types
 */
export async function getFavoriteTypes(): Promise<FavoriteType[]> {
  return db
    .select()
    .from(favoriteTypes)
    .where(eq(favoriteTypes.isActive, true))
    .orderBy(asc(favoriteTypes.sortOrder));
}
