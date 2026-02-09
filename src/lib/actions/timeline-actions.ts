"use server";

import { and, asc, desc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canEditFinalSpace, requireUser } from "@/lib/auth";
import { features } from "@/lib/config";
import { db } from "@/lib/db";
import {
  finalSpaces,
  timelineCategories,
  timelineEvents,
} from "@/lib/db/schema";
import { geocodeLocation } from "@/lib/geocoding/geocode-location";

// ==========================================
// TYPES & VALIDATION
// ==========================================

export interface TimelineEventWithCategory {
  id: string;
  finalSpaceId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  organization: string | null;
  eventType:
    | "birth"
    | "milestone"
    | "achievement"
    | "family"
    | "career"
    | "travel"
    | "memory"
    | "other";
  eventMonth: number | null;
  eventDay: number | null;
  eventYear: number | null;
  endMonth: number | null;
  endDay: number | null;
  endYear: number | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  addToMap: boolean;
  mediaId: string | null;
  sortOrder: number;
  isPublic: boolean;
  cardSize: "compact" | "standard" | "featured";
  accentGradient: unknown;
  createdAt: Date | null;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

const createTimelineEventSchema = z.object({
  finalSpaceId: z.uuid(),
  categoryId: z.uuid().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  organization: z.string().max(200).nullable(),
  eventType: z.enum([
    "birth",
    "milestone",
    "achievement",
    "family",
    "career",
    "travel",
    "memory",
    "other",
  ]),
  eventMonth: z.number().min(1).max(12).nullable(),
  eventDay: z.number().min(1).max(31).nullable(),
  eventYear: z.number().nullable(),
  endMonth: z.number().min(1).max(12).nullable(),
  endDay: z.number().min(1).max(31).nullable(),
  endYear: z.number().nullable(),
  location: z.string().max(500).nullable(),
  isPublic: z.boolean(),
});

const updateTimelineEventSchema = createTimelineEventSchema
  .omit({ finalSpaceId: true })
  .partial()
  .extend({
    id: z.uuid(),
  });

export type CreateTimelineEventInput = z.infer<
  typeof createTimelineEventSchema
>;
export type UpdateTimelineEventInput = z.infer<
  typeof updateTimelineEventSchema
>;

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type TimelineCategory = typeof timelineCategories.$inferSelect;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ==========================================
// HELPERS
// ==========================================

async function requireTimelineOwnership(
  userId: string,
  finalSpaceId: string
): Promise<void> {
  const hasAccess = await canEditFinalSpace(userId, finalSpaceId);
  if (!hasAccess) {
    throw new Error("Not authorized to manage timeline");
  }
}

async function getSlugForRevalidation(
  finalSpaceId: string
): Promise<string | null> {
  const [space] = await db
    .select({ slug: finalSpaces.slug })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, finalSpaceId))
    .limit(1);
  return space?.slug ?? null;
}

async function getNextSortOrder(finalSpaceId: string): Promise<number> {
  const [result] = await db
    .select({ maxOrder: max(timelineEvents.sortOrder) })
    .from(timelineEvents)
    .where(eq(timelineEvents.finalSpaceId, finalSpaceId));
  return (result?.maxOrder ?? 0) + 1;
}

// ==========================================
// CREATE/UPDATE/DELETE ACTIONS
// ==========================================

/**
 * Create a new timeline event
 */
export async function createTimelineEvent(
  input: CreateTimelineEventInput
): Promise<ActionResult<TimelineEvent>> {
  const user = await requireUser();

  const parsed = createTimelineEventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const data = parsed.data;

  await requireTimelineOwnership(user.id, data.finalSpaceId);

  const sortOrder = await getNextSortOrder(data.finalSpaceId);

  let latitude: number | null = null;
  let longitude: number | null = null;
  let addToMap = false;

  if (features.timelineAutoGeocodingEnabled && data.location) {
    const geocoded = await geocodeLocation(data.location);
    if (geocoded) {
      latitude = geocoded.latitude;
      longitude = geocoded.longitude;
      addToMap = true;
    }
  }

  const [event] = await db
    .insert(timelineEvents)
    .values({
      finalSpaceId: data.finalSpaceId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      organization: data.organization,
      eventType: data.eventType,
      eventMonth: data.eventMonth,
      eventDay: data.eventDay,
      eventYear: data.eventYear,
      endMonth: data.endMonth,
      endDay: data.endDay,
      endYear: data.endYear,
      location: data.location,
      latitude,
      longitude,
      addToMap,
      isPublic: data.isPublic,
      sortOrder,
    })
    .returning();

  const slug = await getSlugForRevalidation(data.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true, data: event };
}

