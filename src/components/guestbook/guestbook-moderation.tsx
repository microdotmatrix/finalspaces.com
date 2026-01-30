"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, Eye, EyeOff, Flag, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  approveGuestbookEntry,
  deleteGuestbookEntry,
  type GuestbookEntry,
  hideGuestbookEntry,
} from "@/lib/actions/guestbook-actions";

type GuestbookModerationProps = {
  entries: GuestbookEntry[];
  onUpdate?: () => void;
};

export function GuestbookModeration({
  entries,
  onUpdate,
}: GuestbookModerationProps) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No guestbook entries yet.
      </p>
    );
  }

  const pendingEntries = entries.filter(
    (e) => !e.isApproved || e.moderationStatus === "flagged"
  );
  const approvedEntries = entries.filter(
    (e) => e.isApproved && e.moderationStatus === "ok"
  );
  const hiddenEntries = entries.filter((e) => e.moderationStatus === "hidden");

  return (
    <div className="space-y-8">
      {pendingEntries.length > 0 && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
            <Flag className="size-5 text-yellow-500" />
            Needs Review ({pendingEntries.length})
          </h3>
          <div className="space-y-4">
            {pendingEntries.map((entry) => (
              <ModerationCard
                entry={entry}
                key={entry.id}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {approvedEntries.length > 0 && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
            <Eye className="size-5 text-green-500" />
            Approved ({approvedEntries.length})
          </h3>
          <div className="space-y-4">
            {approvedEntries.map((entry) => (
              <ModerationCard
                entry={entry}
                key={entry.id}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {hiddenEntries.length > 0 && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
            <EyeOff className="size-5 text-muted-foreground" />
            Hidden ({hiddenEntries.length})
          </h3>
          <div className="space-y-4">
            {hiddenEntries.map((entry) => (
              <ModerationCard
                entry={entry}
                key={entry.id}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ModerationCard({
  entry,
  onUpdate,
}: {
  entry: GuestbookEntry;
  onUpdate?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const timeAgo = entry.createdAt
    ? formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })
    : "";

  async function handleApprove() {
    startTransition(async () => {
      const result = await approveGuestbookEntry(entry.id);
      if (result.success) {
        toast.success("Entry approved");
        onUpdate?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleHide() {
    startTransition(async () => {
      const result = await hideGuestbookEntry(entry.id);
      if (result.success) {
        toast.success("Entry hidden");
        onUpdate?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this entry permanently?")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteGuestbookEntry(entry.id);
    if (result.success) {
      toast.success("Entry deleted");
      onUpdate?.();
    } else {
      toast.error(result.error);
      setIsDeleting(false);
    }
  }

  const statusBadge = () => {
    if (entry.moderationStatus === "hidden") {
      return <Badge variant="secondary">Hidden</Badge>;
    }
    if (entry.moderationStatus === "flagged") {
      return <Badge variant="destructive">Flagged</Badge>;
    }
    if (!entry.isApproved) {
      return <Badge variant="outline">Pending</Badge>;
    }
    return <Badge variant="default">Approved</Badge>;
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          {entry.tributeTitle && (
            <p className="font-semibold">{entry.tributeTitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">
              {entry.isAnonymous ? "Anonymous" : entry.authorName}
            </span>
            {entry.authorEmail && (
              <span className="text-muted-foreground">{entry.authorEmail}</span>
            )}
            {entry.relationship && (
              <span className="text-muted-foreground">
                · {entry.relationship}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge()}
          <span className="text-muted-foreground text-xs">{timeAgo}</span>
        </div>
      </div>

      <p className="mb-4 whitespace-pre-wrap text-sm">{entry.message}</p>

      <div className="flex flex-wrap gap-2">
        {entry.moderationStatus !== "ok" || !entry.isApproved ? (
          <Button
            disabled={isPending || isDeleting}
            onClick={handleApprove}
            size="sm"
            variant="outline"
          >
            <Check className="mr-1 size-4" />
            Approve
          </Button>
        ) : null}

        {entry.moderationStatus !== "hidden" && (
          <Button
            disabled={isPending || isDeleting}
            onClick={handleHide}
            size="sm"
            variant="outline"
          >
            <X className="mr-1 size-4" />
            Hide
          </Button>
        )}

        <Button
          disabled={isPending || isDeleting}
          onClick={handleDelete}
          size="sm"
          variant="destructive"
        >
          <Trash2 className="mr-1 size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
