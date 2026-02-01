import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlbumsGrid } from "@/components/memorial/albums-grid";
import { GuestbookSection } from "@/components/memorial/guestbook-section";
import { HeaderCarousel } from "@/components/memorial/header-carousel";
import { SpotifySection } from "@/components/memorial/spotify-section";
import { TimelineSection } from "@/components/memorial/timeline-section";
import { YouTubeSection } from "@/components/memorial/youtube-section";
import { getFinalSpaceBySlug } from "@/lib/actions/final-space-actions";
import {
  getPublicAlbums,
  getPublicHeaderCarouselImages,
} from "@/lib/actions/media-actions";
import { db } from "@/lib/db";
import { type FinalSpace, mediaAssets } from "@/lib/db/schema";
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

  const displayName = getDisplayName(space);

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
  const [headerImages, albums, mediaLinks] = await Promise.all([
    getPublicHeaderCarouselImages(space.id),
    getPublicAlbums(space.id),
    getEnrichedFinalSpaceMediaLinks(space.id),
  ]);

  const displayName = getDisplayName(space);
  const fullName = getFullName(space);

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
    <main className="min-h-screen">
      {/* Header Carousel */}
      {headerImages.length > 0 ? (
        <HeaderCarousel
          birthDate={space.birthDate}
          deathDate={space.deathDate}
          displayName={displayName}
          fullName={fullName}
          images={headerImages}
          inMemoriam={space.inMemoriam}
          nickname={space.nickname}
          profilePicture={profilePicture}
          useNicknameOnly={space.useNicknameOnly}
        />
      ) : (
        <MemorialHero
          birthDate={space.birthDate}
          deathDate={space.deathDate}
          displayName={displayName}
          fullName={fullName}
          inMemoriam={space.inMemoriam}
          name={space.name}
          nickname={space.nickname}
          profilePicture={profilePicture}
          useNicknameOnly={space.useNicknameOnly}
        />
      )}

      <MemorialBio bioText={space.bioText} />
      <MemorialHighlights lifeHighlights={space.lifeHighlights} />

      {/* Photo Albums */}
      {albums.length > 0 && <AlbumsGrid albums={albums} slug={slug} />}

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

      {/* Timeline Section */}
      <Suspense
        fallback={<div className="py-12 text-center">Loading timeline...</div>}
      >
        <TimelineSection finalSpaceId={space.id} />
      </Suspense>

      <MemorialPlaces
        hometown={space.hometown}
        placeOfBirth={space.placeOfBirth}
      />

      {/* Guestbook Section */}
      <Suspense
        fallback={
          <div className="bg-muted/30 py-12 text-center">
            Loading guestbook...
          </div>
        }
      >
        <GuestbookSection
          displayName={displayName || space.name}
          finalSpaceId={space.id}
        />
      </Suspense>

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

function getDisplayName(space: FinalSpace) {
  return space.useNicknameOnly && space.nickname
    ? space.nickname
    : `${space.firstName || ""} ${space.lastName || ""}`.trim();
}

function getFullName(space: FinalSpace) {
  return [space.firstName, space.middleName, space.lastName, space.suffix]
    .filter(Boolean)
    .join(" ");
}

interface MemorialHeroProps {
  displayName: string;
  name: string;
  nickname: string | null;
  useNicknameOnly: boolean;
  fullName: string;
  profilePicture: string | null;
  birthDate: string | null;
  deathDate: string | null;
  inMemoriam: boolean;
}

function MemorialHero({
  birthDate,
  deathDate,
  displayName,
  fullName,
  inMemoriam,
  name,
  nickname,
  profilePicture,
  useNicknameOnly,
}: MemorialHeroProps) {
  // Convert storage key to full UploadThing URL
  const profilePictureUrl = profilePicture
    ? `https://utfs.io/f/${profilePicture}`
    : null;
  return (
    <section className="relative bg-linear-to-b from-primary/10 to-background py-16 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        {profilePictureUrl ? (
          <div className="relative mx-auto mb-6 size-32 overflow-hidden rounded-full sm:size-40">
            <Image
              alt={displayName || name}
              className="object-cover"
              fill
              priority
              sizes="160px"
              src={profilePictureUrl}
            />
          </div>
        ) : (
          <div className="mx-auto mb-6 flex size-32 items-center justify-center rounded-full bg-primary/20 font-bold text-4xl text-primary sm:size-40">
            {(displayName || name).charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="mb-2 font-bold text-3xl sm:text-4xl lg:text-5xl">
          {displayName || name}
        </h1>

        {nickname && !useNicknameOnly && (
          <p className="mb-2 text-lg text-muted-foreground">
            &ldquo;{nickname}&rdquo;
          </p>
        )}

        {fullName && fullName !== displayName && (
          <p className="text-muted-foreground">{fullName}</p>
        )}

        {(birthDate || deathDate) && (
          <p className="mt-4 text-muted-foreground">
            {birthDate && <span>{birthDate}</span>}
            {birthDate && deathDate && <span> — </span>}
            {deathDate && <span>{deathDate}</span>}
          </p>
        )}

        {inMemoriam && (
          <div className="mt-4 inline-block rounded-full bg-black/80 px-4 py-1 font-medium text-sm text-white">
            In Loving Memory
          </div>
        )}
      </div>
    </section>
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
    <section className="py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-6 font-semibold text-2xl">About</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {bioText.split("\n").map((paragraph) => (
            <p key={`${paragraph}-${paragraph.length}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
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
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-6 font-semibold text-2xl">Life Highlights</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {lifeHighlights.split("\n").map((line) => (
            <p key={`${line}-${line.length}`}>{line}</p>
          ))}
        </div>
      </div>
    </section>
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
    <section className="py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-6 font-semibold text-2xl">Places</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {placeOfBirth && (
            <div className="rounded-lg bg-card p-4 shadow">
              <p className="font-medium text-muted-foreground text-sm">
                Place of Birth
              </p>
              <p className="text-lg">{placeOfBirth}</p>
            </div>
          )}
          {hometown && (
            <div className="rounded-lg bg-card p-4 shadow">
              <p className="font-medium text-muted-foreground text-sm">
                Hometown
              </p>
              <p className="text-lg">{hometown}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
