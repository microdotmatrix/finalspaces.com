"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { AlbumPhotoGrid } from "@/components/memorial/album-photo-grid";

interface Photo {
  id: string;
  storageKey: string;
  title: string | null;
  caption: string | null;
}

interface AlbumModalProps {
  photos: Photo[];
  title: string;
}

export function AlbumModal({ photos, title }: AlbumModalProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <Dialog.Root
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
      open
    >
      <AnimatePresence>
        <Dialog.Backdrop
          className="fixed inset-0 z-[100] min-h-dvh bg-black/80 backdrop-blur-sm"
          hidden={undefined}
          key="album-modal-overlay"
          render={
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          }
        />
      </AnimatePresence>

      <AnimatePresence>
        <Dialog.Portal keepMounted>
          <Dialog.Popup
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 outline-none lg:p-8"
            hidden={undefined}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-foreground/10"
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <Dialog.Title className="font-semibold text-lg">
                  {title}
                </Dialog.Title>
                <Dialog.Close
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={handleClose}
                >
                  <svg
                    aria-hidden="true"
                    className="size-4"
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
                </Dialog.Close>
              </div>

              {/* Description for accessibility */}
              <Dialog.Description className="sr-only">
                Photo album: {title}
              </Dialog.Description>

              {/* Photo grid */}
              <div className="overflow-y-auto p-6">
                <AlbumPhotoGrid photos={photos} />
              </div>
            </motion.div>
          </Dialog.Popup>
        </Dialog.Portal>
      </AnimatePresence>
    </Dialog.Root>
  );
}
