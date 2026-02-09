"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { MediaCommentsPanel } from "@/components/media-comments/media-comments-panel";
import { features } from "@/lib/config";

interface Photo {
  id: string;
  storageKey: string;
  title: string | null;
  caption: string | null;
}

interface AlbumPhotoGridProps {
  photos: Photo[];
}

function getMediaUrl(storageKey: string): string {
  return `https://utfs.io/f/${storageKey}`;
}

export function AlbumPhotoGrid({ photos }: AlbumPhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || prev === 0) {
        return prev;
      }
      return prev - 1;
    });
  }, []);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || prev >= photos.length - 1) {
        return prev;
      }
      return prev + 1;
    });
  }, [photos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        goToPrev();
      }
      if (e.key === "ArrowRight") {
        goToNext();
      }
      if (e.key === "Escape") {
        closeLightbox();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, goToPrev, goToNext, closeLightbox]);

  if (photos.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No photos in this album
      </p>
    );
  }

  const activePhoto =
    lightboxIndex !== null ? photos[lightboxIndex] : undefined;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            key={photo.id}
            onClick={() => setLightboxIndex(index)}
            type="button"
          >
            <Image
              alt={photo.title || photo.caption || "Photo"}
              className="object-cover transition-transform group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              src={getMediaUrl(photo.storageKey)}
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2">
                <p className="line-clamp-2 text-white text-xs">
                  {photo.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog.Root
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeLightbox();
          }
        }}
        open={lightboxIndex !== null}
      >
        <AnimatePresence>
          {activePhoto && (
            <Dialog.Backdrop
              className="fixed inset-0 z-[200] min-h-dvh bg-black/90 backdrop-blur-sm"
              hidden={undefined}
              key="lightbox-overlay"
              render={
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              }
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activePhoto && lightboxIndex !== null && (
            <Dialog.Portal keepMounted>
              <Dialog.Popup
                className="fixed inset-0 z-[201] flex items-center justify-center outline-none"
                hidden={undefined}
              >
                <Dialog.Title className="sr-only">
                  {activePhoto.title || "Photo"}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  {activePhoto.caption || activePhoto.title || "Photo viewer"}
                </Dialog.Description>

                {/* Close button */}
                <motion.button
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  exit={{ opacity: 0, scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  onClick={closeLightbox}
                  transition={{ delay: 0.1, duration: 0.15 }}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="sr-only">Close</span>
                </motion.button>

                {/* Previous button */}
                {lightboxIndex > 0 && (
                  <motion.button
                    animate={{ opacity: 1 }}
                    className="absolute top-1/2 left-4 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    onClick={goToPrev}
                    transition={{ delay: 0.1, duration: 0.15 }}
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 19l-7-7 7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="sr-only">Previous photo</span>
                  </motion.button>
                )}

                {/* Next button */}
                {lightboxIndex < photos.length - 1 && (
                  <motion.button
                    animate={{ opacity: 1 }}
                    className="absolute top-1/2 right-4 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    onClick={goToNext}
                    transition={{ delay: 0.1, duration: 0.15 }}
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="sr-only">Next photo</span>
                  </motion.button>
                )}

                {/* Photo */}
                <motion.div
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative flex max-h-[85vh] max-w-[95vw] flex-col items-center gap-4 lg:flex-row lg:items-start"
                  exit={{ scale: 0.9, opacity: 0 }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  key={activePhoto.id}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  <div className="flex max-h-[80vh] flex-col items-center">
                    <Image
                      alt={activePhoto.title || activePhoto.caption || "Photo"}
                      className="max-h-[72vh] w-auto rounded-xl object-contain shadow-2xl"
                      height={1200}
                      src={getMediaUrl(activePhoto.storageKey)}
                      width={1200}
                    />
                    {activePhoto.caption && (
                      <p className="mt-3 max-w-lg text-center text-sm text-white/80">
                        {activePhoto.caption}
                      </p>
                    )}
                    <p className="mt-1 text-white/50 text-xs">
                      {lightboxIndex + 1} of {photos.length}
                    </p>
                  </div>

                  {features.mediaCommentsEnabled && (
                    <div className="w-full max-w-md lg:max-h-[80vh] lg:w-[360px]">
                      <MediaCommentsPanel mediaId={activePhoto.id} />
                    </div>
                  )}
                </motion.div>
              </Dialog.Popup>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
