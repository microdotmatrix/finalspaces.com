"use client";

import L from "leaflet";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import type { TimelineEventWithCategory } from "@/lib/actions/timeline-actions";
import { features } from "@/lib/config";
import { formatEventDateRange } from "@/lib/utils/timeline-helpers";

const FALLBACK_CENTER: [number, number] = [39.8283, -98.5795];
const FALLBACK_ZOOM = 4;

const markerIconCache = new Map<string, L.DivIcon>();

function getMarkerIcon(color: string): L.DivIcon {
  const key = color || "default";
  const cached = markerIconCache.get(key);
  if (cached) {
    return cached;
  }

  const icon = L.divIcon({
    className: "timeline-map-marker-wrapper",
    html: `<span class="timeline-map-marker" style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  markerIconCache.set(key, icon);
  return icon;
}

interface TimelineMapProps {
  events: TimelineEventWithCategory[];
}

export function TimelineMap({ events }: TimelineMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const allMappableEvents = events.filter((event) => {
    if (!event.addToMap) {
      return false;
    }

    if (
      typeof event.latitude !== "number" ||
      typeof event.longitude !== "number"
    ) {
      return false;
    }
    return true;
  });

  const mappableEvents =
    selectedCategory === "all"
      ? allMappableEvents
      : allMappableEvents.filter(
          (event) => event.category?.id === selectedCategory
        );

  const map = new Map<string, { id: string; name: string }>();
  for (const event of events) {
    if (!(event.category?.id && event.category.name)) {
      continue;
    }
    map.set(event.category.id, {
      id: event.category.id,
      name: event.category.name,
    });
  }
  const categories = Array.from(map.values());

  const center: [number, number] = (() => {
    if (allMappableEvents.length === 0) {
      return FALLBACK_CENTER;
    }

    const first = mappableEvents[0] ?? allMappableEvents[0];
    return [
      first.latitude ?? FALLBACK_CENTER[0],
      first.longitude ?? FALLBACK_CENTER[1],
    ];
  })();

  if (events.length === 0 || allMappableEvents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <div className="mb-2 flex justify-center">
          <MapPin className="size-5" />
        </div>
        <p>No mapped timeline locations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted"
            onClick={() => setSelectedCategory("all")}
            type="button"
          >
            All
          </button>
          {categories.map((category) => (
            <button
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted"
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {mappableEvents.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No events match the selected category.
        </p>
      )}

      <div className="h-[380px] overflow-hidden rounded-xl border">
        <MapContainer
          center={center}
          className="h-full w-full"
          scrollWheelZoom
          zoom={FALLBACK_ZOOM}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {features.timelineMapClusteringEnabled ? (
            <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={11}>
              {mappableEvents.map((event) => {
                const markerColor = event.category?.color ?? "#6366f1";
                return (
                  <Marker
                    icon={getMarkerIcon(markerColor)}
                    key={event.id}
                    position={[event.latitude ?? 0, event.longitude ?? 0]}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{event.title}</p>
                        {event.category?.name && (
                          <p className="text-muted-foreground text-xs">
                            {event.category.name}
                          </p>
                        )}
                        {formatEventDateRange(event) && (
                          <p className="text-muted-foreground text-xs">
                            {formatEventDateRange(event)}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs">{event.location}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            mappableEvents.map((event) => {
              const markerColor = event.category?.color ?? "#6366f1";
              return (
                <Marker
                  icon={getMarkerIcon(markerColor)}
                  key={event.id}
                  position={[event.latitude ?? 0, event.longitude ?? 0]}
                >
                  <Popup>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{event.title}</p>
                      {event.category?.name && (
                        <p className="text-muted-foreground text-xs">
                          {event.category.name}
                        </p>
                      )}
                      {formatEventDateRange(event) && (
                        <p className="text-muted-foreground text-xs">
                          {formatEventDateRange(event)}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs">{event.location}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })
          )}
        </MapContainer>
      </div>
    </div>
  );
}
