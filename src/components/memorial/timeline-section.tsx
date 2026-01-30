import { PublicTimeline } from "@/components/timeline/public-timeline";
import { getPublicTimelineEvents } from "@/lib/actions/timeline-actions";

interface TimelineSectionProps {
  finalSpaceId: string;
}

export async function TimelineSection({ finalSpaceId }: TimelineSectionProps) {
  const events = await getPublicTimelineEvents(finalSpaceId);

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 font-semibold text-2xl">Life Timeline</h2>
        <PublicTimeline events={events} />
      </div>
    </section>
  );
}
