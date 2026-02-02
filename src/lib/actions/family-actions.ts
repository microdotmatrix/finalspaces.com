"use server";

import { and, asc, eq, ilike, max, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";

import { canEditFinalSpace, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  familyMembers,
  finalSpaces,
  insertFamilyMemberSchema,
} from "@/lib/db/schema";

// ==========================================
// TYPES
// ==========================================

export type FamilyMember = typeof familyMembers.$inferSelect;
export type CreateFamilyMemberInput = z.infer<
  typeof insertFamilyMemberSchema
> & {
  finalSpaceId: string;
};
export type UpdateFamilyMemberInput = Partial<
  z.infer<typeof insertFamilyMemberSchema>
> & {
  id: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface LinkedFinalSpace {
  id: string;
  name: string;
  slug: string | null;
  profilePictureUrl: string | null;
}

// ==========================================
// HELPERS
// ==========================================

async function requireFamilyAccess(
  userId: string,
  finalSpaceId: string
): Promise<void> {
  const hasAccess = await canEditFinalSpace(userId, finalSpaceId);
  if (!hasAccess) {
    throw new Error("Not authorized to manage family tree");
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
    .select({ maxOrder: max(familyMembers.sortOrder) })
    .from(familyMembers)
    .where(eq(familyMembers.finalSpaceId, finalSpaceId));
  return (result?.maxOrder ?? 0) + 1;
}

// ==========================================
// CREATE
// ==========================================

export async function createFamilyMember(
  input: CreateFamilyMemberInput
): Promise<ActionResult<FamilyMember>> {
  const user = await requireUser();

  const { finalSpaceId, ...memberData } = input;

  const parsed = insertFamilyMemberSchema.safeParse(memberData);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  await requireFamilyAccess(user.id, finalSpaceId);

  const sortOrder = await getNextSortOrder(finalSpaceId);

  const [member] = await db
    .insert(familyMembers)
    .values({
      ...parsed.data,
      finalSpaceId,
      sortOrder,
    })
    .returning();

  const slug = await getSlugForRevalidation(finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true, data: member };
}

// ==========================================
// READ
// ==========================================

export async function getFamilyMembers(
  finalSpaceId: string
): Promise<FamilyMember[]> {
  return await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.finalSpaceId, finalSpaceId))
    .orderBy(asc(familyMembers.generationLevel), asc(familyMembers.sortOrder));
}

export async function getFamilyMember(
  memberId: string
): Promise<FamilyMember | null> {
  const [member] = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.id, memberId))
    .limit(1);
  return member ?? null;
}

// ==========================================
// UPDATE
// ==========================================

export async function updateFamilyMember(
  input: UpdateFamilyMemberInput
): Promise<ActionResult<FamilyMember>> {
  const user = await requireUser();

  const { id, ...data } = input;

  const [existing] = await db
    .select({ finalSpaceId: familyMembers.finalSpaceId })
    .from(familyMembers)
    .where(eq(familyMembers.id, id))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Family member not found" };
  }

  await requireFamilyAccess(user.id, existing.finalSpaceId);

  const [updated] = await db
    .update(familyMembers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(familyMembers.id, id))
    .returning();

  const slug = await getSlugForRevalidation(existing.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true, data: updated };
}

// ==========================================
// DELETE
// ==========================================

export async function deleteFamilyMember(
  memberId: string
): Promise<ActionResult> {
  const user = await requireUser();

  const [member] = await db
    .select({ finalSpaceId: familyMembers.finalSpaceId })
    .from(familyMembers)
    .where(eq(familyMembers.id, memberId))
    .limit(1);

  if (!member) {
    return { success: false, error: "Family member not found" };
  }

  await requireFamilyAccess(user.id, member.finalSpaceId);

  await db.delete(familyMembers).where(eq(familyMembers.id, memberId));

  const slug = await getSlugForRevalidation(member.finalSpaceId);
  if (slug) {
    revalidatePath(`/m/${slug}`);
  }
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}

// ==========================================
// REORDER
// ==========================================

export async function reorderFamilyMembers(
  finalSpaceId: string,
  memberIds: string[]
): Promise<ActionResult> {
  const user = await requireUser();

  await requireFamilyAccess(user.id, finalSpaceId);

  const updates = memberIds.map((id, index) =>
    db
      .update(familyMembers)
      .set({ sortOrder: index })
      .where(
        and(
          eq(familyMembers.id, id),
          eq(familyMembers.finalSpaceId, finalSpaceId)
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
// SEARCH FINAL SPACES FOR LINKING
// ==========================================

export async function searchFinalSpacesForLinking(
  query: string,
  currentUserId?: string
): Promise<LinkedFinalSpace[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const searchPattern = `%${query}%`;

  const results = await db
    .select({
      id: finalSpaces.id,
      name: finalSpaces.name,
      slug: finalSpaces.slug,
      profilePictureId: finalSpaces.profilePictureId,
      status: finalSpaces.status,
      ownerUserId: finalSpaces.ownerUserId,
    })
    .from(finalSpaces)
    .where(
      or(
        ilike(finalSpaces.name, searchPattern),
        ilike(finalSpaces.firstName, searchPattern),
        ilike(finalSpaces.lastName, searchPattern)
      )
    )
    .limit(10);

  // Filter to only show published spaces OR spaces the user owns
  // Note: profilePictureId is a media asset UUID, not a URL - would need join to get URL
  return results
    .filter(
      (space) =>
        space.status === "published" ||
        (currentUserId && space.ownerUserId === currentUserId)
    )
    .map((space) => ({
      id: space.id,
      name: space.name,
      slug: space.slug,
      profilePictureUrl: null, // TODO: Join with mediaAssets to get actual URL
    }));
}
