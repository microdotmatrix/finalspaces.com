import { SpotifyPreviewPlayer } from "@/components/memorial/spotify-preview-player";
import type {
  SpotifyLink,
  SpotifyTrack,
} from "@/lib/validation/external-links";

interface SpotifySectionProps {
  spotifyLinks: SpotifyLink[];
  storageKey: string;
}

const buildTrackFromLink = (link: SpotifyLink): SpotifyTrack => ({
  id: link.spotifyId ?? link.trackId ?? link.url,
  name: link.title ?? "Spotify track",
  artists: link.artist ?? "Spotify",
  albumName: link.albumName,
  albumArtUrl: link.albumArtUrl,
  previewUrl: link.previewUrl ?? null,
  durationMs: link.durationMs,
});

export function SpotifySection({
  spotifyLinks,
  storageKey,
}: SpotifySectionProps) {
  if (spotifyLinks.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-2xl">Spotify</h2>
          <p className="text-muted-foreground text-sm">30-second previews</p>
        </div>
        <div className="space-y-6">
          {spotifyLinks.map((link) => {
            const linkKey = link.spotifyId ?? link.url;
            const isTrack =
              link.type === "track" || !(link.type || link.tracks);
            const tracks = isTrack
              ? [buildTrackFromLink(link)]
              : (link.tracks ?? []);

            if (!tracks.length) {
              return (
                <div
                  className="rounded-xl border bg-card p-4 shadow-sm"
                  key={`${linkKey}-${link.title ?? "link"}`}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      {link.title ?? "Spotify link"}
                    </h3>
                    {link.ownerName || link.artist ? (
                      <p className="text-muted-foreground text-sm">
                        {link.ownerName ?? link.artist}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-3 text-muted-foreground text-sm">
                    Preview unavailable. Open in Spotify to listen.
                  </div>
                  <a
                    className="mt-3 inline-flex text-primary text-sm underline-offset-4 hover:underline"
                    href={link.url}
                    rel="noopener"
                    target="_blank"
                  >
                    Open in Spotify
                  </a>
                </div>
              );
            }

            return (
              <SpotifyPreviewPlayer
                key={linkKey}
                sourceUrl={link.url}
                storageKey={`${storageKey}-${linkKey}`}
                subtitle={link.ownerName ?? link.artist}
                title={link.title}
                tracks={tracks}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
