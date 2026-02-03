"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { FamilyMember } from "@/lib/actions/family-actions";

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
  isPending?: boolean;
}

export function FamilyMemberCard({
  member,
  onEdit,
  onDelete,
  isPending,
}: FamilyMemberCardProps) {
  const displayName = member.nickname || member.firstName;
  const fullName = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(" ");
  const photoUrl = member.photoUrl;
  const isLinked = !!member.linkedFinalSpaceId;

  const lifespan =
    member.birthYear || member.deathYear
      ? `${member.birthYear ?? "?"} - ${member.deathYear ?? "present"}`
      : null;

  return (
    <div className="group relative flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      {/* Photo */}
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {photoUrl ? (
          <Image
            alt={displayName}
            className="object-cover"
            fill
            sizes="56px"
            src={photoUrl}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon className="size-6 text-muted-foreground" icon="ph:user" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{displayName}</p>
            {member.nickname && fullName !== member.nickname && (
              <p className="truncate text-muted-foreground text-sm">
                {fullName}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              disabled={isPending}
              onClick={() => onEdit(member)}
              size="icon"
              variant="ghost"
            >
              <Icon className="size-4" icon="ph:pencil-simple" />
            </Button>
            <Button
              disabled={isPending}
              onClick={() => onDelete(member.id)}
              size="icon"
              variant="ghost"
            >
              <Icon className="size-4" icon="ph:trash" />
            </Button>
          </div>
        </div>

        <p className="mt-1 text-muted-foreground text-sm">
          {member.relationship}
        </p>

        {lifespan && (
          <p className="mt-0.5 text-muted-foreground text-xs">{lifespan}</p>
        )}

        {isLinked && (
          <Link
            className="mt-2 inline-flex items-center gap-1 text-primary text-xs hover:underline"
            href={`/finalspaces/${member.linkedFinalSpaceId}`}
          >
            <Icon className="size-3" icon="ph:link-simple" />
            View FinalSpace
          </Link>
        )}
      </div>
    </div>
  );
}
