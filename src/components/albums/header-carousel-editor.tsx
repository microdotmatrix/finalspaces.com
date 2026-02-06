"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  addMediaToAlbum,
  getAlbumMedia,
  getOrCreateHeaderCarousel,
  removeMediaFromAlbum,
  reorderAlbumMedia,
} from "@/lib/actions/media-actions";
import { cn } from "@/lib/utils";

const MAX_HEADER_IMAGES = 5;

type HeaderCarouselEditorProps = {
  finalSpaceId: string;
  className?: string;
};

type MediaItem = {
  id: string;
  storageKey: string;
  title: string | null;
  originalName: string;
};

export function HeaderCarouselEditor({
  finalSpaceId,
  className,
}: HeaderCarouselEditorProps) {
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadCarousel = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get or create header carousel album
      const result = await getOrCreateHeaderCarousel(finalSpaceId);
      if (result.success && result.album) {
        setAlbumId(result.album.id);

        // Load media in the album
        const albumMedia = await getAlbumMedia(result.album.id);
        setImages(
          albumMedia.map((item) => ({
            id: item.mediaAsset.id,
            storageKey: item.mediaAsset.storageKey,
            title: item.mediaAsset.title,
            originalName: item.mediaAsset.originalName,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load header carousel:", error);
    } finally {
      setIsLoading(false);
    }
  }, [finalSpaceId]);

  useEffect(() => {
    loadCarousel();
  }, [loadCarousel]);

  const handleUploadComplete = async (
    files: { id: string; url: string; key: string; name: string }[]
  ) => {
    if (!albumId) return;

    // Add each uploaded file to the header carousel album
    for (const file of files) {
      await addMediaToAlbum(albumId, file.id);
    }
    loadCarousel();
  };

  const handleRemove = async (mediaId: string) => {
    if (!albumId) return;

    startTransition(async () => {
      await removeMediaFromAlbum(albumId, mediaId);
      loadCarousel();
    });
  };

  const handleMoveUp = async (index: number) => {
    if (!albumId || index === 0) return;

    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    setImages(newImages);

    startTransition(async () => {
      await reorderAlbumMedia(
        albumId,
        newImages.map((img) => img.id)
      );
    });
  };

  const handleMoveDown = async (index: number) => {
    if (!albumId || index === images.length - 1) return;

    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    setImages(newImages);

    startTransition(async () => {
      await reorderAlbumMedia(
        albumId,
        newImages.map((img) => img.id)
      );
    });
  };

  // Generate URL from storage key
  const getMediaUrl = (storageKey: string) => {
    return `https://utfs.io/f/${storageKey}`;
  };

  const canAddMore = images.length < MAX_HEADER_IMAGES;

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              className="size-16 animate-pulse rounded-lg bg-muted"
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview Carousel */}
      {images.length > 0 ? (
        <div className="relative aspect-[3/1] overflow-hidden rounded-lg bg-muted">
          <Image
            alt={images[0].title || images[0].originalName}
            className="object-cover"
            fill
            priority
            src={getMediaUrl(images[0].storageKey)}
          />
          {images.length > 1 && (
            <div className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-1 text-white text-xs">
              1 / {images.length}
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-[3/1] items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed text-muted-foreground">
          <div className="text-center">
            <Icon
              className="mx-auto mb-2 size-10 opacity-50"
              icon="mdi:panorama-horizontal"
            />
            <p className="font-medium text-sm">Header Carousel</p>
            <p className="text-xs">Add up to 5 images for the header</p>
          </div>
        </div>
      )}

      {/* Full-size uploader when no images */}
      {images.length === 0 && albumId && (
        <ImageUploader
          albumId={albumId}
          endpoint="headerCarousel"
          finalSpaceId={finalSpaceId}
          maxFiles={MAX_HEADER_IMAGES}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Image Thumbnails with Reorder */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div
              className="group relative size-20 overflow-hidden rounded-lg bg-muted"
              key={image.id}
            >
              <Image
                alt={image.title || image.originalName}
                className="object-cover"
                fill
                src={getMediaUrl(image.storageKey)}
              />

              {/* Order badge */}
              <div className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white text-xs">
                {index + 1}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Move up */}
                <button
                  className="rounded bg-white/90 p-1 text-black disabled:opacity-50"
                  disabled={index === 0 || isPending}
                  onClick={() => handleMoveUp(index)}
                  title="Move left"
                  type="button"
                >
                  <Icon className="size-4" icon="mdi:chevron-left" />
                </button>

                {/* Remove */}
                <button
                  className="rounded bg-destructive p-1 text-destructive-foreground"
                  disabled={isPending}
                  onClick={() => handleRemove(image.id)}
                  title="Remove"
                  type="button"
                >
                  <Icon className="size-4" icon="mdi:close" />
                </button>

                {/* Move down */}
                <button
                  className="rounded bg-white/90 p-1 text-black disabled:opacity-50"
                  disabled={index === images.length - 1 || isPending}
                  onClick={() => handleMoveDown(index)}
                  title="Move right"
                  type="button"
                >
                  <Icon className="size-4" icon="mdi:chevron-right" />
                </button>
              </div>
            </div>
          ))}

          {/* Compact uploader inline with thumbnails */}
          {canAddMore && albumId && (
            <ImageUploader
              albumId={albumId}
              className="size-20"
              endpoint="headerCarousel"
              finalSpaceId={finalSpaceId}
              maxFiles={MAX_HEADER_IMAGES - images.length}
              onUploadComplete={handleUploadComplete}
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Count indicator */}
      <p className="text-center text-muted-foreground text-xs">
        {images.length} / {MAX_HEADER_IMAGES} header images
      </p>

      {!canAddMore && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
          <div className="flex gap-2">
            <Icon
              className="size-5 flex-shrink-0 text-amber-500"
              icon="mdi:information-outline"
            />
            <p className="text-amber-700 dark:text-amber-300">
              Maximum {MAX_HEADER_IMAGES} images reached. Remove an image to add
              more.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
