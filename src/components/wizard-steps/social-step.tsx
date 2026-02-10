"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { wizardDataAtom } from "@/lib/stores/wizard-state";
import { generateUUID } from "@/lib/utils";

interface LinkItem {
  id: string;
  url: string;
  title?: string;
  type?: "track" | "playlist" | "album";
  spotifyId?: string;
  trackId?: string;
  artist?: string;
  ownerName?: string;
  albumName?: string;
  albumArtUrl?: string;
  previewUrl?: string | null;
  durationMs?: number;
  tracks?: {
    id: string;
    name: string;
    artists: string;
    albumName?: string;
    albumArtUrl?: string;
    previewUrl?: string | null;
    durationMs?: number;
  }[];
  thumbnailUrl?: string;
  channelName?: string;
  fetchedAt?: string;
  staleAt?: string;
}

export function SocialStep() {
  const [wizardData, setWizardData] = useAtom(wizardDataAtom);

  // Local state synced with Jotai
  const [youtubeLinks, setYoutubeLinks] = useState<LinkItem[]>(() =>
    wizardData.youtubeLinks.map((link) => ({
      ...link,
      id: link.id ?? generateUUID(),
    }))
  );
  const [spotifyLinks, setSpotifyLinks] = useState<LinkItem[]>(() =>
    wizardData.spotifyLinks.map((link) => ({
      ...link,
      id: link.id ?? generateUUID(),
    }))
  );
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    wizardData.socialLinks
  );

  // Sync local state to Jotai (debounced effect)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWizardData((prev) => ({
        ...prev,
        youtubeLinks,
        spotifyLinks,
        socialLinks,
      }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [youtubeLinks, spotifyLinks, socialLinks, setWizardData]);

  // YouTube handlers
  const addYoutube = () => {
    setYoutubeLinks((prev) => [
      ...prev,
      { id: generateUUID(), url: "", title: "" },
    ]);
  };

  const removeYoutube = (index: number) => {
    setYoutubeLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateYoutube = (
    index: number,
    field: keyof LinkItem,
    value: string
  ) => {
    setYoutubeLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Spotify handlers
  const addSpotify = () => {
    setSpotifyLinks((prev) => [
      ...prev,
      { id: generateUUID(), url: "", title: "" },
    ]);
  };

  const removeSpotify = (index: number) => {
    setSpotifyLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpotify = (
    index: number,
    field: keyof LinkItem,
    value: string
  ) => {
    setSpotifyLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Social links handler
  const updateSocialLink = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Social &amp; Media</h2>
        <p className="text-muted-foreground">
          Add YouTube videos, Spotify playlists, and social links.
        </p>
      </div>

      <div className="space-y-8">
        {/* YouTube Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-red-500" icon="mdi:youtube" />
              <Label>YouTube Videos</Label>
            </div>
            <Button
              onClick={addYoutube}
              size="sm"
              type="button"
              variant="outline"
            >
              <Icon className="mr-1 size-4" icon="mdi:plus" />
              Add Video
            </Button>
          </div>

          {youtubeLinks.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Add YouTube videos they loved or that celebrate their memory.
            </p>
          ) : (
            <div className="space-y-3">
              {youtubeLinks.map((item, index) => (
                <div className="flex gap-2" key={item.id}>
                  <Input
                    className="flex-1"
                    onChange={(e) =>
                      updateYoutube(index, "url", e.target.value)
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    value={item.url}
                  />
                  <Input
                    className="w-40"
                    onChange={(e) =>
                      updateYoutube(index, "title", e.target.value)
                    }
                    placeholder="Title (optional)"
                    value={item.title || ""}
                  />
                  <Button
                    className="text-red-500"
                    onClick={() => removeYoutube(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Icon className="size-4" icon="mdi:close" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spotify Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-green-500" icon="mdi:spotify" />
              <Label>Spotify</Label>
            </div>
            <Button
              onClick={addSpotify}
              size="sm"
              type="button"
              variant="outline"
            >
              <Icon className="mr-1 size-4" icon="mdi:plus" />
              Add Track/Playlist
            </Button>
          </div>

          {spotifyLinks.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Add their favorite songs or playlists from Spotify.
            </p>
          ) : (
            <div className="space-y-3">
              {spotifyLinks.map((item, index) => (
                <div className="flex gap-2" key={item.id}>
                  <Input
                    className="flex-1"
                    onChange={(e) =>
                      updateSpotify(index, "url", e.target.value)
                    }
                    placeholder="https://open.spotify.com/..."
                    value={item.url}
                  />
                  <Input
                    className="w-40"
                    onChange={(e) =>
                      updateSpotify(index, "title", e.target.value)
                    }
                    placeholder="Title (optional)"
                    value={item.title || ""}
                  />
                  <Button
                    className="text-red-500"
                    onClick={() => removeSpotify(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Icon className="size-4" icon="mdi:close" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <Label>Social Media Profiles (Optional)</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-blue-600" icon="mdi:facebook" />
              <Input
                onChange={(e) => updateSocialLink("facebook", e.target.value)}
                placeholder="Facebook URL"
                value={socialLinks.facebook || ""}
              />
            </div>
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-pink-500" icon="mdi:instagram" />
              <Input
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="Instagram URL"
                value={socialLinks.instagram || ""}
              />
            </div>
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-sky-500" icon="mdi:twitter" />
              <Input
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                placeholder="Twitter/X URL"
                value={socialLinks.twitter || ""}
              />
            </div>
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-blue-700" icon="mdi:linkedin" />
              <Input
                onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                placeholder="LinkedIn URL"
                value={socialLinks.linkedin || ""}
              />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Link to their profiles or memorial pages on other platforms.
          </p>
        </div>
      </div>
    </div>
  );
}
