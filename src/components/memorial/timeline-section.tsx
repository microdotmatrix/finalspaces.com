import { LifeTimeline } from "@/components/timeline/life-timeline";
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
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <LifeTimeline events={events} />
    </div>
  );
}