/**
 * Update a timeline event
 */
export async function updateTimelineEvent(
  input: UpdateTimelineEventInput
): Promise<ActionResult<TimelineEvent>> {
  const user = await requireUser();

  const parsed = updateTimelineEventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { id, ...data } = parsed.data;

  // Find the event to check ownership
  const [existingEvent] = await db
    .select({
      finalSpaceId: timelineEvents.finalSpaceId,
      location: timelineEvents.location,
      latitude: timelineEvents.latitude,
      longitude: timelineEvents.longitude,
      addToMap: timelineEvents.addToMap,
    })
    .from(timelineEvents)
    .where(eq(timelineEvents.id, id))
    .limit(1);

  if (!existingEvent) {
    return { success: false, error: "Event not found" };
  }

  await requireTimelineOwnership(user.id, existingEvent.finalSpaceId);

  const updateData: Partial<typeof timelineEvents.$inferInsert> = {
    ...data,
  };

  const hasLocationField = Object.hasOwn(data, "location");
  if (hasLocationField) {
    const normalizedIncomingLocation =
      data.location?.trim().toLowerCase() ?? null;
    const normalizedExistingLocation =
      existingEvent.location?.trim().toLowerCase() ?? null;

    if (normalizedIncomingLocation) {
      const locationChanged =
        normalizedIncomingLocation !== normalizedExistingLocation;

      if (features.timelineAutoGeocodingEnabled && locationChanged) {
        const geocoded = await geocodeLocation(data.location ?? "");
        if (geocoded) {
          updateData.latitude = geocoded.latitude;
          updateData.longitude = geocoded.longitude;
          updateData.addToMap = true;
        } else {
          updateData.latitude = existingEvent.latitude;
          updateData.longitude = existingEvent.longitude;
          updateData.addToMap = existingEvent.addToMap;
        }
      } else {
        updateData.latitude = existingEvent.latitude;
        updateData.longitude = existingEvent.longitude;
        updateData.addToMap = existingEvent.addToMap;
      }
    } else {
      updateData.latitude = null;
      updateData.longitude = null;
      updateData.addToMap = false;
    }
  }

  const [event] = await db
    .update(timelineEvents)
    .set(updateData)
    .where(eq(timelineEvents.id, id))
    .returning();

  const slug = await getSlugForRevalidation(existingEvent.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true, data: event };
}

/**
 * Delete a timeline event
 */
