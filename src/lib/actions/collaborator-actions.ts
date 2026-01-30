"use server";

import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canEditFinalSpace, getCurrentUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { finalSpaceCollaborators, finalSpaces, users } from "@/lib/db/schema";

// ==========================================
// TYPES & VALIDATION
// ==========================================

const MAX_COLLABORATORS = 3;

const inviteCollaboratorSchema = z.object({
  finalSpaceId: z.uuid(),
  email: z.email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;

export type Collaborator = typeof finalSpaceCollaborators.$inferSelect;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ==========================================
// HELPERS
// ==========================================

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function requireCollaboratorOwnership(
  userId: string,
  finalSpaceId: string
): Promise<void> {
  const hasAccess = await canEditFinalSpace(userId, finalSpaceId);
  if (!hasAccess) {
    throw new Error("Not authorized to manage collaborators");
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

// ==========================================
// INVITE ACTIONS
// ==========================================

/**
 * Invite a collaborator to a FinalSpace
 */
export async function inviteCollaborator(
  input: InviteCollaboratorInput
): Promise<ActionResult<Collaborator>> {
  const user = await requireUser();

  const parsed = inviteCollaboratorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const data = parsed.data;

  // Check ownership
  await requireCollaboratorOwnership(user.id, data.finalSpaceId);

  // Get the FinalSpace to check owner email
  const [space] = await db
    .select({
      id: finalSpaces.id,
      ownerUserId: finalSpaces.ownerUserId,
    })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, data.finalSpaceId))
    .limit(1);

  if (!space) {
    return { success: false, error: "Memorial not found" };
  }

  // Check if trying to invite owner
  const [owner] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, space.ownerUserId ?? ""))
    .limit(1);

  if (owner?.email?.toLowerCase() === data.email.toLowerCase()) {
    return {
      success: false,
      error: "Cannot invite the owner as a collaborator",
    };
  }

  // Check existing collaborators count
  const existingCollaborators = await db
    .select({ id: finalSpaceCollaborators.id })
    .from(finalSpaceCollaborators)
    .where(eq(finalSpaceCollaborators.finalSpaceId, data.finalSpaceId));

  if (existingCollaborators.length >= MAX_COLLABORATORS) {
    return {
      success: false,
      error: `Maximum of ${MAX_COLLABORATORS} collaborators allowed`,
    };
  }

  // Check for duplicate email
  const [existing] = await db
    .select({ id: finalSpaceCollaborators.id })
    .from(finalSpaceCollaborators)
    .where(
      and(
        eq(finalSpaceCollaborators.finalSpaceId, data.finalSpaceId),
        eq(finalSpaceCollaborators.email, data.email.toLowerCase())
      )
    )
    .limit(1);

  if (existing) {
    return { success: false, error: "This person has already been invited" };
  }

  // Generate invite token
  const inviteToken = generateInviteToken();

  // Create collaborator record
  const [collaborator] = await db
    .insert(finalSpaceCollaborators)
    .values({
      finalSpaceId: data.finalSpaceId,
      email: data.email.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      inviteToken,
      status: "pending",
      invitedByUserId: user.id,
    })
    .returning();

  // TODO: Send invite email via Resend
  // await sendInviteEmail({
  //   to: data.email,
  //   firstName: data.firstName,
  //   token: inviteToken,
  //   spaceName: space.name,
  // });

  revalidatePath("/dashboard");

  return { success: true, data: collaborator };
}

/**
 * Accept an invite using a token
 */
export async function acceptInvite(
  token: string
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireUser();

  // Find invite by token
  const [invite] = await db
    .select()
    .from(finalSpaceCollaborators)
    .where(eq(finalSpaceCollaborators.inviteToken, token))
    .limit(1);

  if (!invite) {
    return { success: false, error: "Invalid or expired invite link" };
  }

  if (invite.status === "active") {
    // Already accepted - get slug and redirect
    const slug = await getSlugForRevalidation(invite.finalSpaceId);
    return {
      success: true,
      data: { slug: slug ?? "" },
    };
  }

  // Verify the email matches (case-insensitive)
  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      success: false,
      error: "This invite is for a different email address",
    };
  }

  // Accept the invite
  await db
    .update(finalSpaceCollaborators)
    .set({
      status: "active",
      collaboratorUserId: user.id,
      inviteToken: null, // Clear token after use
      acceptedAt: new Date(),
    })
    .where(eq(finalSpaceCollaborators.id, invite.id));

  const slug = await getSlugForRevalidation(invite.finalSpaceId);

  revalidatePath("/dashboard");

  return { success: true, data: { slug: slug ?? "" } };
}

/**
 * Resend an invite email
 */
export async function resendInvite(
  collaboratorId: string
): Promise<ActionResult> {
  const user = await requireUser();

  const [collaborator] = await db
    .select()
    .from(finalSpaceCollaborators)
    .where(eq(finalSpaceCollaborators.id, collaboratorId))
    .limit(1);

  if (!collaborator) {
    return { success: false, error: "Collaborator not found" };
  }

  if (collaborator.status === "active") {
    return { success: false, error: "This invite has already been accepted" };
  }

  await requireCollaboratorOwnership(user.id, collaborator.finalSpaceId);

  // Generate new token
  const newToken = generateInviteToken();

  await db
    .update(finalSpaceCollaborators)
    .set({
      inviteToken: newToken,
      invitedAt: new Date(),
    })
    .where(eq(finalSpaceCollaborators.id, collaboratorId));

  // TODO: Resend invite email via Resend

  return { success: true, data: undefined };
}

/**
 * Remove a collaborator
 */
export async function removeCollaborator(
  collaboratorId: string
): Promise<ActionResult> {
  const user = await requireUser();

  const [collaborator] = await db
    .select({ finalSpaceId: finalSpaceCollaborators.finalSpaceId })
    .from(finalSpaceCollaborators)
    .where(eq(finalSpaceCollaborators.id, collaboratorId))
    .limit(1);

  if (!collaborator) {
    return { success: false, error: "Collaborator not found" };
  }

  await requireCollaboratorOwnership(user.id, collaborator.finalSpaceId);

  await db
    .delete(finalSpaceCollaborators)
    .where(eq(finalSpaceCollaborators.id, collaboratorId));

  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}

// ==========================================
// READ ACTIONS
// ==========================================

/**
 * Get all collaborators for a FinalSpace
 */
export async function getCollaborators(
  finalSpaceId: string
): Promise<Collaborator[]> {
  const user = await getCurrentUser();

  if (user) {
    const hasAccess = await canEditFinalSpace(user.id, finalSpaceId);
    if (hasAccess) {
      return db
        .select()
        .from(finalSpaceCollaborators)
        .where(eq(finalSpaceCollaborators.finalSpaceId, finalSpaceId));
    }
  }

  return [];
}

/**
 * Get invite details by token (for accept page)
 */
export async function getInviteByToken(token: string): Promise<{
  invite: Collaborator | null;
  spaceName: string | null;
}> {
  const [invite] = await db
    .select()
    .from(finalSpaceCollaborators)
    .where(eq(finalSpaceCollaborators.inviteToken, token))
    .limit(1);

  if (!invite) {
    return { invite: null, spaceName: null };
  }

  const [space] = await db
    .select({ name: finalSpaces.name })
    .from(finalSpaces)
    .where(eq(finalSpaces.id, invite.finalSpaceId))
    .limit(1);

  return { invite, spaceName: space?.name ?? null };
}
