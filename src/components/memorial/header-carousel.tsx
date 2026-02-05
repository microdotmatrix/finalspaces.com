"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { ImageDialog } from "@/components/elements/image-dialog";
import { Button } from "@/components/ui/button";

interface HeaderCarouselProps {
  images: {
    id: string;
    url: string;
    altText?: string | null;
    caption?: string | null;
  }[];
  displayName: string;
  fullName?: string;
  nickname?: string | null;
  useNicknameOnly?: boolean;
  profilePicture?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  inMemoriam?: boolean;
  hometown?: string | null;
}

// Convert storage key to full UploadThing URL
function getMediaUrl(storageKey: string): string {
  return `https://utfs.io/f/${storageKey}`;
}

// Calculate age from birth and death dates
function calculateAge(
  birthDate: string | null | undefined,
  deathDate: string | null | undefined
): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function HeaderCarousel({
  images,
  displayName,
  fullName,
  nickname,
  useNicknameOnly,
  profilePicture,
  birthDate,
  deathDate,
  inMemoriam,
  hometown,
}: HeaderCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const profilePictureUrl = profilePicture
    ? `https://utfs.io/f/${profilePicture}`
    : null;

  const age = calculateAge(birthDate, deathDate);

  return (
    <section className="relative w-full">
      {/* Full-width carousel */}
      <div
        className="embla relative h-[40vh] min-h-[300px] w-full overflow-hidden md:h-[50vh] lg:h-[60vh]"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {images.map((image, index) => (
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
                src={getMediaUrl(image.url)}
              />
            </div>
          ))}
        </div>

        {/* Navigation buttons - only show if multiple images */}
        {images.length > 1 && (
          <>
            <Button
              className="absolute top-1/2 left-4 size-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50 md:size-12"
              disabled={!canScrollPrev}
              onClick={scrollPrev}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="size-5 md:size-6" />
            </Button>
            <Button
              className="absolute top-1/2 right-4 size-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50 md:size-12"
              disabled={!canScrollNext}
              onClick={scrollNext}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="size-5 md:size-6" />
            </Button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((image, index) => (
                <button
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                  key={`dot-${image.id}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Profile info section - below carousel */}
      <div className="relative bg-background">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-end gap-4 md:gap-6">
            {/* Profile picture with cutout effect - overlapping carousel */}
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
              {profilePictureUrl ? (
                <div className="relative size-48 overflow-hidden rounded-full border-4 border-background shadow-xl md:size-64 lg:size-72">
                  <ImageDialog
                    alt={displayName}
                    className="object-cover"
                    src={profilePictureUrl}
                  />
                </div>
              ) : (
                <div className="flex size-48 items-center justify-center rounded-full border-4 border-background bg-muted font-bold text-5xl text-muted-foreground shadow-xl md:size-64 md:text-7xl lg:size-72 lg:text-8xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>

            {/* Name and info - beside profile picture */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="pb-4 md:pb-6"
              initial={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
            >
              <h1 className="font-semibold text-2xl text-foreground md:text-3xl lg:text-4xl">
                {displayName}
              </h1>

              {/* Age and location */}
              <div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                {age !== null && <span>{age} years</span>}
                {age !== null && hometown && <span>•</span>}
                {hometown && <span>{hometown}</span>}
              </div>

              {/* Nickname */}
              {nickname && !useNicknameOnly && (
                <p className="mt-1 text-muted-foreground text-sm italic md:text-base">
                  &ldquo;{nickname}&rdquo;
                </p>
              )}

              {/* In Memoriam badge */}
              {inMemoriam && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="font-medium text-muted-foreground text-xs">
                    In Loving Memory
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
