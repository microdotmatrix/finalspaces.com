"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getCurrentUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { finalSpaceCollaborators, finalSpaces } from "@/lib/db/schema";
import { createUniqueSlug } from "@/lib/utils/slug";

// Re-export types from schema for convenience
export type { FinalSpace } from "@/lib/db/schema";

// Types
export type CreateFinalSpaceInput = {
  name: string;
  firstName?: string;
  lastName?: string;
  inMemoriam?: boolean;
};

export type UpdateFinalSpaceInput = {
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  nickname?: string;
  useNicknameOnly?: boolean;
  birthDate?: string;
  deathDate?: string;
  placeOfBirth?: string;
  hometown?: string;
  bioText?: string;
  lifeHighlights?: string;
  inMemoriam?: boolean;
  quotesJson?: unknown[];
  youtubeLinks?: unknown[];
  spotifyLinks?: unknown[];
  socialLinks?: Record<string, string>;
  themeKey?: string;
};

// Helper to check if a slug exists
async function slugExists(slug: string): Promise<boolean> {
  const existing = await db
    .select({ id: finalSpaces.id })
    .from(finalSpaces)
    .where(eq(finalSpaces.slug, slug))
    .limit(1);
  return existing.length > 0;
}

// Access control helper
async function requireFinalSpaceAccess(
  userId: string,
  spaceId: string,
  level: "view" | "edit" | "delete"
): Promise<void> {
  const space = await db
    .select({
      id: finalSpaces.id,
      ownerUserId: finalSpaces.ownerUserId,
      status: finalSpaces.status,
    })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, spaceId))
    .limit(1);

  if (!space[0]) {
    throw new Error("FinalSpace not found");
  }

  const isOwner = space[0].ownerUserId === userId;

  // Check if user is admin
  const user = await getCurrentUser();
  const isAdmin = user?.isAdmin ?? false;

  // For delete: only owner or admin
  if (level === "delete") {
    if (!(isOwner || isAdmin)) {
      throw new Error("Only owner or admin can delete");
    }
    return;
  }

  // For edit: owner, admin, or active collaborator
  if (level === "edit") {
    if (isOwner || isAdmin) return;

    // Check collaborator status
    const collaborator = await db
      .select({ status: finalSpaceCollaborators.status })
      .from(finalSpaceCollaborators)
      .where(
        and(
          eq(finalSpaceCollaborators.finalSpaceId, spaceId),
          eq(finalSpaceCollaborators.collaboratorUserId, userId)
        )
      )
      .limit(1);

    if (collaborator[0]?.status === "active") return;

    throw new Error("Not authorized to edit this FinalSpace");
  }

  // For view: owner, admin, collaborator, or published
  if (level === "view") {
    if (isOwner || isAdmin) return;
    if (space[0].status === "published") return;

    // Check collaborator
    const collaborator = await db
      .select({ id: finalSpaceCollaborators.id })
      .from(finalSpaceCollaborators)
      .where(
        and(
          eq(finalSpaceCollaborators.finalSpaceId, spaceId),
          eq(finalSpaceCollaborators.collaboratorUserId, userId)
        )
      )
      .limit(1);

    if (collaborator.length > 0) return;

    throw new Error("Not authorized to view this FinalSpace");
  }
}

/**
 * Create a new FinalSpace draft
 */
export async function createFinalSpace(input: CreateFinalSpaceInput) {
  const user = await requireUser();

  // Generate unique slug from name
  const slug = await createUniqueSlug(input.name, slugExists);

  const [newSpace] = await db
    .insert(finalSpaces)
    .values({
      ownerUserId: user.id,
      slug,
      name: input.name,
      firstName: input.firstName,
      lastName: input.lastName,
      inMemoriam: input.inMemoriam ?? false,
      status: "draft",
    })
    .returning();

  revalidatePath("/dashboard");

  return { success: true, finalSpace: newSpace };
}

/**
 * Update a FinalSpace
 */