export async function deleteTimelineEvent(
  eventId: string
): Promise<ActionResult> {
  const user = await requireUser();

  const [event] = await db
    .select({ finalSpaceId: timelineEvents.finalSpaceId })
    .from(timelineEvents)
    .where(eq(timelineEvents.id, eventId))
    .limit(1);

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  await requireTimelineOwnership(user.id, event.finalSpaceId);

  await db.delete(timelineEvents).where(eq(timelineEvents.id, eventId));

  const slug = await getSlugForRevalidation(event.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}

/**
 * Reorder timeline events
 */
export async function reorderTimelineEvents(
  finalSpaceId: string,
  eventIds: string[]
): Promise<ActionResult> {
  const user = await requireUser();

  await requireTimelineOwnership(user.id, finalSpaceId);

  // Update sort order for each event
  const updates = eventIds.map((id, index) =>
    db
      .update(timelineEvents)
      .set({ sortOrder: index })
      .where(
        and(
          eq(timelineEvents.id, id),
          eq(timelineEvents.finalSpaceId, finalSpaceId)
        )
      )
  );

  await Promise.all(updates);

  const slug = await getSlugForRevalidation(finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}

// ==========================================
// READ ACTIONS
// ==========================================

/**
 * Get all timeline events for a FinalSpace (for editing)
 */
export async function getTimelineEvents(
  finalSpaceId: string
): Promise<TimelineEvent[]> {
  const user = await requireUser();
  await requireTimelineOwnership(user.id, finalSpaceId);

  return db
    .select()
    .from(timelineEvents)
    .where(eq(timelineEvents.finalSpaceId, finalSpaceId))
    .orderBy(asc(timelineEvents.sortOrder));
}

/**
 * Get public timeline events for a FinalSpace (for public display)
 */
export async function getPublicTimelineEvents(
  finalSpaceId: string
): Promise<TimelineEvent[]> {
  return db
    .select()
    .from(timelineEvents)
    .where(
      and(
        eq(timelineEvents.finalSpaceId, finalSpaceId),
        eq(timelineEvents.isPublic, true)
      )
    )
    .orderBy(
      desc(timelineEvents.eventYear),
      desc(timelineEvents.eventMonth),
      desc(timelineEvents.eventDay)
    );
}

/**
 * Get a single timeline event by ID
 */
export async function getTimelineEvent(
  eventId: string
): Promise<TimelineEvent | null> {
  const user = await requireUser();

  const [event] = await db
    .select()
    .from(timelineEvents)
    .where(eq(timelineEvents.id, eventId))
    .limit(1);

  if (!event) {
    return null;
  }

  await requireTimelineOwnership(user.id, event.finalSpaceId);

  return event;
}

/**
 * Get all active timeline categories
 */
export async function getTimelineCategories(): Promise<TimelineCategory[]> {
  return db
    .select()
    .from(timelineCategories)
    .where(eq(timelineCategories.isActive, true))
    .orderBy(asc(timelineCategories.sortOrder));
}

/**
 * Get public timeline events with their categories (for public display)
 */
export async function getPublicTimelineEventsWithCategories(
  finalSpaceId: string
): Promise<TimelineEventWithCategory[]> {
  const results = await db
    .select({
      event: timelineEvents,
      category: {
        id: timelineCategories.id,
        name: timelineCategories.name,
        color: timelineCategories.color,
        icon: timelineCategories.icon,
      },
    })
    .from(timelineEvents)
    .leftJoin(
      timelineCategories,
      eq(timelineEvents.categoryId, timelineCategories.id)
    )
    .where(
      and(
        eq(timelineEvents.finalSpaceId, finalSpaceId),
        eq(timelineEvents.isPublic, true)
      )
    )
    .orderBy(
      desc(timelineEvents.eventYear),
      desc(timelineEvents.eventMonth),
      desc(timelineEvents.eventDay)
    );

  return results.map((row) => ({
    ...row.event,
    category: row.category,
  }));
}

/**
 * Get all timeline events with their categories (for editing)
 */
export async function getTimelineEventsWithCategories(
  finalSpaceId: string
): Promise<TimelineEventWithCategory[]> {
  const user = await requireUser();
  await requireTimelineOwnership(user.id, finalSpaceId);

  const results = await db
    .select({
      event: timelineEvents,
      category: {
        id: timelineCategories.id,
        name: timelineCategories.name,
        color: timelineCategories.color,
        icon: timelineCategories.icon,
      },
    })
    .from(timelineEvents)
    .leftJoin(
      timelineCategories,
      eq(timelineEvents.categoryId, timelineCategories.id)
    )
    .where(eq(timelineEvents.finalSpaceId, finalSpaceId))
    .orderBy(
      desc(timelineEvents.eventYear),
      desc(timelineEvents.eventMonth),
      desc(timelineEvents.eventDay)
    );

  return results.map((row) => ({
    ...row.event,
    category: row.category,
  }));
}

/**
 * Auto-create birth and death events from FinalSpace dates
 */
export async function autoCreateBirthDeathEvents(
  finalSpaceId: string,
  displayName: string,
  birthDate: string | null,
  deathDate: string | null,
  placeOfBirth: string | null
): Promise<ActionResult> {
  const user = await requireUser();
  await requireTimelineOwnership(user.id, finalSpaceId);

  // Get the "personal" category for these events
  const [personalCategory] = await db
    .select({ id: timelineCategories.id })
    .from(timelineCategories)
    .where(eq(timelineCategories.key, "personal"))
    .limit(1);

  const categoryId = personalCategory?.id ?? null;
  const eventsToCreate: Array<typeof timelineEvents.$inferInsert> = [];

  // Check for existing birth event
  if (birthDate) {
    const parsed = parseDateString(birthDate);
    const [existingBirth] = await db
      .select({ id: timelineEvents.id })
      .from(timelineEvents)
      .where(
        and(
          eq(timelineEvents.finalSpaceId, finalSpaceId),
          eq(timelineEvents.eventType, "birth")
        )
      )
      .limit(1);

    if (!existingBirth && parsed) {
      const sortOrder = await getNextSortOrder(finalSpaceId);
      eventsToCreate.push({
        finalSpaceId,
        categoryId,
        title: `${displayName} was born`,
        description: placeOfBirth ? `Born in ${placeOfBirth}` : null,
        eventType: "birth",
        eventMonth: parsed.month,
        eventDay: parsed.day,
        eventYear: parsed.year,
        location: placeOfBirth,
        isPublic: true,
        sortOrder,
      });
    }
  }

  // Check for existing death event
  if (deathDate) {
    const parsed = parseDateString(deathDate);
    const [existingDeath] = await db
      .select({ id: timelineEvents.id })
      .from(timelineEvents)
      .where(
        and(
          eq(timelineEvents.finalSpaceId, finalSpaceId),
          eq(timelineEvents.eventType, "other"),
          eq(timelineEvents.title, `${displayName} passed away`)
        )
      )
      .limit(1);

    if (!existingDeath && parsed) {
      const sortOrder =
        (await getNextSortOrder(finalSpaceId)) + eventsToCreate.length;
      eventsToCreate.push({
        finalSpaceId,
        categoryId,
        title: `${displayName} passed away`,
        eventType: "other",
        eventMonth: parsed.month,
        eventDay: parsed.day,
        eventYear: parsed.year,
        isPublic: true,
        sortOrder,
      });
    }
  }

  if (eventsToCreate.length > 0) {
    await db.insert(timelineEvents).values(eventsToCreate);

    const slug = await getSlugForRevalidation(finalSpaceId);
    if (slug) {
      revalidatePath(`/m/${slug}`);
    }
  }

  return { success: true, data: undefined };
}

/**
 * Parse a date string like "1953-04-15" or "April 1953" into components
 */
function parseDateString(
  dateStr: string
): { year: number | null; month: number | null; day: number | null } | null {
  if (!dateStr) return null;

  // Try ISO format: YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      year: Number.parseInt(isoMatch[1], 10),
      month: Number.parseInt(isoMatch[2], 10),
      day: Number.parseInt(isoMatch[3], 10),
    };
  }

  // Try partial ISO: YYYY-MM
  const partialIsoMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (partialIsoMatch) {
    return {
      year: Number.parseInt(partialIsoMatch[1], 10),
      month: Number.parseInt(partialIsoMatch[2], 10),
      day: null,
    };
  }

  // Try year only: YYYY
  const yearOnlyMatch = dateStr.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return {
      year: Number.parseInt(yearOnlyMatch[1], 10),
      month: null,
      day: null,
    };
  }

  // Try "Month YYYY" format
  const monthYearMatch = dateStr.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i
  );
  if (monthYearMatch) {
    const months: Record<string, number> = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };
    return {
      year: Number.parseInt(monthYearMatch[2], 10),
      month: months[monthYearMatch[1].toLowerCase()] ?? null,
      day: null,
    };
  }

  return null;
}
