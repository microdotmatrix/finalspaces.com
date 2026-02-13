"use server";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { canEditFinalSpace, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  albumMedia,
  finalSpaces,
  mediaAlbums,
  mediaAssets,
} from "@/lib/db/schema";

// ==========================================
// TYPES
// ==========================================

export type CreateMediaAssetInput = {
  finalSpaceId: string;
  type: "image" | "video" | "doc";
  title?: string;
  originalName: string;
  mime: string;
  size: number;
  storageKey: string;
  width?: number;
  height?: number;
};

export type CreateAlbumInput = {
  finalSpaceId: string;
  title: string;
  description?: string;
  isHeaderCarousel?: boolean;
};

export type UpdateAlbumInput = {
  title?: string;
  description?: string;
  coverImageId?: string | null;
};

// ==========================================
// ACCESS CONTROL
// ==========================================

async function requireMediaAccess(
  userId: string,
  finalSpaceId: string
): Promise<void> {
  const hasAccess = await canEditFinalSpace(userId, finalSpaceId);
  if (!hasAccess) {
    throw new Error("Not authorized to manage media for this FinalSpace");
  }
}

// ==========================================
// MEDIA ASSETS
// ==========================================

/**
 * Create a new media asset
 */
export async function createMediaAsset(input: CreateMediaAssetInput) {
  const user = await requireUser();
  await requireMediaAccess(user.id, input.finalSpaceId);

  const [mediaAsset] = await db
    .insert(mediaAssets)
    .values({
      finalSpaceId: input.finalSpaceId,
      type: input.type,
      title: input.title,
      originalName: input.originalName,
      mime: input.mime,
      size: input.size,
      storageKey: input.storageKey,
      width: input.width,
      height: input.height,
    })
    .returning();

  return { success: true, mediaAsset };
}

/**
 * Delete a media asset
 */
export async function deleteMediaAsset(mediaId: string) {
  const user = await requireUser();

  // Get the media asset and its FinalSpace
  const [media] = await db
    .select({
      id: mediaAssets.id,
      finalSpaceId: mediaAssets.finalSpaceId,
      storageKey: mediaAssets.storageKey,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))
    .limit(1);

  if (!media) {
    return { success: false, error: "Media asset not found" };
  }

  await requireMediaAccess(user.id, media.finalSpaceId);

  // Check if this media is the profile picture - if so, clear it
  await db
    .update(finalSpaces)
    .set({ profilePictureId: null, updatedAt: new Date() })
    .where(
      and(
        eq(finalSpaces.id, media.finalSpaceId),
        eq(finalSpaces.profilePictureId, mediaId)
      )
    );

  // Delete from album_media first (cascade should handle this, but be explicit)
  await db.delete(albumMedia).where(eq(albumMedia.mediaId, mediaId));

  // Delete the media asset
  await db.delete(mediaAssets).where(eq(mediaAssets.id, mediaId));

  // TODO: Delete from Uploadthing storage (requires UTApi)

  return { success: true };
}

/**
 * Get all media assets for a FinalSpace
 */
export async function getMediaAssets(finalSpaceId: string) {
  const assets = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.finalSpaceId, finalSpaceId))
    .orderBy(desc(mediaAssets.createdAt));

  return assets;
}

/**
 * Get a single media asset by ID
 */
export async function getMediaAsset(mediaId: string) {
  const [media] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))
    .limit(1);

  return media ?? null;
}

/**
 * Set the profile picture for a FinalSpace
 */
export async function setProfilePicture(
  finalSpaceId: string,
  mediaId: string | null
) {
  const user = await requireUser();
  await requireMediaAccess(user.id, finalSpaceId);

  const [updated] = await db
    .update(finalSpaces)
    .set({ profilePictureId: mediaId, updatedAt: new Date() })
    .where(eq(finalSpaces.id, finalSpaceId))
    .returning();

  revalidatePath(`/m/${updated.slug}`);

  return { success: true, finalSpace: updated };
}

// ==========================================
// ALBUMS
// ==========================================

const MAX_CUSTOM_ALBUMS = 5;

/**
 * Create a new album
 */
