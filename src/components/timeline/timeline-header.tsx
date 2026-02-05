import { Clock } from "lucide-react";

interface TimelineHeaderProps {
  eventCount: number;
}

export function TimelineHeader({ eventCount }: TimelineHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-muted-foreground" />
        <h2 className="font-semibold text-xl">Life Timeline</h2>
      </div>
      <span className="text-muted-foreground text-sm">
        {eventCount} {eventCount === 1 ? "event" : "events"}
      </span>
    </div>
  );
}
