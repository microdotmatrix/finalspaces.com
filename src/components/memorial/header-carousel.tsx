"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MemorialHeaderAvatar } from "./memorial-header-avatar";
import { MemorialHeaderDetails } from "./memorial-header-details";
import type {
  MemorialHeaderIdentity,
  MemorialHeaderImage,
} from "./memorial-header-types";
import { getMemorialMediaUrl } from "./memorial-header-utils";

interface HeaderCarouselProps {
  images: MemorialHeaderImage[];
  identity: MemorialHeaderIdentity;
  profilePicture?: string | null;
}

export function HeaderCarousel({
  identity,
  images,
  profilePicture,
}: HeaderCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayName = identity.displayName || identity.fallbackName;

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return null;
  }

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section className="relative w-full">
      <div
        className="embla relative h-[40vh] min-h-[300px] w-full overflow-hidden md:h-[50vh] lg:h-[60vh]"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {images.map((image, index) => {
            const imageUrl = getMemorialMediaUrl(image.url);

            if (!imageUrl) {
              return null;
            }

            return (
              <div
                className="relative h-full min-w-0 flex-[0_0_100%]"
                key={image.id}
              >
                <Image
                  alt={image.altText ?? `${displayName} memorial image`}
                  className="object-cover"
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  src={imageUrl}
                />
              </div>
            );
          })}
        </div>

        {images.length > 1 && (
          <>
            <Button
              aria-label="Previous memorial image"
              className="absolute top-1/2 left-4 size-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50 md:size-12"
              disabled={!canScrollPrev}
              onClick={scrollPrev}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="size-5 md:size-6" />
            </Button>
            <Button
              aria-label="Next memorial image"
              className="absolute top-1/2 right-4 size-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50 md:size-12"
              disabled={!canScrollNext}
              onClick={scrollNext}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="size-5 md:size-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((image, index) => (
                <button
                  aria-label={`Go to image ${index + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  )}
                  key={`dot-${image.id}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative bg-background">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-end gap-4 md:gap-6">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative -mt-24 shrink-0 md:-mt-32 lg:-mt-40"
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2,
              }}
            >
              <MemorialHeaderAvatar
                displayName={identity.displayName}
                fallbackName={identity.fallbackName}
                interactive
                profilePicture={profilePicture}
                variant="carousel"
              />
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
            >
              <MemorialHeaderDetails {...identity} variant="carousel" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