export async function createAlbum(input: CreateAlbumInput) {
  const user = await requireUser();
  await requireMediaAccess(user.id, input.finalSpaceId);

  // Check album limits (max 5 custom albums + 1 header carousel)
  if (input.isHeaderCarousel) {
    // Only one header carousel allowed
    const [existing] = await db
      .select({ id: mediaAlbums.id })
      .from(mediaAlbums)
      .where(
        and(
          eq(mediaAlbums.finalSpaceId, input.finalSpaceId),
          eq(mediaAlbums.isHeaderCarousel, true)
        )
      )
      .limit(1);

    if (existing) {
      return { success: false, error: "Header carousel already exists" };
    }
  } else {
    const existingAlbums = await db
      .select({ id: mediaAlbums.id })
      .from(mediaAlbums)
      .where(
        and(
          eq(mediaAlbums.finalSpaceId, input.finalSpaceId),
          eq(mediaAlbums.isHeaderCarousel, false)
        )
      );

    if (existingAlbums.length >= MAX_CUSTOM_ALBUMS) {
      return {
        success: false,
        error: `Maximum of ${MAX_CUSTOM_ALBUMS} custom albums allowed`,
      };
    }
  }

  // Get next sort order
  const [lastAlbum] = await db
    .select({ sortOrder: mediaAlbums.sortOrder })
    .from(mediaAlbums)
    .where(eq(mediaAlbums.finalSpaceId, input.finalSpaceId))
    .orderBy(desc(mediaAlbums.sortOrder))
    .limit(1);

  const sortOrder = (lastAlbum?.sortOrder ?? 0) + 1;

  const [album] = await db
    .insert(mediaAlbums)
    .values({
      finalSpaceId: input.finalSpaceId,
      title: input.title,
      description: input.description,
      isHeaderCarousel: input.isHeaderCarousel ?? false,
      sortOrder,
    })
    .returning();

  return { success: true, album };
}

/**
 * Update an album
 */
export async function updateAlbum(albumId: string, input: UpdateAlbumInput) {
  const user = await requireUser();

  // Get album to check access
  const [album] = await db
    .select({ finalSpaceId: mediaAlbums.finalSpaceId })
    .from(mediaAlbums)
    .where(eq(mediaAlbums.id, albumId))
    .limit(1);

  if (!album) {
    return { success: false, error: "Album not found" };
  }

  await requireMediaAccess(user.id, album.finalSpaceId);

  const [updated] = await db
    .update(mediaAlbums)
    .set({
      ...input,
    })
    .where(eq(mediaAlbums.id, albumId))
    .returning();

  return { success: true, album: updated };
}

/**
 * Delete an album
 */
export async function deleteAlbum(albumId: string) {
  const user = await requireUser();

  const [album] = await db
    .select({ finalSpaceId: mediaAlbums.finalSpaceId })
    .from(mediaAlbums)
    .where(eq(mediaAlbums.id, albumId))
    .limit(1);

  if (!album) {
    return { success: false, error: "Album not found" };
  }

  await requireMediaAccess(user.id, album.finalSpaceId);

  // Delete album (cascade will remove album_media entries)
  await db.delete(mediaAlbums).where(eq(mediaAlbums.id, albumId));

  return { success: true };
}

/**
 * Get all albums for a FinalSpace
 */
export async function getAlbums(finalSpaceId: string) {
  const albums = await db
    .select()
    .from(mediaAlbums)
    .where(eq(mediaAlbums.finalSpaceId, finalSpaceId))
    .orderBy(asc(mediaAlbums.sortOrder));

  const coverImageIds = albums
    .map((album) => album.coverImageId)
    .filter((coverImageId): coverImageId is string => Boolean(coverImageId));

  const coverImageById = new Map<string, string>();

  if (coverImageIds.length > 0) {
    const coverImages = await db
      .select({ id: mediaAssets.id, storageKey: mediaAssets.storageKey })
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.finalSpaceId, finalSpaceId),
          inArray(mediaAssets.id, coverImageIds)
        )
      );

    for (const coverImage of coverImages) {
      coverImageById.set(coverImage.id, coverImage.storageKey);
    }
  }

  return albums.map((album) => ({
    ...album,
    coverImageStorageKey: album.coverImageId
      ? (coverImageById.get(album.coverImageId) ?? null)
      : null,
  }));
}

