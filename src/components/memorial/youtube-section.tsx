import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { YouTubeLink } from "@/lib/validation/external-links";

interface YouTubeSectionProps {
  youtubeLinks: YouTubeLink[];
}

export function YouTubeSection({ youtubeLinks }: YouTubeSectionProps) {
  if (youtubeLinks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">YouTube</CardTitle>
        <CardDescription>Videos and tributes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {youtubeLinks.map((link) => (
            <a
              className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:shadow-md"
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
      </CardContent>
    </Card>
  );
}