export async function updateFinalSpace(
  spaceId: string,
  input: UpdateFinalSpaceInput
) {
  const user = await requireUser();
  await requireFinalSpaceAccess(user.id, spaceId, "edit");

  const [updated] = await db
    .update(finalSpaces)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(finalSpaces.id, spaceId))
    .returning();

  revalidatePath(`/m/${updated.slug}`);
  revalidatePath("/dashboard");

  return { success: true, finalSpace: updated };
}

/**
 * Publish a FinalSpace (with required field validation)
 */
export async function publishFinalSpace(spaceId: string) {
  const user = await requireUser();
  await requireFinalSpaceAccess(user.id, spaceId, "edit");

  // Fetch current state
  const [space] = await db
    .select()
    .from(finalSpaces)
    .where(eq(finalSpaces.id, spaceId))
    .limit(1);

  if (!space) {
    return { success: false, error: "FinalSpace not found" };
  }

  // Validation: check required fields for publishing
  const errors: string[] = [];

  if (!space.name?.trim()) {
    errors.push("Name is required");
  }

  if (!(space.firstName?.trim() || space.nickname?.trim())) {
    errors.push("First name or nickname is required");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Update status to published
  const [published] = await db
    .update(finalSpaces)
    .set({
      status: "published",
      updatedAt: new Date(),
    })
    .where(eq(finalSpaces.id, spaceId))
    .returning();

  revalidatePath(`/m/${published.slug}`);
  revalidatePath("/dashboard");

  return { success: true, finalSpace: published };
}

/**
 * Unpublish a FinalSpace (set back to draft)
 */
export async function unpublishFinalSpace(spaceId: string) {
  const user = await requireUser();
  await requireFinalSpaceAccess(user.id, spaceId, "edit");

  const [updated] = await db
    .update(finalSpaces)
    .set({
      status: "draft",
      updatedAt: new Date(),
    })
    .where(eq(finalSpaces.id, spaceId))
    .returning();

  revalidatePath(`/m/${updated.slug}`);
  revalidatePath("/dashboard");

  return { success: true, finalSpace: updated };
}

/**
 * Delete a FinalSpace (owner/admin only)
 */
export async function deleteFinalSpace(spaceId: string) {
  const user = await requireUser();
  await requireFinalSpaceAccess(user.id, spaceId, "delete");

  // Get slug before deletion for revalidation
  const [space] = await db
    .select({ slug: finalSpaces.slug })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, spaceId))
    .limit(1);

  await db.delete(finalSpaces).where(eq(finalSpaces.id, spaceId));

  if (space) {
    revalidatePath(`/m/${space.slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Get a FinalSpace by ID (with access control)
 */
export async function getFinalSpace(spaceId: string) {
  const user = await getCurrentUser();

  const [space] = await db
    .select()
    .from(finalSpaces)
    .where(eq(finalSpaces.id, spaceId))
    .limit(1);

  if (!space) {
    return null;
  }

  // Check access
  if (user) {
    try {
      await requireFinalSpaceAccess(user.id, spaceId, "view");
      return space;
    } catch {
      return null;
    }
  }

  // Anonymous: only published
  if (space.status === "published") {
    return space;
  }

  return null;
}

/**
 * Get a FinalSpace by slug (public route)
 */
export async function getFinalSpaceBySlug(slug: string) {
  const [space] = await db
    .select()
    .from(finalSpaces)
    .where(eq(finalSpaces.slug, slug))
    .limit(1);

  if (!space) {
    return null;
  }

  // Public access: only published spaces
  // For authenticated users who might have edit access,
  // the edit UI uses getFinalSpace(id) instead
  if (space.status !== "published") {
    return null;
  }

  return space;
}

/**
 * Get all FinalSpaces for the current user
 */
export async function getUserFinalSpaces() {
  const user = await requireUser();

  const spaces = await db
    .select()
    .from(finalSpaces)
    .where(eq(finalSpaces.ownerUserId, user.id))
    .orderBy(finalSpaces.updatedAt);

  return spaces;
}
