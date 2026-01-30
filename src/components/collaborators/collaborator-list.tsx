"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, Clock, Mail, RotateCcw, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type Collaborator,
  removeCollaborator,
  resendInvite,
} from "@/lib/actions/collaborator-actions";

interface CollaboratorListProps {
  collaborators: Collaborator[];
  onUpdate?: () => void;
}

export function CollaboratorList({
  collaborators,
  onUpdate,
}: CollaboratorListProps) {
  if (collaborators.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No collaborators yet. Invite someone to help manage this memorial.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {collaborators.map((collaborator) => (
        <CollaboratorCard
          collaborator={collaborator}
          key={collaborator.id}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

function CollaboratorCard({
  collaborator,
  onUpdate,
}: {
  collaborator: Collaborator;
  onUpdate?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const fullName = `${collaborator.firstName} ${collaborator.lastName}`.trim();
  const invitedAgo = collaborator.invitedAt
    ? formatDistanceToNow(new Date(collaborator.invitedAt), { addSuffix: true })
    : "";

  function handleResend() {
    startTransition(async () => {
      const result = await resendInvite(collaborator.id);
      if (result.success) {
        toast.success("Invite sent!");
        onUpdate?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRemove() {
    if (!confirm("Remove this collaborator?")) return;

    startTransition(async () => {
      const result = await removeCollaborator(collaborator.id);
      if (result.success) {
        toast.success("Collaborator removed");
        onUpdate?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{fullName}</span>
          {collaborator.status === "active" ? (
            <Badge>
              <Check className="mr-1 size-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="mr-1 size-3" />
              Pending
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Mail className="size-3" />
          <span className="truncate">{collaborator.email}</span>
          {invitedAgo && (
            <>
              <span>·</span>
              <span>Invited {invitedAgo}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {collaborator.status === "pending" && (
          <Button
            disabled={isPending}
            onClick={handleResend}
            size="sm"
            variant="outline"
          >
            <RotateCcw className="mr-1 size-4" />
            Resend
          </Button>
        )}
        <Button
          disabled={isPending}
          onClick={handleRemove}
          size="sm"
          variant="destructive"
        >
          <Trash2 className="mr-1 size-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}
