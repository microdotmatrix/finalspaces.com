"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

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
}

// Convert storage key to full UploadThing URL
function getMediaUrl(storageKey: string): string {
  return `https://utfs.io/f/${storageKey}`;
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

  return (
    <section className="relative w-full">
      {/* Full-width carousel */}
      <div
        className="embla relative h-[50vh] min-h-[400px] w-full overflow-hidden md:h-[60vh] lg:h-[70vh]"
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
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
            </div>
          ))}
        </div>

        {/* Navigation buttons - only show if multiple images */}
        {images.length > 1 && (
          <>
            <Button
              className="absolute top-1/2 left-4 size-12 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50"
              disabled={!canScrollPrev}
              onClick={scrollPrev}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="size-6" />
            </Button>
            <Button
              className="absolute top-1/2 right-4 size-12 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50"
              disabled={!canScrollNext}
              onClick={scrollNext}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="size-6" />
            </Button>

            {/* Dot indicators */}
            <div className="absolute bottom-32 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-36">
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

        {/* Portrait overlay - positioned on the left above name */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-48 left-4 z-20 md:bottom-56 md:left-8 lg:bottom-64 lg:left-12"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className="relative">
            {profilePictureUrl ? (
              <div className="relative size-32 overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl md:size-44 lg:size-52">
                <Image
                  alt={displayName}
                  className="object-cover"
                  fill
                  priority
                  sizes="208px"
                  src={profilePictureUrl}
                />
              </div>
            ) : (
              <div className="flex size-32 items-center justify-center rounded-2xl border-4 border-white/90 bg-white font-bold text-5xl text-slate-700 shadow-2xl md:size-44 md:text-6xl lg:size-52 lg:text-7xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Decorative ring */}
            <div className="absolute -inset-2 -z-10 rounded-2xl bg-gradient-to-br from-amber-200/40 via-transparent to-amber-400/30 blur-md" />
          </div>
        </motion.div>

        {/* Name and info overlay - positioned bottom left */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 bottom-0 left-0 z-10 p-4 md:p-8 lg:p-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-2xl">
            {/* In Memoriam badge */}
            {inMemoriam && (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="font-medium text-white/90 text-xs uppercase tracking-wide">
                  In Loving Memory
                </span>
              </motion.div>
            )}

            {/* Main name */}
            <h1 className="font-medium font-serif text-4xl text-white tracking-tight md:text-5xl lg:text-6xl">
              {displayName}
            </h1>

            {/* Nickname */}
            {nickname && !useNicknameOnly && (
              <p className="mt-2 font-serif text-white/80 text-xl italic md:text-2xl">
                &ldquo;{nickname}&rdquo;
              </p>
            )}

            {/* Full name subtitle */}
            {fullName && fullName !== displayName && (
              <p className="mt-2 text-base text-white/60 md:text-lg">
                {fullName}
              </p>
            )}

            {/* Dates */}
            {(birthDate || deathDate) && (
              <div className="mt-4 flex items-center gap-3 text-sm text-white/70 md:text-base">
                {birthDate && <span>{birthDate}</span>}
                {birthDate && deathDate && (
                  <span className="text-white/40">—</span>
                )}
                {deathDate && <span>{deathDate}</span>}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
