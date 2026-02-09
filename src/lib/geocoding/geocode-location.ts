import { eq } from "drizzle-orm";
import "server-only";

import { db } from "@/lib/db";
import { geocodeCache } from "@/lib/db/schema";

const GEOCODER_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const REQUEST_TIMEOUT_MS = 2000;

interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string | null;
}

function normalizeQuery(location: string): string {
  return location.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function geocodeLocation(
  location: string
): Promise<GeocodeResult | null> {
  const normalizedQuery = normalizeQuery(location);
  if (!normalizedQuery) {
    return null;
  }

  const [cached] = await db
    .select()
    .from(geocodeCache)
    .where(eq(geocodeCache.queryNormalized, normalizedQuery))
    .limit(1);

  if (cached) {
    return {
      latitude: cached.latitude,
      longitude: cached.longitude,
      displayName: cached.displayName,
    };
  }

  const params = new URLSearchParams({
    q: location,
    format: "jsonv2",
    limit: "1",
  });

  let payload: Array<{ lat?: string; lon?: string; display_name?: string }> =
    [];

  try {
    const response = await fetch(`${GEOCODER_ENDPOINT}?${params.toString()}`, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "finalspaces.com geocoder/1.0",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    payload = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
    }>;
  } catch {
    return null;
  }

  const first = payload[0];
  if (!(first?.lat && first?.lon)) {
    return null;
  }

  const latitude = Number.parseFloat(first.lat);
  const longitude = Number.parseFloat(first.lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  await db
    .insert(geocodeCache)
    .values({
      queryNormalized: normalizedQuery,
      displayName: first.display_name ?? null,
      latitude,
      longitude,
      provider: "nominatim",
    })
    .onConflictDoUpdate({
      target: geocodeCache.queryNormalized,
      set: {
        displayName: first.display_name ?? null,
        latitude,
        longitude,
        updatedAt: new Date(),
      },
    });

  return {
    latitude,
    longitude,
    displayName: first.display_name ?? null,
  };
}
