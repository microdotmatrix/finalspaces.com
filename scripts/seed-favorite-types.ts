/**
 * Seed script to populate the favoriteTypes table
 *
 * Run with: npx tsx scripts/seed-favorite-types.ts
 */

import { config } from "dotenv";

config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { favoriteTypes } from "../src/lib/db/schema";

const FAVORITE_TYPES = [
  {
    key: "books",
    name: "Book",
    namePlural: "Books",
    description: "Favorite books and literature",
    icon: "ph:book-duotone",
    apiProvider: "openlibrary",
    sortOrder: 1,
    isActive: true,
  },
  {
    key: "movies",
    name: "Movie",
    namePlural: "Movies",
    description: "Favorite films and movies",
    icon: "ph:film-slate-duotone",
    apiProvider: "tmdb",
    sortOrder: 2,
    isActive: true,
  },
  {
    key: "tv",
    name: "TV Show",
    namePlural: "TV Shows",
    description: "Favorite television series",
    icon: "ph:television-duotone",
    apiProvider: "tmdb",
    sortOrder: 3,
    isActive: true,
  },
  {
    key: "games",
    name: "Video Game",
    namePlural: "Video Games",
    description: "Favorite video games",
    icon: "ph:game-controller-duotone",
    apiProvider: "rawg",
    sortOrder: 4,
    isActive: true,
  },
  {
    key: "artists",
    name: "Artist",
    namePlural: "Artists",
    description: "Favorite musicians and artists",
    icon: "ph:microphone-stage-duotone",
    apiProvider: "spotify",
    sortOrder: 5,
    isActive: true,
  },
  {
    key: "anime",
    name: "Anime",
    namePlural: "Anime",
    description: "Favorite anime series",
    icon: "ph:star-four-duotone",
    apiProvider: "jikan",
    sortOrder: 6,
    isActive: true,
  },
  {
    key: "meals",
    name: "Meal",
    namePlural: "Meals",
    description: "Favorite foods and recipes",
    icon: "ph:cooking-pot-duotone",
    apiProvider: "themealdb",
    sortOrder: 7,
    isActive: true,
  },
  {
    key: "artworks",
    name: "Artwork",
    namePlural: "Artworks",
    description: "Favorite artworks and paintings",
    icon: "ph:paint-brush-duotone",
    apiProvider: "artic",
    sortOrder: 8,
    isActive: true,
  },
  {
    key: "boardgames",
    name: "Board Game",
    namePlural: "Board Games",
    description: "Favorite board games and tabletop games",
    icon: "ph:dice-five-duotone",
    apiProvider: "static",
    sortOrder: 9,
    isActive: true,
  },
  {
    key: "comics",
    name: "Comic",
    namePlural: "Comics",
    description: "Favorite comic books and graphic novels",
    icon: "ph:book-open-duotone",
    apiProvider: "comicvine",
    sortOrder: 10,
    isActive: true,
  },
  {
    key: "drinks",
    name: "Drink",
    namePlural: "Drinks",
    description: "Favorite beverages and cocktails",
    icon: "ph:martini-duotone",
    apiProvider: "thecocktaildb",
    sortOrder: 11,
    isActive: true,
  },
  {
    key: "teams",
    name: "Team",
    namePlural: "Teams",
    description: "Favorite sports teams",
    icon: "ph:soccer-ball-duotone",
    apiProvider: "static",
    sortOrder: 12,
    isActive: true,
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  console.log("Connecting to database...");
  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("Seeding favorite types...");

  for (const type of FAVORITE_TYPES) {
    try {
      await db
        .insert(favoriteTypes)
        .values(type)
        .onConflictDoUpdate({
          target: favoriteTypes.key,
          set: {
            name: type.name,
            namePlural: type.namePlural,
            description: type.description,
            icon: type.icon,
            apiProvider: type.apiProvider,
            sortOrder: type.sortOrder,
            isActive: type.isActive,
          },
        });
      console.log(`  ✓ ${type.key}`);
    } catch (error) {
      console.error(`  ✗ ${type.key}:`, error);
    }
  }

  console.log("\nDone! Seeded", FAVORITE_TYPES.length, "favorite types.");
}

seed().catch(console.error);
