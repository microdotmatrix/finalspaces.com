"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canEditFinalSpace, getCurrentUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { finalSpaces, guestBookEntries } from "@/lib/db/schema";
import { checkAndRecordRateLimit, getClientIp } from "@/lib/rate-limit";

// ==========================================
// TYPES & VALIDATION
// ==========================================

const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;
const MAX_RELATIONSHIP_LENGTH = 100;
const MAX_TITLE_LENGTH = 150;

const submitGuestbookSchema = z.object({
  finalSpaceId: z.uuid(),
  authorName: z.string().min(1).max(MAX_NAME_LENGTH),
  authorEmail: z.email().optional().or(z.literal("")),
  relationship: z.string().max(MAX_RELATIONSHIP_LENGTH).optional(),
  tributeTitle: z.string().max(MAX_TITLE_LENGTH).optional(),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  isAnonymous: z.boolean().optional(),
  honeypot: z.string().optional(), // Spam trap - should be empty
});

export type SubmitGuestbookInput = z.infer<typeof submitGuestbookSchema>;

export type GuestbookEntry = typeof guestBookEntries.$inferSelect;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ==========================================
// HELPERS
// ==========================================

async function requireGuestbookAccess(
  userId: string,
  finalSpaceId: string
): Promise<void> {
  const hasAccess = await canEditFinalSpace(userId, finalSpaceId);
  if (!hasAccess) {
    throw new Error("Not authorized to moderate this guestbook");
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

/**
 * Basic spam heuristics check
 */
function detectSpam(message: string, name: string): boolean {
  const lowerMessage = message.toLowerCase();
  const lowerName = name.toLowerCase();

  // Check for common spam patterns
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|buy now)\b/i,
    /(http[s]?:\/\/[^\s]+){3,}/i, // Multiple URLs
    /(.)\1{10,}/, // Repeated characters
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(lowerMessage) || pattern.test(lowerName)) {
      return true;
    }
  }

  return false;
}

// ==========================================
// PUBLIC ACTIONS
// ==========================================

/**
 * Submit a new guestbook entry (public, rate limited)
 */
export async function submitGuestbookEntry(
  input: SubmitGuestbookInput
): Promise<ActionResult<GuestbookEntry>> {
  // Validate input
  const parsed = submitGuestbookSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const data = parsed.data;

  // Honeypot check - if filled, it's a bot
  if (data.honeypot && data.honeypot.length > 0) {
    // Silently reject but pretend success
    return {
      success: true,
      data: { id: "fake" } as GuestbookEntry,
    };
  }

  // Check if FinalSpace exists and is published
  const [space] = await db
    .select({ id: finalSpaces.id, status: finalSpaces.status })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, data.finalSpaceId))
    .limit(1);

  if (!space) {
    return { success: false, error: "Memorial not found" };
  }

  if (space.status !== "published") {
    return { success: false, error: "Memorial is not available" };
  }

  // Rate limiting
  const clientIp = await getClientIp();
  const allowed = await checkAndRecordRateLimit(clientIp, "guestbook");
  if (!allowed) {
    return {
      success: false,
      error: "Too many submissions. Please try again later.",
    };
  }

  // Spam detection
  const isSpam = detectSpam(data.message, data.authorName);
  const moderationStatus = isSpam ? "flagged" : "ok";

  // Create entry
  const [entry] = await db
    .insert(guestBookEntries)
    .values({
      finalSpaceId: data.finalSpaceId,
      authorName: data.authorName,
      authorEmail: data.authorEmail || null,
      relationship: data.relationship || null,
      tributeTitle: data.tributeTitle || null,
      message: data.message,
      isAnonymous: data.isAnonymous ?? false,
      isApproved: !isSpam, // Auto-approve if not spam
      moderationStatus,
    })
    .returning();

  // Revalidate public page
  const slug = await getSlugForRevalidation(data.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }

  return { success: true, data: entry };
}

/**
 * Flag a guestbook entry (public, rate limited)
 */