/**
 * Get or create the header carousel album
 */
export async function getOrCreateHeaderCarousel(finalSpaceId: string) {
  const user = await requireUser();
  await requireMediaAccess(user.id, finalSpaceId);

  // Check if header carousel exists
  const [existing] = await db
    .select()
    .from(mediaAlbums)
    .where(
      and(
        eq(mediaAlbums.finalSpaceId, finalSpaceId),
        eq(mediaAlbums.isHeaderCarousel, true)
      )
    )
    .limit(1);

  if (existing) {
    return { success: true, album: existing };
  }

  // Create header carousel
  const [album] = await db
    .insert(mediaAlbums)
    .values({
      finalSpaceId,
      title: "Header Carousel",
      isHeaderCarousel: true,
      sortOrder: 0,
    })
    .returning();

  return { success: true, album };
}

/**
 * Reorder albums
 */
export async function reorderAlbums(finalSpaceId: string, albumIds: string[]) {
  const user = await requireUser();
  await requireMediaAccess(user.id, finalSpaceId);

  // Update sort order for each album
  await Promise.all(
    albumIds.map((albumId, index) =>
      db
        .update(mediaAlbums)
        .set({ sortOrder: index })
        .where(
          and(
            eq(mediaAlbums.id, albumId),
            eq(mediaAlbums.finalSpaceId, finalSpaceId)
          )
        )
    )
  );

  return { success: true };
}

// ==========================================
// ALBUM MEDIA
// ==========================================

/**
 * Add media to an album
 */
export async function addMediaToAlbum(
  albumId: string,
  mediaId: string,
  caption?: string
) {
  const user = await requireUser();

  // Get album to check access
  const [album] = await db
    .select({ finalSpaceId: mediaAlbums.finalSpaceId })
    .from(mediaAlbums)
    .where(eq(mediaAlbums.id, albumId))
    .limit(1);

  if (!album) {
    return { success: false, error: "Album not found" };
  }

  await requireMediaAccess(user.id, album.finalSpaceId);

  // Get next sort order
  const [lastEntry] = await db
    .select({ sortOrder: albumMedia.sortOrder })
    .from(albumMedia)
    .where(eq(albumMedia.albumId, albumId))
    .orderBy(desc(albumMedia.sortOrder))
    .limit(1);

  const sortOrder = (lastEntry?.sortOrder ?? 0) + 1;

  await db
    .insert(albumMedia)
    .values({
      albumId,
      mediaId,
      caption,
      sortOrder,
    })
    .onConflictDoNothing(); // Don't fail if already exists

  return { success: true };
}

/**
 * Remove media from an album
 */
export async function removeMediaFromAlbum(albumId: string, mediaId: string) {
  const user = await requireUser();

  const [album] = await db
    .select({ finalSpaceId: mediaAlbums.finalSpaceId })
    .from(mediaAlbums)
    .where(eq(mediaAlbums.id, albumId))
    .limit(1);

  if (!album) {
    return { success: false, error: "Album not found" };
  }

  await requireMediaAccess(user.id, album.finalSpaceId);

  await db
    .delete(albumMedia)
    .where(
      and(eq(albumMedia.albumId, albumId), eq(albumMedia.mediaId, mediaId))
    );

  return { success: true };
}

/**
 * Get all media in an album
 */
export async function getAlbumMedia(albumId: string) {
  const media = await db
    .select({
      albumMedia,
      mediaAsset: mediaAssets,
    })
    .from(albumMedia)
    .innerJoin(mediaAssets, eq(albumMedia.mediaId, mediaAssets.id))
    .where(eq(albumMedia.albumId, albumId))
    .orderBy(asc(albumMedia.sortOrder));

  return media;
}

/**
 * Reorder media within an album
 */
