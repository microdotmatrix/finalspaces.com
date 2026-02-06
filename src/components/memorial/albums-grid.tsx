import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Album {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  mediaCount: number;
}

interface AlbumsGridProps {
  albums: Album[];
  slug: string;
}

// Convert storage key to full UploadThing URL
function getMediaUrl(storageKey: string): string {
  return `https://utfs.io/f/${storageKey}`;
}

export function AlbumsGrid({ albums, slug }: AlbumsGridProps) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Photo Albums</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {albums.map((album) => (
            <Link
              className="group relative aspect-4/3 overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10 transition-all hover:shadow-md"
              href={`/m/${slug}/albums/${album.id}`}
              key={album.id}
              scroll={false}
            >
              {album.coverImageUrl ? (
                <Image
                  alt={album.title}
                  className="object-cover transition-transform group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  src={getMediaUrl(album.coverImageUrl)}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-4xl text-muted-foreground">
                  📷
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4">
                <h3 className="font-medium text-white">{album.title}</h3>
                <p className="text-sm text-white/80">
                  {album.mediaCount}{" "}
                  {album.mediaCount === 1 ? "photo" : "photos"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
