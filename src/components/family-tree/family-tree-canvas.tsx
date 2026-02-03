"use client";

import Image from "next/image";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { FamilyMember } from "@/lib/actions/family-actions";

interface FamilyTreeCanvasProps {
  members: FamilyMember[];
  subjectName: string;
  onSelectMember: (member: FamilyMember) => void;
  onAddRelative: (parentMember?: FamilyMember) => void;
}

/**
 * Group members by generation level for horizontal layout
 */
function groupByGeneration(
  members: FamilyMember[]
): Map<number, FamilyMember[]> {
  const groups = new Map<number, FamilyMember[]>();

  for (const member of members) {
    const level = member.generationLevel;
    if (!groups.has(level)) {
      groups.set(level, []);
    }
    groups.get(level)?.push(member);
  }

  return groups;
}

function FamilyTreeNode({
  member,
  isSubject,
  subjectName,
  onSelect,
  onAddRelative,
}: {
  member?: FamilyMember;
  isSubject?: boolean;
  subjectName: string;
  onSelect?: () => void;
  onAddRelative?: () => void;
}) {
  const displayName = isSubject
    ? subjectName
    : member?.nickname || member?.firstName || "Unknown";
  const photoUrl = member?.photoUrl;

  return (
    <div className="group relative flex flex-col items-center">
      {/* Node */}
      <button
        className={`relative flex flex-col items-center rounded-xl border-2 bg-card p-3 shadow-sm transition-all hover:shadow-md ${
          isSubject
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onClick={onSelect}
        type="button"
      >
        {/* Photo */}
        <div
          className={`relative mb-2 overflow-hidden rounded-lg ${
            isSubject ? "size-16" : "size-12"
          } bg-muted`}
        >
          {photoUrl ? (
            <Image
              alt={displayName}
              className="object-cover"
              fill
              sizes={isSubject ? "64px" : "48px"}
              src={photoUrl}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Icon
                className={`${isSubject ? "size-8" : "size-6"} text-muted-foreground`}
                icon={isSubject ? "ph:star-fill" : "ph:user"}
              />
            </div>
          )}
        </div>

        {/* Name */}
        <p
          className={`max-w-24 truncate text-center font-medium ${
            isSubject ? "text-sm" : "text-xs"
          }`}
        >
          {displayName}
        </p>

        {/* Relationship */}
        {!isSubject && member && (
          <p className="max-w-24 truncate text-center text-muted-foreground text-xs">
            {member.relationship}
          </p>
        )}

        {isSubject && (
          <p className="text-center text-muted-foreground text-xs">Subject</p>
        )}
      </button>

      {/* Add button on hover */}
      {onAddRelative && (
        <Button
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onAddRelative();
          }}
          size="icon-sm"
          variant="outline"
        >
          <Icon className="size-3" icon="ph:plus" />
        </Button>
      )}
    </div>
  );
}

function GenerationRow({
  generation,
  members,
  subjectName,
  onSelectMember,
  onAddRelative,
}: {
  generation: number;
  members: FamilyMember[];
  subjectName: string;
  onSelectMember: (member: FamilyMember) => void;
  onAddRelative: (parentMember?: FamilyMember) => void;
}) {
  const getGenerationLabel = (gen: number): string => {
    if (gen < 0) {
      if (gen === -1) {
        return "Parents";
      }
      if (gen === -2) {
        return "Grandparents";
      }
      return "Ancestors";
    }
    if (gen > 0) {
      if (gen === 1) {
        return "Children";
      }
      if (gen === 2) {
        return "Grandchildren";
      }
      return "Descendants";
    }
    return "Same Generation";
  };

  const label = getGenerationLabel(generation);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </p>
      <div className="flex flex-wrap items-end justify-center gap-4">
        {members.map((member) => (
          <FamilyTreeNode
            key={member.id}
            member={member}
            onAddRelative={() => onAddRelative(member)}
            onSelect={() => onSelectMember(member)}
            subjectName={subjectName}
          />
        ))}
      </div>
    </div>
  );
}

export function FamilyTreeCanvas({
  members,
  subjectName,
  onSelectMember,
  onAddRelative,
}: FamilyTreeCanvasProps) {
  const generationGroups = useMemo(() => groupByGeneration(members), [members]);

  // Sort generations from ancestors (negative) to descendants (positive)
  const sortedGenerations = useMemo(
    () => [...generationGroups.keys()].sort((a, b) => a - b),
    [generationGroups]
  );

  // Split into ancestors, same generation, and descendants
  const ancestors = sortedGenerations.filter((g) => g < 0);
  const sameGen = sortedGenerations.filter((g) => g === 0);
  const descendants = sortedGenerations.filter((g) => g > 0);

  return (
    <div className="relative min-h-96 w-full overflow-auto rounded-xl border bg-muted/30 p-6">
      <div className="flex min-w-max flex-col items-center gap-8">
        {/* Ancestors (top) */}
        {ancestors.map((gen) => (
          <GenerationRow
            generation={gen}
            key={gen}
            members={generationGroups.get(gen) ?? []}
            onAddRelative={onAddRelative}
            onSelectMember={onSelectMember}
            subjectName={subjectName}
          />
        ))}

        {/* Connecting line to subject */}
        {ancestors.length > 0 && (
          <div aria-hidden="true" className="h-8 w-0.5 bg-border" />
        )}

        {/* Subject node with same-generation relatives inline */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            {sameGen.length > 0 ? "Same Generation" : "Memorial Subject"}
          </p>
          <div className="relative flex items-end justify-center">
            {/* Subject node - always centered */}
            <FamilyTreeNode
              isSubject
              onAddRelative={() => onAddRelative()}
              subjectName={subjectName}
            />
            {/* Same generation members positioned to the right */}
            {sameGen.length > 0 && (
              <div className="absolute left-full ml-4 flex items-end gap-4">
                {(generationGroups.get(0) ?? []).map((member) => (
                  <FamilyTreeNode
                    key={member.id}
                    member={member}
                    onAddRelative={() => onAddRelative(member)}
                    onSelect={() => onSelectMember(member)}
                    subjectName={subjectName}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Connecting line to descendants */}
        {descendants.length > 0 && (
          <div aria-hidden="true" className="h-8 w-0.5 bg-border" />
        )}

        {/* Descendants (bottom) */}
        {descendants.map((gen) => (
          <GenerationRow
            generation={gen}
            key={gen}
            members={generationGroups.get(gen) ?? []}
            onAddRelative={onAddRelative}
            onSelectMember={onSelectMember}
            subjectName={subjectName}
          />
        ))}
      </div>
    </div>
  );
}
