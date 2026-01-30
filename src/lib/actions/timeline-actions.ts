"use server";

import { and, asc, desc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canEditFinalSpace, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  finalSpaces,
  timelineCategories,
  timelineEvents,
} from "@/lib/db/schema";

// ==========================================
// TYPES & VALIDATION
// ==========================================

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

const updateTimelineEventSchema = createTimelineEventSchema.partial().extend({
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
    .select({ finalSpaceId: timelineEvents.finalSpaceId })
    .from(timelineEvents)
    .where(eq(timelineEvents.id, id))
    .limit(1);

  if (!existingEvent) {
    return { success: false, error: "Event not found" };
  }

  await requireTimelineOwnership(user.id, existingEvent.finalSpaceId);

  const [event] = await db
    .update(timelineEvents)
    .set(data)
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
  const [event] = await db
    .select()
    .from(timelineEvents)
    .where(eq(timelineEvents.id, eventId))
    .limit(1);
  return event ?? null;
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
