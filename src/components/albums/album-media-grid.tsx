"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/elements/action-button";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import {
  addMediaToAlbum,
  getAlbumMedia,
  removeMediaFromAlbum,
  updateAlbumMediaCaption,
} from "@/lib/actions/media-actions";
import { cn } from "@/lib/utils";

interface AlbumMediaItem {
  albumMedia: {
    albumId: string;
    mediaId: string;
    sortOrder: number;
    caption: string | null;
    addedAt: Date | null;
  };
  mediaAsset: {
    id: string;
    finalSpaceId: string;
    type: "image" | "video" | "doc";
    title: string | null;
    originalName: string;
    mime: string;
    size: number;
    storageKey: string;
    width: number | null;
    height: number | null;
    createdAt: Date | null;
  };
}

interface AlbumMediaGridProps {
  albumId: string;
  finalSpaceId: string;
  onSetCover?: (mediaId: string) => void;
  className?: string;
}

export function AlbumMediaGrid({
  albumId,
  finalSpaceId,
  onSetCover,
  className,
}: AlbumMediaGridProps) {
  const [media, setMedia] = useState<AlbumMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState("");

  const refreshMedia = async () => {
    setIsLoading(true);
    try {
      const data = await getAlbumMedia(albumId);
      setMedia(data);
    } catch {
      console.error("Failed to load album media");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const data = await getAlbumMedia(albumId);
        if (!isCancelled) {
          setMedia(data);
        }
      } catch {
        if (!isCancelled) {
          console.error("Failed to load album media");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadMedia();

    return () => {
      isCancelled = true;
    };
  }, [albumId]);

  const handleRemove = async (
    mediaId: string
  ): Promise<{ error: boolean; message?: string }> => {
    const result = await removeMediaFromAlbum(albumId, mediaId);
    if (!result.success) {
      return {
        error: true,
        message: result.error ?? "Failed to remove photo from album",
      };
    }

    await refreshMedia();
    toast.success("Photo removed from album");
    return { error: false };
  };

  const handleCaptionSave = (mediaId: string) => {
    startTransition(async () => {
      await updateAlbumMediaCaption(albumId, mediaId, captionValue);
      setEditingCaption(null);
      refreshMedia();
    });
  };

  const handleUploadComplete = async (
    files: { id: string; url: string; key: string; name: string }[]
  ) => {
    // Add each uploaded file to the album
    for (const file of files) {
      await addMediaToAlbum(albumId, file.id);
    }
    refreshMedia();
  };

  // Generate URL from storage key
  const getMediaUrl = (storageKey: string) => {
    // Uploadthing URLs are in the format: https://<app-id>.ufs.sh/f/<key>
    return `https://utfs.io/f/${storageKey}`;
  };

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            className="aspect-square animate-pulse rounded-lg bg-muted"
            key={i}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Section - full size when no media */}
      {media.length === 0 && (
        <ImageUploader
          albumId={albumId}
          endpoint="albumMedia"
          finalSpaceId={finalSpaceId}
          maxFiles={10}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Media Grid */}
      {media.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item) => (
            <div
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              key={item.mediaAsset.id}
            >
              <Image
                alt={item.mediaAsset.title || item.mediaAsset.originalName}
                className="object-cover"
                fill
                src={getMediaUrl(item.mediaAsset.storageKey)}
              />

              {/* Hover Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
                  editingCaption === item.mediaAsset.id && "opacity-100"
                )}
              >
                {/* Top Actions */}
                {onSetCover && (
                  <div className="absolute top-2 left-2">
                    <Button
                      aria-label="Set as cover"
                      className="bg-white/90 text-black hover:bg-white"
                      onClick={() => onSetCover(item.mediaAsset.id)}
                      size="icon-xs"
                      title="Set as cover"
                      type="button"
                      variant="secondary"
                    >
                      <Icon className="size-4" icon="mdi:image-check" />
                    </Button>
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                  <ActionButton
                    action={() => handleRemove(item.mediaAsset.id)}
                    areYouSureDescription={
                      "Remove this image from your album? This cannot be undone."
                    }
                    aria-label="Remove from album"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isPending}
                    requireAreYouSure
                    size="icon-xs"
                    title="Remove from album"
                    type="button"
                  >
                    <Icon className="size-4" icon="mdi:close" />
                  </ActionButton>
                </div>

                {/* Bottom Caption */}
                <div className="absolute right-0 bottom-0 left-0 p-2">
                  {editingCaption === item.mediaAsset.id ? (
                    <div className="flex gap-1">
                      <Input
                        autoFocus
                        className="h-8 border-border/25 bg-background/50 text-foreground text-xs backdrop-blur-sm"
                        onChange={(e) => setCaptionValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCaptionSave(item.mediaAsset.id);
                          } else if (e.key === "Escape") {
                            setEditingCaption(null);
                          }
                        }}
                        placeholder="Add caption"
                        value={captionValue}
                      />
                      <Button
                        className="h-8 w-8"
                        disabled={isPending}
                        onClick={() => handleCaptionSave(item.mediaAsset.id)}
                        size="icon"
                        type="button"
                      >
                        <Icon className="size-4" icon="mdi:check" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="w-full truncate text-left text-white text-xs hover:underline"
                      onClick={() => {
                        setEditingCaption(item.mediaAsset.id);
                        setCaptionValue(item.albumMedia.caption || "");
                      }}
                      type="button"
                    >
                      {item.albumMedia.caption || (
                        <span className="italic opacity-70">Add caption</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Compact uploader inline with thumbnails */}
          <ImageUploader
            albumId={albumId}
            endpoint="albumMedia"
            finalSpaceId={finalSpaceId}
            maxFiles={10}
            onUploadComplete={handleUploadComplete}
            variant="compact"
          />
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <Icon
            className="mx-auto mb-3 size-12 opacity-50"
            icon="mdi:image-multiple-outline"
          />
          <p className="font-medium">No photos in this album</p>
          <p className="text-sm">Upload some photos to get started</p>
        </div>
      )}

      {/* Media count */}
      {media.length > 0 && (
        <p className="text-center text-muted-foreground text-xs">
          {media.length} photo{media.length !== 1 ? "s" : ""} in this album
        </p>
      )}
    </div>
  );
}