export async function reorderAlbumMedia(albumId: string, mediaIds: string[]) {
  const user = await requireUser();

  const [album] = await db
    .select({ finalSpaceId: mediaAlbums.finalSpaceId })
    .from(mediaAlbums)
    .where(eq(mediaAlbums.id, albumId))
    .limit(1);

  if (!album) {
    return { success: false, error: "Album not found" };
  }

  await requireMediaAccess(user.id, album.finalSpaceId);

  // Update sort order for each media
  await Promise.all(
    mediaIds.map((mediaId, index) =>
      db
        .update(albumMedia)
        .set({ sortOrder: index })
        .where(
          and(eq(albumMedia.albumId, albumId), eq(albumMedia.mediaId, mediaId))
        )
    )
  );

  return { success: true };
}

/**
 * Update caption for album media
 */
export async function updateAlbumMediaCaption(
  albumId: string,
  mediaId: string,
  caption: string
) {
  const user = await requireUser();

  const [album] = await db
    .select({ finalSpaceId: mediaAlbums.finalSpaceId })
    .from(mediaAlbums)
    .where(eq(mediaAlbums.id, albumId))
    .limit(1);

  if (!album) {
    return { success: false, error: "Album not found" };
  }

  await requireMediaAccess(user.id, album.finalSpaceId);

  await db
    .update(albumMedia)
    .set({ caption })
    .where(
      and(eq(albumMedia.albumId, albumId), eq(albumMedia.mediaId, mediaId))
    );

  return { success: true };
}

// ==========================================
// PUBLIC READ FUNCTIONS (NO AUTH REQUIRED)
// ==========================================

/**
 * Get header carousel images for public memorial page
 */
export async function getPublicHeaderCarouselImages(finalSpaceId: string) {
  // Find the header carousel album
  const [headerAlbum] = await db
    .select()
    .from(mediaAlbums)
    .where(
      and(
        eq(mediaAlbums.finalSpaceId, finalSpaceId),
        eq(mediaAlbums.isHeaderCarousel, true)
      )
    )
    .limit(1);

  if (!headerAlbum) {
    return [];
  }

  // Get images from the header carousel
  const media = await db
    .select({
      id: mediaAssets.id,
      url: mediaAssets.storageKey,
      altText: mediaAssets.title,
      caption: albumMedia.caption,
    })
    .from(albumMedia)
    .innerJoin(mediaAssets, eq(albumMedia.mediaId, mediaAssets.id))
    .where(eq(albumMedia.albumId, headerAlbum.id))
    .orderBy(asc(albumMedia.sortOrder));

  return media;
}

/**
 * Get public albums for memorial page (excludes header carousel)
 */
export async function getPublicAlbums(finalSpaceId: string) {
  const albums = await db
    .select({
      id: mediaAlbums.id,
      title: mediaAlbums.title,
      coverImageId: mediaAlbums.coverImageId,
    })
    .from(mediaAlbums)
    .where(
      and(
        eq(mediaAlbums.finalSpaceId, finalSpaceId),
        eq(mediaAlbums.isHeaderCarousel, false)
      )
    )
    .orderBy(asc(mediaAlbums.sortOrder));

  // Get cover images and media counts
  const enrichedAlbums = await Promise.all(
    albums.map(async (album) => {
      // Get media count
      const mediaList = await db
        .select({ id: albumMedia.mediaId })
        .from(albumMedia)
        .where(eq(albumMedia.albumId, album.id));

      // Get cover image URL
      let coverImageUrl: string | null = null;
      if (album.coverImageId) {
        const [cover] = await db
          .select({ storageKey: mediaAssets.storageKey })
          .from(mediaAssets)
          .where(eq(mediaAssets.id, album.coverImageId))
          .limit(1);
        coverImageUrl = cover?.storageKey ?? null;
      } else if (mediaList.length > 0) {
        // Use first image as fallback cover
        const [first] = await db
          .select({ storageKey: mediaAssets.storageKey })
          .from(albumMedia)
          .innerJoin(mediaAssets, eq(albumMedia.mediaId, mediaAssets.id))
          .where(eq(albumMedia.albumId, album.id))
          .orderBy(asc(albumMedia.sortOrder))
          .limit(1);
        coverImageUrl = first?.storageKey ?? null;
      }

      return {
        id: album.id,
        title: album.title,
        coverImageUrl,
        mediaCount: mediaList.length,
      };
    })
  );

  // Filter out empty albums
  return enrichedAlbums.filter((a) => a.mediaCount > 0);
}
