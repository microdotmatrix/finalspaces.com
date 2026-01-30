import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { finalSpaceCollaborators, finalSpaces, users } from "@/lib/db/schema";
import "server-only";

export type AuthUser = typeof users.$inferSelect;

/**
 * Get the current authenticated user from the database.
 * If authenticated via Clerk but missing from DB, auto-creates the user record.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (existingUser) {
    return existingUser;
  }

  // User exists in Clerk but not in DB - auto-sync them
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      clerkUserId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      profileImageUrl: clerkUser.imageUrl ?? null,
    })
    .returning();

  return newUser ?? null;
}

/**
 * Get the current user or throw an error if not authenticated.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: User not authenticated");
  }

  return user;
}

/**
 * Require the current user to be an admin.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();

  if (!user.isAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

/**
 * Check if a user can edit a FinalSpace (is owner or active collaborator).
 */
export async function canEditFinalSpace(
  userId: string,
  finalSpaceId: string
): Promise<boolean> {
  // Check if user is owner
  const [space] = await db
    .select({ ownerUserId: finalSpaces.ownerUserId })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, finalSpaceId))
    .limit(1);

  if (!space) {
    return false;
  }

  if (space.ownerUserId === userId) {
    return true;
  }

  // Check if user is an active collaborator
  const [collaboration] = await db
    .select()
    .from(finalSpaceCollaborators)
    .where(
      and(
        eq(finalSpaceCollaborators.finalSpaceId, finalSpaceId),
        eq(finalSpaceCollaborators.collaboratorUserId, userId),
        eq(finalSpaceCollaborators.status, "active")
      )
    )
    .limit(1);

  return !!collaboration;
}

/**
 * Check if a user can view a FinalSpace.
 * Public = published spaces are visible to everyone.
 * Drafts are only visible to owner/collaborators.
 */
export async function canViewFinalSpace(
  userId: string | null,
  finalSpaceId: string
): Promise<boolean> {
  const [space] = await db
    .select({
      ownerUserId: finalSpaces.ownerUserId,
      status: finalSpaces.status,
    })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, finalSpaceId))
    .limit(1);

  if (!space) {
    return false;
  }

  // Published spaces are publicly viewable
  if (space.status === "published") {
    return true;
  }

  // Drafts require auth
  if (!userId) {
    return false;
  }

  // Owner can view
  if (space.ownerUserId === userId) {
    return true;
  }

  // Active collaborator can view
  const [collaboration] = await db
    .select()
    .from(finalSpaceCollaborators)
    .where(
      and(
        eq(finalSpaceCollaborators.finalSpaceId, finalSpaceId),
        eq(finalSpaceCollaborators.collaboratorUserId, userId),
        eq(finalSpaceCollaborators.status, "active")
      )
    )
    .limit(1);

  return !!collaboration;
}

/**
 * Get user info from Clerk (for displaying in UI when DB user isn't needed).
 */
export async function getClerkUser() {
  return currentUser();
}
