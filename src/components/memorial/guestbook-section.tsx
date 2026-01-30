import { GuestbookForm } from "@/components/guestbook/guestbook-form";
import { GuestbookList } from "@/components/guestbook/guestbook-list";
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
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-6 font-semibold text-2xl">Guestbook</h2>
        <p className="mb-8 text-muted-foreground">
          Share a memory, tribute, or message for {displayName}.
        </p>

        <div className="mb-12 rounded-lg border bg-card p-6 shadow-sm">
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
      </div>
    </section>
  );
}
