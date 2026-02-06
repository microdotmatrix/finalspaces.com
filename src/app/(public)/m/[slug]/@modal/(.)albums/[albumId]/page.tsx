import { and, eq } from "drizzle-orm";
import { getFinalSpaceBySlug } from "@/lib/actions/final-space-actions";
import { getAlbumMedia } from "@/lib/actions/media-actions";
import { db } from "@/lib/db";
import { mediaAlbums } from "@/lib/db/schema";
import { AlbumModal } from "./album-modal";

interface Props {
  params: Promise<{ slug: string; albumId: string }>;
}

export default async function AlbumModalPage({ params }: Props) {
  const { slug, albumId } = await params;

  const space = await getFinalSpaceBySlug(slug);
  if (!space) {
    return null;
  }

  const [album] = await db
    .select({ title: mediaAlbums.title })
    .from(mediaAlbums)
    .where(
      and(eq(mediaAlbums.id, albumId), eq(mediaAlbums.finalSpaceId, space.id))
    )
    .limit(1);

  if (!album) {
    return null;
  }

  const media = await getAlbumMedia(albumId);

  const photos = media.map(({ albumMedia, mediaAsset }) => ({
    id: mediaAsset.id,
    storageKey: mediaAsset.storageKey,
    title: mediaAsset.title,
    caption: albumMedia.caption,
  }));

  return <AlbumModal photos={photos} title={album.title} />;
}
