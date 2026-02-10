"use client";

import Image from "next/image";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { SpotifyTrack } from "@/lib/validation/external-links";

interface SpotifyPreviewPlayerProps {
  title?: string;
  subtitle?: string;
  tracks: SpotifyTrack[];
  sourceUrl?: string;
  storageKey: string;
}

const formatSeconds = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const formatDuration = (durationMs?: number) => {
  if (!durationMs) {
    return "0:00";
  }
  return formatSeconds(durationMs / 1000);
};

export function SpotifyPreviewPlayer({
  title,
  subtitle,
  tracks,
  sourceUrl,
  storageKey,
}: SpotifyPreviewPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPersistRef = useRef(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = tracks[currentIndex];
  const currentPreview = currentTrack?.previewUrl ?? null;
  const displayDuration =
    currentTrack?.durationMs && currentTrack.durationMs > 0
      ? currentTrack.durationMs / 1000
      : duration;

  const canPlay = Boolean(currentPreview);

  useEffect(() => {
    if (!storageKey) {
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as {
        index?: number;
        position?: number;
      };
      if (typeof parsed.index === "number" && Number.isInteger(parsed.index)) {
        const nextIndex = Math.min(
          Math.max(parsed.index, 0),
          Math.max(tracks.length - 1, 0)
        );
        setCurrentIndex(nextIndex);
      }
      if (typeof parsed.position === "number" && parsed.position >= 0) {
        setPosition(parsed.position);
      }
    } catch {
      return;
    }
  }, [storageKey, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (!currentPreview) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.src = currentPreview;
    audio.currentTime = position;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentPreview, isPlaying, position]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setPosition(currentTime);

      if (!storageKey) {
        return;
      }

      const now = Date.now();
      if (now - lastPersistRef.current < 1500) {
        return;
      }
      lastPersistRef.current = now;
      localStorage.setItem(
        storageKey,
        JSON.stringify({ index: currentIndex, position: currentTime })
      );
    };

    const handleMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (tracks.length === 0) {
        return;
      }
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentIndex(nextIndex);
      setPosition(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, storageKey, tracks.length]);

  const handlePlayPause = () => {
    if (!currentPreview) {
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const handlePrev = () => {
    if (tracks.length === 0) {
      return;
    }
    const nextIndex =
      currentIndex === 0 ? Math.max(tracks.length - 1, 0) : currentIndex - 1;
    setCurrentIndex(nextIndex);
    setPosition(0);
  };

  const handleNext = () => {
    if (tracks.length === 0) {
      return;
    }
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentIndex(nextIndex);
    setPosition(0);
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setPosition(nextTime);
  };

  const header =
    title || subtitle ? (
      <div className="space-y-1">
        {title && <h3 className="font-semibold text-lg">{title}</h3>}
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>
    ) : null;

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {header}
        {sourceUrl && (
          <a
            className="inline-flex items-center gap-2 text-muted-foreground text-sm transition hover:text-foreground"
            href={sourceUrl}
            rel="noopener"
            target="_blank"
          >
            <Icon className="size-4" icon="mdi:spotify" />
            Open in Spotify
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          disabled={!canPlay}
          onClick={handlePlayPause}
          size="icon"
          variant="outline"
        >
          <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} />
        </Button>
        <Button
          aria-label="Previous track"
          onClick={handlePrev}
          size="icon"
          variant="ghost"
        >
          <Icon icon="mdi:skip-previous" />
        </Button>
        <Button
          aria-label="Next track"
          onClick={handleNext}
          size="icon"
          variant="ghost"
        >
          <Icon icon="mdi:skip-next" />
        </Button>
        <div className="flex flex-1 items-center gap-2 text-muted-foreground text-xs">
          <span className="min-w-[36px] text-right">
            {formatSeconds(position)}
          </span>
          <input
            aria-label="Seek preview"
            className="h-1 w-full appearance-none rounded-full bg-muted accent-foreground"
            max={displayDuration || 30}
            min={0}
            onChange={handleSeek}
            step={1}
            type="range"
            value={position}
          />
          <span className="min-w-[36px]">
            {formatSeconds(displayDuration || 30)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {tracks.map((track, index) => {
          const isActive = index === currentIndex;
          const hasPreview = Boolean(track.previewUrl);

          return (
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                isActive ? "border-foreground/60" : "border-border",
                hasPreview ? "hover:border-foreground/50" : "opacity-60"
              )}
              key={`${track.id}-${track.name}`}
              onClick={() => {
                setCurrentIndex(index);
                setPosition(0);
                setIsPlaying(hasPreview);
              }}
              type="button"
            >
              <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                {track.albumArtUrl ? (
                  <Image
                    alt={track.albumName || track.name}
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={track.albumArtUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                    N/A
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{track.name}</p>
                <p className="truncate text-muted-foreground text-sm">
                  {track.artists}
                  {track.albumName ? ` • ${track.albumName}` : ""}
                </p>
              </div>
              <div className="text-muted-foreground text-xs">
                {hasPreview
                  ? formatDuration(track.durationMs)
                  : "Preview unavailable"}
              </div>
            </button>
          );
        })}
      </div>

      <audio ref={audioRef}>
        <track
          default
          kind="captions"
          label="Audio preview"
          src="/captions/spotify-preview.vtt"
          srcLang="en"
        />
      </audio>
    </Card>
  );
}
