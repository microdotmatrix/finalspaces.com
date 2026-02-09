"use client";

import type { ReactNode } from "react";
import type { TimelineEventWithCategory } from "@/lib/actions/timeline-actions";
import { groupEventsByYear } from "@/lib/utils/timeline-helpers";

import { TimelineEventCard } from "./timeline-event-card";
import { TimelineHeader } from "./timeline-header";
import { TimelineYearMarker } from "./timeline-year-marker";

interface LifeTimelineProps {
  events: TimelineEventWithCategory[];
  hideHeader?: boolean;
  renderEventActions?: (event: TimelineEventWithCategory) => ReactNode;
}

export function LifeTimeline({
  events,
  hideHeader = false,
  renderEventActions,
}: LifeTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>No timeline events yet.</p>
      </div>
    );
  }

  const groupedEvents = groupEventsByYear(events);

  return (
    <div className="space-y-2">
      {!hideHeader && <TimelineHeader eventCount={events.length} />}

      {/* Timeline content */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute top-0 bottom-0 left-4 w-px bg-border" />

        {/* Year groups */}
        <div className="space-y-4">
          {groupedEvents.map((group) => (
            <div key={group.year ?? "unknown"}>
              <TimelineYearMarker year={group.year} />
              <div className="space-y-4 pl-4">
                {group.events.map((event) => (
                  <TimelineEventCard
                    actions={renderEventActions?.(event)}
                    event={event}
                    key={event.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
