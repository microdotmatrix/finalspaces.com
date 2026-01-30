import { formatDistanceToNow } from "date-fns";

import type { GuestbookEntry } from "@/lib/actions/guestbook-actions";

type GuestbookListProps = {
  entries: GuestbookEntry[];
};

export function GuestbookList({ entries }: GuestbookListProps) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Be the first to leave a message.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <GuestbookEntryCard entry={entry} key={entry.id} />
      ))}
    </div>
  );
}

function GuestbookEntryCard({ entry }: { entry: GuestbookEntry }) {
  const displayName = entry.isAnonymous ? "Anonymous" : entry.authorName;
  const timeAgo = entry.createdAt
    ? formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })
    : "";

  return (
    <article className="rounded-lg border bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between">
        <div>
          {entry.tributeTitle && (
            <h3 className="font-semibold text-lg">{entry.tributeTitle}</h3>
          )}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-medium text-foreground">{displayName}</span>
            {entry.relationship && (
              <>
                <span>·</span>
                <span>{entry.relationship}</span>
              </>
            )}
          </div>
        </div>
        {timeAgo && (
          <time
            className="text-muted-foreground text-xs"
            dateTime={entry.createdAt?.toISOString()}
          >
            {timeAgo}
          </time>
        )}
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {entry.message}
      </p>
    </article>
  );
}
