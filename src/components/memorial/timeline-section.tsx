import { TimelineSectionContent } from "@/components/memorial/timeline-section-content";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFamilyMembers } from "@/lib/actions/family-actions";
import { getPublicTimelineEventsWithCategories } from "@/lib/actions/timeline-actions";
import { canEditFinalSpace, getCurrentUser } from "@/lib/auth";

interface TimelineSectionProps {
  finalSpaceId: string;
  subjectName: string;
}

export async function TimelineSection({
  finalSpaceId,
  subjectName,
}: TimelineSectionProps) {
  const [events, familyMembers, currentUser] = await Promise.all([
    getPublicTimelineEventsWithCategories(finalSpaceId),
    getFamilyMembers(finalSpaceId),
    getCurrentUser(),
  ]);

  const canEdit = currentUser
    ? await canEditFinalSpace(currentUser.id, finalSpaceId)
    : false;

  if (events.length === 0 && familyMembers.length === 0 && !canEdit) {
    return null;
  }

  const eventCountLabel = `${events.length} ${events.length === 1 ? "event" : "events"}`;
  const familyCountLabel = `${familyMembers.length} ${familyMembers.length === 1 ? "member" : "members"}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Life Timeline</CardTitle>
        <CardAction>
          <div className="text-muted-foreground text-sm">
            {eventCountLabel} • {familyCountLabel}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <TimelineSectionContent
          canEdit={canEdit}
          events={events}
          familyMembers={familyMembers}
          finalSpaceId={finalSpaceId}
          subjectName={subjectName}
        />
      </CardContent>
    </Card>
  );
}
