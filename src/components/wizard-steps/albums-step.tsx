"use client";

import { useAtomValue } from "jotai";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AlbumManager } from "@/components/albums/album-manager";
import { AlbumMediaGrid } from "@/components/albums/album-media-grid";
import { Icon } from "@/components/ui/icon";
import { updateAlbum } from "@/lib/actions/media-actions";
import { draftIdAtom } from "@/lib/stores/wizard-state";

export function AlbumsStep() {
  const draftId = useAtomValue(draftIdAtom);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumsVersion, setAlbumsVersion] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleSetCover = (mediaId: string) => {
    if (!selectedAlbumId || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await updateAlbum(selectedAlbumId, {
        coverImageId: mediaId,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to set album cover");
        return;
      }

      toast.success("Album cover image updated");
      setAlbumsVersion((current) => current + 1);
    });
  };

  if (!draftId) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-bold text-2xl">Albums</h2>
          <p className="text-muted-foreground">
            Organize photos into meaningful collections.
          </p>
        </div>
        <div className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex gap-3">
            <Icon className="size-5 flex-shrink-0" icon="mdi:alert" />
            <div>
              <p className="font-medium">No draft found</p>
              <p className="text-sm">
                Please start from the Identity step to create a new FinalSpace.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Albums</h2>
        <p className="text-muted-foreground">
          Organize photos into meaningful collections.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Album Sidebar */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Your Albums</h3>
          <AlbumManager
            finalSpaceId={draftId}
            key={albumsVersion}
            onAlbumSelect={(id) => setSelectedAlbumId(id)}
            selectedAlbumId={selectedAlbumId ?? undefined}
          />
        </div>

        {/* Album Content */}
        <div className="space-y-4">
          {selectedAlbumId ? (
            <>
              <h3 className="font-semibold text-lg">Photos in Album</h3>
              <AlbumMediaGrid
                albumId={selectedAlbumId}
                finalSpaceId={draftId}
                onSetCover={handleSetCover}
              />
            </>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed text-muted-foreground">
              <div className="max-w-sm px-4 text-center">
                <Icon
                  className="mx-auto mb-3 size-12 opacity-50"
                  icon="mdi:image-multiple-outline"
                />
                <p className="mb-1 font-medium">Select an Album</p>
                <p className="text-sm">
                  Choose an album from the left to manage its photos, or create
                  a new album to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex gap-3">
          <Icon
            className="size-5 flex-shrink-0 text-primary"
            icon="mdi:lightbulb-outline"
          />
          <div className="text-muted-foreground text-sm">
            <p className="mb-1 font-medium text-foreground">Album Tips</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Create themed albums like &quot;Childhood&quot;,
                &quot;Family&quot;, or &quot;Adventures&quot;
              </li>
              <li>You can create up to 5 custom albums</li>
              <li>Add captions to photos to share stories and memories</li>
              <li>Set a cover image to make albums more recognizable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
