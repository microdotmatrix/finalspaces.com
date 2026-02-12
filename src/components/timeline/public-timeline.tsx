import {
  Baby,
  Briefcase,
  CircleDot,
  Flower2,
  GraduationCap,
  Heart,
  HeartPulse,
  type LucideIcon,
  PartyPopper,
  Plane,
  Star,
  Trophy,
  Users,
} from "lucide-react";

import type { TimelineEvent } from "@/lib/actions/timeline-actions";

interface PublicTimelineProps {
  events: TimelineEvent[];
}

const iconMap: Record<string, LucideIcon> = {
  birth: Baby,
  education: GraduationCap,
  career: Briefcase,
  relationship: Heart,
  family: Users,
  achievement: Trophy,
  celebration: PartyPopper,
  travel: Plane,
  milestone: Star,
  health: HeartPulse,
  death: Flower2,
  custom: CircleDot,
};

export function PublicTimeline({ events }: PublicTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute top-0 left-4 h-full w-0.5 bg-border md:left-1/2" />

      <div className="space-y-8">
        {events.map((event, index) => (
          <TimelineCard event={event} index={index} key={event.id} />
        ))}
      </div>
    </div>
  );
}

function TimelineCard({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) {
  const Icon = iconMap[event.eventType] ?? CircleDot;
  const isLeft = index % 2 === 0;

  const dateString = formatEventDate(event);

  return (
    <div
      className={`relative flex items-start gap-4 md:gap-8 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Icon marker */}
      <div className="absolute left-4 z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-background md:left-1/2">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      {/* Spacer for icon on mobile */}
      <div className="w-8 md:hidden" />

      {/* Content card */}
      <div
        className={`flex-1 rounded-lg border bg-card p-4 shadow-sm md:max-w-[calc(50%-2rem)] ${
          isLeft ? "md:mr-auto" : "md:ml-auto"
        }`}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{event.title}</h3>
            {event.organization && (
              <p className="text-muted-foreground text-sm">
                {event.organization}
              </p>
            )}
          </div>
          {dateString && (
            <span className="shrink-0 text-muted-foreground text-xs">
              {dateString}
            </span>
          )}
        </div>

        {event.description && (
          <p className="whitespace-pre-wrap text-muted-foreground text-sm">
            {event.description}
          </p>
        )}

        {event.location && (
          <p className="mt-2 text-muted-foreground text-xs">
            📍 {event.location}
          </p>
        )}
      </div>
    </div>
  );
}

function formatEventDate(event: TimelineEvent): string {
  const parts: string[] = [];

  if (event.eventYear) {
    if (event.eventMonth) {
      const month = new Date(2000, event.eventMonth - 1).toLocaleString(
        "default",
        { month: "short" }
      );
      parts.push(`${month} ${event.eventYear}`);
    } else {
      parts.push(String(event.eventYear));
    }
  }

  if (event.endYear && event.endYear !== event.eventYear) {
    if (event.endMonth) {
      const month = new Date(2000, event.endMonth - 1).toLocaleString(
        "default",
        { month: "short" }
      );
      parts.push(`${month} ${event.endYear}`);
    } else {
      parts.push(String(event.endYear));
    }
  }

  return parts.join(" – ");
}
