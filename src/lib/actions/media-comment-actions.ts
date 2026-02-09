"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canEditFinalSpace, getCurrentUser, requireUser } from "@/lib/auth";
import { features } from "@/lib/config";
import { db } from "@/lib/db";
import {
  albumMedia,
  finalSpaces,
  mediaAssets,
  mediaCommentReports,
  mediaComments,
  users,
} from "@/lib/db/schema";
import { containsBlockedLanguage } from "@/lib/moderation/text-filter";
import { checkAndRecordRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_COMMENT_LENGTH = 1000;
const MAX_REASON_LENGTH = 500;

const createMediaCommentSchema = z.object({
  mediaId: z.uuid(),
  commentText: z.string().trim().min(1).max(MAX_COMMENT_LENGTH),
});

const updateMediaCommentSchema = z.object({
  commentId: z.uuid(),
  commentText: z.string().trim().min(1).max(MAX_COMMENT_LENGTH),
});

const deleteMediaCommentSchema = z.object({
  commentId: z.uuid(),
});

const reportMediaCommentSchema = z.object({
  commentId: z.uuid(),
  reason: z.string().trim().max(MAX_REASON_LENGTH).optional(),
});

const flagMediaCommentSchema = z.object({
  commentId: z.uuid(),
  reason: z.string().trim().max(MAX_REASON_LENGTH).optional(),
});

const getMediaCommentsSchema = z.object({
  mediaId: z.uuid(),
});

export interface MediaCommentView {
  id: string;
  mediaId: string;
  authorName: string;
  authorUserId: string | null;
  commentText: string | null;
  moderationStatus: "ok" | "flagged" | "hidden";
  createdAt: Date | null;
  editedAt: Date | null;
  canEdit: boolean;
  canDelete: boolean;
  canFlag: boolean;
  canReport: boolean;
}

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

interface MediaContext {
  finalSpaceId: string;
  slug: string;
  status: "draft" | "published";
}

interface CommentContext {
  id: string;
  mediaId: string;
  authorUserId: string | null;
  isDeleted: boolean;
  moderationStatus: "ok" | "flagged" | "hidden";
  finalSpaceId: string;
  slug: string;
  status: "draft" | "published";
}

async function getMediaContext(mediaId: string): Promise<MediaContext | null> {
  const [row] = await db
    .select({
      finalSpaceId: mediaAssets.finalSpaceId,
      slug: finalSpaces.slug,
      status: finalSpaces.status,
    })
    .from(mediaAssets)
    .innerJoin(finalSpaces, eq(mediaAssets.finalSpaceId, finalSpaces.id))
    .where(eq(mediaAssets.id, mediaId))
    .limit(1);

  return row ?? null;
}

async function getCommentContext(
  commentId: string
): Promise<CommentContext | null> {
  const [row] = await db
    .select({
      id: mediaComments.id,
      mediaId: mediaComments.mediaId,
      authorUserId: mediaComments.authorUserId,
      isDeleted: mediaComments.isDeleted,
      moderationStatus: mediaComments.moderationStatus,
      finalSpaceId: mediaAssets.finalSpaceId,
      slug: finalSpaces.slug,
      status: finalSpaces.status,
    })
    .from(mediaComments)
    .innerJoin(mediaAssets, eq(mediaComments.mediaId, mediaAssets.id))
    .innerJoin(finalSpaces, eq(mediaAssets.finalSpaceId, finalSpaces.id))
    .where(eq(mediaComments.id, commentId))
    .limit(1);

  return row ?? null;
}

async function isAlbumMedia(mediaId: string): Promise<boolean> {
  const [row] = await db
    .select({ mediaId: albumMedia.mediaId })
    .from(albumMedia)
    .where(eq(albumMedia.mediaId, mediaId))
    .limit(1);

  return !!row;
}

function getAuthorDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
}): string {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (fullName) {
    return fullName;
  }

  if (user.username) {
    return user.username;
  }

  return "Member";
}

async function revalidateCommentPaths(
  slug: string,
  mediaId: string
): Promise<void> {
  revalidatePath(`/m/${slug}`);

  const albumEntries = await db
    .select({ albumId: albumMedia.albumId })
    .from(albumMedia)
    .where(eq(albumMedia.mediaId, mediaId));

  for (const entry of albumEntries) {
    revalidatePath(`/m/${slug}/albums/${entry.albumId}`);
  }
}

