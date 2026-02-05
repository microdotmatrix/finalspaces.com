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
    <section className="py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <LifeTimeline events={events} />
      </div>
    </section>
  );
}
