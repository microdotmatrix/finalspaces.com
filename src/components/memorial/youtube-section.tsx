import Image from "next/image";

import type { YouTubeLink } from "@/lib/validation/external-links";

interface YouTubeSectionProps {
  youtubeLinks: YouTubeLink[];
}

export function YouTubeSection({ youtubeLinks }: YouTubeSectionProps) {
  if (youtubeLinks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-2xl">YouTube</h2>
        <p className="text-muted-foreground text-sm">Videos and tributes</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {youtubeLinks.map((link) => (
          <a
            className="overflow-hidden rounded-xl border bg-muted/30 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            href={link.url}
            key={link.url}
            rel="noopener"
            target="_blank"
          >
            <div className="relative aspect-video w-full bg-muted">
              {link.thumbnailUrl ? (
                <Image
                  alt={link.title ?? "YouTube video"}
                  className="object-cover"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  src={link.thumbnailUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Thumbnail unavailable
                </div>
              )}
            </div>
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 font-medium">
                {link.title ?? "YouTube video"}
              </p>
              {link.channelName && (
                <p className="text-muted-foreground text-sm">
                  {link.channelName}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