export async function getMediaComments(input: {
  mediaId: string;
}): Promise<ActionResult<MediaCommentView[]>> {
  if (!features.mediaCommentsEnabled) {
    return { success: true, data: [] };
  }

  const parsed = getMediaCommentsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { mediaId } = parsed.data;
  const mediaContext = await getMediaContext(mediaId);
  if (!mediaContext) {
    return { success: false, error: "Media not found" };
  }

  const currentUser = await getCurrentUser();
  const canModerate = currentUser
    ? await canEditFinalSpace(currentUser.id, mediaContext.finalSpaceId)
    : false;

  if (mediaContext.status !== "published" && !canModerate) {
    return { success: true, data: [] };
  }

  const rows = await db
    .select({
      comment: mediaComments,
      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        email: users.email,
      },
    })
    .from(mediaComments)
    .leftJoin(users, eq(mediaComments.authorUserId, users.id))
    .where(
      and(
        eq(mediaComments.mediaId, mediaId),
        eq(mediaComments.isDeleted, false)
      )
    )
    .orderBy(desc(mediaComments.createdAt));

  const filtered = rows.filter((row) => {
    if (canModerate) {
      return true;
    }

    if (row.comment.moderationStatus === "ok") {
      return true;
    }

    if (currentUser && row.comment.authorUserId === currentUser.id) {
      return true;
    }

    return false;
  });

  const data = filtered.map(({ comment, author }) => {
    const isAuthor = !!currentUser && comment.authorUserId === currentUser.id;
    const authorName = author
      ? getAuthorDisplayName(author)
      : comment.authorName || "Member";

    return {
      id: comment.id,
      mediaId: comment.mediaId,
      authorName,
      authorUserId: comment.authorUserId,
      commentText: comment.commentText,
      moderationStatus: comment.moderationStatus,
      createdAt: comment.createdAt,
      editedAt: comment.editedAt,
      canEdit: isAuthor,
      canDelete: isAuthor || canModerate,
      canFlag: canModerate && !isAuthor && comment.moderationStatus === "ok",
      canReport: !!currentUser && !isAuthor,
    } satisfies MediaCommentView;
  });

  return { success: true, data };
}

export async function createMediaComment(input: {
  mediaId: string;
  commentText: string;
}): Promise<ActionResult<MediaCommentView>> {
  if (!features.mediaCommentsEnabled) {
    return { success: false, error: "Media comments are currently disabled" };
  }

  const user = await requireUser();

  const parsed = createMediaCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { mediaId, commentText } = parsed.data;

  if (containsBlockedLanguage(commentText)) {
    return {
      success: false,
      error: "Please remove abusive language and try again.",
    };
  }

  const mediaContext = await getMediaContext(mediaId);
  if (!mediaContext || mediaContext.status !== "published") {
    return { success: false, error: "Media is not available" };
  }

  const albumEntry = await isAlbumMedia(mediaId);
  if (!albumEntry) {
    return {
      success: false,
      error: "Comments are only available on album media",
    };
  }

  const ip = await getClientIp();
  const allowed = await checkAndRecordRateLimit(ip, "mediaCommentCreate");
  if (!allowed) {
    return {
      success: false,
      error: "Too many comments. Please try again in a moment.",
    };
  }

  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!author) {
    return { success: false, error: "User account not found" };
  }

  const [created] = await db
    .insert(mediaComments)
    .values({
      mediaId,
      authorUserId: author.id,
      authorName: getAuthorDisplayName(author),
      commentText,
      moderationStatus: "ok",
    })
    .returning();

  await revalidateCommentPaths(mediaContext.slug, mediaId);

  return {
    success: true,
    data: {
      id: created.id,
      mediaId: created.mediaId,
      authorName: created.authorName,
      authorUserId: created.authorUserId,
      commentText: created.commentText,
      moderationStatus: created.moderationStatus,
      createdAt: created.createdAt,
      editedAt: created.editedAt,
      canEdit: true,
      canDelete: true,
      canFlag: false,
      canReport: false,
    },
  };
}

export async function updateMediaComment(input: {
  commentId: string;
  commentText: string;
}): Promise<ActionResult<MediaCommentView>> {
  if (!features.mediaCommentsEnabled) {
    return { success: false, error: "Media comments are currently disabled" };
  }

  const user = await requireUser();

  const parsed = updateMediaCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { commentId, commentText } = parsed.data;
  const commentContext = await getCommentContext(commentId);

  if (!commentContext || commentContext.isDeleted) {
    return { success: false, error: "Comment not found" };
  }

  if (commentContext.authorUserId !== user.id) {
    return { success: false, error: "You can only edit your own comments" };
  }

  if (containsBlockedLanguage(commentText)) {
    return {
      success: false,
      error: "Please remove abusive language and try again.",
    };
  }

  const ip = await getClientIp();
  const allowed = await checkAndRecordRateLimit(ip, "mediaCommentUpdate");
  if (!allowed) {
    return {
      success: false,
      error: "Too many edits. Please try again later.",
    };
  }

  const [updated] = await db
    .update(mediaComments)
    .set({
      commentText,
      editedAt: new Date(),
      updatedAt: new Date(),
      moderationStatus: "ok",
    })
    .where(eq(mediaComments.id, commentId))
    .returning();

  await revalidateCommentPaths(commentContext.slug, commentContext.mediaId);

  return {
    success: true,
    data: {
      id: updated.id,
      mediaId: updated.mediaId,
      authorName: updated.authorName,
      authorUserId: updated.authorUserId,
      commentText: updated.commentText,
      moderationStatus: updated.moderationStatus,
      createdAt: updated.createdAt,
      editedAt: updated.editedAt,
      canEdit: true,
      canDelete: true,
      canFlag: false,
      canReport: false,
    },
  };
}

