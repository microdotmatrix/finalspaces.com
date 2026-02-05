import { GuestbookForm } from "@/components/guestbook/guestbook-form";
import { GuestbookList } from "@/components/guestbook/guestbook-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicGuestbookEntries } from "@/lib/actions/guestbook-actions";

interface GuestbookSectionProps {
  displayName: string;
  finalSpaceId: string;
}

export async function GuestbookSection({
  displayName,
  finalSpaceId,
}: GuestbookSectionProps) {
  const entries = await getPublicGuestbookEntries(finalSpaceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Guestbook</CardTitle>
        <CardDescription>
          Share a memory, tribute, or message for {displayName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="rounded-lg bg-muted/30 p-6 ring-1 ring-foreground/5">
          <h3 className="mb-4 font-medium text-lg">Leave a Message</h3>
          <GuestbookForm
            displayName={displayName}
            finalSpaceId={finalSpaceId}
          />
        </div>

        <div>
          <h3 className="mb-6 font-medium text-lg">
            Messages ({entries.length})
          </h3>
          <GuestbookList entries={entries} />
        </div>
      </CardContent>
    </Card>
  );
}
