import { SpotifyPreviewPlayer } from "@/components/memorial/spotify-preview-player";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Spotify</CardTitle>
        <CardDescription>30-second previews</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {spotifyLinks.map((link) => {
          const linkKey = link.spotifyId ?? link.url;
          const isTrack = link.type === "track" || !(link.type || link.tracks);
          const tracks = isTrack
            ? [buildTrackFromLink(link)]
            : (link.tracks ?? []);

          if (!tracks.length) {
            return (
              <Card className="p-4" key={`${linkKey}-${link.title ?? "link"}`}>
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
              </Card>
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
      </CardContent>
    </Card>
  );
}
