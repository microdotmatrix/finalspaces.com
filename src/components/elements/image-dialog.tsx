"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type { DetailedHTMLProps, ImgHTMLAttributes } from "react";
import { useCallback, useRef, useState } from "react";

interface OriginPosition {
  x: number;
  y: number;
}

export const ImageDialog = ({
  src,
  alt,
  className,
}: DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>) => {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<OriginPosition | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (thumbnailRef.current) {
      const rect = thumbnailRef.current.getBoundingClientRect();
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      const thumbnailCenterX = rect.left + rect.width / 2;
      const thumbnailCenterY = rect.top + rect.height / 2;

      setOrigin({
        x: thumbnailCenterX - viewportCenterX,
        y: thumbnailCenterY - viewportCenterY,
      });
    }
    setOpen(true);
  }, []);

  if (!src) return null;

  return (
    <Dialog.Root
      onOpenChange={(isOpen) => !isOpen && setOpen(false)}
      open={open}
    >
      <div className="relative" ref={thumbnailRef}>
        <Dialog.Trigger
          className="relative block cursor-pointer"
          onClick={handleOpen}
        >
          <Image
            alt={alt || ""}
            className={className}
            height={500}
            sizes="100vw"
            src={src as string}
            style={{
              width: "100%",
              height: "auto",
              opacity: open ? 0 : 1,
              transition: "opacity 0.15s",
            }}
            width={500}
          />
        </Dialog.Trigger>
      </div>

      <AnimatePresence>
        {open && (
          <Dialog.Backdrop
            className="fixed inset-0 z-100 min-h-dvh bg-black/80 backdrop-blur-sm"
            hidden={undefined}
            key="overlay"
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
        {open && origin && (
          <Dialog.Portal keepMounted>
            <Dialog.Popup
              className="fixed inset-0 z-101 flex items-center justify-center p-4 outline-none lg:p-8"
              hidden={undefined}
            >
              <Dialog.Title className="sr-only">{alt || "Image"}</Dialog.Title>
              <Dialog.Description className="sr-only">
                {alt || "Image"}
              </Dialog.Description>

              <motion.div
                animate={{
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1,
                }}
                className="relative z-0 overflow-hidden rounded-xl shadow-2xl"
                exit={{
                  x: origin.x,
                  y: origin.y,
                  scale: 0.3,
                  opacity: 0,
                }}
                initial={{
                  x: origin.x,
                  y: origin.y,
                  scale: 0.3,
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              >
                <Image
                  alt={alt || ""}
                  className="max-h-[85vh] w-auto object-contain"
                  height={1200}
                  src={src as string}
                  width={1200}
                />
              </motion.div>

              <Dialog.Close
                className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 lg:top-8 lg:right-8"
                render={
                  <motion.button
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.1, duration: 0.15 }}
                  />
                }
              >
                <svg
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
              </Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