export async function flagGuestbookEntry(
  entryId: string
): Promise<ActionResult> {
  const clientIp = await getClientIp();
  const allowed = await checkAndRecordRateLimit(clientIp, "flag");
  if (!allowed) {
    return {
      success: false,
      error: "Too many reports. Please try again later.",
    };
  }

  const [entry] = await db
    .select({ finalSpaceId: guestBookEntries.finalSpaceId })
    .from(guestBookEntries)
    .where(eq(guestBookEntries.id, entryId))
    .limit(1);

  if (!entry) {
    return { success: false, error: "Entry not found" };
  }

  await db
    .update(guestBookEntries)
    .set({ moderationStatus: "flagged" })
    .where(eq(guestBookEntries.id, entryId));

  const slug = await getSlugForRevalidation(entry.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }

  return { success: true, data: undefined };
}

// ==========================================
// OWNER MODERATION ACTIONS
// ==========================================

/**
 * Approve a guestbook entry (owner/collaborator)
 */
export async function approveGuestbookEntry(
  entryId: string
): Promise<ActionResult<GuestbookEntry>> {
  const user = await requireUser();

  const [entry] = await db
    .select()
    .from(guestBookEntries)
    .where(eq(guestBookEntries.id, entryId))
    .limit(1);

  if (!entry) {
    return { success: false, error: "Entry not found" };
  }

  await requireGuestbookAccess(user.id, entry.finalSpaceId);

  const [updated] = await db
    .update(guestBookEntries)
    .set({ isApproved: true, moderationStatus: "ok" })
    .where(eq(guestBookEntries.id, entryId))
    .returning();

  const slug = await getSlugForRevalidation(entry.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }

  return { success: true, data: updated };
}

/**
 * Hide a guestbook entry (owner/collaborator)
 */
export async function hideGuestbookEntry(
  entryId: string
): Promise<ActionResult<GuestbookEntry>> {
  const user = await requireUser();

  const [entry] = await db
    .select()
    .from(guestBookEntries)
    .where(eq(guestBookEntries.id, entryId))
    .limit(1);

  if (!entry) {
    return { success: false, error: "Entry not found" };
  }

  await requireGuestbookAccess(user.id, entry.finalSpaceId);

  const [updated] = await db
    .update(guestBookEntries)
    .set({ moderationStatus: "hidden" })
    .where(eq(guestBookEntries.id, entryId))
    .returning();

  const slug = await getSlugForRevalidation(entry.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }

  return { success: true, data: updated };
}

/**
 * Delete a guestbook entry (owner/collaborator)
 */
export async function deleteGuestbookEntry(
  entryId: string
): Promise<ActionResult> {
  const user = await requireUser();

  const [entry] = await db
    .select({ finalSpaceId: guestBookEntries.finalSpaceId })
    .from(guestBookEntries)
    .where(eq(guestBookEntries.id, entryId))
    .limit(1);

  if (!entry) {
    return { success: false, error: "Entry not found" };
  }

  await requireGuestbookAccess(user.id, entry.finalSpaceId);

  await db.delete(guestBookEntries).where(eq(guestBookEntries.id, entryId));

  const slug = await getSlugForRevalidation(entry.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }

  return { success: true, data: undefined };
}

// ==========================================
// READ ACTIONS
// ==========================================

/**
 * Get all guestbook entries for moderation (owner/collaborator)
 */
export async function getGuestbookEntries(
  finalSpaceId: string
): Promise<GuestbookEntry[]> {
  const user = await getCurrentUser();

  if (user) {
    const hasAccess = await canEditFinalSpace(user.id, finalSpaceId);
    if (hasAccess) {
      // Return all entries for moderation
      return db
        .select()
        .from(guestBookEntries)
        .where(eq(guestBookEntries.finalSpaceId, finalSpaceId))
        .orderBy(desc(guestBookEntries.createdAt));
    }
  }

  // For non-editors, return public entries only
  return getPublicGuestbookEntries(finalSpaceId);
}

/**
 * Get public guestbook entries (approved, not hidden)
 */
export async function getPublicGuestbookEntries(
  finalSpaceId: string
): Promise<GuestbookEntry[]> {
  return db
    .select()
    .from(guestBookEntries)
    .where(
      and(
        eq(guestBookEntries.finalSpaceId, finalSpaceId),
        eq(guestBookEntries.isApproved, true),
        eq(guestBookEntries.moderationStatus, "ok")
      )
    )
    .orderBy(desc(guestBookEntries.createdAt));
}
