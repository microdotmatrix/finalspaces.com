import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlbumsGrid } from "@/components/memorial/albums-grid";
import { FavoritesSection } from "@/components/memorial/favorites-section";
import { GuestbookSection } from "@/components/memorial/guestbook-section";
import { MediaPlaceholder } from "@/components/memorial/media-placeholder";
import { MemorialHeader } from "@/components/memorial/memorial-header";
import {
  getMemorialDisplayName,
  getMemorialFullName,
} from "@/components/memorial/memorial-header-utils";
import { SpotifySection } from "@/components/memorial/spotify-section";
import { TimelineSection } from "@/components/memorial/timeline-section";
import { YouTubeSection } from "@/components/memorial/youtube-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFavorites } from "@/lib/actions/favorites-actions";
import { getFinalSpaceBySlug } from "@/lib/actions/final-space-actions";
import {
  getPublicAlbums,
  getPublicHeaderCarouselImages,
} from "@/lib/actions/media-actions";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { getEnrichedFinalSpaceMediaLinks } from "@/lib/media/link-metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const space = await getFinalSpaceBySlug(slug);

  if (!space) {
    return {
      title: "Memorial Not Found",
    };
  }

  const displayName = getMemorialDisplayName(space);

  // Fetch profile picture URL if profilePictureId exists
  let profileImageUrl: string | null = null;
  if (space.profilePictureId) {
    const [media] = await db
      .select({ storageKey: mediaAssets.storageKey })
      .from(mediaAssets)
      .where(eq(mediaAssets.id, space.profilePictureId))
      .limit(1);
    profileImageUrl = media?.storageKey ?? null;
  }

  return {
    title: `${displayName || space.name} – In Loving Memory`,
    description:
      space.bioText?.slice(0, 160) ||
      `Celebrating the life of ${displayName || space.name}`,
    openGraph: {
      title: displayName || space.name,
      description:
        space.bioText?.slice(0, 160) ||
        `Celebrating the life of ${displayName || space.name}`,
      type: "profile",
      images: profileImageUrl ? [{ url: profileImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: displayName || space.name,
      description:
        space.bioText?.slice(0, 160) ||
        `Celebrating the life of ${displayName || space.name}`,
      images: profileImageUrl ? [profileImageUrl] : undefined,
    },
  };
}

export default async function MemorialPage({ params }: Props) {
  const { slug } = await params;
  const space = await getFinalSpaceBySlug(slug);

  if (!space) {
    notFound();
  }

  // Fetch additional data
  const [headerImages, albums, mediaLinks, favoritesData] = await Promise.all([
    getPublicHeaderCarouselImages(space.id),
    getPublicAlbums(space.id),
    getEnrichedFinalSpaceMediaLinks(space.id),
    getFavorites(space.id),
  ]);

  const displayName = getMemorialDisplayName(space);
  const fullName = getMemorialFullName(space);

  // Fetch profile picture URL if profilePictureId exists
  let profilePicture: string | null = null;
  if (space.profilePictureId) {
    const [media] = await db
      .select({ storageKey: mediaAssets.storageKey })
      .from(mediaAssets)
      .where(eq(mediaAssets.id, space.profilePictureId))
      .limit(1);
    profilePicture = media?.storageKey ?? null;
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      <MemorialHeader
        identity={{
          birthDate: space.birthDate,
          deathDate: space.deathDate,
          displayName,
          fallbackName: space.name,
          fullName,
          hometown: space.hometown,
          inMemoriam: space.inMemoriam,
          nickname: space.nickname,
          useNicknameOnly: space.useNicknameOnly,
        }}
        images={headerImages}
        profilePicture={profilePicture}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <MemorialBio bioText={space.bioText} />
            <MemorialHighlights lifeHighlights={space.lifeHighlights} />

            {/* Photo Albums */}
            {albums.length > 0 && <AlbumsGrid albums={albums} slug={slug} />}

            {/* Favorites */}
            <FavoritesSection
              favorites={favoritesData.favorites}
              favoriteTypes={favoritesData.types}
            />

            {/* Spotify & YouTube */}
            {mediaLinks.spotifyLinks.length > 0 && (
              <SpotifySection
                spotifyLinks={mediaLinks.spotifyLinks}
                storageKey={`spotify-player-${space.id}`}
              />
            )}
            {mediaLinks.youtubeLinks.length > 0 && (
              <YouTubeSection youtubeLinks={mediaLinks.youtubeLinks} />
            )}

            {/* Media Placeholder */}
            <MediaPlaceholder />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Timeline Section */}
            <Suspense
              fallback={
                <Card className="p-12 text-center">
                  <div className="text-muted-foreground">
                    Loading timeline...
                  </div>
                </Card>
              }
            >
              <TimelineSection
                finalSpaceId={space.id}
                subjectName={displayName || space.name}
              />
            </Suspense>

            <MemorialPlaces
              hometown={space.hometown}
              placeOfBirth={space.placeOfBirth}
            />

            {/* Guestbook Section */}
            <Suspense
              fallback={
                <Card className="p-12 text-center">
                  <div className="text-muted-foreground">
                    Loading guestbook...
                  </div>
                </Card>
              }
            >
              <GuestbookSection
                displayName={displayName || space.name}
                finalSpaceId={space.id}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>
            Created with{" "}
            <a className="underline hover:text-foreground" href="/">
              FinalSpace
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

interface MemorialBioProps {
  bioText: string | null;
}

function MemorialBio({ bioText }: MemorialBioProps) {
  if (!bioText) {
    return null;
  }

  return (
    <Card className="border-none bg-transparent shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-2xl">About</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground">
          {bioText.split("\n").map((paragraph) => (
            <p key={`${paragraph}-${paragraph.length}`}>{paragraph}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MemorialHighlightsProps {
  lifeHighlights: string | null;
}

function MemorialHighlights({ lifeHighlights }: MemorialHighlightsProps) {
  if (!lifeHighlights) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Life Highlights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {lifeHighlights.split("\n").map((line) => (
            <p key={`${line}-${line.length}`}>{line}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MemorialPlacesProps {
  placeOfBirth: string | null;
  hometown: string | null;
}

function MemorialPlaces({ placeOfBirth, hometown }: MemorialPlacesProps) {
  if (!(placeOfBirth || hometown)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Places</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {placeOfBirth && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-medium text-muted-foreground text-sm">
                Place of Birth
              </p>
              <p className="text-lg">{placeOfBirth}</p>
            </div>
          )}
          {hometown && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-medium text-muted-foreground text-sm">
                Hometown
              </p>
              <p className="text-lg">{hometown}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
