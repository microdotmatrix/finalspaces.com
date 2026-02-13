"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAlbum,
  deleteAlbum,
  getAlbums,
  updateAlbum,
} from "@/lib/actions/media-actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

interface Album {
  id: string;
  title: string;
  description: string | null;
  coverImageId: string | null;
  coverImageStorageKey: string | null;
  isHeaderCarousel: boolean;
  sortOrder: number;
  createdAt: Date | null;
}

interface AlbumManagerProps {
  finalSpaceId: string;
  onAlbumSelect?: (albumId: string) => void;
  selectedAlbumId?: string;
  className?: string;
}

export function AlbumManager({
  finalSpaceId,
  onAlbumSelect,
  selectedAlbumId,
  className,
}: AlbumManagerProps) {
  const getMediaUrl = (storageKey: string): string => {
    return `https://utfs.io/f/${storageKey}`;
  };

  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refreshAlbums = async () => {
    setIsLoading(true);
    try {
      const data = await getAlbums(finalSpaceId);
      setAlbums(data);
    } catch {
      console.error("Failed to load albums");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadAlbums = async () => {
      setIsLoading(true);
      try {
        const data = await getAlbums(finalSpaceId);
        if (!isCancelled) {
          setAlbums(data);
        }
      } catch {
        if (!isCancelled) {
          console.error("Failed to load albums");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAlbums();

    return () => {
      isCancelled = true;
    };
  }, [finalSpaceId]);

  const customAlbums = albums.filter((a) => !a.isHeaderCarousel);
  const canCreateAlbum = customAlbums.length < 5;

  const handleCreate = () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    startTransition(async () => {
      const result = await createAlbum({
        finalSpaceId,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (result.success) {
        setIsCreateOpen(false);
        setTitle("");
        setDescription("");
        setError(null);
        refreshAlbums();
      } else {
        setError(result.error || "Failed to create album");
      }
    });
  };

  const handleUpdate = () => {
    if (!(editingAlbum && title.trim())) {
      setError("Title is required");
      return;
    }

    startTransition(async () => {
      const result = await updateAlbum(editingAlbum.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (result.success) {
        setEditingAlbum(null);
        setTitle("");
        setDescription("");
        setError(null);
        refreshAlbums();
      } else {
        setError(result.error || "Failed to update album");
      }
    });
  };

  const handleDelete = (albumId: string) => {
    startTransition(async () => {
      const result = await deleteAlbum(albumId);
      if (result.success) {
        refreshAlbums();
      }
    });
  };

  const openEditDialog = (album: Album) => {
    setEditingAlbum(album);
    setTitle(album.title);
    setDescription(album.description || "");
    setError(null);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <div className="h-20 animate-pulse rounded-lg bg-muted" key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Album List */}
      {customAlbums.length > 0 ? (
        <div className="space-y-2">
          {customAlbums.map((album) => (
            <div
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors",
                selectedAlbumId === album.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/50"
              )}
              key={album.id}
              onClick={() => onAlbumSelect?.(album.id)}
            >
              {/* Cover Image */}
              <div className="size-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {album.coverImageStorageKey ? (
                  <Image
                    alt={album.title}
                    className="size-full object-cover"
                    height={56}
                    src={getMediaUrl(album.coverImageStorageKey)}
                    width={56}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Icon
                      className="size-6 text-muted-foreground"
                      icon="mdi:image-multiple"
                    />
                  </div>
                )}
              </div>

              {/* Album Info */}
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium">{album.title}</h4>
                {album.description && (
                  <p className="truncate text-muted-foreground text-sm">
                    {album.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(album);
                  }}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Icon className="size-4" icon="mdi:pencil" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        onClick={(e) => e.stopPropagation()}
                        size="icon"
                        type="button"
                        variant="ghost"
                      />
                    }
                  >
                    <Icon className="size-4" icon="mdi:delete" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Album?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove &quot;{album.title}&quot; and all its
                        photos from the album. The photos will not be deleted
                        from your library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(album.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <Icon
            className="mx-auto mb-3 size-12 opacity-50"
            icon="mdi:folder-multiple-image"
          />
          <p className="font-medium">No albums yet</p>
          <p className="text-sm">Create an album to organize your photos</p>
        </div>
      )}

      {/* Create Album Button */}
      <Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
        <DialogTrigger
          render={
            <Button
              className="w-full"
              disabled={!canCreateAlbum}
              type="button"
              variant="outline"
            />
          }
        >
          <Icon className="mr-2 size-4" icon="mdi:plus" />
          Create Album
          {!canCreateAlbum && (
            <span className="ml-2 text-muted-foreground text-xs">(max 5)</span>
          )}
        </DialogTrigger>
        <DialogContent className="shadow-xl sm:max-w-xl border border-border/50">
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium text-sm">Title</label>
              <Input
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Album title"
                value={title}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Textarea
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this album"
                rows={3}
                value={description}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button disabled={isPending} onClick={handleCreate} type="button">
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog
        onOpenChange={(open) => !open && setEditingAlbum(null)}
        open={!!editingAlbum}
      >
        <DialogContent className="shadow-xl sm:max-w-xl border border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium text-sm">Title</label>
              <Input
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Album title"
                value={title}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Textarea
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this album"
                rows={3}
                value={description}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setEditingAlbum(null)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isPending} onClick={handleUpdate} type="button">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Album count */}
      <p className="text-center text-muted-foreground text-xs">
        {customAlbums.length} / 5 albums
      </p>
    </div>
  );
}