export async function deleteMediaComment(input: {
  commentId: string;
}): Promise<ActionResult> {
  if (!features.mediaCommentsEnabled) {
    return { success: false, error: "Media comments are currently disabled" };
  }

  const user = await requireUser();

  const parsed = deleteMediaCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { commentId } = parsed.data;
  const commentContext = await getCommentContext(commentId);

  if (!commentContext || commentContext.isDeleted) {
    return { success: false, error: "Comment not found" };
  }

  const canModerate = await canEditFinalSpace(
    user.id,
    commentContext.finalSpaceId
  );
  const isAuthor = commentContext.authorUserId === user.id;
  if (!(isAuthor || canModerate)) {
    return { success: false, error: "Not authorized to delete this comment" };
  }

  const ip = await getClientIp();
  const allowed = await checkAndRecordRateLimit(ip, "mediaCommentDelete");
  if (!allowed) {
    return {
      success: false,
      error: "Too many deletion attempts. Please try again later.",
    };
  }

  await db
    .update(mediaComments)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedByUserId: user.id,
      updatedAt: new Date(),
    })
    .where(eq(mediaComments.id, commentId));

  await revalidateCommentPaths(commentContext.slug, commentContext.mediaId);

  return { success: true, data: undefined };
}

export async function flagMediaCommentByModerator(input: {
  commentId: string;
  reason?: string;
}): Promise<ActionResult> {
  if (!features.mediaCommentsEnabled) {
    return { success: false, error: "Media comments are currently disabled" };
  }

  const user = await requireUser();

  const parsed = flagMediaCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { commentId } = parsed.data;
  const commentContext = await getCommentContext(commentId);

  if (!commentContext || commentContext.isDeleted) {
    return { success: false, error: "Comment not found" };
  }

  const canModerate = await canEditFinalSpace(
    user.id,
    commentContext.finalSpaceId
  );
  if (!canModerate) {
    return { success: false, error: "Not authorized to flag this comment" };
  }

  if (commentContext.authorUserId === user.id) {
    return { success: false, error: "You cannot flag your own comment" };
  }

  const ip = await getClientIp();
  const allowed = await checkAndRecordRateLimit(ip, "mediaCommentModerate");
  if (!allowed) {
    return {
      success: false,
      error: "Too many moderation actions. Please try again later.",
    };
  }

  await db
    .update(mediaComments)
    .set({
      moderationStatus: "flagged",
      flaggedByUserId: user.id,
      flaggedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mediaComments.id, commentId));

  await revalidateCommentPaths(commentContext.slug, commentContext.mediaId);

  return { success: true, data: undefined };
}

export async function reportMediaComment(input: {
  commentId: string;
  reason?: string;
}): Promise<ActionResult> {
  if (
    !(features.mediaCommentsEnabled && features.mediaCommentReportingEnabled)
  ) {
    return { success: false, error: "Comment reporting is currently disabled" };
  }

  const user = await requireUser();

  const parsed = reportMediaCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { commentId, reason } = parsed.data;
  const commentContext = await getCommentContext(commentId);

  if (!commentContext || commentContext.isDeleted) {
    return { success: false, error: "Comment not found" };
  }

  if (commentContext.authorUserId === user.id) {
    return { success: false, error: "You cannot report your own comment" };
  }

  const ip = await getClientIp();
  const allowed = await checkAndRecordRateLimit(ip, "mediaCommentReport");
  if (!allowed) {
    return {
      success: false,
      error: "Too many reports. Please try again later.",
    };
  }

  const inserted = await db
    .insert(mediaCommentReports)
    .values({
      mediaCommentId: commentId,
      reporterUserId: user.id,
      reason: reason ?? null,
    })
    .onConflictDoNothing()
    .returning({ id: mediaCommentReports.id });

  if (inserted.length === 0) {
    return { success: false, error: "You already reported this comment" };
  }

  await db
    .update(mediaComments)
    .set({
      moderationStatus: "flagged",
      reportCount: sql`${mediaComments.reportCount} + 1`,
      flaggedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mediaComments.id, commentId));

  await revalidateCommentPaths(commentContext.slug, commentContext.mediaId);

  return { success: true, data: undefined };
}
