import { TimelineSectionContent } from "@/components/memorial/timeline-section-content";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicTimelineEventsWithCategories } from "@/lib/actions/timeline-actions";

interface TimelineSectionProps {
  finalSpaceId: string;
}

export async function TimelineSection({ finalSpaceId }: TimelineSectionProps) {
  const events = await getPublicTimelineEventsWithCategories(finalSpaceId);

  if (events.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Life Timeline</CardTitle>
        <CardAction>
          <span className="text-muted-foreground text-sm">
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <TimelineSectionContent events={events} />
      </CardContent>
    </Card>
  );
}
