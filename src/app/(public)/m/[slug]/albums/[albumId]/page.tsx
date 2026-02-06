import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumPhotoGrid } from "@/components/memorial/album-photo-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinalSpaceBySlug } from "@/lib/actions/final-space-actions";
import { getAlbumMedia } from "@/lib/actions/media-actions";
import { db } from "@/lib/db";
import { mediaAlbums } from "@/lib/db/schema";

interface Props {
  params: Promise<{ slug: string; albumId: string }>;
}

export default async function AlbumPage({ params }: Props) {
  const { slug, albumId } = await params;

  const space = await getFinalSpaceBySlug(slug);
  if (!space) {
    notFound();
  }

  const [album] = await db
    .select({ title: mediaAlbums.title, description: mediaAlbums.description })
    .from(mediaAlbums)
    .where(
      and(eq(mediaAlbums.id, albumId), eq(mediaAlbums.finalSpaceId, space.id))
    )
    .limit(1);

  if (!album) {
    notFound();
  }

  const media = await getAlbumMedia(albumId);

  const photos = media.map(({ albumMedia, mediaAsset }) => ({
    id: mediaAsset.id,
    storageKey: mediaAsset.storageKey,
    title: mediaAsset.title,
    caption: albumMedia.caption,
  }));

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="container mx-auto px-4 py-8">
        <Link
          className="mb-6 inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
          href={`/m/${slug}`}
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
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to memorial
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{album.title}</CardTitle>
            {album.description && (
              <p className="text-muted-foreground">{album.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <AlbumPhotoGrid photos={photos} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
