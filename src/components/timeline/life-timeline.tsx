import type { TimelineEventWithCategory } from "@/lib/actions/timeline-actions";
import { groupEventsByYear } from "@/lib/utils/timeline-helpers";

import { TimelineEventCard } from "./timeline-event-card";
import { TimelineHeader } from "./timeline-header";
import { TimelineYearMarker } from "./timeline-year-marker";

interface LifeTimelineProps {
  events: TimelineEventWithCategory[];
}

export function LifeTimeline({ events }: LifeTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border-2 border-muted-foreground/25 border-dashed p-8 text-center">
        <p className="text-muted-foreground">No timeline events yet.</p>
      </div>
    );
  }

  const groupedEvents = groupEventsByYear(events);

  return (
    <div className="space-y-2">
      <TimelineHeader eventCount={events.length} />

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
                  <TimelineEventCard event={event} key={event.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
