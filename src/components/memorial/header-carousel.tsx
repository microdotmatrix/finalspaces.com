"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
}

export function HeaderCarousel({ images }: HeaderCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
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
    <section className="relative w-full overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="flex">
          {images.map((image) => (
            <div
              className="relative aspect-[21/9] min-w-0 flex-[0_0_100%]"
              key={image.id}
            >
              <Image
                alt={image.altText ?? "Memorial header image"}
                className="object-cover"
                fill
                priority
                sizes="100vw"
                src={image.url}
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-center text-sm text-white">
                    {image.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons - only show if multiple images */}
      {images.length > 1 && (
        <>
          <Button
            className="absolute top-1/2 left-4 size-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            className="absolute top-1/2 right-4 size-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md"
            disabled={!canScrollNext}
            onClick={scrollNext}
            size="icon"
            variant="ghost"
          >
            <ChevronRight className="size-5" />
          </Button>
        </>
      )}
    </section>
  );
}
