import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { canEditFinalSpace } from "@/lib/auth";
import { db } from "@/lib/db";
import { finalSpaces, mediaAssets, users } from "@/lib/db/schema";

const f = createUploadthing();

/**
 * Authenticate user and return their database user ID
 */
async function authenticateUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new UploadThingError("Unauthorized: Please sign in to upload files");
  }

  // Get the database user
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user) {
    throw new UploadThingError("User not found in database");
  }

  return { userId: user.id, clerkUserId };
}

/**
 * Validate that user can edit the specified FinalSpace
 */
async function validateFinalSpaceAccess(userId: string, finalSpaceId: string) {
  const hasAccess = await canEditFinalSpace(userId, finalSpaceId);

  if (!hasAccess) {
    throw new UploadThingError(
      "You don't have permission to upload to this FinalSpace"
    );
  }

  return true;
}

/**
 * FileRouter for FinalSpace media uploads
 */
export const uploadRouter = {
  /**
   * Profile image upload - single image, 4MB max
   */
  profileImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await authenticateUser();

      // Get finalSpaceId from headers (set by client)
      const finalSpaceId = req.headers.get("x-final-space-id");
      if (!finalSpaceId) {
        throw new UploadThingError("FinalSpace ID is required");
      }

      await validateFinalSpaceAccess(userId, finalSpaceId);

      return { userId, finalSpaceId, type: "profile" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Insert into media_assets
      const [mediaAsset] = await db
        .insert(mediaAssets)
        .values({
          finalSpaceId: metadata.finalSpaceId,
          type: "image",
          title: "Profile Picture",
          originalName: file.name,
          mime: file.type,
          size: file.size,
          storageKey: file.key,
        })
        .returning();

      // Update the FinalSpace profilePictureId
      await db
        .update(finalSpaces)
        .set({ profilePictureId: mediaAsset.id, updatedAt: new Date() })
        .where(eq(finalSpaces.id, metadata.finalSpaceId));

      return {
        mediaId: mediaAsset.id,
        url: file.ufsUrl,
        key: file.key,
      };
    }),

  /**
   * Header carousel - up to 5 images, 8MB each
   */
  headerCarousel: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await authenticateUser();

      const finalSpaceId = req.headers.get("x-final-space-id");
      if (!finalSpaceId) {
        throw new UploadThingError("FinalSpace ID is required");
      }

      await validateFinalSpaceAccess(userId, finalSpaceId);

      return { userId, finalSpaceId, type: "header" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Insert into media_assets
      const [mediaAsset] = await db
        .insert(mediaAssets)
        .values({
          finalSpaceId: metadata.finalSpaceId,
          type: "image",
          title: "Header Image",
          originalName: file.name,
          mime: file.type,
          size: file.size,
          storageKey: file.key,
        })
        .returning();

      return {
        mediaId: mediaAsset.id,
        url: file.ufsUrl,
        key: file.key,
      };
    }),

  /**
   * Album media - up to 10 images per batch, 8MB each
   */
  albumMedia: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await authenticateUser();

      const finalSpaceId = req.headers.get("x-final-space-id");
      if (!finalSpaceId) {
        throw new UploadThingError("FinalSpace ID is required");
      }

      const albumId = req.headers.get("x-album-id");
      // albumId is optional - if not provided, media goes into general pool

      await validateFinalSpaceAccess(userId, finalSpaceId);

      return { userId, finalSpaceId, albumId, type: "album" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Insert into media_assets
      const [mediaAsset] = await db
        .insert(mediaAssets)
        .values({
          finalSpaceId: metadata.finalSpaceId,
          type: "image",
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
          originalName: file.name,
          mime: file.type,
          size: file.size,
          storageKey: file.key,
        })
        .returning();

      return {
        mediaId: mediaAsset.id,
        url: file.ufsUrl,
        key: file.key,
        albumId: metadata.albumId,
      };
    }),
  /**
   * Timeline event image - single image, 4MB max
   */
  timelineEventImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { userId } = await authenticateUser();

      const finalSpaceId = req.headers.get("x-final-space-id");
      if (!finalSpaceId) {
        throw new UploadThingError("FinalSpace ID is required");
      }

      await validateFinalSpaceAccess(userId, finalSpaceId);

      return { userId, finalSpaceId, type: "timeline" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const [mediaAsset] = await db
        .insert(mediaAssets)
        .values({
          finalSpaceId: metadata.finalSpaceId,
          type: "image",
          title: "Timeline Event Photo",
          originalName: file.name,
          mime: file.type,
          size: file.size,
          storageKey: file.key,
        })
        .returning();

      return {
        mediaId: mediaAsset.id,
        url: file.ufsUrl,
        key: file.key,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
